import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ASSISTANT_MODULES, ALLOWED_SOURCES, ASSISTANT_DAILY_LIMIT, assistantInputSchema, parseAssistantAnswer, buildAssistantPrompt, MODULE_PROMPTS } from "@/lib/assistant-modules";
import { assistantCopy } from "@/lib/assistant-copy";

const ok = { module: "wohnen", message: "Що потрібно для Anmeldung?", history: [], lang: "UK" };
const answer = { short: "a", meaning: "b", steps: ["c"], deadline: null, needed: [], important: null, nextStep: "d", needsHuman: false, source: null, germanText: null, clarifyingQuestion: null };

describe("assistant modules and copy", () => {
  it("has five modules with copy and 4 quick prompts in UK/RU/DE", () => {
    expect([...ASSISTANT_MODULES]).toEqual(["wohnen", "familie", "arbeit", "geld", "aufenthalt"]);
    for (const l of ["UK", "RU", "DE"] as const) for (const m of ASSISTANT_MODULES) {
      expect(assistantCopy[l].modules[m].title.length).toBeGreaterThan(0);
      expect(assistantCopy[l].modules[m].quick).toHaveLength(4);
    }
  });
});

describe("assistant input validation", () => {
  it("accepts valid input", () => { expect(assistantInputSchema.safeParse(ok).success).toBe(true); });
  it("rejects wrong module, empty/long message, extra fields, long history", () => {
    expect(assistantInputSchema.safeParse({ ...ok, module: "steuer" }).success).toBe(false);
    expect(assistantInputSchema.safeParse({ ...ok, message: "   " }).success).toBe(false);
    expect(assistantInputSchema.safeParse({ ...ok, message: "x".repeat(1501) }).success).toBe(false);
    expect(assistantInputSchema.safeParse({ ...ok, userId: "x" }).success).toBe(false);
    expect(assistantInputSchema.safeParse({ ...ok, history: Array(7).fill({ role: "user", content: "a" }) }).success).toBe(false);
  });
});

describe("assistant answer parsing", () => {
  it("drops invalid structures", () => {
    expect(parseAssistantAnswer(answer)).not.toBeNull();
    expect(parseAssistantAnswer({ ...answer, steps: "do it" })).toBeNull();
    expect(parseAssistantAnswer({ ...answer, source: "https://example.com" })).toBeNull();
    expect(parseAssistantAnswer({ short: "only" })).toBeNull();
  });
});

describe("assistant prompts and sources", () => {
  it("every module prompt forbids inventing laws, deadlines and links", () => {
    for (const m of ASSISTANT_MODULES) {
      expect(MODULE_PROMPTS[m]).toMatch(/Never invent laws.*deadlines.*links/);
      expect(buildAssistantPrompt(m, "UK")).toContain("untrusted data");
    }
  });
  it("allows exactly the four official sources", () => {
    expect(ALLOWED_SOURCES.map(u => new URL(u).hostname.replace("www.", ""))).toEqual(["arbeitsagentur.de", "bamf.de", "germany4ukraine.de", "make-it-in-germany.com"]);
  });
});

describe("assistant daily limit", () => {
  it("is 30 and passed to the server reservation", () => {
    expect(ASSISTANT_DAILY_LIMIT).toBe(30);
    const src = readFileSync("src/lib/assistant.functions.ts", "utf8");
    expect(src).toContain("_daily_limit: ASSISTANT_DAILY_LIMIT");
    expect(src).toContain("release_assistant_question");
  });
});
