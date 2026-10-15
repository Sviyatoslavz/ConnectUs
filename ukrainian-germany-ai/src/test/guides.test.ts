import { describe, expect, it } from "vitest";
import { GUIDES } from "@/lib/guides";
import { ASSISTANT_MODULES, ALLOWED_SOURCES } from "@/lib/assistant-modules";

describe("guides", () => {
  it("has a document checklist for every module plus §24 and Ausländerbehörde", () => {
    for (const m of ASSISTANT_MODULES) expect(GUIDES.some(g => g.slug === `docs-${m}`)).toBe(true);
    expect(GUIDES.map(g => g.slug)).toEqual(expect.arrayContaining(["paragraph-24", "auslaenderbehoerde"]));
  });
  it("every guide is in UK/RU/DE and links only to allowed sources", () => {
    for (const g of GUIDES) {
      expect(ALLOWED_SOURCES as readonly string[]).toContain(g.source);
      for (const l of ["UK", "RU", "DE"] as const) for (const s of g.sections) expect(s.items[l].length).toBeGreaterThan(0);
    }
  });
});
