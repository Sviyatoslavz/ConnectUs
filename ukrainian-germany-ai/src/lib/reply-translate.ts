// Reply translation limits — separate from the free letter analyses.
export const REPLY_DAILY_LIMIT = 40;
export const REPLY_MAX_CHARS = 4000;

export type TranslateInput = {
  text: string;
  sourceLang: "UK" | "RU" | "DE";
  subject?: string | null;
  reference?: string | null;
  letterDate?: string | null;
  sender?: string | null;
};

const ctx = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 300) : null);

export function validateTranslateInput(input: unknown): TranslateInput {
  const i = (input ?? {}) as { text?: unknown; sourceLang?: unknown; subject?: unknown; reference?: unknown; letterDate?: unknown; sender?: unknown };
  const text = typeof i.text === "string" ? i.text.trim() : "";
  if (!text) throw new Error("REPLY_EMPTY");
  if (text.length > REPLY_MAX_CHARS) throw new Error("REPLY_TOO_LONG");
  if (!["UK", "RU", "DE"].includes(i.sourceLang as string)) throw new Error("REPLY_BAD_LANG");
  return { text, sourceLang: i.sourceLang as TranslateInput["sourceLang"], subject: ctx(i.subject), reference: ctx(i.reference), letterDate: ctx(i.letterDate), sender: ctx(i.sender) };
}
