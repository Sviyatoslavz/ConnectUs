import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarClock, FileText, Languages, ListChecks, Loader2, LogIn, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLetter } from "@/components/app/LetterContext";
import { letterExample } from "@/lib/demo-data";
import { PdfPreview } from "@/components/app/PdfPreview";
import { LetterDetailsEditor } from "@/components/app/LetterDetailsEditor";
import { ReminderOffer } from "@/components/app/ReminderOffer";
import { LetterFeedback } from "@/components/app/LetterFeedback";
import { describeAuthority } from "@/lib/authority";
import { getLetterShortSummary, getLetterInsights } from "@/lib/letter-analysis";
import { useRouteLetter } from "@/components/app/useRouteLetter";

export function LetterPreview({ demo }: { demo: boolean }) {
  const { letter, analysis, copy: c } = useLetter();
  const body = letter?.url
    ? letter.type === "application/pdf" ? <PdfPreview key={letter.url} url={letter.url} name={letter.name} /> : <img src={letter.url} alt={letter.name} className="max-h-[600px] w-full object-contain" />
    : letter?.text ? <div className="letter-preview whitespace-pre-wrap break-words border-t pt-6 text-sm leading-7">{letter.text}</div>
    : demo ? <div className="letter-preview whitespace-pre-wrap break-words border-t pt-6 text-sm leading-7">{letterExample.original}</div>
    : analysis ? <div className="grid gap-3 text-sm leading-relaxed"><p className="flex gap-2 rounded-xl border bg-secondary p-3"><ShieldCheck className="h-4 w-4 shrink-0" />{c.originalNotStored}</p><dl className="grid gap-1">{[[c.fSender, analysis.sender], [c.fDate, analysis.letterDate], [c.fRef, analysis.reference], [c.fSubject, analysis.subject]].filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}</dl></div>
    : null;
  return <section className="letter-card overflow-hidden p-5 sm:p-7"><h2 className="mb-4 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" />{c.original}</h2>
    {body}
    {letter?.url && <p className="mt-4 break-all text-xs text-muted-foreground">{letter.name}</p>}
  </section>;
}

export function LetterResult({ id, demo }: { id?: string | undefined; demo?: boolean | undefined }) {
  const { lang, copy: c, analysis } = useLetter();
  const state = useRouteLetter(id, demo);
  if (state === "loading") return <p role="status" className="letter-card flex items-center gap-2 p-6 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{c.loadingLetter}</p>;
  if (state === "login") return <section className="letter-card p-8 text-center"><LogIn className="mx-auto mb-5 h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">{c.loginNeeded}</p><Button asChild className="letter-pill mt-6 h-12"><Link to="/auth">{c.signin}</Link></Button></section>;
  if (state === "missing") return <section className="letter-card p-8 text-center"><p className="text-sm">{c.letterNotFound}</p><Button asChild className="letter-pill mt-6 h-12"><Link to="/letters">{c.letters}</Link></Button></section>;
  const isDemo = state === "demo";
  const a = isDemo ? null : analysis;
  const example = a ? { what: a.what, translation: a.translation, actions: a.actions, caution: a.caution } : letterExample[lang];
  const deadline = a ? a.deadline : letterExample.deadline;
  const short = getLetterShortSummary(a);
  const ins = getLetterInsights(a);
  const riskCls = ins.riskLevel === "CRITICAL" || ins.riskLevel === "HIGH" ? "bg-danger-soft text-destructive" : ins.riskLevel === "MEDIUM" ? "bg-warning-soft text-foreground" : "bg-success-soft text-foreground";
  return <div>
    <div className="letter-card mb-4 p-5 sm:p-7"><Button asChild variant="ghost" className="mb-3 h-12 rounded-full px-0"><Link to={a ? "/letters" : "/"}><ArrowLeft />{c.back}</Link></Button><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><h1 className="text-2xl font-semibold sm:text-3xl">{c.result}</h1>{deadline && <span className="rounded-full bg-danger-soft px-3 py-2 text-xs font-semibold text-destructive">{deadline}</span>}</div>{a && (ins.hasType || ins.riskLevel) && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">{ins.hasType && <span className="rounded-full border bg-secondary px-3 py-1.5">{c.docType}: {c.types[ins.documentType]}</span>}{ins.riskLevel && <span className={`rounded-full px-3 py-1.5 ${riskCls}`}>{c.risk}: {c.riskL[ins.riskLevel]}</span>}</div>}
      {ins.riskReason && <p className="mt-2 text-xs leading-relaxed">{ins.riskReason}</p>}
      <p className={`mt-3 text-xs leading-relaxed ${a ? "text-muted-foreground" : "font-semibold"}`}>{a ? c.aiNote : c.demo}</p></div>
    {a && ins.needsHuman && <div role="note" className="mb-4 rounded-3xl border border-warning bg-warning-soft p-4 text-sm leading-relaxed text-foreground">{c.needsHuman}</div>}
    {short && <section className="letter-card mb-4 p-5 sm:p-6"><h2 className="mb-3 text-sm font-semibold">{c.short}</h2><dl className="grid gap-3 text-sm leading-relaxed"><div><dt className="font-semibold">{c.todoShort}</dt><dd>{short.todoShort || "—"}</dd></div><div><dt className="font-semibold">{c.whyShort}</dt><dd>{short.whyShort || "—"}</dd></div></dl></section>}
    <div className="grid items-start gap-4 lg:grid-cols-2"><div className="lg:sticky lg:top-5"><LetterPreview demo={isDemo} /></div><div className="grid gap-4">
      {a && <LetterDetailsEditor />}
      {a?.deadline && <ReminderOffer key={a.id ?? a.deadline} letterId={a.id ?? null} deadline={a.deadline} title={[describeAuthority(a.sender, lang), a.subject].filter(Boolean).join(" — ") || c.deadline} />}
      {[...(deadline ? [{ title: c.deadline, icon: CalendarClock, text: deadline, danger: true }] : []), { title: c.what, icon: FileText, text: example.what, danger: false }, { title: c.translation, icon: Languages, text: example.translation }].map(b => <section key={b.title} className="letter-card p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><b.icon className="h-4 w-4" />{b.title}</h2><p className={`mt-3 whitespace-pre-wrap text-sm leading-relaxed ${b.danger ? "font-semibold text-destructive" : "text-muted-foreground"}`}>{b.text}</p>{b.danger && ins.deadlineQuote && <p className="mt-1 break-words text-xs text-muted-foreground">{c.inLetter}: «{ins.deadlineQuote}»</p>}{b.danger && ins.deadlineUnconfirmed && <p className="mt-2 text-xs font-semibold text-foreground">{c.unconfirmed}</p>}</section>)}
      {ins.remedyInfo && <section className="letter-card p-5 sm:p-6"><h2 className="text-sm font-semibold">{c.remedy}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{ins.remedyInfo}</p></section>}
      <section className="letter-card p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><ListChecks className="h-4 w-4" />{c.actions}</h2><ol className="mt-4 space-y-4">{example.actions.map((step, i) => <li key={`${i}-${step}`} className="flex gap-3 text-sm leading-relaxed"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">{i + 1}</span><span>{step}</span></li>)}</ol><Button asChild className="letter-pill mt-5 h-12 w-full"><Link to="/reply" search={a?.id ? { id: a.id } : { demo: true }}>{c.reply}<ArrowRight /></Link></Button></section>
      <section className="letter-card p-5 sm:p-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><TriangleAlert className="h-4 w-4 text-destructive" />{c.caution}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{example.caution}</p></section>
      {a?.id && <LetterFeedback letterId={a.id} />}
    </div></div>
  </div>;
}
