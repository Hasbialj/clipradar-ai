import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — ClipRadar AI",
  description: "Track performance of your viral clips across platforms.",
};

const PLATFORM_STATS = [
  { name: "TikTok", views: "1.2M", clips: 18, avgScore: 84, color: "#00f2ea" },
  { name: "Instagram Reels", views: "840K", clips: 14, avgScore: 79, color: "#e1306c" },
  { name: "YouTube Shorts", views: "620K", clips: 11, avgScore: 76, color: "#ff0000" },
  { name: "Facebook Reels", views: "190K", clips: 4, avgScore: 71, color: "#1877f2" },
];

const TOP_PERFORMING = [
  { title: "Ternyata Selama Ini Kita Salah", platform: "TikTok", views: "420K", likes: "31K", score: 94 },
  { title: "Momen Paling Lucu Yang Terekam", platform: "Reels", views: "318K", likes: "24K", score: 92 },
  { title: "Insight Yang Mengubah Segalanya", platform: "Shorts", views: "211K", likes: "18K", score: 89 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen animated-gradient-bg p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#f0f0ff", letterSpacing: "-0.02em" }}>
          Analytics
        </h1>
        <p style={{ color: "#8888aa" }}>
          Performance insights across all your published clips.
        </p>
      </div>

      {/* Platform breakdown */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {PLATFORM_STATS.map((p) => (
          <div key={p.name} className="glass-card p-5">
            <div
              className="text-xs font-semibold mb-3"
              style={{ color: p.color }}
            >
              {p.name}
            </div>
            <div
              className="text-3xl font-black font-mono mb-1"
              style={{ color: "#f0f0ff" }}
            >
              {p.views}
            </div>
            <div className="text-xs mb-3" style={{ color: "#55557a" }}>
              total views
            </div>
            <div className="flex justify-between text-xs" style={{ color: "#8888aa" }}>
              <span>{p.clips} clips</span>
              <span style={{ color: p.color }}>Avg {p.avgScore}</span>
            </div>
            <div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(26,26,46,0.8)" }}
            >
              <div
                style={{
                  width: `${p.avgScore}%`,
                  height: "100%",
                  background: p.color,
                  borderRadius: 9999,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top performing clips */}
      <div className="glass-card overflow-hidden mb-8">
        <div
          className="px-6 py-4 text-sm font-semibold"
          style={{
            borderBottom: "1px solid #1e1e3a",
            color: "#f0f0ff",
          }}
        >
          🏆 Top Performing Clips
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(10,10,20,0.6)" }}>
                {["Clip", "Platform", "Views", "Likes", "Viral Score"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-widest px-5 py-3"
                    style={{
                      color: "#55557a",
                      borderBottom: "1px solid #1e1e3a",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PERFORMING.map((clip, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(30,30,58,0.5)" }}
                >
                  <td
                    className="px-5 py-3 text-sm font-medium"
                    style={{ color: "#d0d0ee" }}
                  >
                    {clip.title}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "#8888aa" }}>
                    {clip.platform}
                  </td>
                  <td
                    className="px-5 py-3 text-sm font-mono font-bold"
                    style={{ color: "#f0f0ff" }}
                  >
                    {clip.views}
                  </td>
                  <td
                    className="px-5 py-3 text-sm font-mono"
                    style={{ color: "#8888aa" }}
                  >
                    {clip.likes}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-base font-black font-mono"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #f97316)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {clip.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="p-4 rounded-xl text-sm"
        style={{
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.2)",
          color: "#8888aa",
        }}
      >
        ⚠️ <strong style={{ color: "#d0d0ee" }}>Note:</strong> ClipRadar AI predicts{" "}
        <strong style={{ color: "#9f60ff" }}>viral potential</strong>, not guaranteed
        performance. Actual results depend on audience, timing, platform algorithm,
        thumbnail, title, distribution, trends, and creator niche.
      </div>
    </div>
  );
}
