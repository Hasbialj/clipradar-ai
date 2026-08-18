"use client";

import { useRouter } from "next/navigation";
import { Clock, Scissors, Flame, ChevronRight } from "lucide-react";
import { scoreToColor, scoreToGradient } from "@/lib/utils";

// Demo data for dashboard
const RECENT = [
  {
    id: "demo-1",
    title: "The Real Reason Most Podcasts Fail — Deep Dive",
    duration: "1:32:45",
    clips: 17,
    highestScore: 94,
    contentType: "Podcast",
    analyzedAt: "2 hours ago",
  },
  {
    id: "demo-2",
    title: "Startup Founder Interview: From Zero to $10M ARR",
    duration: "58:12",
    clips: 12,
    highestScore: 89,
    contentType: "Interview",
    analyzedAt: "Yesterday",
  },
  {
    id: "demo-3",
    title: "Day In My Life As A Self-Taught Developer",
    duration: "24:33",
    clips: 8,
    highestScore: 81,
    contentType: "Vlog",
    analyzedAt: "3 days ago",
  },
];

export function RecentAnalysis() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "#f0f0ff" }}>
          Recent Analysis
        </h2>
        <button className="btn-ghost text-xs">View all</button>
      </div>
      <div className="space-y-3">
        {RECENT.map((item) => (
          <div
            key={item.id}
            className="glass-card glass-card-hover p-4 cursor-pointer"
            onClick={() => router.push("/analyze?url=https://www.youtube.com/watch?v=demo")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: "#f0f0ff" }}
                >
                  {item.title}
                </div>
                <div
                  className="flex items-center gap-3 mt-2 text-xs"
                  style={{ color: "#8888aa" }}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {item.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Scissors size={11} />
                    {item.clips} clips
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      color: "#9f60ff",
                      border: "1px solid rgba(124,58,237,0.2)",
                    }}
                  >
                    {item.contentType}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div
                  className={`text-2xl font-bold font-mono bg-gradient-to-r ${scoreToGradient(item.highestScore)} bg-clip-text text-transparent`}
                >
                  {item.highestScore}
                </div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: "#55557a" }}>
                  <Flame size={10} className={scoreToColor(item.highestScore)} />
                  top score
                </div>
              </div>
            </div>
            <div
              className="flex items-center justify-between mt-3 pt-3 text-xs"
              style={{ borderTop: "1px solid #1e1e3a", color: "#55557a" }}
            >
              <span>{item.analyzedAt}</span>
              <span className="flex items-center gap-1 text-purple-400">
                View clips <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
