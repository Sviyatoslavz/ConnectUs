import { z } from 'zod';
export const OFFICIAL_SOURCES = ['bamf', 'germany4ukraine'] as const;
export type OfficialSource = typeof OFFICIAL_SOURCES[number];
export const sourceConfig = {
  bamf: { name: 'BAMF', domain: 'bamf.de', url: 'https://www.bamf.de/', query: 'Ukraine Flüchtlinge Aufenthalt Neuigkeiten' },
  germany4ukraine: { name: 'Germany4Ukraine', domain: 'germany4ukraine.de', url: 'https://www.germany4ukraine.de/', query: 'Ukraine Aufenthalt vorübergehender Schutz Änderungen' },
} as const;
export function sourceOfUrl(value: string): OfficialSource | null {
  try { const u = new URL(value); if (u.protocol !== 'https:' || u.username || u.password) return null; return OFFICIAL_SOURCES.find(k => u.hostname === sourceConfig[k].domain || u.hostname.endsWith(`.${sourceConfig[k].domain}`)) ?? null; } catch { return null; }
}
const article = z.object({ title: z.string().max(300), summary: z.string().max(2000), url: z.string().refine(v => sourceOfUrl(v) !== null), date: z.string(), kind: z.enum(['news', 'background']) }).strict();
export const sourceSectionSchema = z.object({ source: z.enum(OFFICIAL_SOURCES), checkedDay: z.string(), status: z.enum(['ok', 'unavailable']), articles: z.array(article).max(3) }).strict().superRefine((v,c) => { if (v.articles.some(a => sourceOfUrl(a.url) !== v.source)) c.addIssue({ code: 'custom', message: 'Wrong source' }); });
export type SourceSection = z.infer<typeof sourceSectionSchema>;
export function readSourceSections(payload: unknown): SourceSection[] {
  if (!payload || typeof payload !== 'object' || !('sourceSections' in payload) || !Array.isArray(payload.sourceSections)) return [];
  return payload.sourceSections.flatMap(v => { const p = sourceSectionSchema.safeParse(v); return p.success ? [p.data] : []; });
}
export const sourceSummarySchema = z.object({ articles: z.array(z.object({ item: z.number().int().min(0), UK: z.object({ title: z.string(), summary: z.string() }).strict(), RU: z.object({ title: z.string(), summary: z.string() }).strict(), DE: z.object({ title: z.string(), summary: z.string() }).strict(), kind: z.enum(['news','background']), evidence: z.string().nullable() }).strict()).max(6) }).strict();
export function verifiedKind(kind: 'news' | 'background', evidence: string | null, text: string): 'news' | 'background' { return kind === 'news' && evidence && evidence.trim().length >= 20 && text.includes(evidence.trim()) ? 'news' : 'background'; }
export const sourceCopy = {
  UK: { title: 'Біженці та перебування', bamf: 'Притулок, інтеграція та статус', germany4ukraine: 'Інформація для українців у Німеччині', checked: 'Перевірено', unavailable: 'Джерело тимчасово недоступне. Інші розділи оновлюються незалежно.', empty: 'Нових відповідних матеріалів не знайдено.', waiting: 'Матеріали цього джерела ще готуються.', background: 'Офіційна довідка', news: 'Офіційне повідомлення', open: 'Читати першоджерело' },
  RU: { title: 'Беженцы и пребывание', bamf: 'Убежище, интеграция и статус', germany4ukraine: 'Информация для украинцев в Германии', checked: 'Проверено', unavailable: 'Источник временно недоступен. Другие разделы обновляются независимо.', empty: 'Новых подходящих материалов не найдено.', waiting: 'Материалы этого источника ещё готовятся.', background: 'Официальная справка', news: 'Официальное сообщение', open: 'Читать первоисточник' },
  DE: { title: 'Flucht und Aufenthalt', bamf: 'Asyl, Integration und Aufenthaltsstatus', germany4ukraine: 'Informationen für Ukrainer in Deutschland', checked: 'Geprüft', unavailable: 'Quelle vorübergehend nicht verfügbar. Andere Bereiche werden unabhängig aktualisiert.', empty: 'Keine neuen passenden Beiträge gefunden.', waiting: 'Beiträge dieser Quelle werden vorbereitet.', background: 'Offizielle Information', news: 'Offizielle Meldung', open: 'Originalquelle lesen' },
} as const;
