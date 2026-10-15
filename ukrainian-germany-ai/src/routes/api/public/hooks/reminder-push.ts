import { createFileRoute } from "@tanstack/react-router";
import { berlinHour, berlinToday, monthlyDue, monthlyKey, pushStage, remindHour, DEFAULT_REMIND_HOUR, VAPID_PUBLIC_KEY } from "@/lib/push";

const TEXT = {
  UK: { "3d": "Через 3 дні строк", day: "Сьогодні останній день", monthly: "Нагадування на сьогодні" },
  RU: { "3d": "Через 3 дня срок", day: "Сегодня последний день", monthly: "Напоминание на сегодня" },
  DE: { "3d": "Frist in 3 Tagen", day: "Heute ist der letzte Tag", monthly: "Erinnerung für heute" },
} as const;

type Stage = "3d" | "day" | "monthly";
type Due = { id: string; user_id: string; title: string; remind_time: string | null; notified: string[]; stage: Stage; key: string };

async function secretMatches(provided: string, expected: string) {
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const digest = (v: string) => createHash("sha256").update(v, "utf8").digest();
  return timingSafeEqual(digest(provided), digest(expected));
}

/** Pure selection of reminders due now (exported for tests). One-time reminders: 3 days before and on the day, at their time. Monthly: on their day at the default hour. */
export function selectDue(rows: { id: string; user_id: string; title: string; day: number; due_date: string | null; remind_time: string | null; notified: string[] }[], today: string, hour: number): Due[] {
  const out: Due[] = [];
  for (const r of rows) {
    if (r.due_date) {
      const stage = pushStage(r.due_date, today);
      if (!stage || r.notified.includes(stage) || hour < remindHour(r.remind_time)) continue;
      out.push({ ...r, stage, key: stage });
    } else {
      const key = monthlyKey(today);
      if (!monthlyDue(r.day, today) || r.notified.includes(key) || hour < DEFAULT_REMIND_HOUR) continue;
      out.push({ ...r, stage: "monthly", key });
    }
  }
  return out;
}

// Hourly cron: sends push for one-time reminders (3 days before / on the due date, at the chosen time) and monthly reminders.
export const Route = createFileRoute("/api/public/hooks/reminder-push")({
  server: { handlers: { POST: async ({ request }) => {
    // Caller must present the server-only REMINDER_CRON_SECRET (held by the scheduled job).
    const expected = process.env["REMINDER_CRON_SECRET"];
    const provided = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
    if (!expected || !provided || !(await secretMatches(provided, expected))) return new Response("Unauthorized", { status: 401 });
    const privateKey = process.env["VAPID_PRIVATE_KEY"];
    if (!privateKey) { console.error("VAPID_PRIVATE_KEY missing"); return Response.json({ error: "push_not_configured" }, { status: 500 }); }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { buildPushPayload } = await import("@block65/webcrypto-web-push");
    const vapid = { subject: "mailto:support@ukrainian-germany.ai", publicKey: VAPID_PUBLIC_KEY, privateKey };
    const today = berlinToday();
    const hour = berlinHour();
    const plus3 = new Date(Date.parse(today) + 3 * 864e5).toISOString().slice(0, 10);
    const [oneTime, monthly] = await Promise.all([
      supabaseAdmin.from("reminders").select("id,user_id,title,day,due_date,remind_time,notified").eq("done", false).in("due_date", [today, plus3]),
      supabaseAdmin.from("reminders").select("id,user_id,title,day,due_date,remind_time,notified").eq("done", false).is("due_date", null),
    ]);
    if (oneTime.error || monthly.error) return Response.json({ error: (oneTime.error ?? monthly.error)!.message }, { status: 500 });
    const due = selectDue([...(oneTime.data ?? []), ...(monthly.data ?? [])], today, hour);
    if (!due.length) return Response.json({ ok: true, sent: 0 });
    const users = [...new Set(due.map(d => d.user_id))];
    const [{ data: subs, error: subsError }, { data: settings }] = await Promise.all([
      supabaseAdmin.from("push_subscriptions").select("id,user_id,endpoint,p256dh,auth").in("user_id", users),
      supabaseAdmin.from("user_settings").select("user_id,lang").in("user_id", users),
    ]);
    if (subsError) return Response.json({ error: subsError.message }, { status: 500 });
    let sent = 0;
    for (const r of due) {
      const mine = (subs ?? []).filter(s => s.user_id === r.user_id);
      if (!mine.length) continue; // no device yet: retry next hour instead of marking as notified
      const lang = ((settings ?? []).find(s => s.user_id === r.user_id)?.lang ?? "UK") as keyof typeof TEXT;
      const text = TEXT[lang] ?? TEXT.UK;
      const body = JSON.stringify({ title: `${text[r.stage]}${r.remind_time && r.stage !== "monthly" ? ` · ${r.remind_time}` : ""}`, body: r.title, url: "/settings" });
      let delivered = false;
      for (const s of mine) {
        try {
          const payload = await buildPushPayload({ data: body, options: { ttl: 86400 } }, { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } }, vapid);
          const res = await fetch(s.endpoint, payload);
          if (res.status === 404 || res.status === 410) await supabaseAdmin.from("push_subscriptions").delete().eq("id", s.id);
          else if (res.ok) { sent++; delivered = true; }
          else console.error("push HTTP failure", res.status);
        } catch (e) { console.error("push failed", e); }
      }
      if (delivered) await supabaseAdmin.from("reminders").update({ notified: [...r.notified, r.key] }).eq("id", r.id);
    }
    return Response.json({ ok: true, sent });
  } } },
});
