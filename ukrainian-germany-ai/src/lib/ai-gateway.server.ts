// Server-only: shared Lovable AI Gateway provider. Load via dynamic import inside server handlers.
export const AI_MODEL = "openai/gpt-6-astra";

/** Error codes the client maps to UK/RU/DE text. */
export type AiErrorCode = "AI_CREDITS" | "AI_RATE" | "AI_BLOCKED";

export function aiErrorCode(status: number): AiErrorCode | null {
  if (status === 402) return "AI_CREDITS";
  if (status === 429) return "AI_RATE";
  if (status === 403) return "AI_BLOCKED";
  return null;
}

export class AiGatewayError extends Error {
  constructor(public code: AiErrorCode) { super(code); }
}

/** OpenAI-compatible provider on the Lovable AI Gateway; HTTP failures surface as AiGatewayError codes. */
export async function makeProvider(apiKey: string) {
  const { createOpenAI } = await import("@ai-sdk/openai");
  let runId: string | undefined;
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      if (!res.ok) {
        const body = await res.clone().text().catch(() => "");
        console.error("AI gateway error", res.status, body.slice(0, 500));
        const code = aiErrorCode(res.status);
        if (code) throw new AiGatewayError(code);
      }
      return res;
    },
  });
}

/** Finds an AiGatewayError anywhere in an error's cause chain (the AI SDK wraps fetch errors). */
export function findAiErrorCode(error: unknown): AiErrorCode | null {
  let current: unknown = error;
  for (let i = 0; i < 6 && current; i++) {
    if (current instanceof AiGatewayError) return current.code;
    const msg = current instanceof Error ? current.message : "";
    const hit = (["AI_CREDITS", "AI_RATE", "AI_BLOCKED"] as const).find(c => msg.includes(c));
    if (hit) return hit;
    current = (current as { cause?: unknown }).cause ?? (current as { lastError?: unknown }).lastError;
  }
  return null;
}

export const PROVIDER_OPTIONS = {
  openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"], strictJsonSchema: true },
} as const;

export const PROVIDER_OPTIONS_LOW = {
  openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"], strictJsonSchema: true },
} as const;
