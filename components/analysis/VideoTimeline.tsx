"use client";

import { ClipResult } from "@/lib/ai/types";
import { CATEGORY_META } from "@/lib/ai/types";
import { scoreToMarkerColor, scoreToGradient } from "@/lib/utils";

interface Props {
  clips: ClipResult[];
  totalDurationSeconds: number;
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
}

export function VideoTimeline({
  clips,
  totalDurationSeconds,
  selectedClipId,
  onSelectClip,
}: Props) {
  const topClips = clips.slice(0, 15); // Show top 15 markers max

  return (
    <div
      className="glass-card p-5"
      style={{ userSelect: "none" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>
          Video Timeline
        </h3>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#55557a" }}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" /> 90+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-400" /> 80+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" /> 70+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" /> 60+
          </span>
        </div>
      </div>

      {/* Timeline bar */}
      <div
        className="relative h-12 rounded-xl overflow-visible mb-3"
        style={{
          background: "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(236,72,153,0.05), rgba(124,58,237,0.08))",
          border: "1px solid #1e1e3a",
        }}
      >
        {/* Progress waveform decoration */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(124,58,237,0.3) 4px, rgba(124,58,237,0.3) 5px)",
          }}
        />

        {/* Clip markers */}
        {topClips.map((clip) => {
          const leftPct = (clip.startSeconds / totalDurationSeconds) * 100;
          const widthPct = (clip.durationSeconds / totalDurationSeconds) * 100;
          const color = scoreToMarkerColor(clip.score.total);
          const isSelected = clip.id === selectedClipId;
          const primaryCat = clip.categories[0];
          const meta = CATEGORY_META[primaryCat];

          return (
            <button
              key={clip.id}
              title={`${meta.emoji} ${clip.startTime} — Score ${clip.score.total}`}
              onClick={() => onSelectClip(clip.id)}
              className="absolute top-0 h-full cursor-pointer transition-all group"
              style={{
                left: `${leftPct}%`,
                width: `max(${widthPct}%, 4px)`,
                minWidth: 6,
                zIndex: isSelected ? 10 : 1,
              }}
            >
              {/* Highlight bar */}
              <div
                className="absolute inset-0 rounded-sm transition-all"
                style={{
                  background: `${color}30`,
                  border: `1px solid ${color}60`,
                  opacity: isSelected ? 1 : 0.6,
                }}
              />
              {/* Marker dot */}
              <div
                className={`absolute -top-2 left-0 w-3.5 h-3.5 rounded-full transition-all ${isSelected ? "marker-pulse" : "group-hover:scale-125"}`}
                style={{
                  background: color,
                  boxShadow: isSelected
                    ? `0 0 8px ${color}, 0 0 16px ${color}60`
                    : `0 0 4px ${color}80`,
                  transform: `translateX(-50%)`,
                  border: "2px solid rgba(0,0,0,0.4)",
                }}
              />
            </button>
          );
        })}

        {/* Time labels */}
        <div
          className="absolute bottom-1 left-3 text-[9px] font-mono"
          style={{ color: "#55557a" }}
        >
          00:00
        </div>
        <div
          className="absolute bottom-1 right-3 text-[9px] font-mono"
          style={{ color: "#55557a" }}
        >
          {new Date(totalDurationSeconds * 1000).toISOString().substr(11, 8)}
        </div>
      </div>

      {/* Quick clips row */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {topClips.slice(0, 8).map((clip) => {
          const color = scoreToMarkerColor(clip.score.total);
          const isSelected = clip.id === selectedClipId;
          const meta = CATEGORY_META[clip.categories[0]];

          return (
            <button
              key={clip.id}
              onClick={() => onSelectClip(clip.id)}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-center"
              style={{
                background: isSelected
                  ? `${color}20`
                  : "rgba(26,26,46,0.6)",
                border: `1px solid ${isSelected ? color + "60" : "#1e1e3a"}`,
                minWidth: 80,
              }}
            >
              <span className="text-base">{meta.emoji}</span>
              <span
                className="text-[10px] font-mono font-semibold"
                style={{ color: isSelected ? color : "#8888aa" }}
              >
                {clip.startTime.slice(-5)}
              </span>
              <span
                className={`text-xs font-bold bg-gradient-to-r ${scoreToGradient(clip.score.total)} bg-clip-text text-transparent`}
              >
                {clip.score.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
