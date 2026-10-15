import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { useLetter } from "@/components/app/LetterContext";
import { PageHeader } from "@/components/app/AppShell";
import { findGuide, GUIDE_DRAFT_NOTE } from "@/lib/guides";
import { EditorialPhoto } from "@/components/app/EditorialPhoto";
import { guidePhoto } from "@/lib/editorial-photos";
import { assistantCopy } from "@/lib/assistant-copy";

export const Route = createFileRoute("/_shell/guides/$slug")({
  loader: ({ params }) => { const g = findGuide(params.slug); if (!g) throw notFound(); return { slug: g.slug }; },
  head: ({ params }) => {
    const g = findGuide(params.slug);
    const title = g ? `${g.title.UK} — Ukrainian Germany AI` : "Unavailable — Ukrainian Germany AI";
    const desc = g ? g.intro.UK : "Сторінку не знайдено.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }, ...(g ? [] : [{ name: "robots", content: "noindex" }])] };
  },
  component: GuidePage,
});

function GuidePage() {
  const { slug } = Route.useLoaderData();
  const g = findGuide(slug);
  const { lang } = useLetter();
  const t = assistantCopy[lang];
  if (!g) return null;
  return <div>
    <Link to="/assistant" search={g.module ? { m: g.module } : {}} className="mb-3 inline-flex min-h-12 items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" />{t.title}</Link>
    <PageHeader title={g.title[lang]} subtitle={g.intro[lang]} />
    <div className="letter-card mb-4 overflow-hidden"><EditorialPhoto src={guidePhoto(g)} alt={g.title[lang]} lang={lang} eager /></div>
    <p role="note" className="mb-4 flex gap-2 rounded-2xl border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-950"><Info className="h-5 w-5 shrink-0" />{GUIDE_DRAFT_NOTE[lang]}</p>
    {g.sections.map((s, i) => <section key={i} className="letter-card mb-4 p-5">
      <h2 className="font-bold">{s.h[lang]}</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">{s.items[lang].map((x, j) => <li key={j}>{x}</li>)}</ol>
    </section>)}
    <p className="letter-card p-4 text-sm">{t.source}: <a href={g.source} target="_blank" rel="noopener noreferrer" className="break-all underline">{g.source.replace("https://", "")}</a></p>
  </div>;
}
