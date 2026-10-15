import { describe, expect, it } from "vitest";
import { describeAuthority } from "@/lib/authority";
import { isRateLimitError } from "@/lib/auth-errors";

describe("describeAuthority", () => {
  it("adds UK type case-insensitively", () => {
    expect(describeAuthority("JOBCENTER Berlin Mitte", "UK")).toBe("JOBCENTER Berlin Mitte (центр зайнятості, виплати)");
    expect(describeAuthority("Finanzamt Köln", "UK")).toBe("Finanzamt Köln (податкова)");
  });
  it("uses RU and DE", () => {
    expect(describeAuthority("Familienkasse NRW", "RU")).toBe("Familienkasse NRW (выплата Kindergeld)");
    expect(describeAuthority("Deutsche Rentenversicherung", "DE")).toBe("Deutsche Rentenversicherung (Rente)");
  });
  it("leaves unknown names untouched", () => {
    expect(describeAuthority("Stadtwerke München", "UK")).toBe("Stadtwerke München");
    expect(describeAuthority(null, "UK")).toBe("");
  });
});

describe("auth rate limit", () => {
  it("detects the security wait message", () => {
    expect(isRateLimitError("For security purposes, you can only request this after 42 seconds.")).toBe(true);
    expect(isRateLimitError("Invalid login credentials")).toBe(false);
  });
});

import { authErrorText } from "@/lib/auth-errors";
describe("auth error texts", () => {
  it("maps Supabase messages in every language", () => {
    expect(authErrorText("Invalid login credentials", 400, "DE")).toBe("E-Mail oder Passwort ist falsch.");
    expect(authErrorText("User already registered", 422, "RU")).toContain("уже существует");
    expect(authErrorText("Email not confirmed", 400, "UK")).toContain("підтвердьте");
    expect(authErrorText("too many requests", 429, "UK")).toBe("Зачекайте кілька секунд і спробуйте ще раз");
    expect(authErrorText("???", 500, "DE")).toBe("Fehler. Bitte erneut versuchen.");
  });
});
