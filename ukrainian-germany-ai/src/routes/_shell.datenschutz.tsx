import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/app/LegalPage";

export const Route = createFileRoute("/_shell/datenschutz")({
  head: () => ({ meta: [
    { title: "Datenschutz — Ukrainian Germany AI" },
    { name: "description", content: "Informationen zur Datenverarbeitung, Speicherung und Ihren Datenschutzrechten bei Ukrainian Germany AI." },
    { property: "og:title", content: "Datenschutz — Ukrainian Germany AI" },
    { property: "og:description", content: "Verarbeitete Daten, Zwecke, Dienstleister und Rechte nach der DSGVO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <LegalPage page="datenschutz" />,
});
