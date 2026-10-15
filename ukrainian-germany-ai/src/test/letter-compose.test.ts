import { describe, expect, it } from "vitest";
import { berlinDate, buildMailto, cityFromAddress, composeLetter, exportFileName, extractBody, hasPlaceholders, isValidEmail, letterToText } from "@/lib/letter-compose";
import { validateTranslateInput, REPLY_DAILY_LIMIT, REPLY_MAX_CHARS } from "@/lib/reply-translate";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { getLetterShortSummary } from "@/lib/letter-analysis";

const base: LetterAnalysis = {
  sender: "Jobcenter Berlin Mitte", senderPerson: "Frau Weber", senderAddress: "Seydelstr. 2, 10117 Berlin",
  letterDate: "01.10.2026", deadline: "20.10.2026", reference: "BG-Nummer: 123A456", recipientName: "Olena Koval",
  recipientAddress: "Hauptstr. 5, 04109 Leipzig", subject: "Mitwirkungsaufforderung",
  what: "", translation: "", actions: [], caution: "", replyTranslation: "",
  replyDe: "Olena Koval\n[Ort], [Datum]\n\nSehr geehrte Frau Weber,\n\nich beziehe mich auf Ihr Schreiben.\n\nMit freundlichen Grüßen\nOlena Koval",
};
const now = new Date("2026-10-09T23:30:00Z"); // already 10.10. in Berlin

describe("letter compose", () => {
  it("omits the short summary for saved letters without the optional fields", () => {
    expect(getLetterShortSummary(base)).toBeNull();
  });
  it("takes the city after the 5-digit postcode", () => {
    expect(cityFromAddress("Hauptstr. 5, 04109 Leipzig")).toBe("Leipzig");
    expect(cityFromAddress("Hauptstr. 5")).toBeNull();
  });
  it("uses the Berlin date", () => expect(berlinDate(now)).toEqual({ de: "10.10.2026", iso: "2026-10-10" }));
  it("builds place and date without placeholders", () => {
    const c = composeLetter(base, now);
    expect(c.placeDate).toBe("Leipzig, 10.10.2026");
    expect(composeLetter({ ...base, recipientAddress: null }, now).placeDate).toBe("10.10.2026");
    const text = letterToText(c);
    expect(text).not.toContain("[Ort]"); expect(text).not.toContain("[Datum]");
  });
  it("puts all references into Betreff and a neutral salutation", () => {
    const c = composeLetter(base, now);
    expect(c.subject).toEqual(["Mitwirkungsaufforderung", "BG-Nummer: 123A456", "Ihr Schreiben vom 01.10.2026"]);
    expect(composeLetter({ ...base, reference: "AZ 77" }, now).subject[1]).toBe("Ihr Zeichen/Aktenzeichen: AZ 77");
    expect(c.salutation).toBe("Sehr geehrte Damen und Herren,");
    expect(c.recipientBlock).toEqual(["Jobcenter Berlin Mitte", "z. Hd. Frau Weber", "Seydelstr. 2", "10117 Berlin"]);
  });
  it("extracts the body from an old full reply", () => {
    expect(extractBody(base.replyDe)).toBe("ich beziehe mich auf Ihr Schreiben.");
    expect(extractBody("nur Text")).toBe("nur Text");
    expect(composeLetter(base, now).body).toBe("ich beziehe mich auf Ihr Schreiben.");
  });
  it("lists enclosures only when present", () => {
    expect(letterToText(composeLetter(base, now))).not.toContain("Anlagen");
    expect(letterToText(composeLetter({ ...base, enclosures: ["Mietvertrag", " "] }, now))).toContain("Anlagen:\n- Mietvertrag");
  });
  it("detects leftover placeholders", () => { expect(hasPlaceholders("a [..] b")).toBe(true); expect(hasPlaceholders("ok")).toBe(false); });
  it("names the file after the reference and date", () => expect(exportFileName(base, "pdf", now)).toBe("Antwort_123A456_2026-10-10.pdf"));
  it("mailto carries the letter text and does not claim an attachment it cannot add", () => {
    const m = buildMailto("info@jobcenter.de", composeLetter({ ...base, enclosures: ["Lohnabrechnung"] }, now));
    expect(m.startsWith("mailto:info%40jobcenter.de?")).toBe(true);
    const decoded = decodeURIComponent(m);
    expect(decoded).toContain("ich beziehe mich auf Ihr Schreiben.");
    expect(decoded).toContain("Mit freundlichen Grüßen\nOlena Koval");
    expect(decoded).toContain("Anlagen:\n- Lohnabrechnung");
    expect(decoded).not.toContain("PDF-Anhang");
  });
});

