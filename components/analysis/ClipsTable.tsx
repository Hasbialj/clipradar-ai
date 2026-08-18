"use client";

import { useState } from "react";
import { ClipResult, CATEGORY_META } from "@/lib/ai/types";
import { scoreToGradient, scoreToMarkerColor } from "@/lib/utils";
import { Download, Eye } from "lucide-react";
import { VizardStudioModal } from "@/components/editor/VizardStudioModal";

interface Props {
  clips: ClipResult[];
  videoTitle?: string;
  videoUrl?: string;
  onSelectClip: (id: string) => void;
}

export function ClipsTable({ clips, videoTitle = "Video", videoUrl = "", onSelectClip }: Props) {
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
              const markerColor = scoreToMarkerColor(clip.score.total);
              const meta = CATEGORY_META[clip.categories[0]];

              return (
                <tr
                  key={clip.id}
                  className="hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer"
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(10,10,20,0.3)",
                    borderBottom: "1px solid rgba(30,30,58,0.5)",
                  }}
                  onClick={() => onSelectClip(clip.id)}
                >
                  <td className="px-5 py-3.5 text-xs font-mono font-bold" style={{ color: markerColor }}>
                    #{clip.rank}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono" style={{ color: "#8888aa" }}>
                    {clip.startTime} – {clip.endTime}
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    {meta && (
                      <span className={`category-chip ${meta.bg} ${meta.color}`}>
                        {meta.emoji} {meta.label}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-sm font-black font-mono bg-gradient-to-br ${scoreToGradient(clip.score.total)} bg-clip-text text-transparent`}
                    >
                      {clip.score.total}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#8888aa" }}>
                    {meta?.label || clip.categories[0]}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedExportClip(clip)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                        title="Open Vizard Studio"
                      >
                        <Download size={12} />
                        <span>Export</span>
                      </button>
                      <button
                        onClick={() => onSelectClip(clip.id)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                        title="View details"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vizard Studio Export Modal */}
      {selectedExportClip && (
        <VizardStudioModal
          clip={selectedExportClip}
          videoTitle={videoTitle}
          videoUrl={videoUrl}
          isOpen={true}
          onClose={() => setSelectedExportClip(null)}
        />
      )}
    </div>
  );
}
