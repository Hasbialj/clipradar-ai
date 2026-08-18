import { Metadata } from "next";
import { Settings, Bell, Shield, Cpu, Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings — ClipRadar AI",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen animated-gradient-bg p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: "#f0f0ff", letterSpacing: "-0.02em" }}>
          Settings
        </h1>
        <p style={{ color: "#8888aa" }}>Configure ClipRadar AI to your preferences.</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {[
          { icon: Cpu, title: "AI Engine", desc: "Configure analysis models and pipeline settings", color: "#7c3aed" },
          { icon: Bell, title: "Notifications", desc: "Manage analysis completion alerts", color: "#f97316" },
          { icon: Palette, title: "Appearance", desc: "Theme, language, and display preferences", color: "#ec4899" },
          { icon: Shield, title: "Privacy & Security", desc: "Data retention and account security", color: "#22c55e" },
        ].map((item) => (
          <div key={item.title} className="glass-card glass-card-hover p-5 flex items-center gap-4 cursor-pointer">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
            >
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "#f0f0ff" }}>{item.title}</div>
              <div className="text-xs mt-0.5" style={{ color: "#55557a" }}>{item.desc}</div>
            </div>
            <Settings size={14} style={{ color: "#55557a" }} />
          </div>
        ))}

        {/* API Integration note */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <div className="text-sm font-semibold mb-2" style={{ color: "#9f60ff" }}>
            🔌 AI Integration Points
          </div>
          <div className="text-xs space-y-1" style={{ color: "#8888aa" }}>
            <div>• <strong style={{ color: "#d0d0ee" }}>Speech-to-Text:</strong> Connect OpenAI Whisper or Google STT</div>
            <div>• <strong style={{ color: "#d0d0ee" }}>LLM Analysis:</strong> Connect GPT-4 / Gemini Pro for transcript scoring</div>
            <div>• <strong style={{ color: "#d0d0ee" }}>Video Processing:</strong> Connect FFmpeg server for clip export</div>
            <div>• <strong style={{ color: "#d0d0ee" }}>YouTube Download:</strong> Connect yt-dlp backend service</div>
          </div>
        </div>
      </div>
    </div>
  );
}
