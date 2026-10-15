import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const subscriptionSchema = z.object({
  endpoint: z.url().max(2000).refine(v => { const u = new URL(v); return u.protocol === "https:" && !u.username && !u.password; }),
  keys: z.object({ p256dh: z.string().regex(/^[\w-]+$/).min(40).max(200), auth: z.string().regex(/^[\w-]+$/).min(10).max(100) }).strict(),
}).strict();

/** Binds this browser's push endpoint to the signed-in user. A device has one owner: a previous user's row for the same endpoint is replaced. */
export const registerPushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => subscriptionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const removed = await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", data.endpoint).neq("user_id", context.userId);
    if (removed.error) { console.error("push takeover failed", removed.error.message); throw new Error("PUSH_FAILED"); }
    const saved = await context.supabase.from("push_subscriptions").upsert({ endpoint: data.endpoint, p256dh: data.keys.p256dh, auth: data.keys.auth, user_id: context.userId }, { onConflict: "endpoint" });
    if (saved.error) { console.error("push save failed", saved.error.message); throw new Error("PUSH_FAILED"); }
    return { ok: true };
  });
