import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BellRing, Bell, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLetter } from "@/components/app/LetterContext";
import { currentPushEndpoint, reminderDayInMonth, subscribePush } from "@/lib/push";
import { registerPushSubscription } from "@/lib/push.functions";

export { reminderDayInMonth };

const T = {
  UK: { push: "Увімкнути пуш-сповіщення", pushOn: "Пуш увімкнено: нагадаємо за 3 дні й у день строку о вибраній годині, а щомісячні — о 9:00, навіть коли застосунок закрито.", pushErr: "Не вдалося увімкнути. На iPhone спершу додайте застосунок на головний екран.", doneL: "виконано", title: "Календар нагадувань", hint: "Оберіть день місяця — нагадування повторюватиметься щомісяця.", ph: "Напр. оплатити Miete", add: "Додати", today: "Сьогодні нагадування", deadline: "Строк листа", wd: ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"], loc: "uk-UA", failed: "Не вдалося зберегти зміну. Спробуйте ще раз.", remove: "Видалити нагадування" },
  RU: { push: "Включить пуш-уведомления", pushOn: "Пуш включён: напомним за 3 дня и в день срока в выбранный час, а ежемесячные — в 9:00, даже когда приложение закрыто.", pushErr: "Не удалось включить. На iPhone сначала добавьте приложение на главный экран.", doneL: "выполнено", title: "Календарь напоминаний", hint: "Выберите день месяца — напоминание будет повторяться каждый месяц.", ph: "Напр. оплатить Miete", add: "Добавить", today: "Сегодня напоминания", deadline: "Срок письма", wd: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"], loc: "ru-RU", failed: "Не удалось сохранить изменение. Попробуйте ещё раз.", remove: "Удалить напоминание" },
  DE: { push: "Push-Benachrichtigungen aktivieren", pushOn: "Push aktiv: Erinnerung 3 Tage vorher und am Fristtag zur gewählten Stunde, monatliche um 9:00 Uhr — auch wenn die App geschlossen ist.", pushErr: "Aktivierung fehlgeschlagen. Auf dem iPhone App zuerst zum Home-Bildschirm hinzufügen.", doneL: "erledigt", title: "Erinnerungskalender", hint: "Wählen Sie einen Tag — die Erinnerung wiederholt sich monatlich.", ph: "z. B. Miete zahlen", add: "Hinzufügen", today: "Heute fällig", deadline: "Brief-Frist", wd: ["Mo","Di","Mi","Do","Fr","Sa","So"], loc: "de-DE", failed: "Änderung konnte nicht gespeichert werden. Bitte erneut versuchen.", remove: "Erinnerung löschen" },
} as const;

type Reminder = { id: string; title: string; day: number; due_date?: string | null; remind_time?: string | null; done?: boolean };
export type Deadline = { title: string; date: Date };

/** One-time reminders (with due_date) fall only on that date; others repeat monthly. */
export function reminderFallsOn(r: { day: number; due_date?: string | null }, year: number, month: number, d: number) {
  if (r.due_date) return r.due_date === `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return reminderDayInMonth(r.day, year, month) === d;
}

export function ReminderCalendar({ deadlines }: { deadlines: Deadline[] }) {
  const { lang, session } = useLetter();
  const t = T[lang];
  const register = useServerFn(registerPushSubscription);
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [items, setItems] = useState<Reminder[]>([]);
  const [sel, setSel] = useState(now.getDate());
  const [text, setText] = useState("");
  const [push, setPush] = useState<"off" | "on" | "err">("off");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!session || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    // "On" only when this device's subscription is stored for this user.
    void currentPushEndpoint().then(endpoint => {
      if (!endpoint) return;
      void supabase.from("push_subscriptions").select("id").eq("endpoint", endpoint).maybeSingle().then(({ data }) => { if (data) setPush("on"); });
    });
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function enablePush() {
    try {
      const s = await subscribePush();
      await register({ data: { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } } });
      setPush("on");
    } catch { setPush("err"); }
  }
  async function toggleDone(r: Reminder) {
    setFailed(false);
    const { error } = await supabase.from("reminders").update({ done: !r.done }).eq("id", r.id);
    if (error) { setFailed(true); return; }
    setItems(i => i.map(x => x.id === r.id ? { ...x, done: !r.done } : x));
  }

  useEffect(() => {
    if (!session) return;
    void supabase.from("reminders").select("id,title,day,due_date,remind_time,done").order("day").then(({ data, error }) => { if (error) setFailed(true); else setItems(data ?? []); });
  }, [session]);

  const dueToday = items.filter(r => !r.done && reminderFallsOn(r, now.getFullYear(), now.getMonth(), now.getDate()));

  const cells = useMemo(() => {
    const first = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
    const n = new Date(view.y, view.m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)] as (number | null)[];
  }, [view]);

  const remOn = (d: number) => items.filter(r => reminderFallsOn(r, view.y, view.m, d));
  const dlOn = (d: number) => deadlines.filter(x => x.date.getFullYear() === view.y && x.date.getMonth() === view.m && x.date.getDate() === d);

  async function add() {
    if (!text.trim() || !session) return;
    setFailed(false);
    const { data, error } = await supabase.from("reminders").insert({ title: text.trim().slice(0, 200), day: sel, user_id: session.user.id }).select("id,title,day,due_date,remind_time,done").single();
    if (error || !data) { setFailed(true); return; }
    setItems(i => [...i, data]);
    setText("");
  }
  async function remove(id: string) {
    setFailed(false);
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) { setFailed(true); return; }
    setItems(i => i.filter(r => r.id !== id));
  }
  const shift = (d: number) => setView(v => { const x = new Date(v.y, v.m + d, 1); return { y: x.getFullYear(), m: x.getMonth() }; });
  const isToday = (d: number) => view.y === now.getFullYear() && view.m === now.getMonth() && d === now.getDate();

  return <section className="letter-card p-4 sm:p-6" style={{ background: "var(--text-surface)" }}>
    <h2 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-5 w-5" />{t.title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{t.hint}</p>
    {push === "on" ? <p className="mt-3 flex items-center gap-2 rounded-xl border bg-background/80 p-3 text-sm"><BellRing className="h-4 w-4 shrink-0" />{t.pushOn}</p>
      : <><Button variant="outline" className="letter-pill mt-3 h-12 w-full" onClick={() => void enablePush()}><BellRing />{t.push}</Button>{push === "err" && <p className="mt-2 text-xs text-destructive">{t.pushErr}</p>}</>}
    {dueToday.length > 0 && <div className="mt-4 rounded-xl border bg-background/80 p-3 text-sm"><b>{t.today}:</b> {dueToday.map(r => r.title).join(", ")}</div>}
    {failed && <p role="alert" className="mt-3 text-sm text-destructive">{t.failed}</p>}
    <div className="mt-5 flex items-center justify-between">
      <Button variant="outline" className="h-12 w-12 rounded-full bg-transparent" onClick={() => shift(-1)} aria-label="prev"><ChevronLeft className="h-6 w-6" /></Button>
      <span className="text-lg font-bold capitalize">{new Date(view.y, view.m).toLocaleDateString(t.loc, { month: "long", year: "numeric" })}</span>
      <Button variant="outline" className="h-12 w-12 rounded-full bg-transparent" onClick={() => shift(1)} aria-label="next"><ChevronRight className="h-6 w-6" /></Button>
    </div>
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[13px] font-semibold text-foreground/80">{t.wd.map(w => <span key={w}>{w}</span>)}</div>
    <div className="mt-1.5 grid grid-cols-7 gap-1">{cells.map((d, i) => d === null ? <span key={i} /> :
      <button key={i} onClick={() => setSel(d)} className={`relative flex h-12 w-full min-w-0 items-center justify-center rounded-full border text-[19px] font-semibold transition-transform ${sel === d ? "border-foreground bg-foreground font-bold text-background shadow-md" : isToday(d) ? "border-2 border-foreground bg-background font-bold" : "border-transparent"}`}>
        {d}
        <span className="absolute bottom-1 flex gap-0.5">{remOn(d).length > 0 && <i className="h-2 w-2 rounded-full bg-current" />}{dlOn(d).length > 0 && <i className="h-2 w-2 rounded-full bg-destructive" />}</span>
      </button>)}</div>
    <div className="mt-4 grid gap-2">
      {dlOn(sel).map((x, i) => <div key={i} className="rounded-xl border border-destructive/40 p-3 text-[15px]"><span className="text-destructive">{t.deadline}:</span> {x.title}</div>)}
      {remOn(sel).map(r => <div key={r.id} className="flex min-h-12 items-center gap-2 rounded-xl border p-3 text-[15px]"><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!r.done} onChange={() => void toggleDone(r)} className="h-5 w-5 accent-foreground" />{t.doneL}</label><span className={`min-w-0 flex-1 ${r.done ? "text-muted-foreground line-through" : ""}`}>{r.title}{r.remind_time ? ` · ${r.remind_time}` : ""}</span><button aria-label={t.remove} className="grid h-11 w-11 place-items-center" onClick={() => void remove(r.id)}><Trash2 className="h-4 w-4" /></button></div>)}
    </div>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input value={text} maxLength={200} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && void add()} placeholder={`${sel}: ${t.ph}`} className="h-12 w-full min-w-0 flex-1 rounded-full border bg-background/80 px-4 text-[15px]" />
      <Button className="letter-pill h-12 w-full shrink-0 justify-center sm:w-auto" onClick={() => void add()}><Plus />{t.add}</Button>
    </div>
  </section>;
}