describe("email validation", () => {
  it("accepts and rejects", () => {
    expect(isValidEmail("a.b@amt.de")).toBe(true);
    expect(isValidEmail("amt.de")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});

describe("translateReply input", () => {
  it("limits are 40 per day and 4000 chars", () => { expect(REPLY_DAILY_LIMIT).toBe(40); expect(REPLY_MAX_CHARS).toBe(4000); });
  it("rejects empty, too long and bad language", () => {
    expect(() => validateTranslateInput({ text: " ", sourceLang: "UK" })).toThrow("REPLY_EMPTY");
    expect(() => validateTranslateInput({ text: "x".repeat(4001), sourceLang: "UK" })).toThrow("REPLY_TOO_LONG");
    expect(() => validateTranslateInput({ text: "hi", sourceLang: "EN" })).toThrow("REPLY_BAD_LANG");
  });
  it("accepts valid input with context", () => {
    expect(validateTranslateInput({ text: " Дякую ", sourceLang: "UK", reference: "AZ 1" })).toMatchObject({ text: "Дякую", reference: "AZ 1", subject: null });
  });
});

import { findSenderEmail } from "@/lib/letter-compose";
describe("findSenderEmail", () => {
  it("finds labelled email, skips own", () => {
    expect(findSenderEmail("Kontakt: me@gmx.de\nE-Mail: Jobcenter-Mitte@jobcenter-ge.de", ["me@gmx.de"])).toBe("jobcenter-mitte@jobcenter-ge.de");
  });
  it("handles (at)", () => { expect(findSenderEmail("Mail: info(at)amt.de")).toBe("info@amt.de"); });
  it("null when none", () => { expect(findSenderEmail("Keine Adresse")).toBeNull(); });
});

import { verifyDeadlineQuote, getLetterInsights, quoteContainsDate } from "@/lib/letter-analysis";
describe("deadline quote verification", () => {
  const src = "Bitte reichen Sie die Unterlagen bis zum 18.09.2026 ein.";
  it("keeps deadline when quote is in the letter", () => {
    expect(verifyDeadlineQuote({ deadline: "18.09.2026", deadlineQuote: "bis zum 18.09.2026", deadlineConfidence: "HIGH" }, src).deadline).toBe("18.09.2026");
  });
  it("drops deadline when quote is not in the letter", () => {
    expect(verifyDeadlineQuote({ deadline: "18.09.2026", deadlineQuote: "bis zum 30.09.2026", deadlineConfidence: "HIGH" }, src).deadline).toBeNull();
  });
  it("drops deadline without any quote", () => {
    expect(verifyDeadlineQuote({ deadline: "18.09.2026", deadlineQuote: null, deadlineConfidence: "LOW" }, src).deadline).toBeNull();
  });
  it("for photos/PDFs keeps a deadline whose quote contains the date", () => {
    const r = verifyDeadlineQuote({ deadline: "18.09.2026", deadlineQuote: "Bitte bis zum 18.09.2026 einreichen", deadlineConfidence: "HIGH" });
    expect(r).toMatchObject({ deadline: "18.09.2026", deadlineConfidence: "HIGH" });
  });
  it("for photos/PDFs marks a deadline unconfirmed when the quote does not contain the date", () => {
    const r = verifyDeadlineQuote({ deadline: "18.09.2026", deadlineQuote: "Bitte innerhalb von zwei Wochen einreichen", deadlineConfidence: "HIGH" });
    expect(r).toMatchObject({ deadline: "18.09.2026", deadlineConfidence: "LOW" });
    expect(getLetterInsights({ ...base, ...r }).deadlineUnconfirmed).toBe(true);
  });
  it("recognises numeric, short-year and German month-name dates", () => {
    expect(quoteContainsDate("bis zum 8.9.26", "08.09.2026")).toBe(true);
    expect(quoteContainsDate("spätestens am 18. September 2026", "18.09.2026")).toBe(true);
    expect(quoteContainsDate("bis 3. März 2026", "03.03.2026")).toBe(true);
    expect(quoteContainsDate("bis zum 19.09.2026", "18.09.2026")).toBe(false);
    expect(quoteContainsDate("bis zum 18.09.2025", "18.09.2026")).toBe(false);
  });
});
describe("insight defaults for older letters", () => {
  it("defaults to OTHER, no risk, no human review", () => {
    const i = getLetterInsights(base);
    expect(i.documentType).toBe("OTHER");
    expect(i.riskLevel).toBeNull();
    expect(i.needsHuman).toBe(false);
    expect(i.deadlineUnconfirmed).toBe(false);
    expect(i.remedyInfo).toBeNull();
  });
  it("HIGH risk needs human review", () => {
    expect(getLetterInsights({ ...base, riskLevel: "HIGH" }).needsHuman).toBe(true);
  });
});
