"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Mic,
  Brain,
  Search,
  BarChart2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const STEPS = [
  { key: "uploading", label: "Uploading", icon: Upload, desc: "Sending video to analysis pipeline" },
  { key: "transcribing", label: "Transcribing", icon: Mic, desc: "Converting speech to text" },
  { key: "understanding", label: "Understanding", icon: Brain, desc: "Detecting content type & emotions" },
  { key: "detecting", label: "Detecting", icon: Search, desc: "Finding candidate viral moments" },
  { key: "scoring", label: "Scoring", icon: BarChart2, desc: "Computing Viral Momentum Scores" },
  { key: "ready", label: "Ready", icon: CheckCircle2, desc: "Analysis complete!" },
];

interface Props {
  currentStep: string;
  progress: number;
  message: string;
}

export function ProgressPipeline({ currentStep, progress, message }: Props) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 50);
    return () => clearTimeout(timer);
  }, [progress]);

  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div
      className="glass-card p-8"
      style={{ maxWidth: 640, margin: "0 auto" }}
    >
      {/* Title */}
      <div className="text-center mb-8">
        <div className="text-sm font-semibold mb-1" style={{ color: "#9f60ff" }}>
          AI Pipeline Running
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "#f0f0ff" }}>
          Analyzing your video...
        </h2>
        <p className="text-sm mt-2" style={{ color: "#8888aa" }}>
          {message || "Processing..."}
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const pending = i > currentIdx;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done
                      ? "rgba(34, 197, 94, 0.2)"
                      : active
                      ? "rgba(124, 58, 237, 0.25)"
                      : "rgba(26,26,46,0.6)",
                    border: done
                      ? "1px solid rgba(34,197,94,0.5)"
                      : active
                      ? "1px solid rgba(124,58,237,0.6)"
                      : "1px solid #1e1e3a",
                    boxShadow: active ? "0 0 16px rgba(124,58,237,0.3)" : "none",
                  }}
                >
                  {done ? (
                    <CheckCircle2 size={18} style={{ color: "#22c55e" }} />
                  ) : active ? (
                    <Loader2
                      size={18}
                      style={{ color: "#9f60ff" }}
                      className="animate-spin"
                    />
                  ) : (
                    <step.icon size={16} style={{ color: "#55557a" }} />
                  )}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: done ? "#22c55e" : active ? "#9f60ff" : "#55557a",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div
                  className="h-px flex-1 mx-1 transition-all duration-700"
                  style={{
                    width: 24,
                    background: done
                      ? "linear-gradient(90deg, #22c55e, #22c55e)"
                      : active
                      ? "linear-gradient(90deg, #7c3aed, #1e1e3a)"
                      : "#1e1e3a",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs" style={{ color: "#8888aa" }}>
          <span>Overall progress</span>
          <span className="font-mono" style={{ color: "#9f60ff" }}>
            {animatedProgress}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(26,26,46,0.8)" }}
        >
          <div
            className="score-bar-fill"
            style={{
              width: `${animatedProgress}%`,
              background: "linear-gradient(90deg, #7c3aed, #ec4899, #f97316)",
              transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>
      </div>

      {/* Fun fact */}
      <div
        className="mt-6 px-4 py-3 rounded-xl text-xs text-center"
        style={{
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.2)",
          color: "#8888aa",
        }}
      >
        💡 Did you know? Videos with strong hooks in the first 3 seconds get up
        to 70% more watch-through on short-form platforms.
      </div>
    </div>
  );
}
