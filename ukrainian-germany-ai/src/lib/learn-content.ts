import { z } from "zod";

export type Lang = "UK" | "RU" | "DE";
type T = Record<Lang, string>;

const quizItem = z.object({ question: z.string(), options: z.array(z.string()).length(3), answer: z.number().int().min(0).max(2), explanation: z.string() }).strict();

/** AI wire schema for one day's content (news items reference the feed by index; URLs come from code). */
export const dailyWireSchema = z.object({
  tip: z.object({ title: z.string(), text: z.string() }).strict(),
  word: z.object({ de: z.string(), translation: z.string(), explanation: z.string(), exampleDe: z.string(), exampleTr: z.string() }).strict(),
  quiz: z.array(quizItem).min(2).max(3),
  news: z.array(z.object({ item: z.number().int(), title: z.string(), summary: z.string() }).strict()),
}).strict();
export type DailyWire = z.infer<typeof dailyWireSchema>;
export type NewsItem = { title: string; summary: string; url: string; date: string };
export type DailyPayload = Omit<DailyWire, "news"> & { news: NewsItem[] };

export const lessonWireSchema = z.object({
  intro: z.string(),
  phrases: z.array(z.object({ de: z.string(), tr: z.string(), when: z.string() }).strict()).min(3).max(8),
  dialog: z.array(z.object({ who: z.string(), de: z.string(), tr: z.string() }).strict()).max(8),
  tips: z.array(z.string()).max(5),
  quiz: z.array(quizItem).min(2).max(3),
}).strict();
export type LessonPayload = z.infer<typeof lessonWireSchema>;

export type FeedItem = { title: string; link: string; description: string; date: string };

export const NEWS_KEYWORDS = ["ukrain", "aufenthaltstitel", "aufenthaltsrecht", "migration", "flücht", "gefl", "asyl", "bürgergeld", "kindergeld", "integration", "einbürger", "fachkräfte", "arbeitsmarkt", "elterngeld", "wohngeld"];

/** Keeps only feed items about migration/benefit topics, newest first, at most `max`. */
export function filterNews(items: FeedItem[], max = 5): FeedItem[] {
  return items.filter(i => NEWS_KEYWORDS.some(k => `${i.title} ${i.description}`.toLowerCase().includes(k))).slice(0, max);
}

/** Maps AI news entries to feed items; entries pointing to an unknown item are dropped so no URL is ever invented. */
export function attachNewsUrls(news: DailyWire["news"], items: FeedItem[]): NewsItem[] {
  return news.flatMap(n => { const f = items[n.item]; return f ? [{ title: n.title, summary: n.summary, url: f.link, date: f.date }] : []; });
}

