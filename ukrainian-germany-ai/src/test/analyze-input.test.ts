import { describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ middleware() { return this; }, inputValidator() { return this; }, handler(fn: unknown) { return fn; } }) }));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
import { validateAnalyzeInput, MAX_FILE_BASE64 } from "@/lib/letters.functions";
import { findAiErrorCode, aiErrorCode, AiGatewayError } from "@/lib/ai-gateway.server";

const op = "11111111-1111-4111-8111-111111111111";
const ok = { fileName: "a.pdf", mediaType: "application/pdf", fileBase64: "JVBERi0=", lang: "UK" as const, operationId: op };

describe("analysis input validation", () => {
  it("accepts a file or text", () => {
    expect(validateAnalyzeInput(ok).fileName).toBe("a.pdf");
    expect(validateAnalyzeInput({ fileName: "t", text: "Hallo", lang: "DE", operationId: op }).text).toBe("Hallo");
  });
  it("rejects empty, oversized, unknown types and bad ids", () => {
    expect(() => validateAnalyzeInput({ fileName: "x", lang: "UK", operationId: op })).toThrow("BAD_FILE");
    expect(() => validateAnalyzeInput({ ...ok, fileBase64: "a".repeat(MAX_FILE_BASE64 + 1) })).toThrow("FILE_TOO_LARGE");
    expect(() => validateAnalyzeInput({ ...ok, mediaType: "text/html" })).toThrow("BAD_FILE");
    expect(() => validateAnalyzeInput({ ...ok, mediaType: undefined })).toThrow("BAD_FILE");
    expect(() => validateAnalyzeInput({ ...ok, operationId: "x" })).toThrow("Bad operation id");
  });
});

describe("AI gateway error mapping", () => {
  it("maps HTTP status to codes", () => {
    expect(aiErrorCode(402)).toBe("AI_CREDITS");
    expect(aiErrorCode(429)).toBe("AI_RATE");
    expect(aiErrorCode(403)).toBe("AI_BLOCKED");
    expect(aiErrorCode(500)).toBeNull();
  });
  it("finds the code inside wrapped SDK errors", () => {
    const wrapped = Object.assign(new Error("Retry failed"), { lastError: Object.assign(new Error("call failed"), { cause: new AiGatewayError("AI_RATE") }) });
    expect(findAiErrorCode(wrapped)).toBe("AI_RATE");
    expect(findAiErrorCode(new Error("boom"))).toBeNull();
  });
});
