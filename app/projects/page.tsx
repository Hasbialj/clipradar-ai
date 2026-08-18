import { Metadata } from "next";
import { FolderOpen, Plus, Clock, Scissors } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects — ClipRadar AI",
  description: "Organize your video analysis projects.",
};

const PROJECTS = [
  { name: "Podcast Season 3", videos: 12, clips: 87, updated: "2 days ago", color: "#7c3aed" },
  { name: "Interview Series", videos: 6, clips: 43, updated: "1 week ago", color: "#ec4899" },
  { name: "Daily Vlogs", videos: 30, clips: 201, updated: "Today", color: "#f97316" },
  { name: "Product Reviews", videos: 8, clips: 52, updated: "3 days ago", color: "#22c55e" },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen animated-gradient-bg p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2" style={{ color: "#f0f0ff", letterSpacing: "-0.02em" }}>
            Projects
          </h1>
          <p style={{ color: "#8888aa" }}>
            Organize your videos and clips into projects.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {PROJECTS.map((p) => (
          <div
            key={p.name}
            className="glass-card glass-card-hover p-6 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}
              >
                <FolderOpen size={22} style={{ color: p.color }} />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold mb-1" style={{ color: "#f0f0ff" }}>
                  {p.name}
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: "#55557a" }}>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {p.videos} videos
                  </span>
                  <span className="flex items-center gap-1">
                    <Scissors size={11} /> {p.clips} clips
                  </span>
                </div>
              </div>
            </div>
            <div
              className="mt-4 pt-4 text-xs flex justify-between"
              style={{ borderTop: "1px solid #1e1e3a", color: "#55557a" }}
            >
              <span>Updated {p.updated}</span>
              <span style={{ color: p.color }}>View Project →</span>
            </div>
          </div>
        ))}

        {/* Add new */}
        <div
          className="glass-card p-6 flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{
            border: "2px dashed #1e1e3a",
            background: "transparent",
            minHeight: 140,
          }}
        >
          <Plus size={24} style={{ color: "#55557a" }} />
          <span className="text-sm mt-2" style={{ color: "#55557a" }}>
            Create new project
          </span>
        </div>
      </div>
    </div>
  );
}
