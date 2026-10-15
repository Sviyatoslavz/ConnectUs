import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Deletes the caller's letters, reminders, feedback and push subscriptions in one transaction; the account stays. */
export const deleteMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("delete_user_data", { _user_id: context.userId });
    if (error) { console.error("delete failed", error.message); throw new Error("delete_failed"); }
    return { ok: true };
  });

/** Deletes the auth account; every user-owned row is removed with it by ON DELETE CASCADE in one transaction. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) { console.error("deleteUser failed", error.message); throw new Error("delete_failed"); }
    return { ok: true };
  });
