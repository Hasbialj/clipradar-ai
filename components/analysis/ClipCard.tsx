"use client";

import { useState } from "react";
import { ClipResult, CATEGORY_META } from "@/lib/ai/types";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { HookGenerator } from "./HookGenerator";
import { CaptionGenerator } from "./CaptionGenerator";
import { ExportModal } from "./ExportModal";
import { videoFileStore } from "@/lib/video/videoStore";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Check,
  Download,
  Play,
  MessageSquare,
  Sparkles,
  AlignLeft,
  Tv,
} from "lucide-react";
import { clipDurationLabel, getYouTubeVideoId, scoreToGradient, scoreToMarkerColor } from "@/lib/utils";

interface Props {
  clip: ClipResult;
  videoTitle?: string;
  videoUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const DETAIL_TABS = [
  { key: "player", label: "Watch Clip", icon: Tv },
  { key: "breakdown", label: "Score Breakdown", icon: Sparkles },
  { key: "hooks", label: "Hooks", icon: Play },
  { key: "captions", label: "Captions", icon: MessageSquare },
  { key: "transcript", label: "Transcript", icon: AlignLeft },
] as const;

export function ClipCard({ clip, videoTitle = "Video", videoUrl = "", isSelected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [detailTab, setDetailTab] = useState<"player" | "breakdown" | "hooks" | "captions" | "transcript">("player");
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const markerColor = scoreToMarkerColor(clip.score.total);
  const youtubeId = videoUrl ? getYouTubeVideoId(videoUrl) : null;
  const localVideoUrl = videoFileStore.getObjectUrl();

  const copyTitle = async () => {
    await navigator.clipboard.writeText(clip.suggestedTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleClick = () => {
    onSelect();
    setExpanded(true);
  };

  return (
    <div
      id={`clip-${clip.id}`}
      className="glass-card transition-all duration-300"
      style={{
        border: isSelected
          ? `1px solid ${markerColor}60`
          : "1px solid #1e1e3a",
        background: isSelected
          ? `rgba(17,17,32,0.95)`
          : "rgba(17,17,32,0.7)",
        boxShadow: isSelected ? `0 0 24px ${markerColor}20` : "none",
      }}
    >
      {/* ── Header (always visible) ── */}
      <div
        className="p-5 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
            style={{
              background: `${markerColor}20`,
              border: `1px solid ${markerColor}50`,
              color: markerColor,
            }}
          >
            #{clip.rank}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {clip.categories.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <span
                    key={cat}
                    className={`category-chip ${meta.bg} ${meta.color}`}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </div>

            {/* Title */}
            <div
              className="text-sm font-semibold leading-snug mb-2"
              style={{ color: "#f0f0ff" }}
            >
              {clip.suggestedTitle}
            </div>

            {/* Timestamps + duration */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="flex items-center gap-1.5 text-xs font-mono"
                style={{ color: "#8888aa" }}
              >
                <Clock size={11} />
                {clip.startTime} – {clip.endTime}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(26,26,46,0.8)",
                  border: "1px solid #1e1e3a",
                  color: "#55557a",
                }}
              >
                {clipDurationLabel(clip.duration)}
              </span>
            </div>
          </div>

          {/* Score & Direct Download */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExportOpen(true);
              }}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-md shadow-purple-500/20"
              title="Download 9:16 Video, SRT, TXT"
            >
              <Download size={13} />
              <span>Download</span>
            </button>

            <div className="flex flex-col items-end gap-0.5">
              <div
                className={`text-3xl font-black font-mono bg-gradient-to-br ${scoreToGradient(clip.score.total)} bg-clip-text text-transparent`}
              >
                {clip.score.total}
              </div>
              <div className="text-[10px]" style={{ color: "#55557a" }}>
                viral score
              </div>
            </div>

            {/* Expand toggle */}
            <button
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: "rgba(26,26,46,0.6)",
                color: "#8888aa",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((p) => !p);
                if (!expanded) onSelect();
              }}
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Reason preview */}
        <div
          className="mt-3 text-xs leading-relaxed line-clamp-2"
          style={{ color: "#8888aa" }}
        >
          {clip.reason}
        </div>

