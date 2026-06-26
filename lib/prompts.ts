// ─── Letter rules ────────────────────────────────────────────────────────────
// Add or remove rules here. Each line becomes a hard constraint in every letter.
const BASE_LETTER_RULES = [
  // Humanizer rules — avoid AI writing patterns
  "Do not use em dashes (—) anywhere in the letter.",
  "Do not use AI vocabulary: 'vibrant', 'profound', 'pivotal', 'showcasing', 'highlighting', 'fostering', 'tapestry', 'landscape', 'testament', 'crucial', 'underscore', 'delve', 'enhance', 'garner', 'intricate', 'enduring', 'alignment', 'elevate', 'seamless', 'groundbreaking', 'renowned', 'nestled', 'breathtaking', 'commitment to'.",
  "Do not use promotional or puffed-up language. Be specific and concrete instead of vague and grandiose.",
  "Do not use the rule of three (listing three items to sound complete).",
  "Do not use negative parallelisms like 'It's not just X, it's Y' or 'Not only... but...'.",
  "Do not use filler phrases like 'In order to', 'Due to the fact that', 'It is important to note that', 'I hope this finds you well'.",
  "Do not end with a question. Close with a warm, natural sign-off — something like 'Hope to hear from you', 'Take care', or a brief genuine closing line. No questions at the end.",
  "Do not start sentences with 'Additionally,' or 'Moreover,'.",
  "Vary sentence length and structure naturally. Mix short and longer sentences.",
  "Use specific details and references to the host's actual profile content — not vague claims.",
  "Sound like a real person writing — not a template or a chatbot.",
  "CRITICAL: Never fabricate shared interests. Only reference a book, film, band, activity, or experience if it explicitly appears in BOTH the guest's and host's profiles. If there is no genuine overlap, find a real connection from what is actually written, or simply express honest curiosity about something in the host's profile.",
  "CRITICAL: Never mention the host's location count, reference count, or travel statistics (e.g. '293 locations', '94 references') unless they appear in the guest's own profile. Do not highlight CouchSurfing metrics as a compliment.",
];
// ─────────────────────────────────────────────────────────────────────────────

function buildRulesBlock(charLimit: number): string {
  const rules = [
    `CRITICAL: The letter must be STRICTLY under ${charLimit} characters total (including spaces and punctuation). Count carefully before finishing. If you exceed this, rewrite shorter.`,
    ...BASE_LETTER_RULES,
  ];
  return `\n\nAdditional hard rules — follow these without exception:\n${rules.map((r) => `- ${r}`).join("\n")}`;
}

export const SYSTEM_PROMPT = `You are an expert at writing warm, genuine, and personalized CouchSurfing couch request letters. Your letters feel human, not templated. You always reference specific things from the host's profile to show you actually read it. Never start with "As an AI" or mention AI. Be concise. Open with the guest's name and a specific hook tied to something in the host's profile.`;

export type UserProfile = {
  name: string;
  hometown: string;
  purpose: string;
  interests: string;
  notes: string;
  homeText?: string;
  refsText?: string;
  gender?: "male" | "female" | "other";
};

export const LANGUAGES: { code: string; nameEN: string; nameTR: string }[] = [
  { code: "EN", nameEN: "English",    nameTR: "İngilizce" },
  { code: "TR", nameEN: "Turkish",    nameTR: "Türkçe" },
  { code: "DE", nameEN: "German",     nameTR: "Almanca" },
  { code: "FR", nameEN: "French",     nameTR: "Fransızca" },
  { code: "ES", nameEN: "Spanish",    nameTR: "İspanyolca" },
  { code: "IT", nameEN: "Italian",    nameTR: "İtalyanca" },
  { code: "PT", nameEN: "Portuguese", nameTR: "Portekizce" },
  { code: "NL", nameEN: "Dutch",      nameTR: "Felemenkçe" },
  { code: "PL", nameEN: "Polish",     nameTR: "Lehçe" },
  { code: "RU", nameEN: "Russian",    nameTR: "Rusça" },
  { code: "SV", nameEN: "Swedish",    nameTR: "İsveççe" },
  { code: "NO", nameEN: "Norwegian",  nameTR: "Norveççe" },
  { code: "DA", nameEN: "Danish",     nameTR: "Danimarkaca" },
  { code: "FI", nameEN: "Finnish",    nameTR: "Fince" },
  { code: "CS", nameEN: "Czech",      nameTR: "Çekçe" },
  { code: "HU", nameEN: "Hungarian",  nameTR: "Macarca" },
  { code: "RO", nameEN: "Romanian",   nameTR: "Rumence" },
  { code: "EL", nameEN: "Greek",      nameTR: "Yunanca" },
  { code: "HR", nameEN: "Croatian",   nameTR: "Hırvatça" },
  { code: "JA", nameEN: "Japanese",   nameTR: "Japonca" },
  { code: "ZH", nameEN: "Chinese",    nameTR: "Çince" },
  { code: "KO", nameEN: "Korean",     nameTR: "Korece" },
  { code: "AR", nameEN: "Arabic",     nameTR: "Arapça" },
  { code: "HI", nameEN: "Hindi",      nameTR: "Hintçe" },
  { code: "ID", nameEN: "Indonesian", nameTR: "Endonezce" },
];

