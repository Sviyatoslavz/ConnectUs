import { z } from 'zod';

export const SITE_PAGES = ['home', 'assistant', 'learn'] as const;
export const SITE_SLOTS = ['home.title', 'home.intro', 'home.camera', 'home.file', ...['wohnen', 'familie', 'arbeit', 'geld', 'aufenthalt'].map(k => `assistant.${k}`)] as const;
export const localizedText = z.object({ UK: z.string().max(3000), RU: z.string().max(3000), DE: z.string().max(3000) }).strict();
export function safeContentLink(value: string) {
  if (/^\/(?!\/)[a-zA-Z0-9/?=&%_.-]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
export const contentButtonSchema = z.object({ label: localizedText, href: z.string().max(1000).refine(safeContentLink) }).strict();
export const siteContentSchema = z.object({
  id: z.uuid().optional(), page: z.enum(SITE_PAGES), kind: z.enum(['block', 'override']),
  slot: z.string().nullable(), title: localizedText, body: localizedText,
  buttons: z.array(contentButtonSchema).max(8), published: z.boolean(), position: z.number().int().min(0).max(999),
}).strict().superRefine((v, ctx) => {
  if (v.kind === 'override' && (!v.slot || !SITE_SLOTS.includes(v.slot))) ctx.addIssue({ code: 'custom', message: 'Invalid slot' });
  if (v.kind === 'block' && v.slot !== null) ctx.addIssue({ code: 'custom', message: 'Blocks have no slot' });
  if (v.kind === 'override' && v.slot?.split('.')[0] !== v.page) ctx.addIssue({ code: 'custom', message: 'Slot page mismatch' });
  if (v.published && !Object.values(v.title).some(t => t.trim())) ctx.addIssue({ code: 'custom', message: 'Title required' });
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export const emptyText = () => ({ UK: '', RU: '', DE: '' });
export function localizedValue(text: SiteContent['title'], lang: 'UK' | 'RU' | 'DE') { return text[lang] || text.UK || text.RU || text.DE; }
export function assertManageUser(actor: string, target: string, targetIsAdmin: boolean) {
  if (actor === target || targetIsAdmin) throw new Error('ADMIN_PROTECTED_USER');
}
export const manageUserSchema = z.object({ userId: z.uuid(), blocked: z.boolean() }).strict();