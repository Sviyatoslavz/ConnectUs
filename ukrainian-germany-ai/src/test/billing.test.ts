import { describe, expect, it } from "vitest";
import { FREE_ANALYSES, DAILY_ANALYSIS_CAP, limitCodeOf, usageSummary } from "@/lib/billing";

describe("billing rules", () => {
  it("allows 10 free analyses and 200 per day by default", () => {
    expect(FREE_ANALYSES).toBe(10);
    expect(DAILY_ANALYSIS_CAP).toBe(200);
  });
  it("shows remaining free analyses", () => {
    expect(usageSummary(1, "free")).toMatchObject({ used: 1, left: 9, exhausted: false });
  });
  it("keeps already used analyses: 3 used leaves 7", () => {
    expect(usageSummary(3, "free")).toMatchObject({ used: 3, left: 7, exhausted: false });
  });
  it("marks quota exhausted after 10 without active subscription", () => {
    expect(usageSummary(9, "free").exhausted).toBe(false);
    expect(usageSummary(10, "free").exhausted).toBe(true);
    expect(usageSummary(10, "past_due").exhausted).toBe(true);
    expect(usageSummary(10, "active").exhausted).toBe(false);
  });
  it("maps server error codes even when wrapped", () => {
    expect(limitCodeOf("Error: LIMIT_QUOTA")).toBe("LIMIT_QUOTA");
    expect(limitCodeOf("random")).toBeNull();
  });
});
