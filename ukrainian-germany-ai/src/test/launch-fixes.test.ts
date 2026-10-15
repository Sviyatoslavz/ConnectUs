import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { letterSearch } from "@/lib/letter-search";
import { aiErrorCodeOf, aiErrorText, AI_ERROR_CODES } from "@/lib/ai-errors";
import { wrapText } from "@/lib/letter-export";
import { rootCopy } from "@/lib/root-copy";
import { letterExtras, letterCopy } from "@/lib/letter-copy";
import { letterFaq } from "@/lib/letter-faq";
import { FREE_ANALYSES } from "@/lib/billing";
import { CONSENT_VERSION } from "@/lib/consent";

describe("letter routes", () => {
  it("accept only a uuid id and an explicit demo flag", () => {
    expect(letterSearch({ id: "11111111-1111-4111-8111-111111111111" })).toEqual({ id: "11111111-1111-4111-8111-111111111111", demo: undefined });
    expect(letterSearch({ id: "../../etc" })).toEqual({ id: undefined, demo: undefined });
    expect(letterSearch({ demo: "1" }).demo).toBe(true);
    expect(letterSearch({}).demo).toBeUndefined();
  });
  it("demo pages are gone: old URLs only redirect", () => {
    for (const f of ["_shell.chat.tsx", "_shell.profile.tsx", "_shell.tasks.tsx", "_shell.documents.tsx", "_shell.documents.$id.tsx"]) {
      const src = readFileSync(`src/routes/${f}`, "utf8");
      expect(src).toContain("redirect(");
      expect(src).not.toContain("demo-data");
    }
    expect(existsSync("src/routes/_shell.documents.index.tsx")).toBe(false);
  });
  it("no hard-coded demo deadline is shown as a real result", () => {
    const src = readFileSync("src/components/app/LetterResult.tsx", "utf8");
    expect(src).not.toContain('"14.10.2026"');
    expect(src).toContain("useRouteLetter");
  });
});

describe("AI error texts", () => {
  it("map every server code in UK/RU/DE without internal billing hints", () => {
    for (const lang of ["UK", "RU", "DE"] as const) for (const code of AI_ERROR_CODES) {
      expect(aiErrorText[lang][code].length).toBeGreaterThan(10);
      expect(aiErrorText[lang][code]).not.toMatch(/баланс|balance|кредит|Guthaben/i);
    }
    expect(aiErrorCodeOf("Error: AI_RATE")).toBe("AI_RATE");
    expect(aiErrorCodeOf("whatever")).toBeNull();
  });
});

describe("PDF line wrapping", () => {
  const width = (s: string) => s.length;
  it("splits words longer than a line (IBAN, URL)", () => {
    const lines = wrapText("IBAN DE89370400440532013000 ok", width, 10);
    expect(lines.every(l => l.length <= 10)).toBe(true);
    expect(lines.join("").replace(/ /g, "")).toBe("IBANDE89370400440532013000ok");
  });
  it("keeps normal wrapping", () => expect(wrapText("aa bb cc", width, 5)).toEqual(["aa bb", "cc"]));
});

describe("copy", () => {
  it("has localized 404/error pages", () => { for (const l of ["UK", "RU", "DE"] as const) expect(rootCopy[l].notFoundTitle).toBeTruthy(); });
  it("does not promise a price or cancellation flow that does not exist", () => {
    for (const l of ["UK", "RU", "DE"] as const) {
      const all = JSON.stringify(letterExtras[l]) + JSON.stringify(letterFaq[l]);
      expect(all).not.toMatch(/5 €|два клі|два кли|zwei Klicks/);
      expect(letterExtras[l].subBadge).toContain(String(FREE_ANALYSES));
    }
  });
  it("consent text names special categories (Art. 9) in every language", () => {
    for (const l of ["UK", "RU", "DE"] as const) expect(letterCopy[l].agree).toMatch(/9/);
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it("no longer loads Google Fonts", () => {
    expect(readFileSync("src/routes/__root.tsx", "utf8")).not.toContain("fonts.googleapis.com");
  });
});

describe("server-side safety", () => {
  it("analysis requires a recorded consent and checks PDF pages on the server", () => {
    const src = readFileSync("src/lib/letters.functions.ts", "utf8");
    expect(src).toContain('throw new Error("CONSENT_REQUIRED")');
    expect(src).toContain("PDF_TOO_LONG");
    expect(src.indexOf("CONSENT_REQUIRED")).toBeLessThan(src.indexOf('rpc("reserve_analysis"'));
  });
  it("opening the mail client does not mark a letter as sent", () => {
    const src = readFileSync("src/components/app/LetterReply.tsx", "utf8");
    const openMail = src.slice(src.indexOf("function openMail"), src.indexOf("function toggleSent"));
    expect(openMail).not.toContain("sentAt");
  });
  it("migration adds ownership FKs, letter-bound reminders, consents and atomic deletion", () => {
    const sql = readFileSync("drizzle/migrations/0014_launch_hardening.sql", "utf8");
    for (const s of ["ON DELETE CASCADE", "reminders_user_letter_key", "CREATE TABLE IF NOT EXISTS public.consents", "delete_user_data", "ENABLE ROW LEVEL SECURITY"]) expect(sql).toContain(s);
  });
});
