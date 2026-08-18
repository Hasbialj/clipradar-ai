// ============================================================
// ClipRadar AI — Hook & Caption Generator
// INTEGRATION POINT: Replace templates with real LLM calls.
// ============================================================

import { ClipResult, MomentCategory } from "./types";

const HOOK_TEMPLATES: Record<MomentCategory, string[]> = {
  VIRAL_MOMENT: [
    "Gue nggak nyangka bakal melihat ini...",
    "Ini momen yang bikin semua orang diam.",
    "Kalian harus lihat apa yang terjadi selanjutnya.",
    "Bagian ini yang paling banyak di-replay.",
    "Momen ini mengubah segalanya.",
  ],
  FUNNY: [
    "Ini dia momen paling lucu yang pernah gue rekam 😂",
    "Gue nggak sanggup nahan tawa waktu ini terjadi...",
    "Siapa yang bisa nebak apa yang terjadi berikutnya?",
    "Reaksi dia bikin semua orang ngakak.",
    "Kesalahan kecil yang jadi legendary.",
  ],
  SHOCK: [
    "Gue baru sadar kalau selama ini kita salah...",
    "Fakta ini bikin gue speechless.",
    "Ternyata alasan sebenarnya bukan itu.",
    "Nggak ada yang nyangka bakal seperti ini.",
    "Plot twist terbesar yang pernah gue denger.",
  ],
  INSIGHT: [
    "Ini insight yang gue nggak pernah dapet dari buku manapun.",
    "Cara pandang ini bakal mengubah hidupmu.",
    "Fakta menarik yang harus kamu tahu hari ini.",
    "Setelah dengar ini, kamu nggak bakal sama lagi.",
    "Ini alasan kenapa orang sukses berpikir berbeda.",
  ],
  CONTROVERSIAL: [
    "Pendapat gue mungkin bikin kalian nggak setuju...",
    "Gue berani bilang sesuatu yang jarang orang mau akui.",
    "Kontroversial tapi ini fakta.",
    "Setuju atau nggak, ini yang sebenarnya terjadi.",
    "Opini yang bikin ribut di kolom komentar.",
  ],
  EMOTIONAL: [
    "Cerita ini bikin gue nangis tanpa sadar.",
    "Momen paling emosional yang pernah gue saksikan.",
    "Kalau kamu pernah ngerasain ini, kamu pasti ngerti.",
    "Kisah ini mengingatkan kita pada hal yang benar-benar penting.",
    "Jujur, bagian ini bikin gue merenung lama.",
  ],
  REACTION: [
    "Reaksi spontan yang nggak bisa di-edit.",
    "Ekspresi asli yang nggak ada duanya.",
    "Waktu dia sadar apa yang terjadi...",
    "Reaksi terbaik yang pernah gue lihat.",
    "Ini momen yang nggak bisa pura-pura.",
  ],
  RELATABLE: [
    "Kalian pernah ngalamin hal yang persis sama?",
    "Ini pengalaman gue yang mungkin juga pengalaman kalian.",
    "Situasi ini terlalu real untuk diabaikan.",
    "Siapapun yang pernah ngerasain ini pasti langsung paham.",
    "100% relatable — siapa yang setuju?",
  ],
  LIFE_LESSON: [
    "Pelajaran hidup yang gue pelajari dengan cara yang keras.",
    "Nasihat ini berubah cara gue melihat segalanya.",
    "Kalau bisa balik ke masa lalu, ini yang ingin gue tahu.",
    "Lesson learned yang nggak ada di kurikulum sekolah.",
    "Kata-kata ini masih gue inget sampai sekarang.",
  ],
  CURIOSITY: [
    "Tapi ada satu hal yang belum gue ceritain...",
    "Tunggu sampai kalian dengar bagian selanjutnya.",
    "Alasan sebenarnya ternyata jauh lebih mengejutkan.",
    "Apa yang terjadi berikutnya bikin semua orang kaget.",
    "Ada twist yang nggak ada yang tahu.",
  ],
  QUOTE: [
    "Quote ini hidup di kepala gue sampai sekarang.",
    "Kalimat pendek yang maknanya dalam banget.",
    "Simpan ini — kamu butuh di waktu yang tepat.",
    "Kata-kata terbaik yang pernah gue dengar.",
    "Screenshot ini sekarang.",
  ],
  PLOT_TWIST: [
    "Ini bukan yang kalian pikirkan...",
    "Ternyata semuanya terbalik.",
    "Bagian ini bikin gue gasping.",
    "Nggak ada yang expect ini bakal terjadi.",
    "Plot twist yang bikin gue rewatch berkali-kali.",
  ],
};

