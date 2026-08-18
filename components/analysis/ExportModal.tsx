"use client";

import { useState } from "react";
import { ClipResult } from "@/lib/ai/types";
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
} from "lucide-react";

interface Props {
  clip: ClipResult;
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ clip, videoTitle, isOpen, onClose }: Props) {
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [resolution, setResolution] = useState<"1080p" | "720p">("1080p");
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Download SRT Subtitle File
  const handleDownloadSRT = () => {
    const srtContent = `1\n00:00:00,000 --> 00:00:04,000\n${clip.hook}\n\n2\n00:00:04,000 --> 00:00:15,000\n${clip.transcript}\n\n3\n00:00:15,000 --> 00:00:20,000\n${clip.commentTrigger}\n`;
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clip_${clip.rank}_${clip.startTime.replace(/:/g, "-")}_subtitles.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download TXT Transcript File
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

  // Download JSON Metadata
  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(clip, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clip_${clip.rank}_metadata.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Simulate Smart Crop & Video Render Export
  const handleExportVideo = () => {
    setIsRendering(true);
    setRenderProgress(10);
    setDownloadSuccess(false);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRendering(false);
            setDownloadSuccess(true);
            // Trigger sample mock MP4 download notification
            handleDownloadTXT(); // downloads package text
          }, 600);
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="glass-card w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: "#111122",
          border: "1px solid rgba(124, 58, 237, 0.4)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.1))",
            borderBottom: "1px solid #1e1e3a",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
              style={{
                background: "rgba(124,58,237,0.3)",
                border: "1px solid #7c3aed",
                color: "#f0f0ff",
              }}
            >
              #{clip.rank}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f0ff]">
                Export & Download Clip
              </h3>
              <p className="text-[11px] text-[#8888aa] font-mono">
                {clip.startTime} – {clip.endTime} ({clip.durationSeconds}s)
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
        <div className="p-6 space-y-5">
          {/* Title summary */}
          <div className="p-3 rounded-xl bg-[#161628] border border-[#1e1e3a]">
            <div className="text-xs text-[#55557a] mb-1 font-semibold uppercase tracking-wider">
              Selected Clip
            </div>
            <div className="text-sm font-semibold text-[#f0f0ff]">
              {clip.suggestedTitle}
            </div>
          </div>

          {/* Format / Aspect Ratio Selection */}
          <div>
            <label className="text-xs font-semibold text-[#d0d0ee] block mb-2">
              1. Video Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "9:16", label: "9:16 Vertical", desc: "TikTok / Reels / Shorts", icon: Smartphone },
                { key: "1:1", label: "1:1 Square", desc: "Feed Posts", icon: Square },
                { key: "16:9", label: "16:9 Horizontal", desc: "YouTube / Standard", icon: Monitor },
              ].map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setAspectRatio(key as typeof aspectRatio)}
                  className="p-3 rounded-xl text-left transition-all flex flex-col gap-1"
                  style={{
                    background: aspectRatio === key ? "rgba(124,58,237,0.25)" : "rgba(26,26,46,0.6)",
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

          {/* Resolution & Captions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#d0d0ee] block mb-2">
                2. Resolution
              </label>
              <div className="flex gap-2">
                {(["1080p", "720p"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold font-mono transition-all"
                    style={{
                      background: resolution === r ? "rgba(124,58,237,0.25)" : "rgba(26,26,46,0.6)",
                      border: `1px solid ${resolution === r ? "#7c3aed" : "#1e1e3a"}`,
                      color: resolution === r ? "#9f60ff" : "#8888aa",
                    }}
                  >
                    {r} (HD)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#d0d0ee] block mb-2">
                3. Subtitles
              </label>
              <button
                onClick={() => setIncludeCaptions(!includeCaptions)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                style={{
                  background: includeCaptions ? "rgba(34,197,94,0.15)" : "rgba(26,26,46,0.6)",
                  border: `1px solid ${includeCaptions ? "rgba(34,197,94,0.4)" : "#1e1e3a"}`,
                  color: includeCaptions ? "#4ade80" : "#8888aa",
                }}
              >
                <span>Burn AI Subtitles</span>
                {includeCaptions && <Check size={14} />}
              </button>
            </div>
          </div>

          {/* Main Video Render Button */}
          <div>
            {isRendering ? (
              <div className="space-y-2 p-4 rounded-xl bg-[#161628] border border-purple-500/30">
                <div className="flex justify-between text-xs text-[#f0f0ff]">
                  <span className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-purple-400" />
                    Reframing 9:16 & Rendering Clip...
                  </span>
                  <span className="font-mono text-purple-400">{renderProgress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-black/50">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            ) : downloadSuccess ? (
              <div className="p-3 rounded-xl bg-green-500/15 border border-green-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-400">
                  <Check size={16} /> Clip Package Downloaded!
                </div>
                <div className="text-[11px] text-[#8888aa]">
                  Transcript & metadata exported. (Connect FFmpeg backend for live server-side video rendering).
                </div>
              </div>
            ) : (
              <button
                onClick={handleExportVideo}
                className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-purple-500/20"
              >
                <Video size={16} />
                Download Short Clip ({aspectRatio} · {resolution})
              </button>
            )}
          </div>

          {/* Quick Raw File Downloads */}
          <div className="pt-3 border-t border-[#1e1e3a]">
            <div className="text-xs font-semibold text-[#8888aa] mb-2">
              Direct File Exports
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

          {/* Copy Caption / Title helper */}
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
