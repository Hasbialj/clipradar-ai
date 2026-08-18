// ============================================================
// ClipRadar AI — Utility Helpers
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function scoreToColor(score: number): string {
  if (score >= 90) return "text-red-400";
  if (score >= 80) return "text-orange-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 60) return "text-green-400";
  return "text-zinc-400";
}

export function scoreToGradient(score: number): string {
  if (score >= 90) return "from-red-500 to-orange-500";
  if (score >= 80) return "from-orange-500 to-amber-500";
  if (score >= 70) return "from-yellow-500 to-lime-500";
  if (score >= 60) return "from-green-500 to-teal-500";
  return "from-zinc-500 to-zinc-400";
}

export function scoreToBgGradient(score: number): string {
  if (score >= 90) return "from-red-500/20 to-orange-500/10";
  if (score >= 80) return "from-orange-500/20 to-amber-500/10";
  if (score >= 70) return "from-yellow-500/20 to-lime-500/10";
  if (score >= 60) return "from-green-500/20 to-teal-500/10";
  return "from-zinc-500/10 to-zinc-400/5";
}

export function scoreToMarkerColor(score: number): string {
  if (score >= 90) return "#ef4444"; // red
  if (score >= 80) return "#f97316"; // orange
  if (score >= 70) return "#eab308"; // yellow
  if (score >= 60) return "#22c55e"; // green
  return "#71717a"; // zinc
}

export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|\/embed\/|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return (
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url) &&
    getYouTubeVideoId(url) !== null
  );
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function clipDurationLabel(type: string): string {
  if (type === "short") return "15–30s";
  if (type === "medium") return "30–60s";
  return "60–90s";
}
