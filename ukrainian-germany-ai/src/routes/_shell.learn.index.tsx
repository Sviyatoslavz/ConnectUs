import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lightbulb, Languages, HelpCircle, GraduationCap, Newspaper, Info, ArrowUpRight, ArrowRight } from "lucide-react";
import { useLetter } from "@/components/app/LetterContext";
import { PageHeader } from "@/components/app/AppShell";
import { EditorialPhoto } from "@/components/app/EditorialPhoto";
import { editorialPhotos, editorialCopy, publicationPhoto, publicationPhotos } from "@/lib/editorial-photos";
import { LearnQuiz } from "@/components/app/LearnQuiz";
import { supabase } from "@/integrations/supabase/client";
import { berlinToday } from "@/lib/push";
import { COURSES, COURSE_IDS, learnCopy, lessonOfDay, type DailyPayload } from "@/lib/learn-content";
import { Button } from "@/components/ui/button";
import { courseCopy } from "@/lib/course-lessons";
import { SiteBlocks } from "@/components/app/SiteContent";
import { OfficialSourceSections } from '@/components/app/OfficialSourceSections';
import { ReadingNote } from '@/components/app/ReadingNote';
import { experienceCopy } from '@/lib/experience-copy';

export const Route = createFileRoute("/_shell/learn/")({
  head: () => ({ meta: [
    { title: "Щодня — поради, німецька й новини | Ukrainian Germany AI" },
    { name: "description", content: "Порада дня, німецьке слово для відомств, міні-тест, уроки та короткі новини з офіційних джерел для українців у Німеччині." },
    { property: "og:title", content: "Щодня — Ukrainian Germany AI" },
    { property: "og:description", content: "Кілька хвилин на день — і Німеччина стає зрозумілішою." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LearnPage,
});

function Card({ icon: I, title, children, photo }: { icon: typeof Lightbulb; title: string; children: React.ReactNode; photo?: string }) {
  const { lang } = useLetter();
  return <article className="letter-card h-full overflow-hidden">{photo && <EditorialPhoto src={photo} alt={title} lang={lang} />}<div className="p-5"><h2 className="mb-3 flex items-center gap-2 font-bold"><span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background"><I className="h-4 w-4" /></span>{title}</h2>{children}</div></article>;
}

function LearnPage() {
  const { lang } = useLetter();
  const t = learnCopy[lang];
  const e = experienceCopy[lang];
  const [contentDay, setContentDay] = useState<string | null>(null);
  const [data, setData] = useState<DailyPayload | null | undefined>(undefined);
  const today = berlinToday();
  const lod = lessonOfDay(today);
  useEffect(() => {
    let live = true;
    void supabase.from("daily_content").select("payload,day").eq("lang", lang).order("day", { ascending: false }).limit(1).maybeSingle()
      .then(({ data: d }) => { if (live) { setData((d?.payload as DailyPayload | undefined) ?? null); setContentDay(d?.day ?? null); } });
    return () => { live = false; };
  }, [lang]);

  return <div className="learn-layout space-y-6">
    <PageHeader title={t["title"] ?? ""} subtitle={e.dailyIntro} />
    <section className="letter-card p-5"><h2 className="text-xl font-bold">{e.dailyLead}</h2><p className="mt-2 text-sm leading-relaxed">{e.dailyNote}</p><Button asChild className="mt-4 min-h-12 w-full whitespace-normal rounded-full"><Link to="/learn/$course/$idx" params={{ course: lod.course, idx: String(lod.idx + 1) }}>{e.start}<ArrowRight /></Link></Button></section>
    <SiteBlocks page="learn" />
    <p className="letter-card flex gap-2 px-4 py-3 text-sm"><Info className="h-4 w-4 shrink-0" />{t["ai"]}</p>
    {data === null && <p className="letter-card p-5 text-sm">{t["empty"]}</p>}
    {data && <div className="grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
      <Card icon={Lightbulb} title={t["tip"] ?? ""} photo={publicationPhoto(`${data.tip.title} ${data.tip.text}`, 0)}>
        {contentDay && <p className="mb-2 text-xs text-muted-foreground"><time dateTime={contentDay}>{new Intl.DateTimeFormat(lang === "UK" ? "uk-UA" : lang === "RU" ? "ru-RU" : "de-DE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${contentDay}T12:00:00Z`))}</time></p>}<p className="font-semibold">{data.tip.title}</p><p className="mt-1 text-sm">{data.tip.text}</p><div className="mt-4"><ReadingNote title={e.takeAway}>{e.tipNote}</ReadingNote></div></Card>
      <Card icon={Languages} title={t["word"] ?? ""} photo={publicationPhoto(`${data.word.de} ${data.word.explanation}`, 1)}>
        <p className="text-xl font-bold" lang="de">{data.word.de}</p><p className="text-sm">{data.word.translation}</p>
        <p className="mt-2 text-sm text-muted-foreground">{data.word.explanation}</p>
        <p className="mt-3 border-l-2 border-border pl-3 text-sm"><span lang="de" className="font-semibold">{data.word.exampleDe}</span><br />{data.word.exampleTr}</p>
        <div className="mt-4"><ReadingNote title={e.why}>{e.wordNote}</ReadingNote></div>
      </Card>
      <Card icon={HelpCircle} title={t["quiz"] ?? ""} photo={editorialPhotos.classroom}><p className="mb-4 text-sm leading-relaxed">{e.quizNote}</p><LearnQuiz key={lang} items={data.quiz} t={t} /></Card>
    </div>}
    <div className="grid items-start gap-5 lg:grid-cols-2"><Card icon={GraduationCap} title={t["lesson"] ?? ""} photo={publicationPhoto(COURSES[lod.course].lessons[lod.idx]?.DE ?? "", 2)}>
      <Link to="/learn/$course/$idx" params={{ course: lod.course, idx: String(lod.idx + 1) }} className="flex min-h-12 flex-col justify-center rounded-xl border bg-secondary px-4 py-3">
        <span className="text-xs text-muted-foreground">{COURSES[lod.course].title[lang]} · {t["lessonN"]} {lod.idx + 1}</span>
        <span className="font-semibold">{COURSES[lod.course].lessons[lod.idx]?.[lang]} →</span>
      </Link>
    </Card>
    {data && <Card icon={Newspaper} title={t["news"] ?? ""}>
       {data.news.length === 0 ? <p className="rounded-xl border border-border bg-secondary p-4 text-sm">{t["noNews"]}</p> : (() => { const newsPhotos = publicationPhotos(data.news.map(n => `${n.title} ${n.summary}`), [editorialPhotos.classroom, editorialPhotos.counter]); return <ul className="divide-y divide-border">{data.news.map((n, i) => <li key={i} className="overflow-hidden py-4 text-sm">
        <EditorialPhoto src={newsPhotos[i] ?? editorialPhotos.government} alt={n.title} lang={lang} />
        <div className="pt-4"><p className="mb-2 text-xs text-muted-foreground">{editorialCopy[lang].source}{Number.isNaN(Date.parse(n.date)) ? "" : ` · ${new Intl.DateTimeFormat(lang === "UK" ? "uk-UA" : lang === "RU" ? "ru-RU" : "de-DE").format(new Date(n.date))}`}</p><p className="font-semibold">{n.title}</p><p className="mt-1">{n.summary}</p>
        <a href={n.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-xs underline">{new URL(n.url).hostname} <ArrowUpRight className="inline h-3 w-3" /></a></div>
      </li>)}</ul>; })()}
      <p className="mt-3 rounded-xl border border-border bg-secondary p-3 text-xs text-muted-foreground">{t["newsNote"]}</p>
      <div className="mt-4"><ReadingNote title={e.why}>{e.newsNote}</ReadingNote></div>
    </Card>}
    </div>
    <section aria-label={t["courses"]} className="space-y-4">
      <h2 className="flex items-center gap-3 text-xl font-bold"><GraduationCap className="h-6 w-6" />{t["courses"]}</h2>
      <div className="grid items-start gap-5 lg:grid-cols-2">{COURSE_IDS.map(c => <article key={c} className="letter-card overflow-hidden">
        <EditorialPhoto src={c === "deutsch-amt" ? editorialPhotos.classroom : editorialPhotos.counter} alt={COURSES[c].title[lang]} lang={lang} />
        <div className="p-5 sm:p-6"><p className="mb-2 text-xs text-muted-foreground">{c === "deutsch-amt" ? courseCopy[lang].deutsch : courseCopy[lang].behavior}</p><h3 className="text-xl">{COURSES[c].title[lang]}</h3><p className="mb-4 mt-3 text-sm leading-relaxed">{e.courseIntro[c]}</p>
        <ol className="divide-y divide-border">{COURSES[c].lessons.map((l, i) => <li key={i}><Button asChild variant="ghost" className="h-auto min-h-16 w-full justify-start whitespace-normal rounded-lg px-2 py-3 text-left text-sm leading-relaxed"><Link to="/learn/$course/$idx" params={{ course: c, idx: String(i + 1) }}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-xs">{i + 1}</span><span className="min-w-0 flex-1">{l[lang]}</span><ArrowRight className="shrink-0" /></Link></Button></li>)}</ol></div>
      </article>)}</div>
    </section>
    <OfficialSourceSections payload={data} />
  </div>;
}
