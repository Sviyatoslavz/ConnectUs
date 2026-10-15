import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, CalendarClock, FileText, Inbox, LogIn, Plus, Send, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLetter } from "@/components/app/LetterContext";
import { supabase } from "@/integrations/supabase/client";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { deadlineStatus, groupLetters, type DeadlineTone } from "@/lib/letter-list";
import { describeAuthority } from "@/lib/authority";
import { berlinToday } from "@/lib/push";

const listCopy = {
  UK: { all: "Усі організації", organisation: "Організація", unknown: "Організацію не визначено", urgent: "Терміново", soon: "Незабаром", later: "Є час", none: "Строк не вказано", overdue: "Строк минув", today: "Сьогодні", date: "Дата листа", red: "До 3 днів або прострочено", yellow: "Через 4–7 днів", green: "Понад 7 днів", legendTitle: "Кольори строків", loading: "Завантажуємо листи…", error: "Не вдалося завантажити листи", retry: "Спробувати ще раз", removeFailed: "Не вдалося видалити лист. Спробуйте ще раз.", confirmRemove: "Видалити цей лист разом із розбором і нагадуванням?" },
  RU: { all: "Все организации", organisation: "Организация", unknown: "Организация не определена", urgent: "Срочно", soon: "Скоро", later: "Есть время", none: "Срок не указан", overdue: "Срок прошёл", today: "Сегодня", date: "Дата письма", red: "До 3 дней или просрочено", yellow: "Через 4–7 дней", green: "Более 7 дней", legendTitle: "Цвета сроков", loading: "Загружаем письма…", error: "Не удалось загрузить письма", retry: "Попробовать снова", removeFailed: "Не удалось удалить письмо. Попробуйте ещё раз.", confirmRemove: "Удалить это письмо вместе с разбором и напоминанием?" },
  DE: { all: "Alle Organisationen", organisation: "Organisation", unknown: "Organisation nicht erkannt", urgent: "Dringend", soon: "Bald fällig", later: "Noch Zeit", none: "Keine Frist angegeben", overdue: "Überfällig", today: "Heute", date: "Briefdatum", red: "Bis 3 Tage oder überfällig", yellow: "In 4–7 Tagen", green: "Mehr als 7 Tage", legendTitle: "Farben der Fristen", loading: "Briefe werden geladen…", error: "Briefe konnten nicht geladen werden", retry: "Erneut versuchen", removeFailed: "Brief konnte nicht gelöscht werden. Bitte erneut versuchen.", confirmRemove: "Diesen Brief samt Analyse und Erinnerung löschen?" },
};
const folderCopy = {
  UK: { inbox: "Отримані", sent: "Відправлені листи", empty: "Тут збиратимуться ваші відповіді. Після кнопки «Позначити як відправлений» лист з’явиться тут — і вся переписка з установою буде перед очима.", re: "Відповідь на", sentOn: "Відправлено", to: "Кому", answerTo: "На лист від", open: "Відкрити відповідь", replied: "Відповідь відправлено" },
  RU: { inbox: "Полученные", sent: "Отправленные письма", empty: "Здесь будут собираться ваши ответы. После кнопки «Отметить как отправленное» письмо появится здесь — и вся переписка с учреждением будет перед глазами.", re: "Ответ на", sentOn: "Отправлено", to: "Кому", answerTo: "На письмо от", open: "Открыть ответ", replied: "Ответ отправлен" },
  DE: { inbox: "Erhalten", sent: "Gesendete Briefe", empty: "Hier sammeln sich Ihre Antworten. Nach „Als gesendet markieren“ erscheint der Brief hier — so haben Sie den ganzen Schriftverkehr im Blick.", re: "Antwort auf", sentOn: "Gesendet", to: "An", answerTo: "Auf Brief vom", open: "Antwort öffnen", replied: "Antwort gesendet" },
};
const tones: Record<DeadlineTone, string> = { urgent: "text-destructive", soon: "text-warning", later: "text-success", none: "text-muted-foreground" };
const dots: Record<DeadlineTone, string> = { urgent: "bg-destructive", soon: "bg-warning", later: "bg-success", none: "bg-muted-foreground" };

