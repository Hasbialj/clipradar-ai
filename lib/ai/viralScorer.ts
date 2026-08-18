// ============================================================
// ClipRadar AI — Viral Scoring Engine
// Computes 7-dimension viral score for a clip candidate.
// INTEGRATION POINT: Replace `scoreFromTranscript` with real LLM call.
// ============================================================

import { ViralScore } from "./types";

// Keyword banks for pattern matching
const HOOK_PATTERNS = [
  /gue baru sadar/i,
  /jangan pernah/i,
  /ini alasan kenapa/i,
  /ternyata selama ini/i,
  /gila[,.]?\s/i,
  /gue nggak nyangka/i,
  /kalian nggak akan percaya/i,
  /faktanya adalah/i,
  /i never thought/i,
  /you won't believe/i,
  /the real reason/i,
  /stop doing this/i,
  /wait until you see/i,
  /nobody talks about/i,
  /rahasia/i,
  /fakta mengejutkan/i,
  /siapa sangka/i,
];

const EMOTION_PATTERNS = [
  /hahaha|wkwk|lol|ngakak/i,
  /astaga|aduh|waduh|ya ampun/i,
  /gila[!]+/i,
  /serius\?|seriously\?/i,
  /nggak[- ]?nyangka|nggak[- ]?percaya/i,
  /shocked|terkejut|kaget/i,
  /baper|nangis|sedih/i,
  /amazing|luar biasa|wow/i,
  /awkward|canggung/i,
  /excited|semangat/i,
];

const OPEN_LOOP_PATTERNS = [
  /tapi ada satu hal/i,
  /tunggu sampai/i,
  /alasan sebenarnya/i,
  /belum gue ceritain/i,
  /nanti gue kasih tahu/i,
  /rahasianya adalah/i,
  /stay tuned/i,
  /but first/i,
  /here's the thing/i,
  /plot twist/i,
  /ternyata/i,
  /padahal/i,
];

const SHARE_PATTERNS = [
  /tip|trik|cara/i,
  /fakta|fact/i,
  /hack|cheat code/i,
  /ini harus di-share/i,
  /inspirasi|motivasi/i,
  /lucu|funny|humor/i,
  /kontroversial|controversial/i,
];

const RELATABLE_PATTERNS = [
  /kerja|kerjaan|kantor/i,
  /kuliah|kampus|sekolah/i,
  /keluarga|orang tua|bokap|nyokap/i,
  /pacar|gebetan|jomblo/i,
  /uang|duit|gaji|finansial/i,
  /makanan|makan|lapar/i,
  /gaming|game|main/i,
  /teknologi|hp|smartphone/i,
  /teman|sahabat|bestie/i,
  /overthinking|anxiety|stress/i,
];

const COMMENT_PATTERNS = [
  /setuju atau nggak/i,
  /menurut kalian/i,
  /kalian pernah/i,
  /kontroversial/i,
  /perdebatan/i,
  /dua sisi/i,
  /pro.*kontra/i,
  /\?["\s]*$/,
  /what do you think/i,
  /agree or disagree/i,
];

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter((p) => p.test(text)).length;
}

function normalize(value: number, max: number): number {
  return Math.min(max, Math.round(value));
}

export function scoreClip(
  transcript: string,
  contextBefore: string = "",
  durationSeconds: number = 45,
  // These would come from real audio/vision analysis in production
  mockAudioIntensity: number = 0.5, // 0–1
  mockEmotionStrength: number = 0.5 // 0–1
): ViralScore {
  const fullContext = contextBefore + " " + transcript;

  // Baseline scores for candidate clips selected by the moment detector
  const baseHook = Math.max(10, countMatches(transcript.slice(0, 200), HOOK_PATTERNS) * 5 + 8);
  const hookStrength = normalize(baseHook + mockAudioIntensity * 4, 20);

  const baseEmotion = Math.max(8, countMatches(transcript, EMOTION_PATTERNS) * 4 + 7);
  const emotionalIntensity = normalize(baseEmotion + mockEmotionStrength * 5, 20);

  const hasContradiction = /tapi|namun|ternyata|padahal|actually|but wait|however/i.test(transcript);
  const hasSurprise = /\![^!]/.test(transcript) || /hah\?|what\?/i.test(transcript) || /gila/i.test(transcript);
  const unexpectedMoment = normalize(
    (hasContradiction ? 5 : 2) + (hasSurprise ? 6 : 4) + Math.random() * 3,
    15
  );

  const openLoopMatches = countMatches(fullContext, OPEN_LOOP_PATTERNS);
  const curiosity = normalize(Math.max(6, openLoopMatches * 4 + 6) + Math.random() * 3, 15);

  const shareMatches = countMatches(transcript, SHARE_PATTERNS);
  const shareability = normalize(Math.max(5, shareMatches * 2 + 5) + Math.random() * 2, 10);

  const relatableMatches = countMatches(transcript, RELATABLE_PATTERNS);
  const relatability = normalize(Math.max(5, relatableMatches * 2 + 5) + Math.random() * 2, 10);

  const commentMatches = countMatches(transcript, COMMENT_PATTERNS);
  const commentPotential = normalize(Math.max(5, commentMatches * 2 + 5) + Math.random() * 2, 10);

  const durationBonus = durationSeconds >= 25 && durationSeconds <= 65 ? 2 : 0;

  const rawTotal =
    hookStrength +
    emotionalIntensity +
    unexpectedMoment +
    curiosity +
    shareability +
    relatability +
    commentPotential +
    durationBonus;

  const total = Math.min(100, Math.round(rawTotal));

  return {
    total,
    hookStrength,
    emotionalIntensity,
    unexpectedMoment,
    curiosity,
    shareability,
    relatability,
    commentPotential,
  };
}
