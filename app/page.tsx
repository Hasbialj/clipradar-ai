import { HeroInput } from "@/components/dashboard/HeroInput";
import { RecentAnalysis } from "@/components/dashboard/RecentAnalysis";
import { ViralMomentsList } from "@/components/dashboard/ViralMomentsList";
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Scissors,
} from "lucide-react";

const STATS = [
  { label: "Videos Analyzed", value: "2,847", icon: Brain, color: "#7c3aed" },
  { label: "Clips Generated", value: "34,219", icon: Scissors, color: "#ec4899" },
  { label: "Avg. Viral Score", value: "78.4", icon: TrendingUp, color: "#f97316" },
  { label: "Hours Processed", value: "1,203", icon: Clock, color: "#22c55e" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Transcript Analysis",
    desc: "Speech-to-text with emotion detection and speaker identification",
    color: "#7c3aed",
  },
  {
    icon: Zap,
    title: "Viral Momentum Score",
    desc: "7-dimension scoring: Hook, Emotion, Curiosity, Shareability & more",
    color: "#f97316",
  },
  {
    icon: Target,
    title: "Smart Clip Boundaries",
    desc: "Context-aware timestamps — never cuts in the middle of a sentence",
    color: "#ec4899",
  },
];

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen animated-gradient-bg grid-bg"
      style={{ padding: "0" }}
    >
      {/* Hero section */}
      <div className="relative overflow-hidden" style={{ padding: "64px 48px 48px" }}>
        {/* Decorative glow orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute top-0 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
            transform: "translate(50%, -50%)",
          }}
        />

        {/* Header text */}
        <div className="relative text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#9f60ff",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI-Powered Viral Clip Detection
          </div>

          <h1
            className="text-5xl font-black mb-4 leading-tight"
            style={{
              background: "linear-gradient(135deg, #f0f0ff 30%, #9f60ff 70%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em",
            }}
          >
            Find the Moments
            <br />
            Worth Clipping.
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#8888aa" }}>
            Paste a YouTube URL or upload your video. Our AI analyzes every
            second and surfaces the clips most likely to perform on TikTok,
            Reels & Shorts.
          </p>
        </div>

        {/* Input */}
        <HeroInput />

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium glass-card"
              style={{ color: "#8888aa" }}
            >
              <f.icon size={13} style={{ color: f.color }} />
              {f.title}
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="mx-10 rounded-2xl mb-10 grid grid-cols-4 gap-0"
        style={{
          background: "rgba(17,17,32,0.8)",
          border: "1px solid #1e1e3a",
          overflow: "hidden",
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 px-6 py-5"
            style={{
              borderRight: i < STATS.length - 1 ? "1px solid #1e1e3a" : "none",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}40` }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div
                className="text-xl font-bold font-mono"
                style={{ color: "#f0f0ff" }}
              >
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "#55557a" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="px-10 pb-10 grid grid-cols-5 gap-6">
        {/* Recent analysis (wider) */}
        <div className="col-span-3">
          <RecentAnalysis />
        </div>
        {/* Viral moments feed */}
        <div className="col-span-2">
          <ViralMomentsList />
        </div>
      </div>
    </div>
  );
}
