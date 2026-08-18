"use client";

import { CATEGORY_META, MomentCategory } from "@/lib/ai/types";
import { scoreToGradient } from "@/lib/utils";

const DEMO_MOMENTS = [
  { score: 94, category: "SHOCK" as MomentCategory, timestamp: "37:12", title: "Ternyata Selama Ini Kita Salah" },
  { score: 92, category: "FUNNY" as MomentCategory, timestamp: "51:02", title: "Momen Paling Lucu Yang Terekam" },
  { score: 89, category: "INSIGHT" as MomentCategory, timestamp: "12:43", title: "Insight Yang Mengubah Segalanya" },
  { score: 87, category: "CONTROVERSIAL" as MomentCategory, timestamp: "24:17", title: "Pendapat Yang Bikin Ribut" },
  { score: 84, category: "EMOTIONAL" as MomentCategory, timestamp: "1:08:34", title: "Cerita Yang Bikin Baper" },
  { score: 81, category: "PLOT_TWIST" as MomentCategory, timestamp: "44:55", title: "Plot Twist Yang Nggak Nyangka" },
];

export function ViralMomentsList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "#f0f0ff" }}>
          Viral Moments
        </h2>
        <button className="btn-ghost text-xs">Browse all</button>
      </div>
      <div className="space-y-2">
        {DEMO_MOMENTS.map((m, i) => {
          const meta = CATEGORY_META[m.category];
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card-hover cursor-pointer"
              style={{ background: "rgba(17,17,32,0.6)", border: "1px solid #1e1e3a" }}
            >
              {/* Score */}
              <div
                className={`text-xl font-bold font-mono w-10 text-right flex-shrink-0 bg-gradient-to-r ${scoreToGradient(m.score)} bg-clip-text text-transparent`}
              >
                {m.score}
              </div>

              {/* Category badge */}
              <span
                className={`category-chip ${meta.bg} ${meta.color} flex-shrink-0`}
              >
                {meta.emoji} {meta.label}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: "#d0d0ee" }}
                >
                  {m.title}
                </div>
              </div>

              {/* Timestamp */}
              <div
                className="text-xs font-mono flex-shrink-0"
                style={{ color: "#55557a" }}
              >
                {m.timestamp}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
