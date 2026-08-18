"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ClipResult } from "@/lib/ai/types";
import { videoFileStore } from "@/lib/video/videoStore";
import { getYouTubeVideoId } from "@/lib/utils";
import {
  SUBTITLE_PRESETS,
  LAYOUT_PRESETS,
  SubtitleStyleId,
  LayoutPresetId,
} from "@/lib/editor/styles";
import {
  Download,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Smartphone,
  Square,
  Monitor,
  Check,
  Type,
  Layout,
  Sliders,
  Tv,
  FileCode,
  FileText,
  Loader2,
  ExternalLink,
  Upload,
  Volume2,
} from "lucide-react";

interface Props {
  clip: ClipResult;
  videoTitle: string;
  videoUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VizardStudioModal({
  clip,
  videoTitle,
  videoUrl = "",
  isOpen,
  onClose,
}: Props) {
  // Studio Editor States
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [resolution, setResolution] = useState<"1080p" | "720p">("1080p");
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyleId>("hormozi");
  const [layoutPreset, setLayoutPreset] = useState<LayoutPresetId>("blurred_fit");
  const [captionPosition, setCaptionPosition] = useState<"bottom" | "middle" | "top">("bottom");
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);

  // Playback & Rendering States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(clip.startSeconds);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Load uploaded video from IndexedDB on mount/open
  useEffect(() => {
    let active = true;
    videoFileStore.getObjectUrl().then((url) => {
      if (active) setUploadedVideoUrl(url);
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [generatedVideoUrl]);

  const youtubeId = videoUrl ? getYouTubeVideoId(videoUrl) : null;
  const activeStyle = SUBTITLE_PRESETS[subtitleStyle];

  const handleModalFileUpload = async (file: File) => {
    await videoFileStore.setFile(file);
    const url = await videoFileStore.getObjectUrl();
    setUploadedVideoUrl(url);
  };

  const getDimensions = () => {
    if (aspectRatio === "9:16") return resolution === "1080p" ? { w: 1080, h: 1920 } : { w: 720, h: 1280 };
    if (aspectRatio === "1:1") return resolution === "1080p" ? { w: 1080, h: 1080 } : { w: 720, h: 720 };
    return resolution === "1080p" ? { w: 1920, h: 1080 } : { w: 1280, h: 720 };
  };

  // -------------------------------------------------------------
  // Live Canvas Frame Drawer (Used for both Preview & Export)
  // -------------------------------------------------------------
  const drawFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      sourceVideo: HTMLVideoElement | null,
      progressRatio: number,
      elapsedSec: number
    ) => {
      const hasRealVideo = !!(uploadedVideoUrl && sourceVideo && sourceVideo.readyState >= 2);

      // 1. Draw Video Layout (Vizard AI Smart Layouts)
      if (hasRealVideo && sourceVideo) {
        const vw = sourceVideo.videoWidth || 1280;
        const vh = sourceVideo.videoHeight || 720;

        if (layoutPreset === "blurred_fit") {
          // Vizard Blurred Ambient Background:
          // A) Draw full blurred copy across the 9:16 canvas
          ctx.save();
          ctx.filter = "blur(28px) brightness(0.55)";
          const bgScale = Math.max(w / vw, h / vh);
          const bgW = vw * bgScale;
          const bgH = vh * bgScale;
          ctx.drawImage(sourceVideo, (w - bgW) / 2, (h - bgH) / 2, bgW, bgH);
          ctx.restore();

          // B) Draw centered clean 16:9 video in middle
          const fitScale = w / vw;
          const fitW = w;
          const fitH = vh * fitScale;
          const fitY = (h - fitH) / 2;
          ctx.drawImage(sourceVideo, 0, fitY, fitW, fitH);

          // Subtle shadow border around centered video
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.lineWidth = 2;
          ctx.strokeRect(0, fitY, fitW, fitH);
        } else if (layoutPreset === "center_crop") {
          // Smart 9:16 Center Crop
          const scale = Math.max(w / vw, h / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          ctx.drawImage(sourceVideo, (w - dw) / 2, (h - dh) / 2, dw, dh);
        } else if (layoutPreset === "split_screen") {
          // Split Screen Podcast View: Top & Bottom
          const halfH = h / 2;
          const scale = Math.max(w / vw, halfH / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          // Top Speaker
          ctx.drawImage(sourceVideo, (w - dw) / 2, (halfH - dh) / 2, dw, dh);
          // Bottom Speaker (shifted)
          ctx.drawImage(sourceVideo, (w - dw) / 2, halfH + (halfH - dh) / 2, dw, dh);
          // Divider Line
          ctx.fillStyle = "#7c3aed";
          ctx.fillRect(0, halfH - 2, w, 4);
        } else {
          // Original Fit with black bars
          const fitScale = Math.min(w / vw, h / vh);
          const fitW = vw * fitScale;
          const fitH = vh * fitScale;
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(sourceVideo, (w - fitW) / 2, (h - fitH) / 2, fitW, fitH);
        }
      } else {
        // High-end Dark Studio Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#080714");
        grad.addColorStop(0.5, "#120e28");
        grad.addColorStop(1, "#07070f");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Subtle Dark Vignette for Subtitle Legibility
      const vig = ctx.createLinearGradient(0, 0, 0, h);
      vig.addColorStop(0, "rgba(0, 0, 0, 0.4)");
      vig.addColorStop(0.2, "rgba(0, 0, 0, 0)");
      vig.addColorStop(0.65, "rgba(0, 0, 0, 0.2)");
      vig.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // 3. Top Hook Banner Card
      if (includeHeader) {
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.floor(w * 0.046)}px ${activeStyle.fontFamily}`;
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;
        ctx.fillText(clip.suggestedTitle, w / 2, h * 0.14, w * 0.88);
        ctx.shadowBlur = 0;
      }

      // 4. Dynamic Subtitles (Alex Hormozi / MrBeast / Neon / Clean / Karaoke)
      if (includeCaptions) {
        const words = clip.transcript.split(" ");
        const clipDuration = Math.max(1, clip.durationSeconds);
        const wordIndex = Math.min(
          words.length - 1,
          Math.floor((elapsedSec / clipDuration) * words.length)
        );

        // Word window (3 words at a time for punchy Hormozi style)
        const windowSize = subtitleStyle === "hormozi" || subtitleStyle === "mrbeast" ? 3 : 5;
        const windowStart = Math.floor(wordIndex / windowSize) * windowSize;
        const currentSlice = words.slice(windowStart, windowStart + windowSize);

        // Calculate Y position
        let subY = h * 0.74;
        if (captionPosition === "middle") subY = h * 0.50;
        if (captionPosition === "top") subY = h * 0.25;

        // Subtitle Container Box (if preset hasBox is true)
        if (activeStyle.hasBox) {
          const boxH = h * 0.12;
          ctx.fillStyle = activeStyle.bgBoxColor;
          ctx.beginPath();
          ctx.roundRect(w * 0.06, subY - boxH / 2, w * 0.88, boxH, [20]);
          ctx.fill();
          if (activeStyle.strokeColor && activeStyle.strokeColor !== "transparent") {
            ctx.strokeStyle = activeStyle.strokeColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        }

        // Render Words with Active Highlight
        const fontSize = Math.floor(w * (subtitleStyle === "hormozi" ? 0.055 : 0.046));
        ctx.font = `bold ${fontSize}px ${activeStyle.fontFamily}`;
        ctx.textAlign = "center";

        const textToRender = currentSlice.join(" ");
        const displayText =
          activeStyle.textTransform === "uppercase"
            ? textToRender.toUpperCase()
            : textToRender;

        // Stroke Outline
        if (activeStyle.strokeWidth > 0) {
          ctx.strokeStyle = activeStyle.strokeColor;
          ctx.lineWidth = activeStyle.strokeWidth * (w / 720);
          ctx.strokeText(displayText, w / 2, subY + fontSize / 3, w * 0.84);
        }

        // Active Word Highlight Fill
        ctx.fillStyle = activeStyle.highlightColor;
        ctx.fillText(displayText, w / 2, subY + fontSize / 3, w * 0.84);
      }
    },
    [
      uploadedVideoUrl,
      layoutPreset,
      includeHeader,
      includeCaptions,
      captionPosition,
      activeStyle,
      clip.suggestedTitle,
      clip.transcript,
      clip.durationSeconds,
      subtitleStyle,
    ]
  );

  // -------------------------------------------------------------
  // Live Studio Preview Animation Loop
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localElapsed = 0;
    const startTime = performance.now();

    const loop = () => {
      const now = performance.now();
      localElapsed = ((now - startTime) / 1000) % Math.max(1, clip.durationSeconds);
      setCurrentTime(clip.startSeconds + localElapsed);

      const sourceVideo = sourceVideoRef.current;
      drawFrame(ctx, canvas.width, canvas.height, sourceVideo, localElapsed / clip.durationSeconds, localElapsed);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isOpen, drawFrame, clip.startSeconds, clip.durationSeconds]);

  // -------------------------------------------------------------
  // 1-Click High-Quality Video Render & Download (Vizard Engine)
  // -------------------------------------------------------------
  const handleRenderAndExport = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setGeneratedVideoUrl(null);

    const { w, h } = getDimensions();
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clipDurationSec = Math.min(clip.durationSeconds, 20);
    const fps = 30;
    const totalFrames = fps * clipDurationSec;

    const sourceVideo = sourceVideoRef.current;
    const hasRealVideo = !!(uploadedVideoUrl && sourceVideo);

    let audioStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    if (hasRealVideo && sourceVideo) {
      sourceVideo.currentTime = clip.startSeconds;
      try {
        await sourceVideo.play();
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const srcNode = audioCtx.createMediaElementSource(sourceVideo);
        const dest = audioCtx.createMediaStreamDestination();
        srcNode.connect(dest);
        srcNode.connect(audioCtx.destination);
        audioStream = dest.stream;
      } catch (err) {
        console.warn("Audio capture notice:", err);
      }
    }

    const canvasStream = canvas.captureStream(fps);
    const combinedTracks = [...canvasStream.getVideoTracks()];
    if (audioStream && audioStream.getAudioTracks().length > 0) {
      combinedTracks.push(...audioStream.getAudioTracks());
    }
    const finalStream = new MediaStream(combinedTracks);

    let mimeType = "video/webm;codecs=vp9,opus";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "video/webm";
    }

    const recordedChunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(finalStream, {
      mimeType,
      videoBitsPerSecond: 6000000, // 6 Mbps crisp Full HD
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const videoBlobUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(videoBlobUrl);
      setIsRendering(false);
      setRenderProgress(100);

      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }

      // Trigger auto download of high-quality MP4/WebM
      const link = document.createElement("a");
      link.href = videoBlobUrl;
      link.download = `VizardClip_${clip.rank}_${clip.startTime.replace(/:/g, "-")}_${aspectRatio.replace(":", "x")}.webm`;
      link.click();

      if (hasRealVideo && sourceVideo) {
        sourceVideo.pause();
      }
    };

    mediaRecorder.start();

    let currentFrame = 0;
    const renderLoop = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const progressRatio = currentFrame / totalFrames;
      const elapsedSec = currentFrame / fps;

      drawFrame(ctx, w, h, sourceVideo, progressRatio, elapsedSec);

      currentFrame++;
      setRenderProgress(Math.floor((currentFrame / totalFrames) * 100));

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  };

  // Direct Subtitles (.SRT) and Transcript (.TXT) exports
  const handleDownloadSRT = () => {
    const srtContent = `1\n00:00:00,000 --> 00:00:04,000\n${clip.hook}\n\n2\n00:00:04,000 --> 00:00:15,000\n${clip.transcript}\n\n3\n00:00:15,000 --> 00:00:20,000\n${clip.commentTrigger}\n`;
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Clip_${clip.rank}_subtitles.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTXT = () => {
    const txtContent =
      `CLIP #${clip.rank} — ${clip.suggestedTitle}\n` +
      `Video: ${videoTitle}\n` +
      `Timestamp: ${clip.startTime} – ${clip.endTime} (${clip.durationSeconds}s)\n` +
      `Viral Score: ${clip.score.total}/100\n\n` +
      `--- HOOK ---\n${clip.hook}\n\n` +
      `--- TRANSCRIPT ---\n${clip.transcript}\n\n` +
      `--- CAPTION ---\n${clip.suggestedCaptions.storytelling}\n\n` +
      `--- HASHTAGS ---\n${clip.hashtags.join(" ")}\n`;
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Clip_${clip.rank}_script.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      {/* Offscreen video element for real video decoding & frame capture */}
      {uploadedVideoUrl && (
        <video
          ref={sourceVideoRef}
          src={uploadedVideoUrl}
          playsInline
          muted={false}
          crossOrigin="anonymous"
          style={{
            position: "fixed",
            top: -9999,
            left: -9999,
            width: 640,
            height: 360,
            opacity: 0.001,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="glass-card w-full max-w-5xl overflow-hidden relative"
        style={{
          background: "#0d0d1a",
          border: "1px solid rgba(124, 58, 237, 0.4)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.9)",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Top Bar */}
        <div
          className="px-6 py-3.5 flex items-center justify-between flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.12))",
            borderBottom: "1px solid #1e1e3a",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
              style={{
                background: "rgba(124,58,237,0.35)",
                border: "1px solid #7c3aed",
                color: "#f0f0ff",
              }}
            >
              #{clip.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#f0f0ff]">
                  Vizard AI Video Studio
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    color: "white",
                  }}
                >
                  9:16 AUTO-REFRAME
                </span>
              </div>
              <p className="text-[11px] text-[#8888aa] font-mono">
                ⏱️ {clip.startTime} – {clip.endTime} ({clip.durationSeconds}s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8888aa] hover:text-white hover:bg-[#1a1a2e] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Studio Workspace: Left Phone Mockup Preview + Right Controls Panel */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left: 9:16 Smartphone Simulator Live Player */}
          <div className="col-span-5 p-6 flex flex-col items-center justify-center bg-[#07070f] border-r border-[#1e1e3a] relative">
            <div className="text-[11px] font-semibold text-[#8888aa] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              LIVE 9:16 SMARTPHONE PREVIEW
            </div>

            {/* Smartphone Chassis Mockup */}
            <div
              className="relative rounded-[32px] overflow-hidden border-4 border-[#2a2a50] shadow-2xl bg-black"
              style={{
                width: "270px",
                height: "480px",
                boxShadow: "0 0 40px rgba(124, 58, 237, 0.2)",
              }}
            >
              {/* Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-20" />

              {/* Live Canvas View */}
              <canvas
                ref={previewCanvasRef}
                width={540}
                height={960}
                className="w-full h-full object-cover"
              />

              {/* YouTube IFrame Embed Link Option */}
              {youtubeId && !uploadedVideoUrl && (
                <div className="absolute bottom-3 left-2 right-2 z-20">
                  <a
                    href={`https://youtube.com/watch?v=${youtubeId}&t=${clip.startSeconds}s`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full py-1.5 text-[10px] flex items-center justify-center gap-1 bg-black/80 backdrop-blur-md text-white border-purple-500/40"
                  >
                    <Tv size={11} className="text-red-400" /> Watch YouTube Video Segment <ExternalLink size={9} />
                  </a>
                </div>
              )}
            </div>

            {/* Playhead Time */}
            <div className="mt-3 text-xs text-[#8888aa] font-mono">
              Position: <span className="text-purple-400 font-bold">{currentTime.toFixed(1)}s</span> / {clip.endTime}
            </div>
          </div>

          {/* Right: Vizard Style Studio Customization Panel */}
          <div className="col-span-7 p-6 space-y-5 overflow-y-auto bg-[#0d0d1a]">
            {/* 1. Layout Mode Preset (Blurred Fit / Center Crop / Split Screen) */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#f0f0ff] mb-2 uppercase tracking-wider">
                <Layout size={13} className="text-purple-400" />
                1. Auto-Reframe Video Layout
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(LAYOUT_PRESETS).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setLayoutPreset(p.id)}
                    className="p-3 rounded-xl text-left transition-all flex items-start gap-2.5"
                    style={{
                      background: layoutPreset === p.id ? "rgba(124,58,237,0.25)" : "rgba(26,26,46,0.6)",
                      border: `1px solid ${layoutPreset === p.id ? "#7c3aed" : "#1e1e3a"}`,
                    }}
                  >
                    <span className="text-base">{p.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-[#f0f0ff]">{p.name}</div>
                      <div className="text-[10px] text-[#8888aa] mt-0.5 leading-tight">
                        {p.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Subtitle Style Preset (Alex Hormozi / MrBeast / Neon / Clean) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#f0f0ff] uppercase tracking-wider">
                  <Type size={13} className="text-pink-400" />
                  2. Dynamic Subtitle Template
                </div>
                <button
                  onClick={() => setIncludeCaptions(!includeCaptions)}
                  className="text-[11px] text-purple-400 font-semibold hover:underline"
                >
                  {includeCaptions ? "✓ Captions ON" : "✗ Captions OFF"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.values(SUBTITLE_PRESETS).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubtitleStyle(s.id)}
                    className="p-2.5 rounded-xl text-left transition-all flex flex-col gap-1"
                    style={{
                      background: subtitleStyle === s.id ? "rgba(236,72,153,0.25)" : "rgba(26,26,46,0.6)",
                      border: `1px solid ${subtitleStyle === s.id ? "#ec4899" : "#1e1e3a"}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#f0f0ff]">{s.name}</span>
                      {subtitleStyle === s.id && <Check size={12} className="text-pink-400" />}
                    </div>
                    <div className="text-[10px] text-[#8888aa] line-clamp-2 leading-tight">
                      {s.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Subtitle Position & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#d0d0ee] block mb-1.5">
                  Subtitle Position
                </label>
                <div className="flex gap-1.5">
                  {(["bottom", "middle", "top"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setCaptionPosition(pos)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                      style={{
                        background: captionPosition === pos ? "rgba(124,58,237,0.3)" : "rgba(26,26,46,0.6)",
                        border: `1px solid ${captionPosition === pos ? "#7c3aed" : "#1e1e3a"}`,
                        color: captionPosition === pos ? "#f0f0ff" : "#8888aa",
                      }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#d0d0ee] block mb-1.5">
                  Export Quality
                </label>
                <div className="flex gap-1.5">
                  {(["1080p", "720p"] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setResolution(q)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all"
                      style={{
                        background: resolution === q ? "rgba(124,58,237,0.3)" : "rgba(26,26,46,0.6)",
                        border: `1px solid ${resolution === q ? "#7c3aed" : "#1e1e3a"}`,
                        color: resolution === q ? "#9f60ff" : "#8888aa",
                      }}
                    >
                      {q} HD
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Source Video Status / Quick Attachment */}
            <div className="p-3 rounded-xl bg-[#121224] border border-[#1e1e3a] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#f0f0ff]">
                  Source Video File:
                </span>
                <span
                  className="font-medium text-[11px]"
                  style={{ color: uploadedVideoUrl ? "#4ade80" : "#c084fc" }}
                >
                  {uploadedVideoUrl ? "🟢 Local Video Attached" : "🔴 YouTube Link Attached"}
                </span>
              </div>
              {!uploadedVideoUrl && (
                <div
                  onClick={() => modalFileInputRef.current?.click()}
                  className="p-2.5 rounded-lg border border-dashed border-[#2a2a50] hover:border-purple-500/50 text-center cursor-pointer text-xs text-[#8888aa] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload size={12} className="text-purple-400" />
                  <span>Attach local MP4 to render exact video frames & audio</span>
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleModalFileUpload(f);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Rendered Preview Player (if export finished) */}
            {generatedVideoUrl && (
              <div className="p-3 rounded-2xl bg-[#0c0c18] border border-green-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#d0d0ee] font-semibold">
                  <span className="flex items-center gap-1.5 text-green-400">
                    <Check size={14} /> Rendered Clip Saved to Downloads
                  </span>
                  <span className="text-[10px] text-[#8888aa]">{aspectRatio} · {resolution}</span>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[140px] flex items-center justify-center">
                  <video
                    ref={videoPlayerRef}
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Main Action: 1-Click Vizard Video Render & Download */}
            <div>
              {isRendering ? (
                <div className="space-y-2 p-4 rounded-xl bg-[#161628] border border-purple-500/30">
                  <div className="flex justify-between text-xs text-[#f0f0ff]">
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-purple-400" />
                      Rendering 9:16 {activeStyle.name} Video ({renderProgress}%)...
                    </span>
                    <span className="font-mono text-purple-400 font-bold">{renderProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-black/60">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all duration-150"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRenderAndExport}
                  className="btn-primary w-full py-4 text-sm font-bold shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  <Sparkles size={17} />
                  {generatedVideoUrl
                    ? "Re-Render & Download 9:16 Video"
                    : "🎬 Generate & Download 9:16 Video Clip (.mp4/.webm)"}
                </button>
              )}
            </div>

            {/* Direct Subtitle & Transcript Downloads */}
            <div className="pt-2 border-t border-[#1e1e3a] flex items-center justify-between text-xs text-[#8888aa]">
              <span>Direct Exports:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSRT}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <FileCode size={12} className="text-cyan-400" /> .SRT Subtitles
                </button>
                <button
                  onClick={handleDownloadTXT}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <FileText size={12} className="text-amber-400" /> .TXT Script
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
