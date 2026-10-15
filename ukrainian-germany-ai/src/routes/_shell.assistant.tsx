import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Info, AlertTriangle, Copy, Check, Loader2, ArrowUpRight, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLetter } from "@/components/app/LetterContext";
import { PageHeader } from "@/components/app/AppShell";
import { EditorialPhoto } from "@/components/app/EditorialPhoto";
import { editorialPhotos, editorialCopy, topicPhoto, guidePhoto } from "@/lib/editorial-photos";
import { assistantCopy } from "@/lib/assistant-copy";
import { ASSISTANT_MODULES, ASSISTANT_MAX_CHARS, ASSISTANT_MAX_HISTORY, type AssistantModule, type AssistantAnswer } from "@/lib/assistant-modules";
import { GUIDES } from "@/lib/guides";
import { askAssistant, translateLetter } from "@/lib/assistant.functions";
import { LETTER_TRANSLATE_MAX_CHARS, type TranslateLetterAnswer } from "@/lib/assistant-modules";
import { useNavigate } from "@tanstack/react-router";
import { SiteBlocks, useSiteText } from "@/components/app/SiteContent";
import { ReadingNote } from '@/components/app/ReadingNote';
import { experienceCopy } from '@/lib/experience-copy';

export const Route = createFileRoute("/_shell/assistant")({
  validateSearch: (s: Record<string, unknown>): { m?: AssistantModule | undefined } => ({
    m: ASSISTANT_MODULES.find(k => k === s["m"]),
  }),
  head: () => ({ meta: [
    { title: "Помічник — Ukrainian Germany AI" },
    { name: "description", content: "Житло, сім'я, робота, виплати та статус у Німеччині: пояснення простими словами і наступний крок." },
    { property: "og:title", content: "Помічник — Ukrainian Germany AI" },
    { property: "og:description", content: "Персональний помічник для українців у Німеччині за п'ятьма темами." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AssistantPage,
});

type Turn = { q: string; a: AssistantAnswer };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-4"><h3 className="text-base font-bold">{title}</h3><div className="mt-1 text-sm">{children}</div></div>;
}

function Answer({ a, t }: { a: AssistantAnswer; t: typeof assistantCopy.UK }) {
  const [copied, setCopied] = useState(false);
  return <div className="letter-card p-5">
    {a.needsHuman && <div role="alert" className="mb-4 flex gap-2 rounded-2xl border border-warning bg-warning-soft p-3 text-sm text-warning"><AlertTriangle className="h-5 w-5 shrink-0" />{t.needsHuman}</div>}
    <h3 className="text-base font-bold">{t.short}</h3><p className="mt-1">{a.short}</p>
    {a.meaning && <Block title={t.meaning}><p>{a.meaning}</p></Block>}
    {a.steps.length > 0 && <Block title={t.steps}><ol className="list-decimal space-y-1 pl-5">{a.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></Block>}
    {a.deadline && <Block title={t.deadline}><p>{a.deadline}</p></Block>}
    {a.needed.length > 0 && <Block title={t.needed}><ul className="list-disc space-y-1 pl-5">{a.needed.map((s, i) => <li key={i}>{s}</li>)}</ul></Block>}
    {a.important && <Block title={t.important}><p>{a.important}</p></Block>}
    {a.germanText && <Block title={t.germanText}>
      <pre lang="de" className="whitespace-pre-wrap break-words rounded-2xl border bg-secondary p-3 font-sans text-sm">{a.germanText}</pre>
      <Button variant="outline" className="mt-2 h-12 rounded-full" onClick={() => { void navigator.clipboard.writeText(a.germanText ?? ""); setCopied(true); }}>{copied ? <Check /> : <Copy />}{copied ? t.copied : t.copy}</Button>
    </Block>}
    {a.nextStep && <Block title={t.next}><p className="font-semibold">{a.nextStep}</p></Block>}
    {a.clarifyingQuestion && <Block title={t.question}><p>{a.clarifyingQuestion}</p></Block>}
    {a.source && <Block title={t.source}><a href={a.source} target="_blank" rel="noopener noreferrer" className="underline break-all">{a.source.replace("https://", "")}</a></Block>}
  </div>;
}

function TranslateCard({ t }: { t: typeof assistantCopy.UK }) {
  const { lang, session, setLetter, copy } = useLetter();
  const tr = useServerFn(translateLetter);
  const navigate = useNavigate();
  const [text, setText] = useState(""); const [target, setTarget] = useState<"UK" | "RU" | "DE">(lang === "DE" ? "RU" : lang);
  const [res, setRes] = useState<TranslateLetterAnswer | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const go = async () => {
    setBusy(true); setError("");
    try { setRes(await tr({ data: { text: text.trim(), target, lang } })); }
    catch (e) { setError(e instanceof Error && e.message.includes("ASSIST_LIMIT") ? t.errLimit : t.errFailed); }
    finally { setBusy(false); }
  };
  return <section className="letter-card mt-6 p-5">
    <h2 className="font-bold">{t.tr.card}</h2><p className="text-sm text-muted-foreground">{t.tr.desc}</p>
    <Button asChild variant="outline" className="letter-pill mt-3 min-h-12 w-full whitespace-normal"><Link to="/" search={{ capture: true }}><Camera />{copy.camera}</Link></Button>
    <Button asChild variant="outline" className="letter-pill mt-3 min-h-12 w-full whitespace-normal"><Link to="/" search={{ upload: true }}><Upload />{{ UK: "Завантажити файл (PDF, фото)", RU: "Загрузить файл (PDF, фото)", DE: "Datei hochladen (PDF, Foto)" }[lang]}</Link></Button>
    <Textarea value={text} onChange={e => setText(e.target.value)} maxLength={LETTER_TRANSLATE_MAX_CHARS} placeholder={t.tr.paste} aria-label={t.tr.paste} className="mt-3 min-h-32" />
    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><span className="min-w-0 text-xs sm:text-sm">{t.tr.target}:</span>
      <div role="group" aria-label={t.tr.target} className="grid shrink-0 grid-cols-3 gap-1">{(["UK", "RU", "DE"] as const).map(l => <Button key={l} variant={target === l ? "default" : "outline"} className="h-12 w-12 min-w-0 rounded-full px-0 text-xs" aria-pressed={target === l} onClick={() => setTarget(l)}>{l}</Button>)}</div>
    </div>
    {session ? <Button className="mt-3 h-12 w-full rounded-full" disabled={busy || !text.trim()} onClick={() => void go()}>{busy && <Loader2 className="animate-spin" />}{t.tr.go}</Button>
      : <Button asChild className="mt-3 h-12 w-full rounded-full"><Link to="/auth">{t.signIn}</Link></Button>}
    {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    {res && <div className="mt-4">
      <Block title={t.tr.result}><p className="whitespace-pre-wrap rounded-2xl border bg-secondary p-3">{res.translation}</p></Block>
      {res.terms.length > 0 && <Block title={t.tr.terms}><ul className="space-y-1">{res.terms.map((x, i) => <li key={i}><b lang="de">{x.term}</b> — {x.explanation}</li>)}</ul></Block>}
      {res.notes && <Block title={t.tr.notes}><p>{res.notes}</p></Block>}
      <Button variant="outline" className="mt-4 h-auto min-h-12 w-full whitespace-normal rounded-full" onClick={() => { setLetter({ name: text.trim().slice(0, 40), text: text.trim() }); void navigate({ to: "/" }); }}>{t.tr.analyze}</Button>
    </div>}
  </section>;
}

function AssistantPage() {
  const siteText = useSiteText();
  const { m } = Route.useSearch();
  const { lang, session } = useLetter();
  const t = assistantCopy[lang];
  const e = experienceCopy[lang];
  const ask = useServerFn(askAssistant);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const moduleSection = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!m) return;
    const timer = window.setTimeout(() => moduleSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }), 150);
    return () => window.clearTimeout(timer);
  }, [m]);

  const send = async () => {
    const q = input.trim();
    if (!m || !q || busy) return;
    if (q.length > ASSISTANT_MAX_CHARS) { setError(t.errTooLong); return; }
    setBusy(true); setError("");
    const history = turns.flatMap(x => [{ role: "user" as const, content: x.q.slice(0, ASSISTANT_MAX_CHARS) }, { role: "assistant" as const, content: `${x.a.short} ${x.a.nextStep}`.slice(0, ASSISTANT_MAX_CHARS) }]).slice(-ASSISTANT_MAX_HISTORY);
    try {
      const a = await ask({ data: { module: m, message: q, history, lang } });
      setTurns(p => [...p, { q, a }]); setInput("");
    } catch (e) {
      setError(e instanceof Error && e.message.includes("ASSIST_LIMIT") ? t.errLimit : t.errFailed);
    } finally { setBusy(false); }
  };

  return <div>
    <PageHeader title={t.title} subtitle={e.assistantIntro} />
    <p className="letter-card mb-4 flex items-center gap-2 px-4 py-3 text-sm"><Info className="h-4 w-4 shrink-0" />{t.disclaimer}</p>
    <h2 className="mb-4 text-xl font-bold">{e.choose}</h2>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {ASSISTANT_MODULES.map(k => { const active = m === k; return (
        <Link key={k} to="/assistant" search={{ m: k }} resetScroll={false} onClick={() => { if (!active) { setTurns([]); setError(""); setInput(""); } else moduleSection.current?.scrollIntoView({ block: "start" }); }} aria-current={active ? "true" : undefined}
          className={`letter-card min-w-0 overflow-hidden ${active ? "ring-2 ring-border" : ""}`}>
          <EditorialPhoto src={topicPhoto(k)} alt={t.modules[k].title} lang={lang} compact />
          <span className="flex min-w-0 flex-col gap-2 px-3 py-4"><span className="font-bold">{siteText(`assistant.${k}`, t.modules[k].title)}</span><span className="block text-sm leading-relaxed text-muted-foreground">{siteText(`assistant.${k}`, t.modules[k].desc, 'body')}</span><span className="mt-2 flex items-center gap-1 text-xs font-bold">{e.explore}<ArrowUpRight className="h-4 w-4 shrink-0" /></span></span>
        </Link>); })}
    </div>

    <section className="letter-card mt-5 p-5">
      <h2 className="font-bold">{editorialCopy[lang].daily}</h2><p className="mt-1 text-sm text-muted-foreground">{editorialCopy[lang].dailyText}</p>
      <Button asChild variant="outline" className="mt-3 min-h-12 w-full whitespace-normal rounded-full"><Link to="/learn">{editorialCopy[lang].read}<ArrowUpRight className="h-4 w-4" /></Link></Button>
    </section>
    <SiteBlocks page="assistant" />
    <TranslateCard t={t} />
    {m && <section ref={moduleSection} className="mt-6 scroll-mt-5 space-y-4">
      <h2 className="text-xl font-bold">{t.modules[m].title}</h2>
      <ReadingNote title={e.why}>{e.moduleNotes[m]}</ReadingNote>
      <div className="flex flex-wrap gap-2">{t.modules[m].quick.map(q => <Button key={q} variant="outline" className="letter-pill h-auto min-h-12 max-w-full whitespace-normal text-left" onClick={() => setInput(q)}>{q}</Button>)}</div>
      <div className="space-y-3"><h2 className="font-bold">{editorialCopy[lang].discover}</h2>{GUIDES.filter(g => g.module === m).map(g => <Link key={g.slug} to="/guides/$slug" params={{ slug: g.slug }} className="letter-card block overflow-hidden"><EditorialPhoto src={guidePhoto(g)} alt={g.title[lang]} lang={lang} /><span className="flex items-center justify-between gap-3 px-4 pb-4 text-sm font-semibold">{g.title[lang]}<ArrowUpRight className="h-4 w-4 shrink-0" /></span><p className="px-4 pb-4 text-sm text-muted-foreground">{g.intro[lang]}</p></Link>)}</div>
      <p className="rounded-xl border border-border bg-secondary p-4 text-sm">{t.letterHint} <Link to="/" className="font-semibold underline">{t.letterLink}</Link></p>
      {turns.map((x, i) => <div key={i} className="space-y-2"><p className="letter-card ml-auto w-fit max-w-[90%] px-4 py-3 text-sm"><b>{t.you}:</b> {x.q}</p><Answer a={x.a} t={t} /></div>)}
      {session ? <div className="letter-card p-4">
        <Textarea value={input} onChange={e => setInput(e.target.value)} maxLength={ASSISTANT_MAX_CHARS} placeholder={t.placeholder} className="min-h-28" aria-label={t.placeholder} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{input.length}/{ASSISTANT_MAX_CHARS}</span>
          <div className="flex w-full flex-col gap-2">
            {turns.length > 0 && <Button variant="ghost" className="h-12 rounded-full" onClick={() => { setTurns([]); setError(""); }}>{t.newChat}</Button>}
            <Button className="h-auto min-h-12 w-full whitespace-normal rounded-full" disabled={busy || !input.trim()} onClick={() => void send()}>{busy && <Loader2 className="animate-spin" />}{busy ? t.asking : t.ask}</Button>
          </div>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      </div> : <Button asChild className="h-12 w-full rounded-full"><Link to="/auth">{t.signIn}</Link></Button>}
    </section>}
  </div>;
}
