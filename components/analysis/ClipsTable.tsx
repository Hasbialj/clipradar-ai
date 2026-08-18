"use client";

import { useState } from "react";
import { ClipResult, CATEGORY_META } from "@/lib/ai/types";
import { scoreToGradient, scoreToMarkerColor } from "@/lib/utils";
import { Download, Eye } from "lucide-react";
import { ExportModal } from "./ExportModal";

interface Props {
  clips: ClipResult[];
  videoTitle?: string;
  onSelectClip: (id: string) => void;
}

export function ClipsTable({ clips, videoTitle = "Video", onSelectClip }: Props) {
  const [selectedExportClip, setSelectedExportClip] = useState<ClipResult | null>(null);
  const top10 = clips.slice(0, 10);

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid #1e1e3a" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>
          🏆 Top 10 Clips Ranked
        </h3>
        <span className="text-xs" style={{ color: "#55557a" }}>
          by Viral Momentum Score
        </span>
      </div>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(10,10,20,0.6)" }}>
              {["Rank", "Timestamp", "Category", "Score", "Type", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-widest px-5 py-3"
                  style={{ color: "#55557a", borderBottom: "1px solid #1e1e3a" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top10.map((clip, i) => {
              const color = scoreToMarkerColor(clip.score.total);

              return (
                <tr
                  key={clip.id}
                  className="cursor-pointer transition-all"
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(10,10,20,0.3)",
                    borderBottom: "1px solid rgba(30,30,58,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "rgba(124,58,237,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 === 0 ? "transparent" : "rgba(10,10,20,0.3)";
                  }}
                  onClick={() => onSelectClip(clip.id)}
                >
                  {/* Rank */}
                  <td className="px-5 py-3">
                    <span
                      className="text-sm font-bold font-mono"
                      style={{ color }}
                    >
                      #{clip.rank}
                    </span>
                  </td>
                  {/* Timestamp */}
                  <td className="px-5 py-3">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "#8888aa" }}
                    >
                      {clip.startTime.slice(-5)} – {clip.endTime.slice(-5)}
                    </span>
                  </td>
                  {/* Category */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {clip.categories.slice(0, 2).map((cat) => {
                        const meta = CATEGORY_META[cat];
                        return (
                          <span
                            key={cat}
                            className={`category-chip ${meta.bg} ${meta.color}`}
                            style={{ fontSize: 10 }}
                          >
                            {meta.emoji} {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  {/* Score */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base font-black font-mono bg-gradient-to-r ${scoreToGradient(clip.score.total)} bg-clip-text text-transparent`}
                      >
                        {clip.score.total}
                      </span>
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{
                          background: "rgba(26,26,46,0.8)",
                          width: 48,
                        }}
                      >
                        <div
                          style={{
                            width: `${clip.score.total}%`,
                            height: "100%",
                            background: color,
                            borderRadius: 9999,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Duration type */}
                  <td className="px-5 py-3">
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(26,26,46,0.8)",
                        border: "1px solid #1e1e3a",
                        color: "#55557a",
                      }}
                    >
                      {clip.duration === "short"
                        ? "15–30s"
                        : clip.duration === "medium"
                        ? "30–60s"
                        : "60–90s"}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExportClip(clip);
                        }}
                        className="btn-primary text-[11px] py-1.5 px-2.5 flex items-center gap-1 shadow-sm"
                        title="Download 9:16 Video, SRT, TXT"
                      >
                        <Download size={12} />
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip.id);
                        }}
                        className="btn-ghost text-[11px] py-1 px-2 flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      {selectedExportClip && (
        <ExportModal
          clip={selectedExportClip}
          videoTitle={videoTitle}
          isOpen={true}
          onClose={() => setSelectedExportClip(null)}
        />
      )}
    </div>
  );
}
