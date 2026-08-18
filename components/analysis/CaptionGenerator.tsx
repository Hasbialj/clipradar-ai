"use client";

import { useState } from "react";
import { ClipResult } from "@/lib/ai/types";
import { Copy, Check, MessageSquare } from "lucide-react";

const TABS = [
  { key: "short", label: "Short" },
  { key: "storytelling", label: "Story" },
  { key: "controversial", label: "Hot Take" },
  { key: "curiosity", label: "Curiosity" },
  { key: "cta", label: "CTA" },
] as const;

interface Props {
  clip: ClipResult;
}

export function CaptionGenerator({ clip }: Props) {
  const [activeTab, setActiveTab] = useState<keyof typeof clip.suggestedCaptions>("short");
  const [copied, setCopied] = useState(false);

  const text = clip.suggestedCaptions[activeTab];

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={14} style={{ color: "#ec4899" }} />
        <span className="text-xs font-semibold" style={{ color: "#ec4899" }}>
          AI Caption Generator
        </span>
      </div>

      {/* Tab switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-3"
        style={{ background: "rgba(26,26,46,0.6)", border: "1px solid #1e1e3a" }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background:
                activeTab === key
                  ? "rgba(236,72,153,0.2)"
                  : "transparent",
              color: activeTab === key ? "#ec4899" : "#55557a",
              border: activeTab === key
                ? "1px solid rgba(236,72,153,0.3)"
                : "1px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Caption text */}
      <div
        className="p-4 rounded-xl min-h-[80px] relative"
        style={{
          background: "rgba(17,17,32,0.8)",
          border: "1px solid #1e1e3a",
        }}
      >
        <p className="text-sm leading-relaxed pr-8" style={{ color: "#d0d0ee" }}>
          {text}
        </p>
        <button
          onClick={copy}
          className="absolute top-3 right-3 transition-all"
          title="Copy caption"
        >
          {copied ? (
            <Check size={14} style={{ color: "#22c55e" }} />
          ) : (
            <Copy size={14} style={{ color: "#55557a" }} />
          )}
        </button>
      </div>

      {/* Hashtags */}
      <div className="mt-3">
        <div className="flex flex-wrap gap-1.5">
          {clip.hashtags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.2)",
                color: "#9f60ff",
              }}
              onClick={() => navigator.clipboard.writeText(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
