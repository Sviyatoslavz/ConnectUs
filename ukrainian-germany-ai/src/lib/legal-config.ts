export interface LegalConfig {
  operatorName: string;
  street: string;
  postalCodeCity: string;
  country: string;
  email: string;
  phone?: string;
  aiProviderName: string;
  /** Where the AI provider processes data and on which basis (adequacy decision / EU standard contractual clauses). */
  aiTransferNote: string;
  hostingNote: string;
  /** Competent data protection supervisory authority for the operator. */
  supervisoryAuthority?: string;
}

// Public information only. Fill in verified operator/service details before launch.
export const legalConfig: LegalConfig = {
  operatorName: "",
  street: "",
  postalCodeCity: "",
  country: "",
  email: "",
  phone: "",
  aiProviderName: "",
  aiTransferNote: "",
  hostingNote: "",
  supervisoryAuthority: "",
};

export function isLegalValueFilled(value: string | undefined): boolean {
  return Boolean(value?.trim()) && !/^\s*\[/.test(value ?? "");
}

export function isLegalConfigComplete(config: LegalConfig): boolean {
  return [config.operatorName, config.street, config.postalCodeCity, config.country,
    config.email, config.aiProviderName, config.aiTransferNote, config.hostingNote].every(isLegalValueFilled);
}
