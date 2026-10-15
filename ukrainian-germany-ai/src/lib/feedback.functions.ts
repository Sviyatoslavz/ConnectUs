import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertOwnLetter, feedbackSchema } from "./letter-feedback";

/** Saves (or updates) the caller's rating for one of their own letters. No AI, no quota. */
export const submitFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => feedbackSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase.from("letters").select("user_id").eq("id", data.letterId).maybeSingle();
    assertOwnLetter(row, userId);
    const { error } = await supabase.from("letter_feedback").upsert(
      { user_id: userId, letter_id: data.letterId, rating: data.rating, error_type: data.errorType, comment: data.comment, created_at: new Date().toISOString() },
      { onConflict: "user_id,letter_id" },
    );
    if (error) { console.error("feedback save failed", error.message); throw new Error("save_failed"); }
    if (data.rating === "down") {
      try { const { dispatchOwnerPush } = await import("./owner-monitor.server"); await dispatchOwnerPush(true); } catch { console.error("owner notification deferred to cron"); }
    }
    return { ok: true, rating: data.rating };
  });
