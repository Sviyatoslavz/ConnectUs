import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download, Mail, Check, Languages, Copy, Share2, AlertTriangle, Pencil, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeAuthority } from "@/lib/authority";
import { useLetter } from "@/components/app/LetterContext";
import { letterExample } from "@/lib/demo-data";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { findSenderEmail, buildMailto, composeLetter, exportFileName, extractBody, hasPlaceholders, isValidEmail, letterToText } from "@/lib/letter-compose";
import { persistAnalysis, saveErrorText } from "@/lib/letter-persist";
import { translateReply } from "@/lib/letters.functions";
import { useRouteLetter } from "@/components/app/useRouteLetter";

const T = {
  UK: { yours: "Ваш текст", yoursAny: "Ваш текст", hint: "Пропозиція ШІ — змініть під себе. Пишіть своїми словами: німецьку версію складемо саме з них.", translate: "Перекласти на німецьку", translating: "Перекладаю…", stale: "Німецька версія застаріла", fix: "Виправити дані", check: "Перевірка: що написано німецькою", notes: "Що варто уточнити", noCheck: "Натисніть «Перекласти на німецьку», щоб побачити зворотний переклад.", signIn: "Увійдіть, щоб перекладати власний текст.", ph: "У тексті лишилися незаповнені місця […]. Заповніть їх або завантажте все одно.", anyway: "Завантажити все одно", fill: "Заповнити", sign: "Роздрукуйте й підпишіть від руки — для листа в установу потрібен підпис.", send: "Надіслати email", to: "Кому", toBad: "Перевірте адресу e-mail", open: "Відкрити пошту", copy: "Скопіювати адресу", copied: "Адресу скопійовано", share: "Поділитися PDF", attach: "У пошті відкриється текст листа. За потреби завантажте PDF і додайте його як вкладення. Після надсилання позначте лист як відправлений.", portal: "Деякі установи приймають документи тільки поштою або через онлайн-портал — перевірте спосіб подання в листі.", eLimit: "Сьогодні вичерпано 40 перекладів. Спробуйте завтра.", eLong: "Текст задовгий — до 4000 символів.", eEmpty: "Напишіть текст для перекладу.", eGen: "Не вдалося перекласти. Спробуйте ще раз.", eDl: "Не вдалося завантажити. Спробуйте ще раз.", body: "Текст листа (можна редагувати)", saving: "Зберігаємо…" },
  RU: { yours: "Ваш текст", yoursAny: "Ваш текст", hint: "Предложение ИИ — измените под себя. Пишите своими словами: немецкую версию соберём именно из них.", translate: "Перевести на немецкий", translating: "Перевожу…", stale: "Немецкая версия устарела", fix: "Исправить данные", check: "Проверка: что написано по-немецки", notes: "Что стоит уточнить", noCheck: "Нажмите «Перевести на немецкий», чтобы увидеть обратный перевод.", signIn: "Войдите, чтобы переводить свой текст.", ph: "В тексте остались незаполненные места […]. Заполните их или скачайте всё равно.", anyway: "Скачать всё равно", fill: "Заполнить", sign: "Распечатайте и подпишите от руки — для письма в учреждение нужна подпись.", send: "Отправить email", to: "Кому", toBad: "Проверьте адрес e-mail", open: "Открыть почту", copy: "Скопировать адрес", copied: "Адрес скопирован", share: "Поделиться PDF", attach: "В почте откроется текст письма. При необходимости скачайте PDF и приложите его. После отправки отметьте письмо как отправленное.", portal: "Некоторые учреждения принимают документы только почтой или через онлайн-портал — проверьте способ подачи в письме.", eLimit: "Сегодня исчерпано 40 переводов. Попробуйте завтра.", eLong: "Текст слишком длинный — до 4000 символов.", eEmpty: "Напишите текст для перевода.", eGen: "Не удалось перевести. Попробуйте ещё раз.", eDl: "Не удалось скачать. Попробуйте ещё раз.", body: "Текст письма (можно редактировать)", saving: "Сохраняем…" },
  DE: { yours: "Ihr Text", yoursAny: "Ihr Text (beliebige Sprache)", hint: "KI-Vorschlag — passen Sie ihn an. Schreiben Sie in eigenen Worten: Die deutsche Fassung entsteht genau daraus.", translate: "Ins Deutsche übersetzen", translating: "Übersetze…", stale: "Deutsche Fassung ist veraltet", fix: "Daten korrigieren", check: "Prüfung: Was auf Deutsch steht", notes: "Was noch zu klären ist", noCheck: "Tippen Sie auf „Ins Deutsche übersetzen“, um die Rückübersetzung zu sehen.", signIn: "Melden Sie sich an, um eigenen Text zu übersetzen.", ph: "Im Text sind noch offene Stellen […]. Füllen Sie sie aus oder laden Sie trotzdem herunter.", anyway: "Trotzdem herunterladen", fill: "Ausfüllen", sign: "Ausdrucken und handschriftlich unterschreiben — Behördenbriefe brauchen eine Unterschrift.", send: "E-Mail senden", to: "An", toBad: "E-Mail-Adresse prüfen", open: "E-Mail öffnen", copy: "Adresse kopieren", copied: "Adresse kopiert", share: "PDF teilen", attach: "Ihr E-Mail-Programm öffnet sich mit dem Brieftext. Bei Bedarf laden Sie das PDF herunter und hängen es an. Markieren Sie den Brief nach dem Versand als gesendet.", portal: "Manche Behörden nehmen Unterlagen nur per Post oder Online-Portal an — prüfen Sie den Einreichungsweg im Brief.", eLimit: "Heute sind 40 Übersetzungen aufgebraucht. Bitte morgen erneut.", eLong: "Text zu lang — maximal 4000 Zeichen.", eEmpty: "Bitte Text eingeben.", eGen: "Übersetzung fehlgeschlagen. Bitte erneut versuchen.", eDl: "Download fehlgeschlagen. Bitte erneut versuchen.", body: "Brieftext (bearbeitbar)", saving: "Wird gespeichert…" },
};

