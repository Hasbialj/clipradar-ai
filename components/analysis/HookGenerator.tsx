"use client";

import { useState } from "react";
import { ClipResult } from "@/lib/ai/types";
import { Sparkles, Copy, Check } from "lucide-react";

interface Props {
  clip: ClipResult;
}

export function HookGenerator({ clip }: Props) {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);

  const copyHook = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: "#9f60ff" }} />
        <span className="text-xs font-semibold" style={{ color: "#9f60ff" }}>
          AI Hook Generator
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#9f60ff",
          }}
        >
          5 variants
        </span>
      </div>
      <div className="space-y-2">
        {clip.alternativeHooks.map((hook, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all group"
            style={{
              background:
                selected === i
                  ? "rgba(124,58,237,0.12)"
                  : "rgba(26,26,46,0.5)",
              border: `1px solid ${
                selected === i ? "rgba(124,58,237,0.4)" : "#1e1e3a"
              }`,
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
              style={{
                background:
                  selected === i
                    ? "rgba(124,58,237,0.4)"
                    : "rgba(26,26,46,0.8)",
                color: selected === i ? "#f0f0ff" : "#55557a",
                border: `1px solid ${selected === i ? "#7c3aed" : "#1e1e3a"}`,
              }}
            >
              {i + 1}
            </div>
            <p
              className="text-sm flex-1 leading-relaxed"
              style={{ color: selected === i ? "#f0f0ff" : "#8888aa" }}
            >
              {hook}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyHook(hook, i);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              title="Copy hook"
            >
              {copied === i ? (
                <Check size={13} style={{ color: "#22c55e" }} />
              ) : (
                <Copy size={13} style={{ color: "#55557a" }} />
              )}
            </button>
          </div>
        ))}
      </div>
      {/* Use selected hook */}
      <button
        className="btn-secondary w-full mt-3 text-sm"
        onClick={() => copyHook(clip.alternativeHooks[selected], -1)}
      >
        {copied === -1 ? (
          <>
            <Check size={14} style={{ color: "#22c55e" }} /> Copied!
          </>
        ) : (
          <>
            <Copy size={14} /> Copy Hook #{selected + 1}
          </>
        )}
      </button>
    </div>
  );
}
