import { Metadata } from "next";
import { CATEGORY_META, MomentCategory } from "@/lib/ai/types";

export const metadata: Metadata = {
  title: "Viral Moments — ClipRadar AI",
  description: "Browse all detected viral moments across your analyzed videos.",
};

const ALL_CATS = Object.keys(CATEGORY_META) as MomentCategory[];

const DEMO_MOMENTS = [
  { cat: "SHOCK" as MomentCategory, score: 94, title: "Ternyata Selama Ini Kita Salah", ts: "37:12–37:48", video: "Podcast XYZ" },
  { cat: "FUNNY" as MomentCategory, score: 92, title: "Momen Paling Lucu Yang Terekam", ts: "51:02–51:26", video: "Interview ABC" },
  { cat: "INSIGHT" as MomentCategory, score: 89, title: "Insight Yang Mengubah Segalanya", ts: "12:43–13:35", video: "Podcast XYZ" },
  { cat: "CONTROVERSIAL" as MomentCategory, score: 87, title: "Pendapat Kontroversial Soal Karier", ts: "24:17–24:55", video: "Debate GHI" },
  { cat: "EMOTIONAL" as MomentCategory, score: 84, title: "Cerita Ini Bikin Gue Baper", ts: "1:08:34–1:09:45", video: "Interview ABC" },
  { cat: "PLOT_TWIST" as MomentCategory, score: 81, title: "Plot Twist Yang Nggak Nyangka", ts: "44:55–45:30", video: "Podcast XYZ" },
  { cat: "RELATABLE" as MomentCategory, score: 78, title: "Situasi Ini Terlalu Real", ts: "18:22–18:55", video: "Vlog DEF" },
  { cat: "QUOTE" as MomentCategory, score: 75, title: "Quote Yang Bikin Speechless", ts: "01:22–01:42", video: "Interview ABC" },
  { cat: "CURIOSITY" as MomentCategory, score: 73, title: "Ada Yang Belum Gue Ceritain...", ts: "58:01–58:44", video: "Podcast XYZ" },
  { cat: "LIFE_LESSON" as MomentCategory, score: 71, title: "Pelajaran Hidup Yang Keras", ts: "1:21:04–1:22:10", video: "Interview ABC" },
];

export default function MomentsPage() {
  return (
    <div className="min-h-screen animated-gradient-bg p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#f0f0ff", letterSpacing: "-0.02em" }}>
          Viral Moments
        </h1>
        <p style={{ color: "#8888aa" }}>
          All detected high-potential moments across your video library.
        </p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: "rgba(124,58,237,0.25)",
            border: "1px solid rgba(124,58,237,0.5)",
            color: "#9f60ff",
          }}
        >
          All
        </button>
        {ALL_CATS.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: "rgba(26,26,46,0.6)",
                border: "1px solid #1e1e3a",
                color: "#8888aa",
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Moments grid */}
      <div className="grid grid-cols-2 gap-4">
        {DEMO_MOMENTS.map((m, i) => {
          const meta = CATEGORY_META[m.cat];
          return (
            <div
              key={i}
              className="glass-card glass-card-hover p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`category-chip ${meta.bg} ${meta.color}`}>
                  {meta.emoji} {meta.label}
                </span>
                <span
                  className="text-2xl font-black font-mono"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #eab308)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {m.score}
                </span>
              </div>
              <div className="text-sm font-semibold mb-2" style={{ color: "#f0f0ff" }}>
                {m.title}
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: "#55557a" }}>
                <span className="font-mono">{m.ts}</span>
                <span>{m.video}</span>
              </div>
              {/* Score bar */}
              <div
                className="mt-3 h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(26,26,46,0.8)" }}
              >
                <div
                  style={{
                    width: `${m.score}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                    borderRadius: 9999,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
