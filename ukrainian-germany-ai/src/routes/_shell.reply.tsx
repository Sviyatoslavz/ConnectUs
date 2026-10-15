import { createFileRoute } from "@tanstack/react-router";
import { LetterReply } from "@/components/app/LetterReply";
import { letterSearch } from "@/lib/letter-search";
export const Route = createFileRoute("/_shell/reply")({
  validateSearch: letterSearch,
  head: () => ({ meta: [
    { title: "Відповідь на лист — Ukrainian Germany AI" }, { name: "description", content: "Перевірте німецьку чернетку та завантажте відповідь у PDF або DOCX." },
    { property: "og:title", content: "Відповідь на лист — Ukrainian Germany AI" }, { property: "og:description", content: "Редагуйте відповідь і збережіть готовий лист." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
  ] }), component: ReplyPage,
});
function ReplyPage() { const { id, demo } = Route.useSearch(); return <LetterReply id={id} demo={demo} />; }
