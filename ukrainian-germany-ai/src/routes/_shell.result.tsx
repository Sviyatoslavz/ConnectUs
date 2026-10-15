import { createFileRoute } from "@tanstack/react-router";
import { LetterResult } from "@/components/app/LetterResult";
import { letterSearch } from "@/lib/letter-search";
export const Route = createFileRoute("/_shell/result")({
  validateSearch: letterSearch,
  head: () => ({ meta: [
    { title: "Розбір листа — Ukrainian Germany AI" }, { name: "description", content: "Строк, переклад і наступні кроки для вашого німецького листа." },
    { property: "og:title", content: "Розбір листа — Ukrainian Germany AI" }, { property: "og:description", content: "Зрозумійте лист, вимоги та строк відповіді." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
  ] }), component: ResultPage,
});
function ResultPage() { const { id, demo } = Route.useSearch(); return <LetterResult id={id} demo={demo} />; }
