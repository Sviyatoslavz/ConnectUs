import { describe, it, expect } from 'vitest';
import { sourceOfUrl, readSourceSections, sourceSectionSchema, verifiedKind, OFFICIAL_SOURCES } from '@/lib/official-sources';
describe('independent official news sections', () => {
  it('only accepts exact official domains and subdomains over https', () => { expect(sourceOfUrl('https://www.bamf.de/a')).toBe('bamf'); expect(sourceOfUrl('https://www.germany4ukraine.de/a')).toBe('germany4ukraine'); for (const u of ['https://bamf.de.evil.test/', 'https://fakebamf.de/', 'http://bamf.de/', 'javascript:alert(1)']) expect(sourceOfUrl(u)).toBeNull(); });
  it('keeps both distinct sources even if one is unavailable', () => { const rows = OFFICIAL_SOURCES.map(source => ({ source, checkedDay: '2026-10-14', status: source === 'bamf' ? 'unavailable' : 'ok', articles: [] })); expect(readSourceSections({ sourceSections: rows })).toHaveLength(2); });
  it('rejects a cross-source article', () => { expect(sourceSectionSchema.safeParse({ source: 'bamf', checkedDay: '2026-10-14', status: 'ok', articles: [{ title: 'a', summary: 'b', url: 'https://germany4ukraine.de/a', date: '', kind: 'background' }] }).success).toBe(false); });
  it('does not claim a change without a matching direct quote', () => { const quote = 'Der vorübergehende Schutz wird verlängert.'; expect(verifiedKind('news', quote, `Meldung: ${quote}`)).toBe('news'); expect(verifiedKind('news', quote, 'Andere Information')).toBe('background'); expect(verifiedKind('news', null, quote)).toBe('background'); });
  it('preserves older daily publications', () => { expect(readSourceSections({ news: [] })).toEqual([]); expect(readSourceSections(null)).toEqual([]); });
});
