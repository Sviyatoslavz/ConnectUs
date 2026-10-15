import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Art. 15 / Art. 20 DSGVO: everything stored about the caller, read through RLS (own rows only). */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const [letters, reminders, settings, feedback, usage, subscription, push, consents, replyUsage, assistantUsage] = await Promise.all([
      db.from("letters").select("id,file_name,lang,sender,sender_person,letter_date,deadline,reference,recipient_name,subject,analysis,reply_de,created_at").order("created_at"),
      db.from("reminders").select("id,title,day,due_date,remind_time,done,letter_id,created_at").order("created_at"),
      db.from("user_settings").select("lang,updated_at"),
      db.from("letter_feedback").select("letter_id,rating,error_type,comment,created_at"),
      db.from("usage_records").select("operation_type,status,letter_id,created_at,completed_at").order("created_at"),
      db.from("subscriptions").select("status,current_period_end,updated_at"),
      db.from("push_subscriptions").select("endpoint,created_at"),
      db.from("consents").select("kind,version,lang,created_at"),
      db.from("reply_usage").select("day,count"),
      db.from("assistant_usage").select("day,count"),
    ]);
    const failed = [letters, reminders, settings, feedback, usage, subscription, push, consents, replyUsage, assistantUsage].find(r => r.error);
    if (failed?.error) { console.error("export failed", failed.error.message); throw new Error("export_failed"); }
    return {
      exportedAt: new Date().toISOString(),
      account: { id: context.userId, email: typeof context.claims?.email === "string" ? context.claims.email : null },
      letters: letters.data, reminders: reminders.data, settings: settings.data, feedback: feedback.data,
      usage: usage.data, subscription: subscription.data, pushSubscriptions: push.data, consents: consents.data,
      replyTranslationsPerDay: replyUsage.data, assistantQuestionsPerDay: assistantUsage.data,
    };
  });
