import { useLetter } from "@/components/app/LetterContext";
import { legalCopy } from "@/lib/legal-copy";
import { legalConfig, isLegalConfigComplete, isLegalValueFilled, type LegalConfig } from "@/lib/legal-config";

type Props = { page: "impressum" | "datenschutz"; lang: keyof typeof legalCopy; config?: LegalConfig };

export function LegalContent({ page, lang, config = legalConfig }: Props) {
  const c = legalCopy[lang];
  const value = (text: string | undefined) => isLegalValueFilled(text) ? text : c.missing;
  const operator = <dl className="grid gap-4 text-sm leading-relaxed">
    <div><dt className="font-bold">{c.operator}</dt><dd>{value(config.operatorName)}</dd></div>
    <div><dt className="font-bold">{c.address}</dt><dd>{value(config.street)}<br />{value(config.postalCodeCity)}<br />{value(config.country)}</dd></div>
    <div><dt className="font-bold">{c.contact}</dt><dd>{value(config.email)}</dd></div>
    {isLegalValueFilled(config.phone) && <div><dt className="font-bold">{c.phone}</dt><dd>{config.phone}</dd></div>}
  </dl>;
  const sections = [
    [c.data, c.dataText], [c.purposes, c.purposesText], [c.basis, c.basisText], [c.special, c.specialText],
    [c.sharing, c.sharingText], [c.retention, c.retentionText], [c.rights, c.rightsText],
  ];
  return <article className="legal-text mx-auto max-w-3xl rounded-3xl border p-5 text-foreground sm:p-8" lang={lang === "UK" ? "uk" : lang.toLowerCase()}>
    <h1 className="break-words text-2xl sm:text-3xl">{page === "impressum" ? c.impressum : c.privacy}</h1>
    {!isLegalConfigComplete(config) && <div role="alert" className="my-6 rounded-lg border border-warning bg-warning-soft p-4 text-sm font-semibold leading-relaxed text-warning">{c.warning}</div>}
    {page === "impressum" ? <section className="mt-6"><h2 className="mb-4 text-lg">{c.ddg}</h2>{operator}</section> : <>
      <section className="mt-6"><h2 className="text-lg">{c.controller}</h2><p className="my-4 text-sm leading-relaxed">{c.controllerText}</p>{operator}</section>
      {sections.map(([title, text]) => <section key={title} className="mt-7 border-t pt-6"><h2 className="text-lg">{title}</h2><p className="mt-3 text-sm leading-relaxed">{text}</p>
        {title === c.sharing && <dl className="mt-4 grid gap-3 text-sm leading-relaxed"><div><dt className="font-bold">{c.ai}</dt><dd>{value(config.aiProviderName)}</dd></div><div><dt className="font-bold">{c.transfer}</dt><dd>{value(config.aiTransferNote)}</dd></div><div><dt className="font-bold">{c.hosting}</dt><dd>{value(config.hostingNote)}</dd></div></dl>}
        {title === c.rights && <dl className="mt-4 text-sm leading-relaxed"><dt className="font-bold">{c.authority}</dt><dd>{value(config.supervisoryAuthority)}</dd></dl>}
      </section>)}
    </>}
    <p className="mt-8 border-t pt-5 text-xs leading-relaxed text-muted-foreground">{c.template}</p>
  </article>;
}

export function LegalPage({ page }: Pick<Props, "page">) {
  const { lang } = useLetter();
  return <LegalContent page={page} lang={lang} />;
}
