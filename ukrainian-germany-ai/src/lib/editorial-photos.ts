import berlin from "@/assets/editorial-berlin.jpg";
import office from "@/assets/editorial-office.jpg";
import housing from "@/assets/editorial-housing.jpg";
import family from "@/assets/editorial-family.jpg";
import work from "@/assets/editorial-work.jpg";
import budget from "@/assets/editorial-budget.jpg";
import type { AssistantModule } from "@/lib/assistant-modules";

import classroom from "@/assets/editorial-class.jpg";
import documents from "@/assets/editorial-documents.jpg";
import station from "@/assets/editorial-station.jpg";
import health from "@/assets/editorial-health.jpg";
import government from "@/assets/editorial-government.jpg";
import counter from "@/assets/editorial-counter.jpg";
import oldtown from "@/assets/editorial-oldtown.jpg";
import appointment from "@/assets/editorial-appointment.jpg";

export const editorialPhotos = { city: berlin, office, wohnen: housing, familie: family, arbeit: work, geld: budget, aufenthalt: documents, documents, classroom, station, health, government, counter, oldtown, appointment };

const GROUPS: [RegExp, string[]][] = [
  [/kind|famil|school|schul|школ|сім|семь|дит|дет|kita|eltern/, [family, classroom]],
  [/wohn|miet|житл|жиль|оренд|аренд|квартир|unterkunft/, [housing, oldtown]],
  [/gesund|arzt|kranken|лікар|врач|здоров|страхов/, [health, appointment]],
  [/sprach|deutsch|kurs|integration|мова|язык|курс|урок|wort|phrase|слов/, [classroom, counter]],
  [/geld|finanz|budget|bürgergeld|виплат|выплат|грош|деньг|кошти|пенсі|пенси/, [budget, documents]],
  [/arbeit|beruf|job|bewerb|робот|работ|працев|резюме/, [work, counter]],
  [/gesetz|recht|bundes|regierung|закон|minister|beschluss|§/, [government, documents]],
  [/einreise|ankunft|flucht|geflücht|schutz|ukrain|біжен|беж|прибут|приезд|reise/, [station, government]],
  [/termin|frist|brief|post|строк|срок|лист|письм|запис/, [appointment, office]],
  [/aufenthalt|titel|ausweis|pass|visum|документ|статус|дозвіл|разреш/, [documents, office]],
  [/amt|behörde|відом|ведом|jobcenter|ausländer|мігра|мигра|поведін|повед|verhalten|höflich/, [counter, office]],
];
const FALLBACK = [berlin, oldtown, station, government, counter, appointment, classroom, documents];

function hash(s: string): number { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

/** Illustration selection only: never implies that an image depicts a reported event. Different texts spread across a themed set. `variant` shifts the pick so neighbouring cards (same topic) never show the same photo. */
export function publicationPhoto(text: string, variant = 0): string {
  const s = text.toLocaleLowerCase();
  const h = hash(s);
  const g = GROUPS.find(([re]) => re.test(s));
  const pool = g ? g[1] : FALLBACK;
  return pool[(h + variant) % pool.length]!;
}

/** Photos for a list of publications: no photo repeats within the list, so neighbouring cards never match. `reserved` lists photos of fixed cards around the list (quiz, courses) that must also be avoided. */
export function publicationPhotos(texts: string[], reserved: string[] = []): string[] {
  const taken = [...reserved];
  const out: string[] = [];
  for (let i = 0; i < texts.length; i++) {
    let photo = publicationPhoto(texts[i]!, i);
    for (let bump = 1; (taken.includes(photo) || out.includes(photo)) && bump < 12; bump++) photo = publicationPhoto(texts[i]!, i + bump);
    out.push(photo);
    taken.push(photo);
  }
  return out;
}

export const editorialCopy = {
  UK: { illustration: "AI-ілюстрація · не фото події", discover: "Розібратися в темі", daily: "Щоденне читання", dailyText: "Слово, яке почуєте у відомстві. Порада, яку зможете застосувати. І новини — з посиланням на першоджерело.", read: "Читати «Щодня»", source: "Офіційне повідомлення", unknownDate: "Дату не вказано" },
  RU: { illustration: "AI-иллюстрация · не фото события", discover: "Разобраться в теме", daily: "Ежедневное чтение", dailyText: "Слово, которое услышите в ведомстве. Совет, который сможете применить. И новости — со ссылкой на первоисточник.", read: "Читать «Каждый день»", source: "Официальное сообщение", unknownDate: "Дата не указана" },
  DE: { illustration: "KI-Illustration · kein Ereignisfoto", discover: "Das Thema verstehen", daily: "Täglich etwas Neues", dailyText: "Ein Wort für den nächsten Behördentermin. Ein Tipp für den Alltag. Und Nachrichten mit Link zur Originalquelle.", read: "Täglich lesen", source: "Offizielle Meldung", unknownDate: "Datum nicht angegeben" },
};

export function topicPhoto(module: AssistantModule): string { return editorialPhotos[module]; }

/** Guide illustration: an explicit per-guide photo wins, otherwise the module topic photo. */
export function guidePhoto(g: { module: AssistantModule | null; photo?: string }): string {
  if (g.photo && g.photo in editorialPhotos) return editorialPhotos[g.photo as keyof typeof editorialPhotos];
  return g.module ? topicPhoto(g.module) : editorialPhotos.office;
}
