// ============================================================
// ClipRadar AI — Mock Analyzer
// Generates a realistic analysis result with demo data.
// INTEGRATION POINT: Replace with real Whisper + LLM pipeline.
// ============================================================

import {
  AnalysisResult,
  ClipResult,
  ContentType,
  MomentCategory,
  VideoMetadata,
} from "./types";
import { scoreClip } from "./viralScorer";
import { generateCaptions, generateHashtags, generateHooks } from "./hookGenerator";

let idCounter = 1000;
function genId(): string {
  return `clip_${++idCounter}_${Date.now()}`;
}

function secondsToTimestamp(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

function detectContentType(url: string): ContentType {
  const lower = url.toLowerCase();
  if (lower.includes("podcast")) return "Podcast";
  if (lower.includes("interview")) return "Interview";
  if (lower.includes("gaming") || lower.includes("game")) return "Gaming";
  if (lower.includes("vlog")) return "Vlog";
  if (lower.includes("tutorial") || lower.includes("how")) return "Tutorial";
  if (lower.includes("review")) return "Review";
  if (lower.includes("react")) return "Reaction";
  return "Podcast"; // default for long-form
}

// Rich mock transcript segments for realistic display
const TRANSCRIPT_SEGMENTS = [
  "Jadi gue mau cerita sesuatu yang gue baru sadar kemarin. Gila, gue udah salah selama bertahun-tahun. Ternyata cara yang selama ini kita pikir benar, itu justru yang bikin kita nggak maju.",
  "Hahaha, ini nggak nyangka banget. Waktu dia bilang itu, semua orang di ruangan langsung diam. Nggak ada yang expect dia bakal ngomong kayak gitu.",
  "Nah ini yang menarik. Ada fakta yang gue temukan dari penelitian terbaru — dan ini mengubah cara gue melihat segalanya tentang produktivitas dan waktu.",
  "Oke serius deh. Menurut kalian mana yang lebih penting: uang atau waktu? Karena gue punya pendapat yang mungkin bikin kalian nggak setuju.",
  "Ini bagian yang paling bikin gue baper. Dia cerita tentang ibunya, dan gue langsung nggak bisa nahan air mata. Siapapun yang pernah kehilangan orang tua pasti ngerti rasanya.",
  "Reaksi dia waktu tau fakta itu benar-benar spontan. Tangan langsung ke mulut, matanya melebar. Ini bukan akting, ini real.",
  "Tau nggak sih kalau sebenarnya 90% orang melakukan hal ini setiap hari tanpa sadar? Dan itu yang bikin mereka stuck di tempat yang sama.",
  "Gue mau share sesuatu yang personal. Dulu gue pernah berada di titik paling bawah dalam hidup gue. Dan ini yang menyelamatkan gue.",
  "Plot twist: semua yang dia ceritain selama 30 menit ternyata salah. Dan ini yang sebenarnya terjadi.",
  "Kalimat ini hidup di kepala gue sampai sekarang: 'Jangan tunggu sempurna untuk mulai. Mulai dulu, sempurnakan nanti.'",
  "Ada yang lucu banget terjadi tadi. Dia lagi jelasin hal yang serius banget, terus tiba-tiba... nggak, kalian harus lihat sendiri reaksinya.",
  "Fakta mengejutkan: cara kalian bernafas sekarang kemungkinan salah. Dan ini bedanya dengan yang benar.",
  "Gue nggak pernah setuju sama statement ini sampai dia jelasin dengan cara yang berbeda.",
  "Tunggu dulu. Jadi maksudnya selama ini kita udah dibohongi? Ini bukan conspiracy theory, ini literally di paper akademis.",
  "Momen ini yang bikin podcast ini jadi trending. Ketika dua orang yang biasanya setuju, tiba-tiba berselisih pendapat secara terbuka.",
  "Ini tips yang gue dapat dari orang yang sudah 20 tahun di industri ini. Dan nggak ada yang mengajarkan ini di sekolah.",
  "Ada satu pertanyaan yang nggak pernah dijawab di episode ini: kenapa hal ini bisa terjadi? Dan jawabannya lebih gelap dari yang kalian kira.",
];

const REASONS = [
  "Pernyataan mengejutkan muncul setelah percakapan panjang yang membangun rasa penasaran. Reaksi spontan pembicara meningkatkan emotional intensity secara signifikan.",
  "Humor yang muncul secara organik dari situasi yang tidak terduga. Reaksi jujur dan tidak di-script membuat momen ini sangat shareable.",
  "Insight berharga yang dikemas dalam kalimat yang mudah dipahami. Informasi ini memberikan nilai nyata bagi penonton, mendorong save dan share.",
  "Opini kontroversial yang disampaikan dengan berani dan berargumen kuat. Berpotensi memicu diskusi panjang di kolom komentar.",
  "Momen emosional autentik yang menyentuh pengalaman universal. Penonton yang relate akan terdorong untuk berbagi kepada orang yang mereka sayangi.",
  "Reaksi spontan yang tidak bisa dipalsukan. Ekspresi genuine pembicara menjadi inti dari shareability momen ini.",
  "Fakta mengejutkan yang langsung relevan dengan kehidupan sehari-hari penonton. Hook awal yang kuat ditambah payoff yang memuaskan.",
  "Open loop yang kuat di awal membuat penonton tidak bisa berhenti menonton. Resolusi cerita memberikan kepuasan emosional.",
  "Plot twist yang tidak ada yang prediksi. Kontras antara ekspektasi dan realita menciptakan momen yang sangat memorable.",
  "Quote yang singkat, padat, dan penuh makna. Sangat mudah untuk di-screenshot dan dibagikan di berbagai platform.",
];

const TITLES = [
  "Ternyata Selama Ini Kita Salah 😳",
  "Momen Ini Yang Bikin Semua Orang Diam",
  "Fakta Mengejutkan Yang Jarang Diketahui",
  "Pendapat Kontroversial Yang Bikin Ribut 💬",
  "Cerita Ini Bikin Gue Nangis 😭",
  "Reaksi Yang Nggak Bisa Dipalsukan 😮",
  "90% Orang Salah Melakukan Ini",
  "Perjalanan Dari Titik Paling Bawah",
  "Plot Twist Yang Nggak Nyangka ⚡",
  "Quote Yang Hidup Di Kepala Gue Sampe Sekarang",
  "Momen Paling Lucu Yang Pernah Terekam 😂",
  "Cara Bernafas Yang Benar — Kamu Pasti Salah",
  "Ketika Dua Orang Berbeda Pendapat Secara Terbuka",
  "Tips Dari 20 Tahun Pengalaman",
  "Jawaban Yang Lebih Gelap Dari Yang Kamu Kira 🌑",
];

const COMMENT_TRIGGERS = [
  "Menurut kalian benar atau nggak? 👇",
  "Kalian pernah ngalamin hal yang sama?",
  "Setuju atau nggak setuju? Gue mau tahu!",
  "Ada yang mau nambahin? Drop di komentar!",
  "Kalian di tim mana?",
  "Ini relate nggak sama pengalaman kalian?",
  "Siapa yang juga baru tahu fakta ini?",
  "Tag teman yang butuh lihat ini!",
];

const CATEGORY_SETS: MomentCategory[][] = [
  ["SHOCK", "CONTROVERSIAL"],
  ["FUNNY", "REACTION"],
  ["INSIGHT", "LIFE_LESSON"],
  ["CONTROVERSIAL", "COMMENT_POTENTIAL" as never],
  ["EMOTIONAL", "RELATABLE"],
  ["REACTION", "FUNNY"],
  ["SHOCK", "INSIGHT"],
  ["EMOTIONAL", "LIFE_LESSON"],
  ["PLOT_TWIST", "SHOCK"],
  ["QUOTE", "LIFE_LESSON"],
  ["FUNNY", "RELATABLE"],
  ["CURIOSITY", "SHOCK"],
  ["CONTROVERSIAL", "INSIGHT"],
  ["INSIGHT", "CURIOSITY"],
  ["CURIOSITY", "PLOT_TWIST"],
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function analyzeMockVideo(
  input: { url?: string; fileName?: string; durationSeconds?: number },
  onProgress: (step: string, progress: number, message: string) => void
): Promise<AnalysisResult> {
  const totalDuration = input.durationSeconds || randomBetween(3600, 7200);
  const contentType = detectContentType(input.url || input.fileName || "");
  const title = input.url
    ? `Video from YouTube`
    : input.fileName || "Uploaded Video";

  // Fast server-side step reporting
  const steps = [
    { step: "uploading", progress: 15, message: "Uploading video to pipeline..." },
    { step: "transcribing", progress: 50, message: "Transcribing speech segments..." },
    { step: "understanding", progress: 65, message: "Running emotion detection & speaker analysis..." },
    { step: "detecting", progress: 75, message: "Detecting candidate viral moments..." },
    { step: "scoring", progress: 92, message: "Computing scores, hooks, titles & captions..." },
    { step: "ready", progress: 100, message: "Analysis complete! Ready to explore." },
  ];

  for (const s of steps) {
    onProgress(s.step, s.progress, s.message);
  }

  // Generate 12–17 clips safely distributed across video duration
  const clipCount = randomBetween(12, 17);
  const clips: ClipResult[] = [];
  const interval = Math.max(120, Math.floor((totalDuration - 180) / clipCount));

  for (let i = 0; i < clipCount; i++) {
    const baseSec = 60 + i * interval;
    const jitter = randomBetween(-20, 20);
    const startSec = Math.max(30, Math.min(totalDuration - 120, baseSec + jitter));

    const durationSec = pick([20, 28, 35, 42, 52, 65, 78, 88], i);
    const endSec = startSec + durationSec;

    const transcriptIdx = i % TRANSCRIPT_SEGMENTS.length;
    const transcript = TRANSCRIPT_SEGMENTS[transcriptIdx];
    const audioIntensity = Math.random() * 0.7 + 0.3;
    const emotionStrength = Math.random() * 0.7 + 0.3;

    const score = scoreClip(transcript, "", durationSec, audioIntensity, emotionStrength);

    // Boost top clips to ensure high scores for drama
    if (i < 3) {
      score.total = Math.min(100, score.total + randomBetween(8, 18));
      score.hookStrength = Math.min(20, score.hookStrength + 3);
      score.emotionalIntensity = Math.min(20, score.emotionalIntensity + 3);
    }

    const categories = pick(CATEGORY_SETS, i);
    // Ensure first category is correct
    const validCategories: MomentCategory[] = categories.filter(
      (c) => c !== ("COMMENT_POTENTIAL" as never)
    ) as MomentCategory[];
    if (validCategories.length === 0) validCategories.push("VIRAL_MOMENT");

    const clipDuration =
      durationSec <= 30 ? "short" : durationSec <= 60 ? "medium" : "story";

    const baseClip: ClipResult = {
      id: genId(),
      rank: i + 1,
      startTime: secondsToTimestamp(startSec),
      endTime: secondsToTimestamp(endSec),
      startSeconds: startSec,
      endSeconds: endSec,
      duration: clipDuration,
      durationSeconds: durationSec,
      categories: validCategories,
      score,
      transcript,
      reason: pick(REASONS, i),
      hook: pick(TRANSCRIPT_SEGMENTS, i).slice(0, 80) + "...",
      alternativeHooks: [],
      suggestedTitle: pick(TITLES, i),
      suggestedCaptions: {
        short: "",
        storytelling: "",
        controversial: "",
        curiosity: "",
        cta: "",
      },
      commentTrigger: pick(COMMENT_TRIGGERS, i),
      hashtags: [],
    };

    baseClip.alternativeHooks = generateHooks(baseClip);
    baseClip.suggestedCaptions = generateCaptions(baseClip);
    baseClip.hashtags = generateHashtags(validCategories);

    clips.push(baseClip);
  }

  // Sort by score descending and re-rank
  clips.sort((a, b) => b.score.total - a.score.total);
  clips.forEach((c, i) => (c.rank = i + 1));

  const videoMetadata: VideoMetadata = {
    title,
    duration: secondsToTimestamp(totalDuration),
    durationSeconds: totalDuration,
    contentType,
    language: "id",
    url: input.url,
    fileName: input.fileName,
  };

  return {
    id: `analysis_${Date.now()}`,
    videoMetadata,
    clips,
    totalClipsFound: clips.length,
    highestScore: clips[0]?.score.total ?? 0,
    analyzedAt: new Date().toISOString(),
  };
}
