import { describe, it, expect } from 'vitest';
import { siteContentSchema, safeContentLink, assertManageUser, localizedValue, manageUserSchema } from '../lib/site-content';
const text = { UK: 'Тема', RU: 'Тема', DE: 'Thema' };
const block = { page: 'home', kind: 'block', slot: null, title: text, body: text, buttons: [], published: true, position: 0 };
describe('owner administration rules', () => {
  it('accepts localized blocks on all three managed pages', () => { for (const page of ['home', 'assistant', 'learn']) expect(siteContentSchema.parse({ ...block, page }).page).toBe(page); });
  it('only permits known editable slots and matching page', () => { expect(siteContentSchema.safeParse({ ...block, kind: 'override', slot: 'home.camera' }).success).toBe(true); expect(siteContentSchema.safeParse({ ...block, kind: 'override', slot: 'admin.title' }).success).toBe(false); expect(siteContentSchema.safeParse({ ...block, kind: 'override', slot: 'assistant.wohnen' }).success).toBe(false); });
  it('rejects scripts, insecure links and protocol-relative URLs', () => { for (const v of ['javascript:alert(1)', '//evil.test', 'http://evil.test', 'https://user:pass@example.com']) expect(safeContentLink(v)).toBe(false); expect(safeContentLink('/assistant?m=wohnen')).toBe(true); expect(safeContentLink('https://bamf.de/')).toBe(true); });
  it('protects owner and other administrators from blocking', () => { expect(() => assertManageUser('owner', 'owner', false)).toThrow(); expect(() => assertManageUser('owner', 'admin', true)).toThrow(); expect(() => assertManageUser('owner', 'member', false)).not.toThrow(); });
  it('rejects forged role fields and invalid user ids', () => { expect(manageUserSchema.safeParse({ userId: 'fake', blocked: true }).success).toBe(false); expect(manageUserSchema.safeParse({ userId: '1c56adaf-5f83-4e06-8d55-c723840ee8cd', blocked: true, role: 'admin' }).success).toBe(false); });
  it('keeps language fallback without empty labels', () => { expect(localizedValue({ UK: 'Житло', RU: '', DE: '' }, 'DE')).toBe('Житло'); });
  it('rejects unsafe publication and extra fields', () => { expect(siteContentSchema.safeParse({ ...block, title: { UK: '', RU: '', DE: '' } }).success).toBe(false); expect(siteContentSchema.safeParse({ ...block, role: 'admin' }).success).toBe(false); });
});