export const Route = createFileRoute("/_shell/letters")({
  head: () => ({ meta: [
    { title: "Мої листи — Ukrainian Germany AI" }, { name: "description", content: "Ваші розібрані листи та підготовлені відповіді." },
    { property: "og:title", content: "Мої листи — Ukrainian Germany AI" }, { property: "og:description", content: "Поверніться до своїх листів і відповідей." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
  ] }), component: Letters,
});

type Row = { id: string; file_name: string; sender: string | null; letter_date: string | null; deadline: string | null; subject: string | null; analysis: unknown };

function Letters() {
  const { lang, copy: c, session, authReady, setLetter, setAnalysis, analysis } = useLetter();
  const t = listCopy[lang];
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [organisation, setOrganisation] = useState("all");
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [error, setError] = useState(false);
  const [removeError, setRemoveError] = useState(false);
  const [reload, setReload] = useState(0);
  const [today, setToday] = useState(() => berlinToday());
  useEffect(() => { const timer = window.setInterval(() => setToday(berlinToday()), 60_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    let cancelled = false;
    if (!session) { setRows([]); return; }
    setRows(null); setError(false);
    void supabase.from("letters").select("id,file_name,sender,letter_date,deadline,subject,analysis").order("created_at", { ascending: false }).then(({ data, error: failure }) => { if (!cancelled) { setError(Boolean(failure)); setRows((data as Row[]) ?? []); } });
    return () => { cancelled = true; };
  }, [session, reload]);
  async function remove(id: string) {
    if (!window.confirm(t.confirmRemove)) return;
    setRemoveError(false);
    const { error: failure } = await supabase.from("letters").delete().eq("id", id);
    if (failure) { setRemoveError(true); return; }
    setRows(r => r?.filter(x => x.id !== id) ?? null);
    if (analysis?.id === id) setLetter(null);
  }
  function load(r: Row) { setLetter({ name: r.subject || r.file_name, text: "" }); setAnalysis({ ...(r.analysis as LetterAnalysis), id: r.id }); }
  function open(r: Row) { load(r); void navigate({ to: "/result", search: { id: r.id } }); }
  function openReply(r: Row) { load(r); void navigate({ to: "/reply", search: { id: r.id } }); }
  const sentOf = (r: Row) => (r.analysis as LetterAnalysis | null)?.sentAt ?? null;
  const sentRows = (rows ?? []).filter(r => sentOf(r)).sort((a, b) => (sentOf(b) ?? "").localeCompare(sentOf(a) ?? ""));
  const groups = groupLetters(rows ?? [], today);
  const selected = groups.some(g => g.key === organisation) ? organisation : "all";
  const f = folderCopy[lang];

  return <div className="mx-auto max-w-[720px]"><header className="letter-card mb-4 p-6"><h1 className="text-2xl font-semibold">{c.letters}</h1></header>
    {removeError && <p role="alert" className="letter-card mb-4 p-4 text-sm text-destructive">{t.removeFailed}</p>}
    {authReady && !session ? <section className="letter-card p-8 text-center"><LogIn className="mx-auto mb-5 h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{c.loginNeeded}</p><Button asChild className="letter-pill mt-6 h-12"><Link to="/auth">{c.signin}</Link></Button></section>
    : !authReady || rows === null ? <p role="status" className="letter-card p-6 text-sm">{t.loading}</p>
    : error ? <section className="letter-card p-6"><p role="alert">{t.error}</p><Button className="letter-pill mt-4 h-12" onClick={() => setReload(n => n + 1)}>{t.retry}</Button></section>
    : rows.length > 0 ? <>
      <div role="tablist" className="mb-4 grid grid-cols-2 gap-2">{([["inbox", f.inbox, Inbox, rows.length], ["sent", f.sent, Send, sentRows.length]] as const).map(([key, label, Ic, n]) => <Button key={key} role="tab" aria-selected={folder === key} variant={folder === key ? "default" : "outline"} className={`letter-pill h-auto min-h-12 whitespace-normal py-2 text-sm ${folder === key ? "" : "bg-transparent"}`} onClick={() => setFolder(key)}><Ic className="shrink-0" /><span className="min-w-0 break-words text-center leading-tight">{label} ({n})</span></Button>)}</div>
      {folder === "sent" ? (sentRows.length === 0 ? <section className="letter-card p-6 text-center"><Send className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="text-sm leading-relaxed">{f.empty}</p></section>
        : <div className="grid gap-3">{sentRows.map(r => { const a = r.analysis as LetterAnalysis; return <article key={r.id} className="letter-card p-5">
          <p className="rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold">{describeAuthority(r.sender, lang) || t.unknown}</p>
          <h3 className="mt-3 break-words font-semibold">{f.re}: {r.subject || r.file_name}</h3>
          <dl className="mt-3 grid gap-1 text-sm"><div className="flex flex-wrap gap-1"><dt className="text-muted-foreground">{f.sentOn}:</dt><dd className="font-semibold">{new Date(sentOf(r)!).toLocaleDateString("de-DE")}</dd></div>{a.sentTo && <div className="flex flex-wrap gap-1"><dt className="text-muted-foreground">{f.to}:</dt><dd className="break-all">{a.sentTo}</dd></div>}{r.letter_date && <div className="flex flex-wrap gap-1"><dt className="text-muted-foreground">{f.answerTo}:</dt><dd>{r.letter_date}</dd></div>}</dl>
          <Button className="letter-pill mt-4 h-12 w-full" onClick={() => openReply(r)}>{f.open}<ArrowRight /></Button>
        </article>; })}</div>)
      : <>
      <div className="mb-6 space-y-4">
        <label className="block text-sm font-semibold">{t.organisation}<select value={selected} onChange={e => setOrganisation(e.target.value)} className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-border bg-primary px-3 text-sm text-primary-foreground"><option value="all">{t.all} ({rows.length})</option>{groups.map(g => <option key={g.key} value={g.key}>{describeAuthority(g.name, lang) || t.unknown} ({g.rows.length})</option>)}</select></label>
        <div className="rounded-xl border border-border bg-secondary p-4"><p className="text-xs font-semibold text-muted-foreground">{t.legendTitle}</p><div className="mt-2 grid gap-2 text-xs text-foreground">{[{ tone: "urgent", label: t.red }, { tone: "soon", label: t.yellow }, { tone: "later", label: t.green }].map(item => <span key={item.tone} className="flex items-center gap-2"><span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${dots[item.tone as DeadlineTone]}`} />{item.label}</span>)}</div></div>
      </div>
      <div className="space-y-7">{groups.filter(g => selected === "all" || g.key === selected).map(g => <section key={g.key} aria-label={describeAuthority(g.name, lang) || t.unknown}>
        <h2 className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-4 text-base font-semibold"><Building2 className="h-5 w-5 shrink-0" /><span className="min-w-0 flex-1 break-words leading-snug">{describeAuthority(g.name, lang) || t.unknown}</span><span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-full border border-border bg-primary px-2 text-xs">{g.rows.length}</span></h2>
        <div className="grid gap-3">{g.rows.map(r => {
          const status = deadlineStatus(r.deadline, today);
          const label = status.days !== null && status.days < 0 ? t.overdue : status.days === 0 ? t.today : t[status.tone];
          const Icon = status.tone === "urgent" ? TriangleAlert : CalendarClock;
          return <article key={r.id} className="letter-card p-5"><div className="flex items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{r.subject || r.file_name}</h3>{r.letter_date && <p className="mt-2 text-xs text-muted-foreground">{t.date}: {r.letter_date}</p>}{sentOf(r) && <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold"><Send className="h-3 w-3" />{f.replied}</p>}</div></div>
            <div className="mt-4 flex items-start gap-3 border-t border-border pt-4"><span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dots[status.tone]}`} /><div className="min-w-0 flex-1"><span className={`text-xs font-semibold ${tones[status.tone]}`}>{label}</span>{status.days !== null && <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground"><Icon className="h-4 w-4 shrink-0 text-muted-foreground" /><span>{c.deadline}: <strong>{r.deadline}</strong></span></p>}</div></div>
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2"><Button className="letter-pill h-12" onClick={() => open(r)}>{c.open}<ArrowRight /></Button><Button variant="outline" size="icon" aria-label={c.remove} className="h-12 w-12 rounded-full bg-transparent" onClick={() => void remove(r.id)}><Trash2 /></Button></div>
          </article>;
        })}</div>
      </section>)}</div>
    </>}
    </>
    : <section className="letter-card p-8 text-center"><FileText className="mx-auto mb-5 h-10 w-10 text-muted-foreground" /><h2 className="text-lg font-semibold">{c.empty}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{c.emptyText}</p><Button asChild className="letter-pill mt-6 h-12"><Link to="/"><Plus />{c.add}</Link></Button></section>}
  </div>;
}
