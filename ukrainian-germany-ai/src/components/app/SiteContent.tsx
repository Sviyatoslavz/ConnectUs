import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLetter } from './LetterContext';
import { Button } from '@/components/ui/button';
import { siteContentSchema, localizedValue, safeContentLink, type SiteContent, type SITE_PAGES } from '@/lib/site-content';
import { adminCopy } from '@/lib/admin-copy';
import { getAdminAccess } from '@/lib/admin.functions';

export function useSiteContent() {
  return useQuery({ queryKey: ['site-content'], staleTime: 60_000, queryFn: async () => {
    const { data, error } = await supabase.from('site_content').select('id,page,kind,slot,title,body,buttons,published,position').eq('published', true).order('position');
    if (error) return [];
    return (data ?? []).flatMap(row => { const parsed = siteContentSchema.safeParse(row); return parsed.success ? [parsed.data] : []; });
  } });
}

export function useSiteText() {
  const { data = [] } = useSiteContent();
  const { lang } = useLetter();
  return (slot: string, fallback: string, field: 'title' | 'body' = 'title') => {
    const item = data.find(row => row.kind === 'override' && row.slot === slot);
    return item ? localizedValue(item[field], lang) || fallback : fallback;
  };
}

export function SiteBlocks({ page }: { page: typeof SITE_PAGES[number] }) {
  const { data = [] } = useSiteContent();
  const { lang } = useLetter();
  return <div className="space-y-4">{data.filter(row => row.kind === 'block' && row.page === page).map(row => <ContentBlock key={row.id} row={row} lang={lang} />)}</div>;
}
function ContentBlock({ row, lang }: { row: SiteContent; lang: 'UK' | 'RU' | 'DE' }) {
  return <section className="letter-card mt-4 p-6 sm:p-8">
    <h2 className="text-lg font-bold">{localizedValue(row.title, lang)}</h2>
    {localizedValue(row.body, lang) && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{localizedValue(row.body, lang)}</p>}
    {row.buttons.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{row.buttons.filter(b => safeContentLink(b.href)).map((b, i) => <Button key={i} asChild variant="outline" className="min-h-12 max-w-full whitespace-normal rounded-full"><a href={b.href} {...(b.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{localizedValue(b.label, lang)}</a></Button>)}</div>}
  </section>;
}

export function AdminEntry() {
  const { session, lang } = useLetter();
  const check = useServerFn(getAdminAccess);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => { let live = true; setAllowed(false); if (session) void check().then(r => { if (live) setAllowed(r.admin); }).catch(() => {}); return () => { live = false; }; }, [session?.user.id]);
  return allowed ? <Button asChild variant="outline" className="letter-pill h-12 w-full"><Link to="/admin"><Shield />{adminCopy[lang].nav}</Link></Button> : null;
}
