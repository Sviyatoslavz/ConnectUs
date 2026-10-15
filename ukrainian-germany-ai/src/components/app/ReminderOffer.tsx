import { useEffect, useState } from "react";
import { BellPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLetter } from "@/components/app/LetterContext";

const T = {
  UK: { q: "Додати дату й час у календар з нагадуванням?", hint: "ШІ знайшов строк у листі. Перевірте дату й час — нагадування з’явиться в «Налаштуваннях», а push прийде за 3 дні й у день строку о вибраній годині.", date: "Дата", time: "Час", yes: "Так, додати нагадування", no: "Ні, дякую", done: "Нагадування додано в календар", error: "Не вдалося зберегти нагадування. Спробуйте ще раз." },
  RU: { q: "Добавить дату и время в календарь с напоминанием?", hint: "ИИ нашёл срок в письме. Проверьте дату и время — напоминание появится в «Настройках», а push придёт за 3 дня и в день срока в выбранный час.", date: "Дата", time: "Время", yes: "Да, добавить напоминание", no: "Нет, спасибо", done: "Напоминание добавлено в календарь", error: "Не удалось сохранить напоминание. Попробуйте ещё раз." },
  DE: { q: "Datum und Uhrzeit mit Erinnerung in den Kalender eintragen?", hint: "Die KI hat eine Frist gefunden. Prüfen Sie Datum und Uhrzeit — Push kommt 3 Tage vorher und am Fristtag zur gewählten Stunde.", date: "Datum", time: "Uhrzeit", yes: "Ja, Erinnerung hinzufügen", no: "Nein, danke", done: "Erinnerung hinzugefügt", error: "Erinnerung konnte nicht gespeichert werden. Bitte erneut versuchen." },
} as const;

/** "14.10.2026" → "2026-10-14" */
export function deadlineToIso(d: string) {
  const m = d.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  return m ? `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}` : "";
}

export function ReminderOffer({ deadline, title, letterId }: { deadline: string; title: string; letterId: string | null }) {
  const { lang, session } = useLetter();
  const t = T[lang];
  const [date, setDate] = useState(deadlineToIso(deadline));
  const [time, setTime] = useState("09:00");
  const [state, setState] = useState<"ask" | "done" | "hidden">("ask");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  // One reminder per letter: show the existing one instead of offering a duplicate.
  useEffect(() => {
    if (!session || !letterId) return;
    let live = true;
    void supabase.from("reminders").select("due_date,remind_time").eq("letter_id", letterId).maybeSingle().then(({ data }) => {
      if (!live || !data) return;
      if (data.due_date) setDate(data.due_date);
      if (data.remind_time) setTime(data.remind_time);
      setState("done");
    });
    return () => { live = false; };
  }, [session?.user.id, letterId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!session || state === "hidden") return null;
  if (state === "done") return <section className="letter-card flex items-center gap-2 p-5 text-sm font-semibold"><Check className="h-4 w-4" />{t.done}: {date.split("-").reverse().join(".")} {time}</section>;

  async function add() {
    if (!date || !session) return;
    setBusy(true); setError(false);
    if (typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
    const row = { title, day: +date.slice(8, 10), due_date: date, remind_time: time, user_id: session.user.id, letter_id: letterId, done: false, notified: [] as string[] };
    const { error: failed } = letterId
      ? await supabase.from("reminders").upsert(row, { onConflict: "user_id,letter_id" })
      : await supabase.from("reminders").insert(row);
    setBusy(false);
    if (failed) { console.error("reminder save failed", failed.message); setError(true); return; }
    setState("done");
  }

  return <section className="letter-card p-5 sm:p-6">
    <h2 className="flex items-center gap-2 text-sm font-semibold"><BellPlus className="h-4 w-4" />{t.q}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{t.hint}</p>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <label className="text-xs">{t.date}<input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 h-12 w-full rounded-full border bg-background/80 px-4 text-sm" /></label>
      <label className="text-xs">{t.time}<input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 h-12 w-full rounded-full border bg-background/80 px-4 text-sm" /></label>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-destructive">{t.error}</p>}
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <Button className="letter-pill h-12" disabled={!date || busy} onClick={() => void add()}>{t.yes}</Button>
      <Button variant="outline" className="letter-pill h-12 bg-transparent" onClick={() => setState("hidden")}>{t.no}</Button>
    </div>
  </section>;
}
