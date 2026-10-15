import { photosToPdf, MAX_PHOTOS } from "@/lib/photos-to-pdf";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Camera, Upload, ArrowUp, ShieldCheck, FileText, X, ArrowRight, Loader2, Check, ChevronDown } from "lucide-react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { recordConsent, useLetter } from "@/components/app/LetterContext";
import { letterExtras } from "@/lib/letter-copy";
import { letterFaq } from "@/lib/letter-faq";
import { useServerFn } from "@tanstack/react-start";
import { analyzeLetter, getUsage } from "@/lib/letters.functions";
import { limitCodeOf, usageSummary } from "@/lib/billing";
import { aiErrorCodeOf, aiErrorText } from "@/lib/ai-errors";
import { blobUrlToBase64 } from "@/lib/letter-analysis";
import { SiteBlocks, useSiteText } from "./SiteContent";

export function LetterHome() {
  const siteText = useSiteText();
  const { copy: c, consent, setConsent, letter, setLetter, setAnalysis, session, lang } = useLetter();
  const c2 = letterExtras[lang];
  const analyze = useServerFn(analyzeLetter);
  const navigate = useNavigate();
  const fetchUsage = useServerFn(getUsage);
  const [usage, setUsage] = useState<{ used: number; subscription: string } | null>(null);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const uid = session?.user.id;
  const refreshUsage = () => { void fetchUsage().then(setUsage).catch(() => setUsage(null)); };
  useEffect(() => { if (uid) refreshUsage(); else setUsage(null); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps
  const summary = usage ? usageSummary(usage.used, usage.subscription) : null;
  const camera = useRef<HTMLInputElement>(null); const files = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<"camera" | "file" | "submit" | File | null>(null);
  const [agreed, setAgreed] = useState(false); const [drag, setDrag] = useState(false); const topic = "";
  const [photos, setPhotos] = useState<File[]>([]);
  const { capture, upload } = useSearch({ from: "/" });
  const captureRequested = useRef(false);
  useEffect(() => {
    if ((!capture && !upload) || captureRequested.current) return;
    captureRequested.current = true;
    act(upload ? "file" : "camera");
    void navigate({ to: "/", search: {}, replace: true });
  }, [capture, upload]); // eslint-disable-line react-hooks/exhaustive-deps
  const addLabel = { UK: "Додати ще сторінку", RU: "Добавить ещё страницу", DE: "Weitere Seite hinzufügen" }[lang];
  const photosLabel = (n: number) => ({ UK: `Фото листа (${n} стор.)`, RU: `Фото письма (${n} стр.)`, DE: `Fotos des Briefs (${n} S.)` }[lang]);
  useEffect(() => { if (!letter) setPhotos([]); }, [letter]);
  async function selectMany(list: File[]) {
    if (!list.length) return;
    const imgs = list.filter(f => f.type.startsWith("image/"));
    if (imgs.length !== list.length || (list.length === 1 && !photos.length && list[0]!.type === "application/pdf")) { setPhotos([]); return select(list[0]!); }
    setError(""); setBusy(true);
    try {
      if (imgs.some(f => f.size > 20 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(f.type))) throw new Error(c.invalid);
      const next = [...photos, ...imgs];
      if (next.length > MAX_PHOTOS) throw new Error(c.pages);
      const pdf = await photosToPdf(next);
      if (pdf.size > 20 * 1024 * 1024) throw new Error(c.invalid);
      setPhotos(next);
      setLetter({ name: photosLabel(next.length), text: "", type: "application/pdf", url: URL.createObjectURL(pdf) });
    } catch (e) { setError(e instanceof Error && [c.invalid, c.pages].includes(e.message) ? e.message : c.broken); }
    finally { setBusy(false); }
  }
  async function select(file: File) {
    setError(""); setBusy(true);
    try {
      if (file.size > 20 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) throw new Error(c.invalid);
      if (file.type === "application/pdf") { const { PDFDocument } = await import("pdf-lib"); const doc = await PDFDocument.load(await file.arrayBuffer()); if (doc.getPageCount() > 5) throw new Error(c.pages); }
      else { const bitmap = await createImageBitmap(file); bitmap.close(); }
      setLetter({ name: file.name, text: "", type: file.type, url: URL.createObjectURL(file) });
    } catch (e) { setError(e instanceof Error && [c.invalid, c.pages].includes(e.message) ? e.message : c.broken); }
    finally { setBusy(false); }
  }
  function act(action: "camera" | "file" | "submit" | File, allowed = consent) {
    if (!allowed) { setPending(action); return; }
    if (action instanceof File) { void select(action); return; }
    if (action === "camera") camera.current?.click();
    else if (action === "file") files.current?.click();
    else { if (!letter) { setError(c.need); return; } void run(); }
  }
  async function run() {
    if (!session) { setError(c.loginNeeded); void navigate({ to: "/auth" }); return; }
    setError(""); setBusy(true);
    try {
      try { await recordConsent(session.user.id, lang); } catch { setError(c.consentFailed); return; }
      const current = letter!;
      const payload = !current.url ? { fileName: current.name, text: current.text, topic, lang } : { fileName: current.name, mediaType: current.type, fileBase64: await blobUrlToBase64(current.url), topic, lang };
      const operationId = crypto.randomUUID(); // one key per press of "send"; retries of this press reuse it server-side
      const res = await analyze({ data: { ...payload, operationId } });
      setAnalysis({ ...res.analysis, id: res.id });
      void navigate({ to: "/result", search: { id: res.id } });
      refreshUsage();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const code = limitCodeOf(msg);
      const aiCode = aiErrorCodeOf(msg);
      if (code === "LIMIT_QUOTA") { setQuotaOpen(true); refreshUsage(); }
      else if (code === "LIMIT_BUSY") setError(c2.errBusy);
      else if (code === "LIMIT_OVERLOADED") setError(c2.errOverloaded);
      else if (code === "SAVE_FAILED") setError(c2.errSave);
      else if (aiCode === "CONSENT_REQUIRED") { setConsent(false); setError(aiErrorText[lang][aiCode]); }
      else if (aiCode) setError(aiErrorText[lang][aiCode]);
      else setError(aiErrorText[lang].ANALYZE_FAILED);
    }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-[720px]">
    <section className={`letter-card p-6 sm:p-10 ${drag ? "letter-drop" : ""}`} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); const fl = Array.from(e.dataTransfer.files); if (fl.length > 1) { if (consent) void selectMany(fl); else act(fl[0]!); } else if (fl[0]) act(fl[0]!); }}>
      <h1 className="letter-headline max-w-xl font-semibold leading-[1.12]">{siteText('home.title', c.title)}</h1>
      <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-foreground/80 sm:text-lg">{siteText('home.intro', c.intro)}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button className="letter-pill min-h-14 h-auto whitespace-normal py-3 text-base" onClick={() => act("camera")}><Camera className="!h-5 !w-5" />{siteText('home.camera', c.camera)}</Button>
        <Button variant="outline" className="letter-pill min-h-14 h-auto whitespace-normal bg-transparent py-3 text-base" onClick={() => act("file")}><Upload className="!h-5 !w-5" />{siteText('home.file', c.file)}</Button>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{c.limit}</p>
      {summary && <p className="mt-2 text-center text-xs font-semibold" data-testid="usage">{summary.active ? c2.usageActive : c2.usage(summary.used, summary.left)}{!summary.active && <span className="block font-medium text-muted-foreground">{c2.usageAfter}</span>}</p>}
      <input aria-label="Camera" ref={camera} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={e => { void selectMany(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      <input aria-label="File upload" ref={files} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={e => { void selectMany(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      {letter && <div className="mt-5 flex min-w-0 items-center gap-2 rounded-xl border p-3"><FileText className="h-5 w-5 shrink-0" /><span className="min-w-0 flex-1 truncate text-sm">{letter.name}</span><Button size="icon" variant="ghost" className="h-12 w-12" aria-label={c.remove} onClick={() => { setPhotos([]); setLetter(null); }}><X /></Button></div>}
      {letter && photos.length > 0 && photos.length < MAX_PHOTOS && <Button variant="outline" disabled={busy} className="letter-pill mt-3 h-12 w-full bg-transparent" onClick={() => camera.current?.click()}><Plus />{addLabel}</Button>}
      <Button disabled={busy} onClick={() => act("submit")} className="letter-pill mt-3 h-14 w-full gap-2.5 text-base">
        {busy ? <Loader2 className="!h-5 !w-5 animate-spin" /> : <ArrowUp className="!h-5 !w-5" />}
        {c.send}
      </Button>
      {busy && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{c.analyzing}</p>}{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-7 flex items-start gap-2 border-t pt-5 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" /><p>{c.local}</p></div>
    </section>
    <SiteBlocks page="home" />
    <section className="letter-card mt-4 p-6 sm:p-8"><h2 className="text-lg font-semibold">{c.howTitle}</h2><ol className="mt-4 grid gap-4">{[c.how1, c.how2, c.how3, c.how4].map((t, i) => <li key={i} className="flex items-start gap-3 text-sm leading-relaxed"><span className="letter-step-num flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span><span className="pt-1">{t}</span></li>)}</ol></section>
    <section className="letter-card mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 sm:px-7"><div className="min-w-0"><p className="text-sm font-semibold">{c.example}</p><p className="mt-1 text-xs text-muted-foreground">Jobcenter · Aufforderung zur Mitwirkung</p></div><Button variant="ghost" size="icon" aria-label={c.example} title={c.example} className="h-12 w-12 rounded-full" onClick={() => { setLetter(null); void navigate({ to: "/result", search: { demo: true } }); }}><ArrowRight /></Button></section>
    <section className="letter-card mt-4 p-6 sm:p-8">
      <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold">{c2.subBadge}</span>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/80">{c2.subText}</p>
      <ul className="mt-5 grid gap-2.5">{c2.subList.map(item => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0" />{item}</li>)}</ul>
      <Button className="letter-pill mt-6 h-14 w-full text-base" onClick={() => (session ? act("file") : void navigate({ to: "/auth" }))}>{c2.subCta}</Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />{c.secure}</p>
    </section>
    <section className="letter-card mt-4 p-6 sm:p-8">
      <h2 className="text-lg font-semibold">{c2.faqTitle}</h2>
      <div className="mt-5 space-y-7">{letterFaq[lang].map(section => <div key={section.title}><h3 className="border-b pb-2 text-base font-bold tracking-wide first:pt-0 [&:not(:first-child)]:mt-2">{section.title}</h3>{section.items.map(item => <details key={item.q} className="group border-b last:border-b-0"><summary className="grid min-h-12 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span className="min-w-0">{item.q}</span><ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" /></summary><p className="pb-4 text-sm leading-relaxed text-foreground/80">{item.a}</p></details>)}</div>)}</div>
    </section>
    <Dialog open={quotaOpen} onOpenChange={setQuotaOpen}><DialogContent className="app-theme letter-card"><DialogTitle>{c2.quotaTitle}</DialogTitle><DialogDescription className="leading-relaxed">{c2.quotaText}</DialogDescription><Button asChild variant="outline" className="letter-pill h-12"><Link to="/letters" onClick={() => setQuotaOpen(false)}>{c.letters}</Link></Button><Button variant="ghost" className="h-12" onClick={() => setQuotaOpen(false)}>{c.cancel}</Button></DialogContent></Dialog>
    <Dialog open={pending !== null} onOpenChange={open => { if (!open) setPending(null); }}><DialogContent className="app-theme letter-card"><DialogTitle>{c.consent} · DSGVO</DialogTitle><DialogDescription className="leading-relaxed">{c.privacy}</DialogDescription><Link to="/datenschutz" onClick={() => setPending(null)} className="inline-flex min-h-12 items-center text-sm underline underline-offset-4">Datenschutz</Link><label className="flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="h-5 w-5 shrink-0 accent-primary" />{c.agree}</label><Button disabled={!agreed} className="letter-pill h-12" onClick={() => { const action = pending; setConsent(true); setPending(null); if (session) void recordConsent(session.user.id, lang).catch(() => undefined); if (action) act(action, true); }}>{c.continue}</Button><Button variant="ghost" className="h-12" onClick={() => setPending(null)}>{c.cancel}</Button></DialogContent></Dialog>
  </div>;
}
