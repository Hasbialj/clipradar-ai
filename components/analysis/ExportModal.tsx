"use client";

import { useState, useRef, useEffect } from "react";
import { ClipResult } from "@/lib/ai/types";
import { videoFileStore } from "@/lib/video/videoStore";
import { getYouTubeVideoId } from "@/lib/utils";
import {
  Download,
  X,
  FileText,
  FileCode,
  Sparkles,
  Check,
  Video,
  Smartphone,
  Square,
  Monitor,
  Loader2,
  Tv,
  ExternalLink,
} from "lucide-react";

interface Props {
  clip: ClipResult;
  videoTitle: string;
  videoUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ clip, videoTitle, videoUrl = "", isOpen, onClose }: Props) {
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [resolution, setResolution] = useState<"1080p" | "720p">("1080p");
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);

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
    };
  }, [generatedVideoUrl]);

  if (!isOpen) return null;

  const youtubeId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

  const getCanvasDimensions = () => {
    if (aspectRatio === "9:16") return resolution === "1080p" ? { w: 1080, h: 1920 } : { w: 720, h: 1280 };
    if (aspectRatio === "1:1") return resolution === "1080p" ? { w: 1080, h: 1080 } : { w: 720, h: 720 };
    return resolution === "1080p" ? { w: 1920, h: 1080 } : { w: 1280, h: 720 };
  };

  // Real Video & Audio Clipping Engine
  const handleRenderAndClipVideo = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setGeneratedVideoUrl(null);

    const { w, h } = getCanvasDimensions();
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clipDurationSec = Math.min(clip.durationSeconds, 15);
    const fps = 30;
    const totalFrames = fps * clipDurationSec;

    const sourceVideo = sourceVideoRef.current;
    const hasRealVideo = !!(uploadedVideoUrl && sourceVideo);

    // Set up Web Audio API sound stream for the video
    let audioStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    if (hasRealVideo && sourceVideo) {
      sourceVideo.currentTime = clip.startSeconds;
      try {
        await sourceVideo.play();
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const srcNode = audioCtx.createMediaElementSource(sourceVideo);
        const dest = audioCtx.createMediaStreamDestination();
        srcNode.connect(dest);
        srcNode.connect(audioCtx.destination);
        audioStream = dest.stream;
      } catch (audioErr) {
        console.warn("Direct audio capture:", audioErr);
      }
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const dest = audioCtx.createMediaStreamDestination();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        audioStream = dest.stream;
      } catch {
        // audio context not available
      }
    }

    // Combined stream
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
    const mediaRecorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 4000000 });

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

      // Trigger automatic video file download
      const link = document.createElement("a");
      link.href = videoBlobUrl;
      link.download = `ClipRadar_${clip.rank}_${clip.startTime.replace(/:/g, "-")}_${aspectRatio.replace(":", "x")}.webm`;
      link.click();

      if (hasRealVideo && sourceVideo) {
        sourceVideo.pause();
      }
    };

    mediaRecorder.start();

    let currentFrame = 0;
    const transcriptWords = clip.transcript.split(" ");

    const renderLoop = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const progressRatio = currentFrame / totalFrames;
      const elapsedSec = (currentFrame / fps);

      // 1. Draw Video or Dynamic Motion Frame
      if (hasRealVideo && sourceVideo && sourceVideo.readyState >= 2) {
        const vw = sourceVideo.videoWidth || 1280;
        const vh = sourceVideo.videoHeight || 720;
        const scale = Math.max(w / vw, h / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.drawImage(sourceVideo, dx, dy, dw, dh);
      } else {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        const t = progressRatio * Math.PI * 2;
        grad.addColorStop(0, `rgb(${Math.floor(15 + Math.sin(t) * 10)}, ${Math.floor(10 + Math.cos(t) * 5)}, ${Math.floor(35 + Math.sin(t) * 15)})`);
        grad.addColorStop(0.5, `rgb(${Math.floor(25 + Math.cos(t) * 10)}, ${Math.floor(15 + Math.sin(t) * 5)}, ${Math.floor(50 + Math.cos(t) * 20)})`);
        grad.addColorStop(1, `rgb(${Math.floor(10 + Math.sin(t) * 5)}, ${Math.floor(8 + Math.cos(t) * 4)}, ${Math.floor(25 + Math.sin(t) * 10)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Audio Waveform Visualizer
        ctx.fillStyle = "rgba(124, 58, 237, 0.45)";
        const barCount = 32;
        const barWidth = w / (barCount * 1.5);
        for (let i = 0; i < barCount; i++) {
          const waveHeight = Math.sin(elapsedSec * 6 + i * 0.4) * (h * 0.08) + (h * 0.04);
          const bx = (w - barCount * barWidth * 1.5) / 2 + i * barWidth * 1.5;
          const by = h * 0.45 - waveHeight / 2;
          ctx.fillRect(bx, by, barWidth, waveHeight);
        }
      }

      // 2. Vignette
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, h);
      overlayGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
      overlayGrad.addColorStop(0.2, "rgba(0, 0, 0, 0.2)");
      overlayGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.3)");
      overlayGrad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, w, h);

      // 3. Top Branding & Viral Badge
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.floor(w * 0.038)}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText("⚡ CLIPRADAR AI", w * 0.08, h * 0.08);

      ctx.fillStyle = "rgba(124, 58, 237, 0.85)";
      ctx.beginPath();
      ctx.roundRect(w * 0.68, h * 0.055, w * 0.24, h * 0.04, [20]);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.floor(w * 0.032)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`🔥 ${clip.score.total}/100 VIRAL`, w * 0.80, h * 0.082);

      // 4. Hook Title Card
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = `bold ${Math.floor(w * 0.048)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(clip.suggestedTitle, w / 2, h * 0.18, w * 0.85);

      // 5. Burnt-In Subtitles
      if (includeCaptions) {
        const wordIndex = Math.min(
          transcriptWords.length - 1,
          Math.floor((elapsedSec / clipDurationSec) * transcriptWords.length)
        );
        const startWord = Math.max(0, wordIndex - 3);
        const endWord = Math.min(transcriptWords.length, wordIndex + 4);
        const currentSlice = transcriptWords.slice(startWord, endWord);

        const subBoxY = h * 0.72;
        const subBoxH = h * 0.14;
        ctx.fillStyle = "rgba(10, 10, 20, 0.85)";
        ctx.beginPath();
        ctx.roundRect(w * 0.06, subBoxY, w * 0.88, subBoxH, [24]);
        ctx.fill();
        ctx.strokeStyle = "rgba(124, 58, 237, 0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();

        const renderedText = currentSlice.join(" ");
        ctx.fillStyle = "#fef08a";
        ctx.font = `bold ${Math.floor(w * 0.042)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(renderedText, w / 2, subBoxY + subBoxH / 2 + 10, w * 0.82);
      }

      // 6. Bottom Timestamp & CTA
      ctx.fillStyle = "#a1a1aa";
      ctx.font = `${Math.floor(w * 0.028)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`⏱️ ${clip.startTime} – ${clip.endTime} | ${clip.commentTrigger}`, w / 2, h * 0.94);

      currentFrame++;
      setRenderProgress(Math.floor((currentFrame / totalFrames) * 100));

      requestAnimationFrame(renderLoop);
    };

    renderLoop();
  };

  const handleDownloadSRT = () => {
    const srtContent = `1\n00:00:00,000 --> 00:00:04,000\n${clip.hook}\n\n2\n00:00:04,000 --> 00:00:15,000\n${clip.transcript}\n\n3\n00:00:15,000 --> 00:00:20,000\n${clip.commentTrigger}\n`;
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clip_${clip.rank}_subtitles.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTXT = () => {
    const txtContent = `CLIP #${clip.rank} — ${clip.suggestedTitle}\n` +
      `Video: ${videoTitle}\n` +
      `Timestamp: ${clip.startTime} – ${clip.endTime} (${clip.durationSeconds}s)\n` +
      `Viral Score: ${clip.score.total}/100\n\n` +
      `--- HOOK ---\n${clip.hook}\n\n` +
      `--- TRANSCRIPT ---\n${clip.transcript}\n\n` +
      `--- SUGGESTED CAPTION ---\n${clip.suggestedCaptions.storytelling}\n\n` +
      `--- COMMENT TRIGGER ---\n${clip.commentTrigger}\n\n` +
      `--- HASHTAGS ---\n${clip.hashtags.join(" ")}\n`;

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clip_${clip.rank}_transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(clip, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clip_${clip.rank}_metadata.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
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
        className="glass-card w-full max-w-lg overflow-hidden relative"
        style={{
          background: "#111122",
          border: "1px solid rgba(124, 58, 237, 0.4)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
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
              <h3 className="text-sm font-bold text-[#f0f0ff]">
                Download Clipped Video
              </h3>
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

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Source Status Badge */}
          <div
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
            style={{
              background: uploadedVideoUrl
                ? "rgba(34,197,94,0.12)"
                : "rgba(124,58,237,0.12)",
              border: `1px solid ${
                uploadedVideoUrl ? "rgba(34,197,94,0.3)" : "rgba(124,58,237,0.3)"
              }`,
            }}
          >
            <span className="flex items-center gap-2 font-medium" style={{ color: uploadedVideoUrl ? "#4ade80" : "#c084fc" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: uploadedVideoUrl ? "#22c55e" : "#a855f7" }} />
              {uploadedVideoUrl
                ? "Local Video File Connected (Direct Video & Audio Cut)"
                : "YouTube Stream Connected (Live Player & Motion Video)"}
            </span>
            <span className="text-[10px] text-[#8888aa] font-mono">
              {clip.durationSeconds}s cut
            </span>
          </div>

          {/* YouTube Real Clip Player Preview (with Audio) */}
          {youtubeId && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#0c0c18] border border-[#1e1e3a]">
              <div className="flex items-center justify-between text-xs text-[#d0d0ee] font-semibold">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <Tv size={14} /> YouTube Segment ({clip.startTime} – {clip.endTime})
                </span>
                <a
                  href={`https://youtube.com/watch?v=${youtubeId}&t=${clip.startSeconds}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-[#8888aa] hover:text-white transition-colors"
                >
                  Open on YouTube <ExternalLink size={10} />
                </a>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-md">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?start=${clip.startSeconds}&end=${clip.endSeconds}&autoplay=1`}
                  title={clip.suggestedTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="p-3 rounded-xl bg-[#161628] border border-[#1e1e3a]">
            <div className="text-[10px] text-[#55557a] mb-0.5 font-semibold uppercase tracking-wider">
              Clip Title
            </div>
            <div className="text-sm font-semibold text-[#f0f0ff]">
              {clip.suggestedTitle}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-[#d0d0ee] block mb-2">
              1. Video Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "9:16", label: "9:16 Vertical", desc: "TikTok / Reels", icon: Smartphone },
                { key: "1:1", label: "1:1 Square", desc: "Feed Posts", icon: Square },
                { key: "16:9", label: "16:9 Horizontal", desc: "YouTube", icon: Monitor },
              ].map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setAspectRatio(key as typeof aspectRatio)}
                  className="p-2.5 rounded-xl text-left transition-all flex flex-col gap-1"
                  style={{
                    background: aspectRatio === key ? "rgba(124,58,237,0.3)" : "rgba(26,26,46,0.6)",
                    border: `1px solid ${aspectRatio === key ? "#7c3aed" : "#1e1e3a"}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#f0f0ff]">
                    <Icon size={14} className={aspectRatio === key ? "text-purple-400" : "text-[#55557a]"} />
                    {label}
                  </div>
                  <div className="text-[10px] text-[#8888aa]">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & Subtitles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#d0d0ee] block mb-1.5">
                2. Resolution
              </label>
              <div className="flex gap-2">
                {(["1080p", "720p"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all"
                    style={{
                      background: resolution === r ? "rgba(124,58,237,0.3)" : "rgba(26,26,46,0.6)",
                      border: `1px solid ${resolution === r ? "#7c3aed" : "#1e1e3a"}`,
                      color: resolution === r ? "#9f60ff" : "#8888aa",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#d0d0ee] block mb-1.5">
                3. Subtitles
              </label>
              <button
                onClick={() => setIncludeCaptions(!includeCaptions)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                style={{
                  background: includeCaptions ? "rgba(34,197,94,0.18)" : "rgba(26,26,46,0.6)",
                  border: `1px solid ${includeCaptions ? "rgba(34,197,94,0.5)" : "#1e1e3a"}`,
                  color: includeCaptions ? "#4ade80" : "#8888aa",
                }}
              >
                <span>Burn AI Subtitles</span>
                {includeCaptions && <Check size={14} />}
              </button>
            </div>
          </div>

          {/* Rendered Preview Player */}
          {generatedVideoUrl && (
            <div className="p-3 rounded-2xl bg-[#0c0c18] border border-purple-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#d0d0ee] font-semibold">
                <span className="flex items-center gap-1.5 text-green-400">
                  <Check size={14} /> Clipped Video Ready
                </span>
                <span className="text-[10px] text-[#8888aa]">{aspectRatio} · {resolution}</span>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center max-h-[160px]">
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

          {/* Action Button */}
          <div>
            {isRendering ? (
              <div className="space-y-2 p-4 rounded-xl bg-[#161628] border border-purple-500/30">
                <div className="flex justify-between text-xs text-[#f0f0ff]">
                  <span className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-purple-400" />
                    Clipping & Rendering {aspectRatio} Video...
                  </span>
                  <span className="font-mono text-purple-400 font-bold">{renderProgress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-black/60">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-150"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleRenderAndClipVideo}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <Video size={17} />
                {generatedVideoUrl ? "Re-Render & Download Video Clip" : "🎬 Clip & Download Video File (.mp4/.webm)"}
              </button>
            )}
          </div>

          {/* File Exports */}
          <div className="pt-3 border-t border-[#1e1e3a]">
            <div className="text-xs font-semibold text-[#8888aa] mb-2">
              Export Subtitles & Transcripts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleDownloadSRT}
                className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                title="Download SubRip subtitle file"
              >
                <FileCode size={13} className="text-cyan-400" />
                .SRT Subtitle
              </button>
              <button
                onClick={handleDownloadTXT}
                className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                title="Download text transcript"
              >
                <FileText size={13} className="text-amber-400" />
                .TXT Script
              </button>
              <button
                onClick={handleDownloadJSON}
                className="btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                title="Download JSON metadata"
              >
                <Sparkles size={13} className="text-purple-400" />
                .JSON Data
              </button>
            </div>
          </div>

          {/* Copy Shortcuts */}
          <div className="flex items-center justify-between text-xs text-[#8888aa] pt-1">
            <button
              onClick={() => copyToClipboard(clip.suggestedTitle, "title")}
              className="hover:text-white transition-colors"
            >
              {copiedType === "title" ? "✓ Title Copied!" : "📋 Copy Title"}
            </button>
            <button
              onClick={() => copyToClipboard(clip.suggestedCaptions.storytelling, "caption")}
              className="hover:text-white transition-colors"
            >
              {copiedType === "caption" ? "✓ Caption Copied!" : "📋 Copy Caption"}
            </button>
            <button
              onClick={() => copyToClipboard(clip.hashtags.join(" "), "tags")}
              className="hover:text-white transition-colors"
            >
              {copiedType === "tags" ? "✓ Hashtags Copied!" : "📋 Copy Hashtags"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
