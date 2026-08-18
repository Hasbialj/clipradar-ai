"use client";

import { useState } from "react";
import { MomentCategory, CATEGORY_META, ClipDuration } from "@/lib/ai/types";
import { FilterOptions } from "@/lib/ai/types";
import { Filter, RotateCcw } from "lucide-react";

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as MomentCategory[];
const MIN_SCORE_OPTIONS = [60, 70, 80, 90];
const DURATION_OPTIONS: { key: ClipDuration; label: string }[] = [
  { key: "short", label: "Short (15–30s)" },
  { key: "medium", label: "Medium (30–60s)" },
  { key: "story", label: "Story (60–90s)" },
];

interface Props {
  onChange: (filters: FilterOptions) => void;
}

export function MomentFilter({ onChange }: Props) {
  const [selectedCats, setSelectedCats] = useState<MomentCategory[]>([]);
  const [minScore, setMinScore] = useState(60);
  const [durations, setDurations] = useState<ClipDuration[]>(["short", "medium", "story"]);

  const toggleCat = (cat: MomentCategory) => {
    const next = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    setSelectedCats(next);
    onChange({ categories: next, minScore, durationTypes: durations });
  };

  const setScore = (s: number) => {
    setMinScore(s);
    onChange({ categories: selectedCats, minScore: s, durationTypes: durations });
  };

  const toggleDuration = (d: ClipDuration) => {
    const next = durations.includes(d)
      ? durations.filter((x) => x !== d)
      : [...durations, d];
    setDurations(next);
    onChange({ categories: selectedCats, minScore, durationTypes: next });
  };

  const reset = () => {
    setSelectedCats([]);
    setMinScore(60);
    setDurations(["short", "medium", "story"]);
    onChange({ categories: [], minScore: 60, durationTypes: ["short", "medium", "story"] });
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "#9f60ff" }} />
          <span className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>
            Find Viral Moments
          </span>
        </div>
        <button onClick={reset} className="btn-ghost text-xs">
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Minimum score */}
      <div className="mb-4">
        <div className="text-xs font-medium mb-2" style={{ color: "#8888aa" }}>
          Minimum Viral Score
        </div>
        <div className="flex gap-2">
          {MIN_SCORE_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              className="flex-1 py-2 rounded-xl text-sm font-bold font-mono transition-all"
              style={{
                background:
                  minScore === s
                    ? "rgba(124,58,237,0.25)"
                    : "rgba(26,26,46,0.6)",
                border: `1px solid ${
                  minScore === s ? "rgba(124,58,237,0.5)" : "#1e1e3a"
                }`,
                color: minScore === s ? "#9f60ff" : "#55557a",
              }}
            >
              {s}+
            </button>
          ))}
        </div>
      </div>

      {/* Duration filter */}
      <div className="mb-4">
        <div className="text-xs font-medium mb-2" style={{ color: "#8888aa" }}>
          Clip Duration
        </div>
        <div className="flex flex-col gap-1.5">
          {DURATION_OPTIONS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: durations.includes(key)
                    ? "#7c3aed"
                    : "rgba(26,26,46,0.8)",
                  border: `1px solid ${
                    durations.includes(key) ? "#7c3aed" : "#1e1e3a"
                  }`,
                }}
                onClick={() => toggleDuration(key)}
              >
                {durations.includes(key) && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="text-xs transition-colors"
                style={{
                  color: durations.includes(key) ? "#d0d0ee" : "#55557a",
                }}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: "#8888aa" }}>
          Categories
        </div>
        <div className="flex flex-col gap-1.5">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = selectedCats.includes(cat) || selectedCats.length === 0;
            return (
              <label
                key={cat}
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => toggleCat(cat)}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: selectedCats.includes(cat)
                      ? "#7c3aed"
                      : "rgba(26,26,46,0.8)",
                    border: `1px solid ${
                      selectedCats.includes(cat) ? "#7c3aed" : "#1e1e3a"
                    }`,
                  }}
                >
                  {selectedCats.includes(cat) && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-xs transition-colors`}
                  style={{
                    color: active ? "#d0d0ee" : "#55557a",
                  }}
                >
                  {meta.emoji} {meta.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Active filter count */}
      {(selectedCats.length > 0 || minScore > 60) && (
        <div
          className="mt-4 px-3 py-2 rounded-xl text-xs text-center"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "#9f60ff",
          }}
        >
          {selectedCats.length > 0
            ? `Filtering: ${selectedCats.length} categories`
            : "All categories"}{" "}
          · Score ≥ {minScore}
        </div>
      )}
    </div>
  );
}
