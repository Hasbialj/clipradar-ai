// ============================================================
// ClipRadar AI — Vizard Subtitle & Video Style Presets
// ============================================================

export type SubtitleStyleId = "hormozi" | "mrbeast" | "neon" | "clean" | "karaoke";
export type LayoutPresetId = "blurred_fit" | "center_crop" | "split_screen" | "original_fit";

export interface SubtitlePreset {
  id: SubtitleStyleId;
  name: string;
  description: string;
  fontFamily: string;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  strokeWidth: number;
  bgBoxColor: string;
  hasBox: boolean;
  textTransform: "uppercase" | "none";
  animation: "bounce" | "glow" | "pop" | "smooth";
}

export interface LayoutPreset {
  id: LayoutPresetId;
  name: string;
  description: string;
  icon: string;
  renderMode: "blurred_fit" | "center_crop" | "split_screen" | "original_fit";
}

export const SUBTITLE_PRESETS: Record<SubtitleStyleId, SubtitlePreset> = {
  hormozi: {
    id: "hormozi",
    name: "Alex Hormozi",
    description: "Punchy bold font with bright yellow highlight & black outline",
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    textColor: "#ffffff",
    highlightColor: "#facc15", // bright yellow
    strokeColor: "#000000",
    strokeWidth: 4,
    bgBoxColor: "rgba(0, 0, 0, 0.75)",
    hasBox: false,
    textTransform: "uppercase",
    animation: "bounce",
  },
  mrbeast: {
    id: "mrbeast",
    name: "MrBeast Style",
    description: "High impact yellow & green punch with thick outline",
    fontFamily: "'Arial Black', sans-serif",
    textColor: "#ffffff",
    highlightColor: "#4ade80", // bright green
    strokeColor: "#000000",
    strokeWidth: 5,
    bgBoxColor: "rgba(0,0,0,0.8)",
    hasBox: false,
    textTransform: "uppercase",
    animation: "pop",
  },
  neon: {
    id: "neon",
    name: "Cyber Neon",
    description: "Glowing purple & cyan text with modern tech aesthetic",
    fontFamily: "'Inter', sans-serif",
    textColor: "#00f2ea",
    highlightColor: "#ec4899", // neon pink
    strokeColor: "#7c3aed",
    strokeWidth: 3,
    bgBoxColor: "rgba(10, 10, 24, 0.85)",
    hasBox: true,
    textTransform: "uppercase",
    animation: "glow",
  },
  clean: {
    id: "clean",
    name: "Clean Minimal",
    description: "Sleek typography with semi-transparent rounded pill",
    fontFamily: "'Inter', sans-serif",
    textColor: "#f0f0ff",
    highlightColor: "#9f60ff",
    strokeColor: "transparent",
    strokeWidth: 0,
    bgBoxColor: "rgba(10, 10, 20, 0.85)",
    hasBox: true,
    textTransform: "none",
    animation: "smooth",
  },
  karaoke: {
    id: "karaoke",
    name: "Karaoke Word-by-Word",
    description: "Sequential word highlight with smooth text container",
    fontFamily: "'Inter', sans-serif",
    textColor: "#a1a1aa",
    highlightColor: "#fde047",
    strokeColor: "#000000",
    strokeWidth: 2,
    bgBoxColor: "rgba(15, 15, 30, 0.9)",
    hasBox: true,
    textTransform: "none",
    animation: "smooth",
  },
};

export const LAYOUT_PRESETS: Record<LayoutPresetId, LayoutPreset> = {
  blurred_fit: {
    id: "blurred_fit",
    name: "Blurred Background (Recommended)",
    description: "Original 16:9 video centered with ambient blurred copy top/bottom",
    icon: "✨",
    renderMode: "blurred_fit",
  },
  center_crop: {
    id: "center_crop",
    name: "Smart Center Crop (9:16)",
    description: "Auto-centers speaker with full 9:16 vertical fill",
    icon: "🎯",
    renderMode: "center_crop",
  },
  split_screen: {
    id: "split_screen",
    name: "Podcast Split Screen",
    description: "Stacked top & bottom views for multi-speaker podcasts",
    icon: "🎙️",
    renderMode: "split_screen",
  },
  original_fit: {
    id: "original_fit",
    name: "Fit with Black Bars",
    description: "Classic fit with black letterbox top & bottom",
    icon: "⬛",
    renderMode: "original_fit",
  },
};