type Pending = "pdf" | "docx" | "share" | null;

export function LetterReply({ id, demo: demoFlag }: { id?: string | undefined; demo?: boolean | undefined }) {
  const { copy: c, analysis } = useLetter();
  const state = useRouteLetter(id, demoFlag);
  if (state === "loading") return <p role="status" className="letter-card flex items-center gap-2 p-6 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{c.loadingLetter}</p>;
  if (state === "login") return <section className="letter-card p-8 text-center"><LogIn className="mx-auto mb-5 h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{c.loginNeeded}</p><Button asChild className="letter-pill mt-6 h-12"><Link to="/auth">{c.signin}</Link></Button></section>;
  if (state === "missing") return <section className="letter-card p-8 text-center"><p className="text-sm">{c.letterNotFound}</p><Button asChild className="letter-pill mt-6 h-12"><Link to="/letters">{c.letters}</Link></Button></section>;
  return <ReplyEditor key={state === "demo" ? "demo" : analysis?.id ?? "new"} demo={state === "demo"} />;
}

function ReplyEditor({ demo: isDemo }: { demo: boolean }) {
  const { lang, copy: c, analysis: stored, setAnalysis, session } = useLetter();
  const analysis = isDemo ? null : stored;
  const t = T[lang];
  const demo = useMemo<LetterAnalysis>(() => ({ sender: null, senderPerson: null, senderAddress: null, letterDate: null, deadline: null, reference: null, recipientName: null, recipientAddress: null, subject: null, what: "", translation: "", actions: [], caution: "", replyDe: letterExample.DE.reply, replyTranslation: letterExample[lang].reply }), [lang]);
  const a = analysis ?? demo;
  const initialUser = a.userReplyText ?? a.replyTranslation;
  const [tab, setTab] = useState<"src" | "de">("src");
  const [userText, setUserText] = useState(initialUser);
  const [translatedFrom, setTranslatedFrom] = useState(initialUser);
  const [body, setBody] = useState(a.replyBodyDe ?? extractBody(a.replyDe));
  const [back, setBack] = useState(a.backTranslation ?? "");
  const [notes, setNotes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false); const [status, setStatus] = useState(""); const [error, setError] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [mailOpen, setMailOpen] = useState(false); const [to, setTo] = useState(a.senderEmail || findSenderEmail([a.translation, a.senderAddress, a.replyDe].join("\n"), [a.userEmail, session?.user.email]) || ""); const [toErr, setToErr] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const translate = useServerFn(translateReply);

  const composed = useMemo(() => composeLetter({ ...a, replyBodyDe: body }), [a, body]);
  const fullText = letterToText(composed);
  const stale = userText.trim() !== translatedFrom.trim();

  useEffect(() => {
    try { setCanShare(!!navigator.canShare?.({ files: [new File([""], "a.pdf", { type: "application/pdf" })] })); } catch { setCanShare(false); }
  }, []);

  // Saves the analysis and reports failures instead of losing edits silently.
  const persist = async (next: LetterAnalysis) => {
    setAnalysis(next);
    try { await persistAnalysis(next); setSaveError(false); return true; }
    catch { setSaveError(true); return false; }
  };

  // Debounced autosave + flush on leaving the page.
  const aRef = useRef(analysis); aRef.current = analysis;
  const latest = useRef({ userText, body, back }); latest.current = { userText, body, back };
  const save = () => {
    const cur = aRef.current; if (!cur) return;
    const { userText: u, body: b, back: bk } = latest.current;
    if (cur.userReplyText === u && cur.replyBodyDe === b && (cur.backTranslation ?? "") === bk) return;
    const next = { ...cur, userReplyText: u, replyBodyDe: b, backTranslation: bk };
    aRef.current = next; void persist(next);
  };
  useEffect(() => { if (!analysis) return; const id = setTimeout(save, 1200); return () => clearTimeout(id); }, [userText, body, back]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => save(), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function runTranslate() {
    setBusy(true); setError("");
    try {
      const r = await translate({ data: { text: userText, sourceLang: lang, subject: a.subject, reference: a.reference, letterDate: a.letterDate, sender: a.sender } });
      setBody(r.germanBody); setBack(r.backTranslation); setNotes(r.notes); setTranslatedFrom(userText); setTab("de");
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setError(m.includes("REPLY_LIMIT") ? t.eLimit : m.includes("REPLY_TOO_LONG") ? t.eLong : m.includes("REPLY_EMPTY") ? t.eEmpty : t.eGen);
    } finally { setBusy(false); }
  }

  async function run(kind: Exclude<Pending, null>) {
    setPending(null); setBusy(true); setStatus("");
    try {
      const { buildLetterBlob, saveBlob } = await import("@/lib/letter-export");
      const fmt = kind === "docx" ? "docx" : "pdf";
      const blob = await buildLetterBlob(fmt, composed);
      const name = exportFileName(a, fmt);
      if (kind === "share") {
        await navigator.share({ files: [new File([blob], name, { type: "application/pdf" })], title: composed.subject[0] ?? "Antwort" });
      } else { saveBlob(blob, name); setStatus(`${name} ✓`); }
    } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setStatus(t.eDl); }
    finally { setBusy(false); }
  }
  const request = (kind: Exclude<Pending, null>) => hasPlaceholders(fullText) ? setPending(kind) : void run(kind);

  /** Opens the mail client only; the letter is marked as sent solely by the explicit button below. */
  function openMail() {
    if (!isValidEmail(to)) { setToErr(true); return; }
    setToErr(false);
    if (analysis && analysis.senderEmail !== to.trim()) void persist({ ...analysis, senderEmail: to.trim() });
    window.location.href = buildMailto(to, composed);
  }
  function toggleSent() {
    if (!analysis) return;
    const next = { ...analysis, sentAt: analysis.sentAt ? null : new Date().toISOString(), sentTo: analysis.sentAt ? null : (to.trim() || analysis.sentTo || null) };
    void persist(next);
  }
  const sentLabel = { UK: ["Позначити як відправлений", "Відправлено", "Скасувати позначку"], RU: ["Отметить как отправленное", "Отправлено", "Снять отметку"], DE: ["Als gesendet markieren", "Gesendet", "Markierung entfernen"] }[lang];

  const area = "w-full resize-y rounded-xl bg-transparent text-sm leading-7 outline-none";
  const resultSearch = analysis?.id ? { id: analysis.id } : { demo: true };
  return <div>
    <header className="letter-card mb-4 p-5 sm:p-7"><Button asChild variant="ghost" className="mb-3 h-12 rounded-full px-0"><Link to="/result" search={resultSearch}><ArrowLeft />{c.back}</Link></Button><h1 className="text-2xl font-semibold sm:text-3xl">{c.draft}</h1>{analysis?.sender && <p className="mt-3 break-words text-sm font-semibold">{c.fSender}: {describeAuthority(analysis.sender, lang)}</p>}<p className="mt-3 text-sm text-muted-foreground">{c.edit}</p><p className={`mt-2 text-xs ${analysis ? "text-muted-foreground" : "font-semibold"}`}>{analysis ? c.aiNote : c.demo}</p></header>
    {saveError && <p role="alert" className="letter-card mb-4 p-4 text-sm text-destructive">{saveErrorText[lang]}</p>}
    <div role="tablist" className="letter-card mb-4 grid grid-cols-2 p-1 lg:hidden"><Button role="tab" aria-selected={tab === "src"} variant={tab === "src" ? "default" : "ghost"} className="h-12 rounded-full" onClick={() => setTab("src")}>{t.yours}</Button><Button role="tab" aria-selected={tab === "de"} variant={tab === "de" ? "default" : "ghost"} className="h-12 rounded-full" onClick={() => setTab("de")}>Deutsch</Button></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={`letter-card p-5 sm:p-7 ${tab === "src" ? "block" : "hidden lg:block"}`}>
        <h2 className="text-sm font-semibold">{lang === "DE" ? t.yoursAny : t.yours}</h2>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">{t.hint}</p>
        <textarea aria-label={t.yours} value={userText} maxLength={4000} onChange={e => setUserText(e.target.value)} className={`${area} min-h-[360px]`} />
        <div className="mt-4 grid gap-2">
          {stale && <p role="status" className="flex items-center gap-2 text-xs font-semibold"><AlertTriangle className="h-4 w-4" />{t.stale}</p>}
          <Button disabled={busy || !session || !analysis} className="letter-pill h-12" onClick={() => void runTranslate()}><Languages />{busy ? t.translating : t.translate}</Button>
          {(!session || !analysis) && <p className="text-xs text-muted-foreground">{t.signIn}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
      </section>
      <section className={`letter-card p-5 sm:p-7 ${tab === "de" ? "block" : "hidden lg:block"}`}>
        <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Deutsch</h2>{analysis?.id && <Link to="/result" search={{ id: analysis.id }} className="flex items-center gap-1 text-xs font-semibold underline"><Pencil className="h-3 w-3" />{t.fix}</Link>}</div>
        <div className="grid gap-4 text-sm leading-6">
          {composed.senderBlock.length > 0 && <div className="text-xs text-muted-foreground">{composed.senderBlock.map(l => <div key={l}>{l}</div>)}</div>}
          {composed.recipientBlock.length > 0 && <div>{composed.recipientBlock.map(l => <div key={l}>{l}</div>)}</div>}
          <div className="text-right">{composed.placeDate}</div>
          <div className="font-bold">{composed.subject.map(l => <div key={l}>{l}</div>)}</div>
          <div>{composed.salutation}</div>
          <label className="grid gap-1"><span className="text-xs text-muted-foreground">{t.body}</span>
            <textarea aria-label={t.body} value={body} onChange={e => setBody(e.target.value)} className={`${area} min-h-[220px] border p-3`} /></label>
          <div>{composed.closing}<div className="h-10" />{composed.signatureName}</div>
          {composed.enclosures.length > 0 && <div>Anlagen:{composed.enclosures.map(e => <div key={e}>- {e}</div>)}</div>}
        </div>
        <details className="mt-5 rounded-xl border p-3 text-sm"><summary className="cursor-pointer font-semibold">{t.check}</summary>
          <p className="mt-3 whitespace-pre-wrap leading-6">{back || t.noCheck}</p>
          {notes.length > 0 && <><h3 className="mt-3 font-semibold">{t.notes}</h3><ul className="mt-1 list-disc pl-5">{notes.map(n => <li key={n}>{n}</li>)}</ul></>}
        </details>
      </section>
    </div>
    <footer className="letter-card mt-4 p-5">
      {pending && <div role="alertdialog" className="mb-4 rounded-xl border p-4 text-sm"><p className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0" />{t.ph}</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><Button className="letter-pill h-11" onClick={() => { setPending(null); setTab("de"); }}>{t.fill}</Button><Button variant="outline" className="letter-pill h-11 bg-transparent" onClick={() => void run(pending)}>{t.anyway}</Button></div></div>}
      <div className="grid gap-3 sm:grid-cols-3"><Button disabled={busy} className="letter-pill h-12" onClick={() => request("pdf")}><Download />{c.pdf}</Button><Button disabled={busy} variant="outline" className="letter-pill h-12 bg-transparent" onClick={() => request("docx")}><Download />{c.docx}</Button><Button variant="outline" className="letter-pill h-12 bg-transparent" onClick={() => setMailOpen(v => !v)}><Mail />{t.send}</Button></div>
      <p className="mt-3 text-xs text-muted-foreground">{t.sign}</p>
      {analysis?.id && <div className="mt-3 grid gap-2">{analysis.sentAt && <p className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-3 text-sm font-semibold"><Check className="h-4 w-4" />{sentLabel[1]}: {new Date(analysis.sentAt).toLocaleDateString("de-DE")}{analysis.sentTo ? ` · ${analysis.sentTo}` : ""}</p>}<Button variant="outline" className="letter-pill h-12 w-full bg-transparent" onClick={toggleSent}><Check />{analysis.sentAt ? sentLabel[2] : sentLabel[0]}</Button></div>}
      {mailOpen && <div className="mt-4 grid gap-2 rounded-xl border p-4">
        <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{t.to}</span><input type="email" value={to} aria-invalid={toErr} onChange={e => { setTo(e.target.value); setToErr(false); }} className="h-12 rounded-xl border bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring" /></label>
        {toErr && <p role="alert" className="text-xs text-destructive">{t.toBad}</p>}
        <div className="grid gap-2 sm:grid-cols-3">
          <Button className="letter-pill h-11" onClick={openMail}><Mail />{t.open}</Button>
          <Button variant="outline" className="letter-pill h-11 bg-transparent" disabled={!to.trim()} onClick={() => void navigator.clipboard?.writeText(to.trim()).then(() => setStatus(t.copied))}><Copy />{t.copy}</Button>
          {canShare && <Button variant="outline" disabled={busy} className="letter-pill h-11 bg-transparent" onClick={() => request("share")}><Share2 />{t.share}</Button>}
        </div>
        <p className="text-xs text-muted-foreground">{t.attach}</p>
        <p className="text-xs text-muted-foreground">{t.portal}</p>
      </div>}
      {status && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Check className="h-4 w-4" />{status}</p>}
    </footer>
  </div>;
}
