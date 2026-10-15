import type { LetterAnalysis } from "./letter-analysis";

/** Pure DIN 5008 letter assembly — no AI involved. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());

const splitLines = (v?: string | null) => (v ?? "").split(/\n|,\s*/).map(s => s.trim()).filter(Boolean);

export function cityFromAddress(addr?: string | null) {
  const m = (addr ?? "").match(/\b\d{5}\s+([^\n,;]+)/);
  return m?.[1]?.trim() ?? null;
}

export function berlinDate(now = new Date()) {
  const p: { day?: string; month?: string; year?: string } = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map(x => [x.type, x.value]));
  return { de: `${p.day}.${p.month}.${p.year}`, iso: `${p.year}-${p.month}-${p.day}` };
}

/** Cut the salutation/header and the closing from an old full-letter reply. */
export function extractBody(reply: string) {
  const lines = (reply ?? "").split("\n");
  const start = lines.findIndex(l => /^\s*Sehr geehrte/i.test(l));
  const end = lines.findIndex(l => /^\s*Mit freundlichen Grüßen/i.test(l));
  if (start < 0 && end < 0) return reply.trim();
  return lines.slice(start < 0 ? 0 : start + 1, end < 0 ? lines.length : end).join("\n").trim();
}

export type ComposedLetter = {
  senderBlock: string[];
  recipientBlock: string[];
  placeDate: string;
  subject: string[];
  salutation: string;
  body: string;
  closing: string;
  signatureName: string;
  enclosures: string[];
};

export function composeLetter(a: LetterAnalysis, now = new Date()): ComposedLetter {
  const senderBlock = [a.recipientName, ...splitLines(a.recipientAddress), a.userPhone ? `Tel.: ${a.userPhone}` : null, a.userEmail ? `E-Mail: ${a.userEmail}` : null].filter(Boolean) as string[];
  const recipientBlock = [a.sender, a.senderPerson ? `z. Hd. ${a.senderPerson}` : null, ...splitLines(a.senderAddress)].filter(Boolean) as string[];
  const city = cityFromAddress(a.recipientAddress);
  const date = berlinDate(now).de;
  const ref = a.reference?.trim();
  const subject = [
    a.subject?.trim() || "Ihr Schreiben",
    ref ? (ref.includes(":") ? ref : `Ihr Zeichen/Aktenzeichen: ${ref}`) : null,
    a.letterDate ? `Ihr Schreiben vom ${a.letterDate}` : null,
  ].filter(Boolean) as string[];
  return {
    senderBlock, recipientBlock,
    placeDate: city ? `${city}, ${date}` : date,
    subject,
    salutation: "Sehr geehrte Damen und Herren,",
    body: (a.replyBodyDe ?? extractBody(a.replyDe ?? "")).trim(),
    closing: "Mit freundlichen Grüßen",
    signatureName: a.recipientName?.trim() ?? "",
    enclosures: (a.enclosures ?? []).map(s => s.trim()).filter(Boolean),
  };
}

export function letterToText(c: ComposedLetter) {
  const parts = [c.senderBlock.join("\n"), c.recipientBlock.join("\n"), c.placeDate, c.subject.join("\n"), c.salutation, c.body, `${c.closing}\n\n\n${c.signatureName}`];
  if (c.enclosures.length) parts.push(`Anlagen:\n${c.enclosures.map(e => `- ${e}`).join("\n")}`);
  return parts.filter(p => p.trim()).join("\n\n");
}

export const hasPlaceholders = (s: string) => /\[[^\]\n]*\]/.test(s);

export function exportFileName(a: LetterAnalysis, ext: "pdf" | "docx", now = new Date()) {
  const raw = a.reference?.split(":").pop()?.trim() || a.sender || "Schreiben";
  const slug = raw.replace(/[^\p{L}\p{N}-]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "Schreiben";
  return `Antwort_${slug}_${berlinDate(now).iso}.${ext}`;
}

/** mailto: cannot attach files, so the e-mail carries the letter text itself (the PDF can be attached manually). */
export function buildMailto(to: string, c: ComposedLetter) {
  const subject = c.subject.slice(0, 2).join(" – ");
  const enclosures = c.enclosures.length ? `\n\nAnlagen:\n${c.enclosures.map(e => `- ${e}`).join("\n")}` : "";
  const body = `${c.salutation}\n\n${c.body}\n\n${c.closing}\n${c.signatureName}${enclosures}`;
  return `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const FIND_EMAIL_RE = /[A-Za-z0-9._%+-]+(?:\s*(?:@|\(at\)|\[at\])\s*)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/gi;

/** Find the sender's e-mail in raw letter text. Skips the user's own address; prefers ones near "E-Mail". */
export function findSenderEmail(text: string | null | undefined, exclude: (string | null | undefined)[] = []): string | null {
  if (!text) return null;
  const skip = new Set(exclude.filter(Boolean).map(e => e!.trim().toLowerCase()));
  const found: { email: string; score: number }[] = [];
  for (const m of text.matchAll(FIND_EMAIL_RE)) {
    const email = m[0].replace(/\s*(?:\(at\)|\[at\])\s*/i, "@").replace(/\s+/g, "").replace(/\.$/, "").toLowerCase();
    if (!isValidEmail(email) || skip.has(email) || /noreply|no-reply/.test(email)) continue;
    const before = text.slice(Math.max(0, m.index! - 25), m.index).toLowerCase();
    found.push({ email, score: /e-?mail|mail:/.test(before) ? 2 : 1 });
  }
  found.sort((x, y) => y.score - x.score);
  return found[0]?.email ?? null;
}