export function parseRss(xml: string): FeedItem[] {
  const pick = (s: string, tag: string) => (new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(s)?.[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => ({ title: pick(m[1]!, "title"), link: pick(m[1]!, "link"), description: pick(m[1]!, "description").slice(0, 600), date: pick(m[1]!, "pubDate") })).filter(i => i.title && /^https:\/\//.test(i.link));
}

export const COURSES = {
  "deutsch-amt": {
    title: { UK: "Німецька для відомств", RU: "Немецкий для ведомств", DE: "Deutsch für Behörden" },
    lessons: [
      { UK: "Записатися на Termin телефоном", RU: "Записаться на Termin по телефону", DE: "Einen Termin telefonisch vereinbaren" },
      { UK: "На рецепції: Anmeldung і номерок", RU: "На ресепшене: Anmeldung и номерок", DE: "Am Empfang: Anmeldung und Wartenummer" },
      { UK: "Розмова в Jobcenter", RU: "Разговор в Jobcenter", DE: "Gespräch im Jobcenter" },
      { UK: "В Ausländerbehörde", RU: "В Ausländerbehörde", DE: "In der Ausländerbehörde" },
      { UK: "У лікаря (Hausarzt)", RU: "У врача (Hausarzt)", DE: "Beim Hausarzt" },
      { UK: "Короткий email у відомство", RU: "Короткий email в ведомство", DE: "Eine kurze E-Mail an die Behörde" },
      { UK: "Не зрозумів — як перепитати", RU: "Не понял — как переспросить", DE: "Nicht verstanden — nachfragen" },
    ] as T[],
  },
  verhalten: {
    title: { UK: "Як поводитися в установах", RU: "Как вести себя в учреждениях", DE: "Verhalten bei Behörden" },
    lessons: [
      { UK: "Пунктуальність і Termin", RU: "Пунктуальность и Termin", DE: "Pünktlichkeit und Termine" },
      { UK: "Що брати з собою: папка й копії", RU: "Что брать с собой: папка и копии", DE: "Was mitnehmen: Ordner und Kopien" },
      { UK: "Як говорити по телефону", RU: "Как говорить по телефону", DE: "Richtig telefonieren" },
      { UK: "Листи: читати й відповідати вчасно", RU: "Письма: читать и отвечать вовремя", DE: "Briefe rechtzeitig lesen und beantworten" },
      { UK: "Ввічливість: Sie і Du", RU: "Вежливость: Sie и Du", DE: "Höflichkeit: Sie und Du" },
      { UK: "Коли просити перекладача чи супровід", RU: "Когда просить переводчика или сопровождение", DE: "Dolmetscher oder Begleitung anfragen" },
      { UK: "Якщо щось пішло не так", RU: "Если что-то пошло не так", DE: "Wenn etwas schiefgeht" },
    ] as T[],
  },
} as const;
export type CourseId = keyof typeof COURSES;
export const COURSE_IDS = Object.keys(COURSES) as CourseId[];
export const ALL_LESSONS = COURSE_IDS.flatMap(c => COURSES[c].lessons.map((_, idx) => ({ course: c, idx })));

/** Lesson of the day rotates through both courses by Berlin calendar day. */
export function lessonOfDay(day: string) {
  const n = Math.floor(Date.parse(`${day}T00:00:00Z`) / 864e5);
  return ALL_LESSONS[((n % ALL_LESSONS.length) + ALL_LESSONS.length) % ALL_LESSONS.length]!;
}

export const learnCopy: Record<Lang, Record<string, string>> = {
  UK: { nav: "Щодня", title: "Щодня", subtitle: "Кілька хвилин на день — і Німеччина стає зрозумілішою.", tip: "Порада дня", word: "Слово дня", quiz: "Міні-тест", lesson: "Урок дня", news: "Новини з офіційних джерел", courses: "Міні-курси", open: "Відкрити", check: "Перевірити", right: "Правильно!", wrong: "Не зовсім.", empty: "Сьогоднішні матеріали ще готуються. Загляньте трохи пізніше.", noNews: "Сьогодні немає нових офіційних повідомлень на ці теми.", newsNote: "Короткий переказ офіційного повідомлення. Деталі — за посиланням.", ai: "Матеріали підготовлено AI і можуть містити неточності; це не юридична консультація.", phrases: "Корисні фрази", dialog: "Діалог", tips: "Поради", notReady: "Урок ще готується — загляньте завтра.", back: "Назад", lessonN: "Урок" },
  RU: { nav: "Каждый день", title: "Каждый день", subtitle: "Несколько минут в день — и Германия становится понятнее.", tip: "Совет дня", word: "Слово дня", quiz: "Мини-тест", lesson: "Урок дня", news: "Новости из официальных источников", courses: "Мини-курсы", open: "Открыть", check: "Проверить", right: "Правильно!", wrong: "Не совсем.", empty: "Сегодняшние материалы ещё готовятся. Загляните чуть позже.", noNews: "Сегодня нет новых официальных сообщений на эти темы.", newsNote: "Краткий пересказ официального сообщения. Детали — по ссылке.", ai: "Материалы подготовлены AI и могут содержать неточности; это не юридическая консультация.", phrases: "Полезные фразы", dialog: "Диалог", tips: "Советы", notReady: "Урок ещё готовится — загляните завтра.", back: "Назад", lessonN: "Урок" },
  DE: { nav: "Täglich", title: "Täglich", subtitle: "Ein paar Minuten am Tag — und Deutschland wird verständlicher.", tip: "Tipp des Tages", word: "Wort des Tages", quiz: "Mini-Quiz", lesson: "Lektion des Tages", news: "Neues aus offiziellen Quellen", courses: "Mini-Kurse", open: "Öffnen", check: "Prüfen", right: "Richtig!", wrong: "Nicht ganz.", empty: "Die heutigen Inhalte werden noch vorbereitet. Schauen Sie später vorbei.", noNews: "Heute keine neuen offiziellen Meldungen zu diesen Themen.", newsNote: "Kurzfassung einer offiziellen Meldung. Details unter dem Link.", ai: "Inhalte von KI erstellt, können Ungenauigkeiten enthalten; keine Rechtsberatung.", phrases: "Nützliche Sätze", dialog: "Dialog", tips: "Tipps", notReady: "Die Lektion wird noch vorbereitet — schauen Sie morgen vorbei.", back: "Zurück", lessonN: "Lektion" },
};
