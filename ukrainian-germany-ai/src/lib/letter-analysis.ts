export const DOCUMENT_TYPES = ["BESCHEID", "ANHOERUNG", "AUFFORDERUNG", "BRIEF", "ANTRAG", "FORMULAR", "VERTRAG", "RECHNUNG", "MAHNUNG", "TERMINBESTAETIGUNG", "AUFENTHALTSDOKUMENT", "ARBEITSVERTRAG", "MIETVERTRAG", "OTHER"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export type LetterAnalysis = {
  sender: string | null;
  senderPerson: string | null;
  senderAddress: string | null;
  letterDate: string | null;
  deadline: string | null;
  reference: string | null;
  recipientName: string | null;
  recipientAddress: string | null;
  subject: string | null;
  what: string;
  translation: string;
  actions: string[];
  caution: string;
  replyDe: string;
  replyTranslation: string;
  // Optional — older saved letters do not have these.
  todoShort?: string | null;
  whyShort?: string | null;
  senderEmail?: string | null;
  /** ISO time when the user marked the reply as sent; absent on older letters. */
  sentAt?: string | null;
  sentTo?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  replyBodyDe?: string | null;
  userReplyText?: string | null;
  backTranslation?: string | null;
  enclosures?: string[];
  documentType?: DocumentType | null;
  deadlineQuote?: string | null;
  deadlineConfidence?: Confidence | null;
  riskLevel?: RiskLevel | null;
  riskReason?: string | null;
  needsHuman?: boolean | null;
  remedyInfo?: string | null;
  id?: string;
};

export function getLetterShortSummary(analysis: LetterAnalysis | null) {
  const todoShort = analysis?.todoShort?.trim().slice(0, 160) || null;
  const whyShort = analysis?.whyShort?.trim().slice(0, 160) || null;
  return todoShort || whyShort ? { todoShort, whyShort } : null;
}

const norm = (t: string) => t.toLowerCase().replace(/[\s\u00a0]+/g, " ").replace(/[„“”"«»]/g, "").trim();

const MONTHS = ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"];

/** True when the quote itself spells out the given DD.MM.YYYY date (numeric or with a German month name). */
export function quoteContainsDate(quote: string, deadline: string): boolean {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(deadline.trim());
  if (!m) return false;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), m[3]!];
  const q = norm(quote).replace(/maerz/g, "märz");
  for (const x of q.matchAll(/(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{2,4})/g)) {
    const year = x[3]!;
    if (Number(x[1]) === d && Number(x[2]) === mo && (year === y || (year.length === 2 && y.endsWith(year)))) return true;
  }
  const month = MONTHS[mo - 1]!;
  return new RegExp(`(^|\\D)0?${d}\\.?\\s+${month}\\s+${y}`).test(q);
}

/** Deadline must be backed by a verbatim quote. With the letter text the quote must occur in it; for photos and PDFs the quote must at least contain the date, otherwise the deadline is kept but marked unconfirmed. */
export function verifyDeadlineQuote<T extends Pick<LetterAnalysis, "deadline" | "deadlineQuote" | "deadlineConfidence">>(a: T, sourceText?: string | null): T {
  if (!a.deadline) return a;
  const quote = a.deadlineQuote?.trim();
  if (!quote) return { ...a, deadline: null, deadlineConfidence: null };
  if (sourceText?.trim()) return norm(sourceText).includes(norm(quote)) ? a : { ...a, deadline: null, deadlineConfidence: null };
  return quoteContainsDate(quote, a.deadline) ? a : { ...a, deadlineConfidence: "LOW" };
}

/** Safe defaults for optional analysis fields (older saved letters lack them). */
export function getLetterInsights(a: LetterAnalysis | null) {
  const documentType: DocumentType = a?.documentType && (DOCUMENT_TYPES as readonly string[]).includes(a.documentType) ? a.documentType : "OTHER";
  const riskLevel: RiskLevel | null = a?.riskLevel && (RISK_LEVELS as readonly string[]).includes(a.riskLevel) ? a.riskLevel : null;
  const needsHuman = riskLevel === "HIGH" || riskLevel === "CRITICAL" || a?.needsHuman === true;
  const deadlineQuote = a?.deadline ? a.deadlineQuote?.trim() || null : null;
  const deadlineUnconfirmed = !!a?.deadline && a.deadlineConfidence != null && a.deadlineConfidence !== "HIGH";
  return { documentType, hasType: !!a?.documentType, riskLevel, riskReason: a?.riskReason?.trim() || null, needsHuman, deadlineQuote, deadlineUnconfirmed, remedyInfo: a?.remedyInfo?.trim() || null };
}

export async function blobUrlToBase64(url: string) {
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}
