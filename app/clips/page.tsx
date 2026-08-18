import { Scissors, Download, Filter } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Clips — ClipRadar AI",
  description: "Manage and export your generated short-form clips.",
};

const DEMO_CLIPS = [
  { title: "Ternyata Selama Ini Kita Salah 😳", score: 94, cat: "SHOCK", duration: "36s", platform: "TikTok", from: "Podcast XYZ" },
  { title: "Momen Paling Lucu Yang Terekam 😂", score: 92, cat: "FUNNY", duration: "24s", platform: "Reels", from: "Interview ABC" },
  { title: "Insight Yang Mengubah Segalanya 🧠", score: 89, cat: "INSIGHT", duration: "52s", platform: "Shorts", from: "Podcast XYZ" },
  { title: "Plot Twist Yang Nggak Nyangka ⚡", score: 85, cat: "PLOT_TWIST", duration: "42s", platform: "TikTok", from: "Vlog DEF" },
  { title: "Pendapat Yang Bikin Ribut 💬", score: 81, cat: "CONTROVERSIAL", duration: "38s", platform: "Reels", from: "Debate GHI" },
];

const PLATFORM_COLORS: Record<string, string> = {
  TikTok: "#00f2ea",
  Reels: "#e1306c",
  Shorts: "#ff0000",
};

export default function ClipsPage() {
  return (
    <div className="min-h-screen animated-gradient-bg p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#f0f0ff", letterSpacing: "-0.02em" }}>
          My Clips
        </h1>
        <p style={{ color: "#8888aa" }}>
          Your generated short-form clips, ready to download and post.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clips", value: "47", color: "#7c3aed" },
          { label: "Avg. Score", value: "81.2", color: "#f97316" },
          { label: "Ready to Export", value: "12", color: "#22c55e" },
          { label: "Storage Used", value: "2.3 GB", color: "#ec4899" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card p-5"
          >
            <div className="text-2xl font-black font-mono" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "#55557a" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <button className="btn-secondary">
          <Filter size={14} /> Filter
        </button>
        <select
          className="cr-input"
          style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
        >
          <option>All Platforms</option>
          <option>TikTok</option>
          <option>Instagram Reels</option>
          <option>YouTube Shorts</option>
        </select>
        <select
          className="cr-input"
          style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
        >
          <option>All Scores</option>
          <option>90+</option>
          <option>80+</option>
          <option>70+</option>
        </select>
      </div>

      {/* Clips grid */}
      <div className="space-y-3">
        {DEMO_CLIPS.map((clip, i) => (
          <div
            key={i}
            className="glass-card glass-card-hover p-4 flex items-center gap-4"
          >
            {/* Thumbnail placeholder */}
            <div
              className="w-20 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.2))",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              <Scissors size={20} style={{ color: "#9f60ff" }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold mb-1" style={{ color: "#f0f0ff" }}>
                {clip.title}
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: "#55557a" }}>
                <span>{clip.from}</span>
                <span>·</span>
                <span>{clip.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: `${PLATFORM_COLORS[clip.platform]}20`,
                  border: `1px solid ${PLATFORM_COLORS[clip.platform]}40`,
                  color: PLATFORM_COLORS[clip.platform],
                }}
              >
                {clip.platform}
              </span>
              <span
                className="text-xl font-black font-mono"
                style={{
                  background: "linear-gradient(135deg, #f97316, #eab308)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {clip.score}
              </span>
              <button className="btn-secondary text-xs py-1.5">
                <Download size={12} /> Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