        {/* Score bar */}
        <div className="mt-3">
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(26,26,46,0.8)" }}
          >
            <div
              style={{
                width: `${clip.score.total}%`,
                height: "100%",
                borderRadius: 9999,
                background: `linear-gradient(90deg, ${markerColor}aa, ${markerColor})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div
          style={{ borderTop: "1px solid #1e1e3a" }}
        >
          {/* Quick actions bar */}
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ background: "rgba(10,10,20,0.6)" }}
          >
            <button className="btn-secondary text-xs py-1.5" onClick={copyTitle}>
              {copiedTitle ? (
                <><Check size={12} style={{ color: "#22c55e" }} /> Copied!</>
              ) : (
                <><Copy size={12} /> Copy Title</>
              )}
            </button>
            <button
              className="btn-primary text-xs py-1.5"
              onClick={() => setIsExportOpen(true)}
            >
              <Download size={12} /> Download / Export Options
            </button>
            <div className="flex-1" />
            {/* Comment trigger */}
            <div
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.2)",
                color: "#9f60ff",
              }}
            >
              💬 {clip.commentTrigger}
            </div>
          </div>

          {/* Detail tabs */}
          <div className="px-5 pt-4">
            <div
              className="flex gap-1 p-1 rounded-xl mb-4"
              style={{
                background: "rgba(10,10,20,0.6)",
                border: "1px solid #1e1e3a",
                width: "fit-content",
              }}
            >
              {DETAIL_TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setDetailTab(key as typeof detailTab)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={
                    detailTab === key
                      ? {
                          background: "rgba(124,58,237,0.2)",
                          color: "#f0f0ff",
                          border: "1px solid rgba(124,58,237,0.3)",
                        }
                      : { color: "#55557a", border: "1px solid transparent" }
                  }
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <div className="pb-5">
              {detailTab === "player" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#8888aa]">
                    <span className="font-semibold text-[#f0f0ff]">
                      🎬 Playing Clip: {clip.startTime} – {clip.endTime}
                    </span>
                    <span className="font-mono text-purple-400 font-bold">
                      {clip.durationSeconds}s segment
                    </span>
                  </div>

                  {/* Real YouTube Player with audio & video */}
                  {youtubeId ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-[#1e1e3a] aspect-video shadow-2xl">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?start=${clip.startSeconds}&end=${clip.endSeconds}&autoplay=1&enablejsapi=1`}
                        title={clip.suggestedTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : localVideoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-[#1e1e3a] aspect-video shadow-2xl">
                      <video
                        src={localVideoUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                        onLoadedMetadata={(e) => {
                          (e.target as HTMLVideoElement).currentTime = clip.startSeconds;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-[#161628] border border-[#1e1e3a] text-center space-y-2">
                      <div className="text-3xl mb-1">🎬</div>
                      <div className="text-sm font-bold text-[#f0f0ff]">
                        YouTube Video Segment: {clip.startTime} – {clip.endTime}
                      </div>
                      <p className="text-xs text-[#8888aa] max-w-md mx-auto">
                        Untuk memutar YouTube langsung di tab ini, pastikan URL YouTube dimasukkan di dashboard (contoh: https://www.youtube.com/watch?v=...).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === "breakdown" && <ScoreBreakdown score={clip.score} />}
              {detailTab === "hooks" && <HookGenerator clip={clip} />}
              {detailTab === "captions" && <CaptionGenerator clip={clip} />}
              {detailTab === "transcript" && (
                <div
                  className="p-4 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: "rgba(10,10,20,0.6)",
                    border: "1px solid #1e1e3a",
                    color: "#8888aa",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                  }}
                >
                  <div
                    className="text-[10px] mb-3 uppercase tracking-widest"
                    style={{ color: "#55557a" }}
                  >
                    Transcript — {clip.startTime} to {clip.endTime}
                  </div>
                  {clip.transcript}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export & Download Modal */}
      <ExportModal
        clip={clip}
        videoTitle={videoTitle}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
