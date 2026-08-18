"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProgressPipeline } from "@/components/analysis/ProgressPipeline";
import { VideoTimeline } from "@/components/analysis/VideoTimeline";
import { ClipCard } from "@/components/analysis/ClipCard";
import { ClipsTable } from "@/components/analysis/ClipsTable";
import { MomentFilter } from "@/components/search/MomentFilter";
import { AnalysisResult, FilterOptions } from "@/lib/ai/types";
import {
  Brain,
  Scissors,
  Flame,
  Clock,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { scoreToGradient } from "@/lib/utils";

function AnalyzePage() {
  const params = useSearchParams();
  const urlParam = params.get("url");
  const fileParam = params.get("file");

  const [pipeline, setPipeline] = useState({ step: "idle", progress: 0, message: "" });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    minScore: 60,
    durationTypes: ["short", "medium", "story"],
  });
  const [activeView, setActiveView] = useState<"clips" | "table">("clips");
  const hasStarted = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    setPipeline({ step: "uploading", progress: 5, message: "Starting analysis..." });

    try {
      // Simulate streaming progress by polling with SSE-like pattern
      const steps = [
        { step: "uploading", progress: 15, message: "Uploading video to pipeline...", delay: 600 },
        { step: "transcribing", progress: 30, message: "Extracting audio & running speech-to-text...", delay: 1200 },
        { step: "transcribing", progress: 50, message: "Transcribing speech segments...", delay: 1000 },
        { step: "understanding", progress: 60, message: "Analyzing content type & language...", delay: 800 },
        { step: "understanding", progress: 65, message: "Running emotion detection & speaker analysis...", delay: 700 },
        { step: "detecting", progress: 75, message: "Detecting candidate viral moments...", delay: 900 },
        { step: "scoring", progress: 85, message: "Computing Viral Momentum Scores...", delay: 800 },
        { step: "scoring", progress: 92, message: "Generating hooks, titles & captions...", delay: 700 },
      ];

      for (const s of steps) {
        await new Promise((r) => setTimeout(r, s.delay));
        setPipeline({ step: s.step, progress: s.progress, message: s.message });
      }

      // Make actual API call
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: urlParam || undefined,
          fileName: fileParam || undefined,
        }),
      });

      if (!resp.ok) throw new Error("Analysis failed");
      const data = await resp.json();

      setPipeline({ step: "ready", progress: 100, message: "Analysis complete! Ready to explore." });
      setResult(data.result);

      // Auto-select top clip
      if (data.result.clips?.length > 0) {
        setSelectedClipId(data.result.clips[0].id);
      }
    } catch (err) {
      setError("Analysis failed. Please try again.");
      setPipeline({ step: "error", progress: 0, message: "Error occurred" });
    }
  }, [urlParam, fileParam]);

  useEffect(() => {
    if (urlParam || fileParam) {
      runAnalysis();
    }
  }, [urlParam, fileParam, runAnalysis]);

  // Filter clips
  const filteredClips = result?.clips.filter((clip) => {
    if (clip.score.total < filters.minScore) return false;
    if (!filters.durationTypes.includes(clip.duration)) return false;
    if (filters.categories.length > 0) {
      if (!clip.categories.some((c) => filters.categories.includes(c))) return false;
    }
    return true;
  }) ?? [];

  const handleSelectClip = (id: string) => {
    setSelectedClipId(id);
    // Scroll to clip card
    setTimeout(() => {
      const el = document.getElementById(`clip-${id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const isLoading = pipeline.step !== "ready" && pipeline.step !== "error" && pipeline.step !== "idle";
  const showInput = !urlParam && !fileParam;

  return (
    <div
      className="min-h-screen animated-gradient-bg"
      style={{ padding: "32px 32px 48px" }}
    >
      {/* Back nav */}
      <div className="mb-6">
        <Link href="/" className="btn-ghost text-sm">
          <ChevronLeft size={15} /> Back to Dashboard
        </Link>
      </div>

      {/* No input state */}
      {showInput && (
        <div className="text-center py-32">
          <div className="text-4xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#f0f0ff" }}>
            No Video Selected
          </h2>
          <p className="mb-6" style={{ color: "#8888aa" }}>
            Go back to the dashboard and paste a YouTube URL or upload a video.
          </p>
          <Link href="/" className="btn-primary">
            ← Go to Dashboard
          </Link>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="max-w-lg mx-auto flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
          }}
        >
          <AlertTriangle size={18} />
          <div>
            <div className="font-semibold">Analysis Error</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Loading: pipeline progress */}
      {isLoading && (
        <div className="py-16">
          <ProgressPipeline
            currentStep={pipeline.step}
            progress={pipeline.progress}
            message={pipeline.message}
          />
        </div>
      )}

      {/* Results */}
      {result && pipeline.step === "ready" && (
        <div className="space-y-6 fade-up">
          {/* Analysis header */}
          <div
            className="glass-card p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(17,17,32,0.9))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div
                  className="text-xs font-semibold mb-1 uppercase tracking-widest"
                  style={{ color: "#9f60ff" }}
                >
                  Video Analysis Complete
                </div>
                <h1
                  className="text-xl font-bold mb-1"
                  style={{ color: "#f0f0ff" }}
                >
                  {result.videoMetadata.title}
                </h1>
                <div
                  className="flex items-center gap-4 text-sm"
                  style={{ color: "#8888aa" }}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {result.videoMetadata.duration}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      color: "#9f60ff",
                      border: "1px solid rgba(124,58,237,0.3)",
                    }}
                  >
                    {result.videoMetadata.contentType}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div
                    className="text-3xl font-black font-mono"
                    style={{ color: "#f0f0ff" }}
                  >
                    {result.totalClipsFound}
                  </div>
                  <div className="text-xs" style={{ color: "#55557a" }}>
                    clips found
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-black font-mono bg-gradient-to-r ${scoreToGradient(result.highestScore)} bg-clip-text text-transparent`}
                  >
                    {result.highestScore}
                  </div>
                  <div className="text-xs" style={{ color: "#55557a" }}>
                    highest score
                  </div>
                </div>
                <div className="text-center">
                  <Flame size={28} className="mx-auto" style={{ color: "#f97316" }} />
                  <div className="text-xs mt-0.5" style={{ color: "#55557a" }}>
                    viral potential
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <VideoTimeline
            clips={result.clips}
            totalDurationSeconds={result.videoMetadata.durationSeconds}
            selectedClipId={selectedClipId}
            onSelectClip={handleSelectClip}
          />

          {/* Main layout: filter sidebar + clips */}
          <div className="grid grid-cols-4 gap-6">
            {/* Filter sidebar */}
            <div className="col-span-1">
              <MomentFilter onChange={setFilters} />
            </div>

            {/* Clips panel */}
            <div className="col-span-3 space-y-4">
              {/* View switcher + count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors size={15} style={{ color: "#9f60ff" }} />
                  <span className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>
                    {filteredClips.length} Clips
                  </span>
                  {filters.categories.length > 0 || filters.minScore > 60 ? (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(124,58,237,0.15)",
                        color: "#9f60ff",
                        border: "1px solid rgba(124,58,237,0.3)",
                      }}
                    >
                      filtered
                    </span>
                  ) : null}
                </div>

                <div
                  className="flex gap-1 p-1 rounded-xl"
                  style={{ background: "rgba(26,26,46,0.6)", border: "1px solid #1e1e3a" }}
                >
                  {(["clips", "table"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setActiveView(v)}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                      style={
                        activeView === v
                          ? {
                              background: "rgba(124,58,237,0.2)",
                              color: "#f0f0ff",
                              border: "1px solid rgba(124,58,237,0.3)",
                            }
                          : { color: "#55557a", border: "1px solid transparent" }
                      }
                    >
                      {v === "clips" ? "🃏 Clips" : "📊 Table"}
                    </button>
                  ))}
                </div>
              </div>

              {filteredClips.length === 0 ? (
                <div
                  className="glass-card p-12 text-center"
                  style={{ color: "#55557a" }}
                >
                  <Brain size={32} className="mx-auto mb-3 opacity-30" />
                  <div>No clips match your filters. Try adjusting the criteria.</div>
                </div>
              ) : activeView === "clips" ? (
                <div className="space-y-4">
                  {filteredClips.map((clip) => (
                    <ClipCard
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      onSelect={() => setSelectedClipId(clip.id)}
                    />
                  ))}
                </div>
              ) : (
                <ClipsTable
                  clips={filteredClips}
                  onSelectClip={handleSelectClip}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzePageWrapper() {
  return (
    <Suspense>
      <AnalyzePage />
    </Suspense>
  );
}
