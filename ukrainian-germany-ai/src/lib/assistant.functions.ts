import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { translateLetterInputSchema, translateLetterAnswerSchema, buildTranslatePrompt, type TranslateLetterAnswer, assistantInputSchema, assistantAnswerSchema, parseAssistantAnswer, buildAssistantPrompt, ASSISTANT_DAILY_LIMIT, type AssistantAnswer } from "@/lib/assistant-modules";

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => assistantInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<AssistantAnswer> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const { data: r, error } = await supabaseAdmin.rpc("reserve_assistant_question", { _user_id: userId, _daily_limit: ASSISTANT_DAILY_LIMIT });
    if (error || !r) { console.error("assistant reserve failed", error); throw new Error("ASSIST_FAILED"); }
    if ((r as { result: string }).result === "limit") throw new Error("ASSIST_LIMIT");
    try {
      const apiKey = process.env["LOVABLE_API_KEY"];
      if (!apiKey) throw new Error("no key");
      const { streamText, Output } = await import("ai");
      const { makeProvider, AI_MODEL, PROVIDER_OPTIONS_LOW } = await import("./ai-gateway.server");
      const provider = await makeProvider(apiKey);
      const result = streamText({
        model: provider.responses(AI_MODEL),
        instructions: buildAssistantPrompt(data.module, data.lang),
        messages: [...data.history, { role: "user" as const, content: data.message }],
        output: Output.object({ schema: assistantAnswerSchema }), maxRetries: 1,
        providerOptions: PROVIDER_OPTIONS_LOW as never,
      });
      const answer = parseAssistantAnswer(await result.output);
      if (!answer) throw new Error("bad json");
      const { recordOwnerAiEvent } = await import("./owner-monitor.server"); await recordOwnerAiEvent("assistant");
      return answer;
    } catch (e) {
      console.error("assistant failed", e);
      const { recordOwnerAiEvent } = await import("./owner-monitor.server"); await recordOwnerAiEvent("error");
      await supabaseAdmin.rpc("release_assistant_question", { _user_id: userId });
      throw new Error("ASSIST_FAILED");
    }
  });

/** Translates a pasted letter, keeping German official terms; shares the assistant daily limit. */
export const translateLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => translateLetterInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<TranslateLetterAnswer> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const { data: r, error } = await supabaseAdmin.rpc("reserve_assistant_question", { _user_id: userId, _daily_limit: ASSISTANT_DAILY_LIMIT });
    if (error || !r) { console.error("assistant reserve failed", error); throw new Error("ASSIST_FAILED"); }
    if ((r as { result: string }).result === "limit") throw new Error("ASSIST_LIMIT");
    try {
      const apiKey = process.env["LOVABLE_API_KEY"];
      if (!apiKey) throw new Error("no key");
      const { streamText, Output } = await import("ai");
      const { makeProvider, AI_MODEL, PROVIDER_OPTIONS_LOW } = await import("./ai-gateway.server");
      const provider = await makeProvider(apiKey);
      const result = streamText({
        model: provider.responses(AI_MODEL),
        instructions: buildTranslatePrompt(data.target, data.lang),
        messages: [{ role: "user" as const, content: data.text }],
        output: Output.object({ schema: translateLetterAnswerSchema }), maxRetries: 1,
        providerOptions: PROVIDER_OPTIONS_LOW as never,
      });
      const parsed = translateLetterAnswerSchema.safeParse(await result.output);
      if (!parsed.success || !parsed.data.translation.trim()) throw new Error("bad json");
      const { recordOwnerAiEvent } = await import("./owner-monitor.server"); await recordOwnerAiEvent("assistant");
      return parsed.data;
    } catch (e) {
      console.error("letter translate failed", e);
      const { recordOwnerAiEvent } = await import("./owner-monitor.server"); await recordOwnerAiEvent("error");
      await supabaseAdmin.rpc("release_assistant_question", { _user_id: userId });
      throw new Error("ASSIST_FAILED");
    }
  });
