import { describe, expect, it } from "vitest";
import { assertOwnLetter, feedbackSchema } from "@/lib/letter-feedback";

const id = "11111111-1111-4111-8111-111111111111";

describe("feedback validation", () => {
  it("accepts up/down and rejects other ratings", () => {
    expect(feedbackSchema.parse({ letterId: id, rating: "up" }).rating).toBe("up");
    expect(() => feedbackSchema.parse({ letterId: id, rating: "meh" })).toThrow();
    expect(() => feedbackSchema.parse({ letterId: "x", rating: "up" })).toThrow();
  });
  it("limits comment to 500 chars and rejects letter text", () => {
    expect(() => feedbackSchema.parse({ letterId: id, rating: "down", comment: "a".repeat(501) })).toThrow();
    expect(() => feedbackSchema.parse({ letterId: id, rating: "down", text: "Sehr geehrte" })).toThrow();
  });
  it("drops reason and comment for a thumbs up", () => {
    expect(feedbackSchema.parse({ letterId: id, rating: "up", errorType: "deadline", comment: "x" })).toEqual({ letterId: id, rating: "up", errorType: null, comment: null });
  });
});

describe("letter ownership", () => {
  it("rejects someone else's or missing letter", () => {
    expect(() => assertOwnLetter({ user_id: "other" }, "me")).toThrow("letter_not_found");
    expect(() => assertOwnLetter(null, "me")).toThrow("letter_not_found");
    expect(() => assertOwnLetter({ user_id: "me" }, "me")).not.toThrow();
  });
});