const LANG_INSTRUCTIONS: Record<string, string> = {
  EN: "Write the letter in English.",
  TR: "Mektubu Türkçe yaz.",
  DE: "Schreib den Brief auf Deutsch.",
  FR: "Écris la lettre en français.",
  ES: "Escribe la carta en español.",
  IT: "Scrivi la lettera in italiano.",
  PT: "Escreve a carta em português.",
  NL: "Schrijf de brief in het Nederlands.",
  PL: "Napisz list po polsku.",
  RU: "Напиши письмо на русском.",
  SV: "Skriv brevet på svenska.",
  NO: "Skriv brevet på norsk.",
  DA: "Skriv brevet på dansk.",
  FI: "Kirjoita kirje suomeksi.",
  CS: "Napiš dopis česky.",
  HU: "Írd a levelet magyarul.",
  RO: "Scrie scrisoarea în română.",
  EL: "Γράψε την επιστολή στα ελληνικά.",
  HR: "Napiši pismo na hrvatskom.",
  JA: "手紙を日本語で書いてください。",
  ZH: "请用中文写这封信。",
  KO: "편지를 한국어로 써주세요.",
  AR: "اكتب الرسالة باللغة العربية.",
  HI: "पत्र हिंदी में लिखें।",
  ID: "Tulis surat dalam bahasa Indonesia.",
};

export function buildLetterPrompt(
  userProfile: UserProfile,
  hostProfileText: string,
  checkIn: string,
  checkOut: string,
  language: string,
  hostHomeText?: string,
  hostRefsText?: string,
  charLimit: number = 980,
): string {
  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  const langInstruction = LANG_INSTRUCTIONS[language] ?? "Write the letter in English.";

  const guestHome = [
    userProfile.homeText?.trim() ? `My home/guest section on CouchSurfing:\n${userProfile.homeText}` : null,
    userProfile.refsText?.trim() ? `My CouchSurfing references:\n${userProfile.refsText}` : null,
  ].filter(Boolean).join("\n\n");
  const guestHomeSep = guestHome ? `\n\n${guestHome}` : "";

  const hostSections = [
    `=== Host Profile ===\n${hostProfileText}`,
    hostHomeText?.trim() ? `=== Host Home Section ===\n${hostHomeText}` : null,
    hostRefsText?.trim() ? `=== Host References ===\n${hostRefsText}` : null,
  ].filter(Boolean).join("\n\n");

  return `My profile:
Name: ${userProfile.name}
Hometown: ${userProfile.hometown}
Purpose of travel: ${userProfile.purpose}
Interests: ${userProfile.interests}
Additional notes about me: ${userProfile.notes}${guestHomeSep}

${hostSections}

Stay dates: ${checkIn} to ${checkOut} (${nights} night${nights !== 1 ? "s" : ""})

${langInstruction}

Requirements:
- Reference at least 2 specific things from the host's profile, home section, or references
- Briefly mention the travel purpose
- End with a warm, natural closing line (e.g. "Hope to hear from you", "Take care") — no questions at the end
- Sound like a real person, not a template
${buildRulesBlock(charLimit)}`;
}