const CAPTION_TEMPLATES = {
  short: [
    "Momen ini terlalu bagus untuk dilewatkan. 🔥",
    "Ini dia yang semua orang perlu tahu.",
    "Simpan sebelum hilang!",
    "Nggak ada yang expect ini.",
    "Real talk. 💯",
  ],
  storytelling: [
    "Jadi waktu itu kita lagi ngobrol santai, terus tiba-tiba muncul momen ini yang nggak ada yang nyangka...",
    "Cerita ini dimulai dari percakapan biasa, tapi berakhir dengan sesuatu yang bikin semua orang terdiam.",
    "Gue udah rekam banyak konten, tapi momen ini yang paling susah gue lupa.",
    "Dari semua yang terjadi hari itu, bagian ini yang paling berkesan.",
    "Kalau gue nggak rekam ini, mungkin nggak ada yang percaya.",
  ],
  controversial: [
    "Gue tahu ini bukan pendapat yang populer, tapi ini yang gue percaya.",
    "Mungkin kalian nggak setuju, dan itu oke. Tapi dengarkan dulu.",
    "Fakta yang menyakitkan lebih baik dari kebohongan yang nyaman.",
    "Ini opini yang jarang orang berani ucapkan.",
    "Setuju atau nggak, realitanya memang seperti ini.",
  ],
  curiosity: [
    "Tapi ada bagian yang belum gue ceritain... dan itu yang paling penting.",
    "Kalian kira ceritanya sudah selesai? Tunggu dulu.",
    "Sebelum kalian scroll, dengerin bagian ini dulu.",
    "Ada satu hal yang bikin momen ini berbeda dari yang lain.",
    "Jawabannya nggak se-simple yang kalian kira.",
  ],
  cta: [
    "Menurut kalian gimana? Drop di komentar! 👇",
    "Kalian pernah ngalamin hal yang sama? Ceritain!",
    "Setuju atau nggak setuju? Gue mau tahu pendapat kalian.",
    "Tag teman yang butuh lihat ini! 🔁",
    "Save dulu, tonton nanti kalau butuh reminder. 📌",
  ],
};

export function generateHooks(clip: ClipResult): string[] {
  const primaryCategory = clip.categories[0];
  const templates =
    HOOK_TEMPLATES[primaryCategory] || HOOK_TEMPLATES["VIRAL_MOMENT"];
  // Return 5 hooks, mixing category-specific and a general one
  return [...templates].slice(0, 5);
}

export function generateCaptions(clip: ClipResult): {
  short: string;
  storytelling: string;
  controversial: string;
  curiosity: string;
  cta: string;
} {
  const idx = Math.floor(clip.rank % 5);
  return {
    short: CAPTION_TEMPLATES.short[idx],
    storytelling: CAPTION_TEMPLATES.storytelling[idx],
    controversial: CAPTION_TEMPLATES.controversial[idx],
    curiosity: CAPTION_TEMPLATES.curiosity[idx],
    cta: CAPTION_TEMPLATES.cta[idx],
  };
}

export function generateHashtags(categories: MomentCategory[]): string[] {
  const base = ["#ClipRadarAI", "#ShortForm", "#ViralPotential"];
  const categoryTags: Record<MomentCategory, string[]> = {
    VIRAL_MOMENT: ["#ViralMoment", "#Trending", "#MustWatch"],
    FUNNY: ["#Lucu", "#Funny", "#LOL", "#Comedy"],
    SHOCK: ["#MindBlown", "#Shocking", "#WTF"],
    INSIGHT: ["#Insight", "#Edukasi", "#LearnOnTikTok"],
    CONTROVERSIAL: ["#Controversial", "#HotTake", "#Debate"],
    EMOTIONAL: ["#Emotional", "#Touching", "#Baper"],
    REACTION: ["#Reaction", "#ReactionVideo"],
    RELATABLE: ["#Relatable", "#TrueStory", "#SoTrue"],
    LIFE_LESSON: ["#LifeLesson", "#Motivasi", "#Wisdom"],
    CURIOSITY: ["#Curious", "#WaitForIt"],
    QUOTE: ["#Quote", "#QuoteOfTheDay", "#WordsThatHit"],
    PLOT_TWIST: ["#PlotTwist", "#Unexpected", "#Twist"],
  };

  const tags = [...base];
  categories.forEach((cat) => {
    tags.push(...(categoryTags[cat] || []));
  });
  return [...new Set(tags)].slice(0, 12);
}
