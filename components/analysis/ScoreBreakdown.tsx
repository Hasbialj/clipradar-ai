"use client";

import { ViralScore } from "@/lib/ai/types";
import { useEffect, useState } from "react";

const DIMENSIONS = [
  { key: "hookStrength", label: "Hook Strength", max: 20, weight: "20%", color: "#7c3aed" },
  { key: "emotionalIntensity", label: "Emotional Intensity", max: 20, weight: "20%", color: "#ec4899" },
  { key: "unexpectedMoment", label: "Unexpected Moment", max: 15, weight: "15%", color: "#f97316" },
  { key: "curiosity", label: "Curiosity / Open Loop", max: 15, weight: "15%", color: "#eab308" },
  { key: "shareability", label: "Shareability", max: 10, weight: "10%", color: "#22c55e" },
  { key: "relatability", label: "Relatability", max: 10, weight: "10%", color: "#06b6d4" },
  { key: "commentPotential", label: "Comment Potential", max: 10, weight: "10%", color: "#a78bfa" },
] as const;

interface Props {
  score: ViralScore;
}

export function ScoreBreakdown({ score }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      {DIMENSIONS.map(({ key, label, max, weight, color }) => {
        const value = score[key];
        const pct = animated ? (value / max) * 100 : 0;

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: "#d0d0ee" }}>
                  {label}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: `${color}15`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {weight}
                </span>
              </div>
              <span className="text-xs font-mono font-bold" style={{ color }}>
                {value}/{max}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(26,26,46,0.8)" }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 9999,
                  background: `linear-gradient(90deg, ${color}aa, ${color})`,
                  transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  boxShadow: `0 0 6px ${color}60`,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Total */}
      <div
        className="flex items-center justify-between pt-3 mt-1"
        style={{ borderTop: "1px solid #1e1e3a" }}
      >
        <span className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>
          Total Viral Score
        </span>
        <span
          className="text-2xl font-black font-mono"
          style={{
            background:
              score.total >= 90
                ? "linear-gradient(135deg, #ef4444, #f97316)"
                : score.total >= 80
                ? "linear-gradient(135deg, #f97316, #eab308)"
                : score.total >= 70
                ? "linear-gradient(135deg, #eab308, #84cc16)"
                : "linear-gradient(135deg, #22c55e, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {score.total}/100
        </span>
      </div>

      <p
        className="text-xs leading-relaxed"
        style={{ color: "#55557a" }}
      >
        {score.total >= 90
          ? "🔥 Memiliki karakteristik yang sering menghasilkan engagement tinggi di short-form platform."
          : score.total >= 80
          ? "⚡ Diprediksi menarik — berpotensi tinggi untuk performa baik sebagai konten pendek."
          : score.total >= 70
          ? "✅ Layak diuji sebagai short-form content dengan potensi engagement yang solid."
          : "📊 Klip ini memiliki beberapa karakteristik menarik — perlu dioptimalkan lebih lanjut."}
      </p>
    </div>
  );
}
