import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LegalContent } from "@/components/app/LegalPage";
import { legalConfig, isLegalConfigComplete } from "@/lib/legal-config";
import { legalCopy } from "@/lib/legal-copy";

describe("Legal pages without operator data", () => {
  it("keeps both pages available and warns in each interface language", () => {
    expect(isLegalConfigComplete(legalConfig)).toBe(false);
    for (const lang of ["UK", "RU", "DE"] as const) {
      for (const page of ["impressum", "datenschutz"] as const) {
        const html = renderToStaticMarkup(<LegalContent page={page} lang={lang} config={legalConfig} />);
        expect(html).toContain('role="alert"');
        expect(html).toContain(legalCopy[lang].warning);
      }
    }
  });
  it("requires service details but not an optional phone number", () => {
    const config = { operatorName: "Example", street: "Example", postalCodeCity: "Example", country: "Example", email: "Example", aiProviderName: "Example", aiTransferNote: "Example", hostingNote: "Example" };
    expect(isLegalConfigComplete(config)).toBe(true);
    expect(isLegalConfigComplete({ ...config, operatorName: "[ВПИШИТЕ: имя]" })).toBe(false);
    expect(isLegalConfigComplete({ ...config, hostingNote: " " })).toBe(false);
    expect(isLegalConfigComplete({ ...config, aiTransferNote: "" })).toBe(false);
  });
  it("discloses special categories, third-country transfer and the data export in all languages", () => {
    for (const lang of ["UK", "RU", "DE"] as const) {
      const html = renderToStaticMarkup(<LegalContent page="datenschutz" lang={lang} config={legalConfig} />);
      expect(html).toContain(legalCopy[lang].special);
      expect(html).toContain("Art. 9 Abs. 2 lit. a");
      expect(html).toContain(legalCopy[lang].transfer);
      expect(html).toContain("JSON");
      expect(html).not.toMatch(/fonts\.googleapis/);
    }
  });
});
