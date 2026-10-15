import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/app/LegalPage";

export const Route = createFileRoute("/_shell/impressum")({
  head: () => ({ meta: [
    { title: "Impressum — Ukrainian Germany AI" },
    { name: "description", content: "Angaben zum Betreiber und Kontakt gemäß § 5 DDG für Ukrainian Germany AI." },
    { property: "og:title", content: "Impressum — Ukrainian Germany AI" },
    { property: "og:description", content: "Betreiberangaben und Kontakt gemäß § 5 DDG." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <LegalPage page="impressum" />,
});
