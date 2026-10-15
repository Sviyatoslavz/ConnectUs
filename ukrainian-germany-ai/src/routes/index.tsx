import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { LetterHome } from "@/components/app/LetterHome";
export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { capture?: boolean | undefined; upload?: boolean | undefined } => ({ capture: s["capture"] === true || s["capture"] === "true" ? true : undefined, upload: s["upload"] === true || s["upload"] === "true" ? true : undefined }),
  head: () => ({ meta: [
    { title: "Ukrainian Germany AI — зрозуміти лист з Німеччини" },
    { name: "description", content: "Німецький лист — не вирок, а інструкція. Сфотографуйте його: переклад, строк, пояснення й готова відповідь німецькою." },
    { property: "og:title", content: "Ukrainian Germany AI — лист зрозуміло, кроки відомі" },
    { property: "og:description", content: "Переклад, строк, пояснення й готова відповідь німецькою — замість паніки через поштову скриньку." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: () => <AppShell><LetterHome /></AppShell>,
});
