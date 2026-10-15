// Display-only: appends a short organisation type in the UI language. Never used in exported letters.
export type AuthorityLang = "UK" | "RU" | "DE";

const DICT: { keys: string[]; UK: string; RU: string; DE: string }[] = [
  { keys: ["jobcenter"], UK: "центр зайнятості, виплати", RU: "центр занятости, выплаты", DE: "Grundsicherung, Bürgergeld" },
  { keys: ["sozialamt"], UK: "соціальна служба", RU: "социальная служба", DE: "Sozialhilfe" },
  { keys: ["ausländerbehörde", "auslaenderbehoerde", "ausländeramt", "landesamt für einwanderung"], UK: "міграційна служба", RU: "миграционная служба", DE: "Aufenthalt, Visum" },
  { keys: ["arbeitsagentur", "agentur für arbeit", "bundesagentur"], UK: "агентство з працевлаштування", RU: "агентство по трудоустройству", DE: "Arbeitsvermittlung" },
  { keys: ["familienkasse"], UK: "виплата Kindergeld", RU: "выплата Kindergeld", DE: "Kindergeld" },
  { keys: ["krankenkasse", " aok", "aok ", "techniker", "barmer", "dak-gesundheit", "ikk"], UK: "медична страховка", RU: "медицинская страховка", DE: "Krankenversicherung" },
  { keys: ["finanzamt"], UK: "податкова", RU: "налоговая", DE: "Steuerbehörde" },
  { keys: ["vermieter", "hausverwaltung", "wohnungsbau"], UK: "орендодавець", RU: "арендодатель", DE: "Wohnung" },
  { keys: ["rentenversicherung"], UK: "пенсійне страхування", RU: "пенсионное страхование", DE: "Rente" },
];

export function authorityType(name: string | null | undefined, lang: AuthorityLang): string | null {
  if (!name) return null;
  const n = ` ${name.toLowerCase()} `;
  const hit = DICT.find(d => d.keys.some(k => n.includes(k)));
  return hit ? hit[lang] : null;
}

export function describeAuthority(name: string | null | undefined, lang: AuthorityLang): string {
  const raw = (name ?? "").trim();
  if (!raw) return "";
  const type = authorityType(raw, lang);
  return type ? `${raw} (${type})` : raw;
}
