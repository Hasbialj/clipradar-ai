"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Link,
  Upload,
  PlayCircle,
  Sparkles,
  AlertCircle,
  FileVideo,
  X,
} from "lucide-react";
import { isValidYouTubeUrl } from "@/lib/utils";
import { videoFileStore } from "@/lib/video/videoStore";

export function HeroInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"url" | "file">("url");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = () => {
    setError("");
    if (mode === "url") {
      if (!url.trim()) { setError("Please enter a YouTube URL."); return; }
      if (!isValidYouTubeUrl(url.trim())) {
        setError("Invalid YouTube URL. Please check and try again.");
        return;
      }
      router.push(`/analyze?url=${encodeURIComponent(url.trim())}`);
    } else {
      if (!file) { setError("Please select a video file."); return; }
      videoFileStore.setFile(file);
      // Store file name in session for the analyze page
      sessionStorage.setItem("uploadedFileName", file.name);
      sessionStorage.setItem("uploadedFileSize", String(file.size));
      router.push(`/analyze?file=${encodeURIComponent(file.name)}`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("video/")) {
      setFile(dropped);
      videoFileStore.setFile(dropped);
      setMode("file");
      setError("");
    } else {
      setError("Please drop a valid video file.");
    }
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tab switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-4 w-fit mx-auto"
        style={{ background: "rgba(26, 26, 46, 0.8)", border: "1px solid #1e1e3a" }}
      >
        {(["url", "file"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={
              mode === m
                ? {
                    background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.2))",
                    color: "#f0f0ff",
                    border: "1px solid rgba(124,58,237,0.4)",
                  }
                : { color: "#8888aa", border: "1px solid transparent" }
            }
          >
            {m === "url" ? <PlayCircle size={15} /> : <Upload size={15} />}
            {m === "url" ? "YouTube URL" : "Upload Video"}
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === "url" ? (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Link
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "#55557a" }}
            />
            <input
              id="youtube-url-input"
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="cr-input pl-11"
            />
          </div>
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            className="btn-primary flex-shrink-0"
            style={{ minWidth: 160 }}
          >
            <Sparkles size={17} />
            Analyze Video
          </button>
        </div>
      ) : (
        <div>
          <div
            id="file-drop-zone"
            className="relative rounded-2xl transition-all cursor-pointer"
            style={{
              border: `2px dashed ${dragging ? "#7c3aed" : "#2a2a50"}`,
              background: dragging ? "rgba(124,58,237,0.08)" : "rgba(17,17,32,0.6)",
              padding: "40px 24px",
              textAlign: "center",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setError(""); }
              }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.2)" }}
                >
                  <FileVideo size={28} style={{ color: "#9f60ff" }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: "#f0f0ff" }}>
                    {file.name}
                  </div>
                  <div className="text-sm mt-1" style={{ color: "#8888aa" }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center float"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                  <Upload size={24} style={{ color: "#9f60ff" }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: "#f0f0ff" }}>
                    Drop your video here
                  </div>
                  <div className="text-sm mt-1" style={{ color: "#8888aa" }}>
                    or click to browse — MP4, MOV, MKV, AVI supported
                  </div>
                </div>
              </div>
            )}
          </div>
          {file && (
            <div className="flex justify-center mt-3">
              <button
                id="upload-analyze-btn"
                onClick={handleAnalyze}
                className="btn-primary"
              >
                <Sparkles size={17} />
                Analyze Video
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
          }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Tip */}
      <p className="text-center mt-4 text-sm" style={{ color: "#55557a" }}>
        Works best with podcasts, interviews, vlogs, and long-form content (30min–3hr)
      </p>
    </div>
  );
}
