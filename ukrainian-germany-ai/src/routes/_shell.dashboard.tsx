import { createFileRoute } from "@tanstack/react-router";
import { LetterHome } from "@/components/app/LetterHome";
export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({ meta: [
    { title: "Додати лист — Ukrainian Germany AI" }, { name: "description", content: "Фото, PDF або текст вашого листа з Німеччини." },
    { property: "og:title", content: "Додати лист — Ukrainian Germany AI" }, { property: "og:description", content: "Розберіться з листом і підготуйте відповідь." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: LetterHome,
});
