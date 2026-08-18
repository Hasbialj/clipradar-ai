// ============================================================
// ClipRadar AI — Shared TypeScript Types
// ============================================================

export type MomentCategory =
  | "VIRAL_MOMENT"
  | "FUNNY"
  | "SHOCK"
  | "INSIGHT"
  | "CONTROVERSIAL"
  | "EMOTIONAL"
  | "REACTION"
  | "RELATABLE"
  | "LIFE_LESSON"
  | "CURIOSITY"
  | "QUOTE"
  | "PLOT_TWIST";

export type ClipDuration = "short" | "medium" | "story";
export type ContentType =
  | "Podcast"
  | "Interview"
  | "Gaming"
  | "Reaction"
  | "Vlog"
  | "Tutorial"
  | "Educational"
  | "News"
  | "Comedy"
  | "Debate"
  | "Storytelling"
  | "Cooking"
  | "Review"
  | "Livestream"
  | "Unknown";

export interface ViralScore {
  total: number; // 0–100
  hookStrength: number; // 0–20
  emotionalIntensity: number; // 0–20
  unexpectedMoment: number; // 0–15
  curiosity: number; // 0–15
  shareability: number; // 0–10
  relatability: number; // 0–10
  commentPotential: number; // 0–10
}

export interface ClipResult {
  id: string;
  rank: number;
  startTime: string; // "HH:MM:SS"
  endTime: string;
  startSeconds: number;
  endSeconds: number;
  duration: ClipDuration;
  durationSeconds: number;
  categories: MomentCategory[];
  score: ViralScore;
  transcript: string;
  reason: string;
  hook: string;
  alternativeHooks: string[];
  suggestedTitle: string;
  suggestedCaptions: {
    short: string;
    storytelling: string;
    controversial: string;
    curiosity: string;
    cta: string;
  };
  commentTrigger: string;
  hashtags: string[];
}

export interface VideoMetadata {
  title: string;
  duration: string; // "HH:MM:SS"
  durationSeconds: number;
  thumbnailUrl?: string;
  contentType: ContentType;
  language: string;
  url?: string;
  fileName?: string;
}

export type PipelineStep =
  | "idle"
  | "uploading"
  | "transcribing"
  | "understanding"
  | "detecting"
  | "scoring"
  | "ready"
  | "error";

export interface PipelineProgress {
  step: PipelineStep;
  progress: number; // 0–100
  message: string;
}

export interface AnalysisResult {
  id: string;
  videoMetadata: VideoMetadata;
  clips: ClipResult[];
  totalClipsFound: number;
  highestScore: number;
  analyzedAt: string;
}

export interface FilterOptions {
  categories: MomentCategory[];
  minScore: number;
  durationTypes: ClipDuration[];
}

// Category display metadata
export const CATEGORY_META: Record<
  MomentCategory,
  { label: string; emoji: string; color: string; bg: string }
> = {
  VIRAL_MOMENT: {
    label: "Viral Moment",
    emoji: "🔥",
    color: "text-red-400",
    bg: "bg-red-500/20 border-red-500/40",
  },
  FUNNY: {
    label: "Funny",
    emoji: "😂",
    color: "text-yellow-400",
    bg: "bg-yellow-500/20 border-yellow-500/40",
  },
  SHOCK: {
    label: "Shock",
    emoji: "😱",
    color: "text-orange-400",
    bg: "bg-orange-500/20 border-orange-500/40",
  },
  INSIGHT: {
    label: "Insight",
    emoji: "🧠",
    color: "text-green-400",
    bg: "bg-green-500/20 border-green-500/40",
  },
  CONTROVERSIAL: {
    label: "Controversial",
    emoji: "💬",
    color: "text-purple-400",
    bg: "bg-purple-500/20 border-purple-500/40",
  },
  EMOTIONAL: {
    label: "Emotional",
    emoji: "❤️",
    color: "text-pink-400",
    bg: "bg-pink-500/20 border-pink-500/40",
  },
  REACTION: {
    label: "Reaction",
    emoji: "😮",
    color: "text-cyan-400",
    bg: "bg-cyan-500/20 border-cyan-500/40",
  },
  RELATABLE: {
    label: "Relatable",
    emoji: "🎯",
    color: "text-teal-400",
    bg: "bg-teal-500/20 border-teal-500/40",
  },
  LIFE_LESSON: {
    label: "Life Lesson",
    emoji: "💡",
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/40",
  },
  CURIOSITY: {
    label: "Curiosity",
    emoji: "👀",
    color: "text-indigo-400",
    bg: "bg-indigo-500/20 border-indigo-500/40",
  },
  QUOTE: {
    label: "Quote",
    emoji: "🗣️",
    color: "text-violet-400",
    bg: "bg-violet-500/20 border-violet-500/40",
  },
  PLOT_TWIST: {
    label: "Plot Twist",
    emoji: "⚡",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/20 border-fuchsia-500/40",
  },
};
