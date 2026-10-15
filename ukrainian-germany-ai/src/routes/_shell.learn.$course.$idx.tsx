import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Languages, MessageCircle, ListChecks } from "lucide-react";
import { useLetter } from "@/components/app/LetterContext";
import { PageHeader } from "@/components/app/AppShell";
import { EditorialPhoto } from "@/components/app/EditorialPhoto";
import { editorialPhotos } from "@/lib/editorial-photos";
const LESSON_PHOTOS = [editorialPhotos.counter, editorialPhotos.appointment, editorialPhotos.classroom, editorialPhotos.documents, editorialPhotos.office, editorialPhotos.health, editorialPhotos.station, editorialPhotos.oldtown, editorialPhotos.government];
const lessonPhoto = (course: string, i: number) => LESSON_PHOTOS[(i + (course === "verhalten" ? 4 : 0)) % LESSON_PHOTOS.length] ?? editorialPhotos.counter;
import { LearnQuiz } from "@/components/app/LearnQuiz";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { courseCopy, getCourseLesson } from "@/lib/course-lessons";
import { COURSES, learnCopy, lessonWireSchema, type CourseId, type LessonPayload } from "@/lib/learn-content";
import { ReadingNote } from '@/components/app/ReadingNote';
import { LessonPhrases } from '@/components/app/LessonPhrases';
import { experienceCopy } from '@/lib/experience-copy';

function resolve(course: string, idx: string) {
  const c = COURSES[course as CourseId]; const i = Number(idx) - 1;
  return c && Number.isInteger(i) && c.lessons[i] ? { course: course as CourseId, i } : null;
}

export const Route = createFileRoute("/_shell/learn/$course/$idx")({
  loader: ({ params }) => { const r = resolve(params.course, params.idx); if (!r) throw notFound(); return r; },
  head: ({ params }) => {
    const r = resolve(params.course, params.idx);
    const title = r ? `${COURSES[r.course].lessons[r.i]?.UK} — ${COURSES[r.course].title.UK}` : "Unavailable — Ukrainian Germany AI";
    const desc = r ? `Міні-урок курсу «${COURSES[r.course].title.UK}»: фрази, діалог, поради й тест.` : "Урок не знайдено.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }, ...(r ? [] : [{ name: "robots", content: "noindex" }])] };
  },
  component: LessonPage,
});

function LessonPage() {
  const { course, i } = Route.useLoaderData();
  const { lang } = useLetter();
  const t = learnCopy[lang];
  const [p, setP] = useState<LessonPayload | null | undefined>(undefined);
  useEffect(() => {
    let live = true; setP(undefined);
    void supabase.from("course_lessons").select("payload").eq("course", course).eq("idx", i).eq("lang", lang).maybeSingle()
      .then(({ data }) => { if (live) setP((data?.payload as LessonPayload | undefined) ?? null); });
    return () => { live = false; };
  }, [course, i, lang]);
  const c = COURSES[course];
  const copy = courseCopy[lang];
  const e = experienceCopy[lang];
  const parsed = lessonWireSchema.safeParse(p);
  const lesson = parsed.success ? parsed.data : getCourseLesson(course, i, lang);
  return <div className="learn-layout space-y-6">
    <Button asChild variant="secondary" className="h-12 rounded-xl"><Link to="/learn"><ArrowLeft />{copy.overview}</Link></Button>
    <PageHeader title={c.lessons[i]?.[lang] ?? c.title[lang]} subtitle={`${c.title[lang]} · ${t["lessonN"]} ${i + 1}/${c.lessons.length}`} />
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        <article className="letter-card overflow-hidden"><EditorialPhoto src={lessonPhoto(course, i)} alt={c.lessons[i]?.[lang] ?? c.title[lang]} lang={lang} eager />{lesson && <div className="p-5 sm:p-6"><p className="mb-3 text-sm font-bold">{e.lessonLead}</p><p className="text-base leading-relaxed">{lesson.intro}</p></div>}</article>
        {lesson && <>
          <section className="letter-card p-5"><h2 className="flex items-center gap-2 text-lg"><Languages className="h-5 w-5" />{t["phrases"]}</h2><p className="mt-2 text-sm leading-relaxed">{e.phrasesIntro}</p><LessonPhrases phrases={lesson.phrases} lang={lang} /></section>
          {lesson.dialog.length > 0 && <section className="letter-card p-5"><h2 className="flex items-center gap-2 text-lg"><MessageCircle className="h-5 w-5" />{parsed.success ? t["dialog"] : copy.practice}</h2>{!parsed.success && <p className="mt-2 text-sm text-muted-foreground">{copy.practiceIntro}</p>}<ul className="mt-4 space-y-3">{lesson.dialog.map((x, k) => <li key={k} className="lesson-dialog-line text-sm"><p className="mb-2 text-xs font-bold text-muted-foreground">{x.who}</p><p lang="de" className="text-base font-bold leading-relaxed">{x.de}</p><p className="mt-2 text-sm leading-relaxed">{x.tr}</p></li>)}</ul><div className="mt-4"><ReadingNote title={e.why}>{e.practiceNote}</ReadingNote></div></section>}
          <section className="letter-card p-5"><h2 className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5" />{t["tips"]}</h2><ul className="mt-3 space-y-3 text-sm leading-relaxed">{lesson.tips.map((x,k) => <li key={k} className="flex items-start gap-3 border-b border-border py-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-xs">{k + 1}</span><span>{x}</span></li>)}</ul><div className="mt-4"><ReadingNote title={e.takeAway}>{e.tipsNote}</ReadingNote></div></section>
          <section className="letter-card p-5"><h2 className="text-lg">{t["quiz"]}</h2><p className="mb-4 mt-2 text-sm">{e.quizLead}</p><LearnQuiz key={`${course}${i}${lang}`} items={lesson.quiz} t={t} /></section>
        </>}
        <nav aria-label={copy.overview} className="grid gap-3 sm:grid-cols-2">
          {i > 0 && <Button asChild variant="secondary" className="h-auto min-h-12 whitespace-normal rounded-xl py-3"><Link to="/learn/$course/$idx" params={{course, idx: String(i)}}><ArrowLeft />{copy.previous}</Link></Button>}
          {i + 1 < c.lessons.length && <Button asChild className="h-auto min-h-12 whitespace-normal rounded-xl py-3"><Link to="/learn/$course/$idx" params={{course, idx: String(i + 2)}}>{copy.next}<ArrowRight /></Link></Button>}
        </nav>
      </div>
      <aside className="letter-card min-w-0 p-5 lg:sticky lg:top-6"><h2 className="mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5" />{c.title[lang]}</h2><ol className="divide-y divide-border">{c.lessons.map((l,k) => <li key={k}><Button asChild variant={i === k ? "default" : "ghost"} className="h-auto min-h-12 w-full justify-start whitespace-normal rounded-lg px-3 py-3 text-left leading-relaxed"><Link to="/learn/$course/$idx" params={{course,idx: String(k+1)}} aria-current={i === k ? "page" : undefined}><span className="shrink-0 text-xs">{k+1}.</span>{l[lang]}</Link></Button></li>)}</ol></aside>
    </div>
    <p className="letter-card p-4 text-xs leading-relaxed">{t["ai"]}</p>
  </div>;
}
