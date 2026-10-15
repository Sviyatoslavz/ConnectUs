import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, FileText, LayoutGrid, Plus, Pencil, Trash2, ShieldCheck, RefreshCw, ArrowUpRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLetter } from '@/components/app/LetterContext';
import { OwnerMonitor } from '@/components/app/OwnerMonitor';
import { adminCopy } from '@/lib/admin-copy';
import { assistantCopy } from '@/lib/assistant-copy';
import { letterCopy } from '@/lib/letter-copy';
import { getAdminDashboard, saveSiteContent, deleteSiteContent, manageAdminUser } from '@/lib/admin.functions';
import { SITE_PAGES, SITE_SLOTS, emptyText, siteContentSchema, localizedValue, type SiteContent } from '@/lib/site-content';

export const Route = createFileRoute('/_shell/admin')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Управление сайтом — Ukrainian Germany AI' }, { name: 'description', content: 'Закрытая панель владельца: пользователи, тематические блоки и кнопки.' }, { property: 'og:title', content: 'Панель владельца — Ukrainian Germany AI' }, { property: 'og:description', content: 'Управление содержанием сайта.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminPage,
});

type Dashboard = Awaited<ReturnType<typeof getAdminDashboard>>;
function AdminPage() {
  const { lang, session } = useLetter(); const t = adminCopy[lang];
  const load = useServerFn(getAdminDashboard); const save = useServerFn(saveSiteContent); const remove = useServerFn(deleteSiteContent); const manage = useServerFn(manageAdminUser);
  const cache = useQueryClient();
  const [data, setData] = useState<Dashboard | null>(null); const [page, setPage] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'content' | 'users'>('content'); const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<SiteContent | null>(null); const [editLang, setEditLang] = useState<'UK' | 'RU' | 'DE'>(lang);
  const [confirm, setConfirm] = useState<{ type: 'delete'; id: string } | { type: 'user'; userId: string; blocked: boolean } | null>(null);
  async function refresh() {
    setBusy(true); setError('');
    try { setData(await load({ data: { page } })); } catch (e) { setData(null); setError(e instanceof Error && e.message.includes('ADMIN_FORBIDDEN') ? t.denied : t.error); } finally { setBusy(false); }
  }
  useEffect(() => { if (session) void refresh(); else setData(null); }, [page, session?.user.id]);
  async function persist() {
    if (!editing || busy) return;
    const checked = siteContentSchema.safeParse(editing); if (!checked.success) { setError(t.error); return; }
    setBusy(true); setError('');
    try { await save({ data: checked.data }); setEditing(null); setNotice(t.saved); await cache.invalidateQueries({ queryKey: ['site-content'] }); await refresh(); } catch { setError(t.error); } finally { setBusy(false); }
  }
  async function execute() {
    if (!confirm || busy) return; setBusy(true); setError('');
    try { if (confirm.type === 'delete') { await remove({ data: { id: confirm.id } }); await cache.invalidateQueries({ queryKey: ['site-content'] }); } else await manage({ data: { userId: confirm.userId, blocked: confirm.blocked } }); setConfirm(null); await refresh(); } catch { setError(t.error); } finally { setBusy(false); }
  }
  function newBlock() { setError(''); setNotice(''); setEditLang(lang); setEditing({ page: 'home', kind: 'block', slot: null, title: emptyText(), body: emptyText(), buttons: [], published: false, position: 0 }); }
  function editSlot(slot: string) {
    const old = data?.content.find(row => row.slot === slot); const parsed = old ? siteContentSchema.safeParse({ id: old.id, page: old.page, kind: old.kind, slot: old.slot, title: old.title, body: old.body, buttons: old.buttons, published: old.published, position: old.position }) : null;
    if (parsed?.success) setEditing(parsed.data);
    else {
      const title = emptyText(); const body = emptyText();
      for (const l of ['UK', 'RU', 'DE'] as const) {
        const key = slot.split('.')[1] ?? '';
        if (slot.startsWith('home.')) title[l] = letterCopy[l][key as 'title' | 'intro' | 'camera' | 'file'];
        else { const module = assistantCopy[l].modules[key as keyof typeof assistantCopy.UK.modules]; title[l] = module?.title ?? ''; body[l] = module?.desc ?? ''; }
      }
      setEditing({ page: slot.startsWith('home.') ? 'home' : 'assistant', kind: 'override', slot, title, body, buttons: [], published: true, position: 0 });
    }
    setEditLang(lang); setError(''); setNotice('');
  }
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(lang === 'UK' ? 'uk-UA' : lang === 'RU' ? 'ru-RU' : 'de-DE').format(new Date(value)) : '—';
  const blocks = (data?.content ?? []).flatMap(row => { const parsed = siteContentSchema.safeParse({ id: row.id, page: row.page, kind: row.kind, slot: row.slot, title: row.title, body: row.body, buttons: row.buttons, published: row.published, position: row.position }); return parsed.success && row.kind === 'block' ? [parsed.data] : []; });
  return <div className="space-y-6 pb-24 md:pb-0">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5"><div><p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4" />{t.owner}</p><h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1></div><div className="flex gap-2"><Button variant="outline" size="icon" className="h-12 w-12" aria-label={t.refresh} title={t.refresh} disabled={busy || !session} onClick={() => void refresh()}><RefreshCw className={busy ? 'animate-spin' : ''} /></Button><Button asChild variant="outline" className="h-12"><Link to="/">{t.open}<ArrowUpRight /></Link></Button></div></header>
    {!session && <p className="letter-card p-6">{t.denied} <Link to="/auth" className="underline">{lang === 'DE' ? 'Anmelden' : lang === 'UK' ? 'Увійти' : 'Войти'}</Link></p>}
    {error && !editing && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {busy && !data && <p role="status" className="flex gap-2"><Loader2 className="h-5 w-5 animate-spin" />{t.loading}</p>}
    {data && <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[{ label: t.total, value: data.total, icon: Users }, { label: t.letters, value: data.letters, icon: FileText }, { label: t.content, value: blocks.length, icon: LayoutGrid }].map(x => <div key={x.label} className="letter-card min-w-0 p-4 last:col-span-2 sm:p-5 sm:last:col-span-1"><x.icon className="mb-3 h-5 w-5 text-muted-foreground" /><p className="text-3xl font-bold">{x.value}</p><p className="mt-1 text-xs text-muted-foreground sm:text-sm">{x.label}</p></div>)}</div>
      <div role="tablist" className="flex flex-wrap gap-2 border-b pb-4">{(['content', 'users'] as const).map(k => <Button key={k} role="tab" aria-selected={tab === k} variant={tab === k ? 'default' : 'outline'} className="min-h-12 whitespace-normal" onClick={() => setTab(k)}>{k === 'content' ? <LayoutGrid /> : <Users />}{t[k]}</Button>)}</div>
      {tab === 'content' ? <div className="space-y-6">
        <section><h2 className="mb-4 font-bold">{t.overrides}</h2><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{SITE_SLOTS.map(slot => { const key = slot.split('.')[1] ?? ''; const label = slot.startsWith('home.') ? letterCopy[lang][key as 'title' | 'intro' | 'camera' | 'file'] : assistantCopy[lang].modules[key as keyof typeof assistantCopy.UK.modules]?.title; return <Button key={slot} variant="outline" className="h-auto min-h-14 justify-between whitespace-normal text-left" onClick={() => editSlot(slot)}><span className="min-w-0">{label}</span><Pencil className="shrink-0" /></Button>; })}</div></section>
        <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{t.custom}</h2><Button className="h-12" onClick={newBlock}><Plus />{t.add}</Button></div>{!blocks.length && <p className="py-5 text-sm text-muted-foreground">{t.empty}</p>}<div className="grid gap-3 sm:grid-cols-2">{blocks.map(row => <article key={row.id} className="letter-card p-5"><p className="text-xs text-muted-foreground">{t[row.page]} · {row.published ? t.published : t.draft} · {row.position}</p><h3 className="mt-2 font-bold">{localizedValue(row.title, lang) || '—'}</h3><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{localizedValue(row.body, lang)}</p><div className="mt-4 flex gap-2"><Button variant="outline" className="h-12" onClick={() => { setEditing(row); setEditLang(lang); setError(''); }}><Pencil />{t.edit}</Button><Button variant="ghost" size="icon" className="h-12 w-12 text-destructive" title={t.remove} aria-label={t.remove} onClick={() => { if (row.id) setConfirm({ type: 'delete', id: row.id }); }}><Trash2 /></Button></div></article>)}</div></section>
      </div> : <section><Input aria-label={t.search} placeholder={t.search} value={filter} onChange={e => setFilter(e.target.value)} className="mb-4 h-12" /><div className="space-y-3">{data.users.filter(u => u.email.toLowerCase().includes(filter.toLowerCase())).map(u => <article key={u.id} className="letter-card flex flex-wrap items-center justify-between gap-3 p-5"><div className="min-w-0"><p className="break-all font-bold">{u.email || u.id}</p><p className="mt-1 text-xs text-muted-foreground">{t.joined}: {date(u.createdAt)} · {t.last}: {date(u.lastSignIn)}</p><p className={`mt-2 text-xs ${u.blocked ? 'text-destructive' : ''}`}>{u.protected ? t.owner : u.blocked ? t.blocked : t.active}</p></div>{!u.protected && <Button variant="outline" className="h-12" disabled={busy} onClick={() => setConfirm({ type: 'user', userId: u.id, blocked: !u.blocked })}>{u.blocked ? t.unblock : t.block}</Button>}</article>)}</div><div className="mt-4 flex items-center justify-between gap-3"><Button variant="outline" disabled={page === 1 || busy} onClick={() => setPage(p => p - 1)}>{t.prev}</Button><span className="text-sm">{page} / {data.lastPage}</span><Button variant="outline" disabled={page >= data.lastPage || busy} onClick={() => setPage(p => p + 1)}>{t.next}</Button></div></section>}
      <OwnerMonitor />
    </>}
    <Dialog open={Boolean(editing)} onOpenChange={open => { if (!open && !busy) setEditing(null); }}><DialogContent className="app-theme letter-card max-h-[85dvh] max-w-2xl overflow-y-auto"><DialogTitle>{editing?.kind === 'override' ? t.edit : t.custom}</DialogTitle><DialogDescription>{editing?.slot ? t.overrides : t.add}</DialogDescription>{editing && <div className="space-y-4">
      <div role="group" aria-label="Language" className="flex gap-2">{(['UK', 'RU', 'DE'] as const).map(l => <Button key={l} variant={editLang === l ? 'default' : 'outline'} aria-pressed={editLang === l} onClick={() => setEditLang(l)}>{l}</Button>)}</div>
      <label className="block text-sm">{t.heading}<Input aria-label={t.heading} className="mt-2 h-12" value={editing.title[editLang]} maxLength={3000} onChange={e => setEditing({ ...editing, title: { ...editing.title, [editLang]: e.target.value } })} /></label>
      {(editing.kind === 'block' || editing.page === 'assistant') && <label className="block text-sm">{t.body}<Textarea aria-label={t.body} className="mt-2 min-h-28" value={editing.body[editLang]} maxLength={3000} onChange={e => setEditing({ ...editing, body: { ...editing.body, [editLang]: e.target.value } })} /></label>}
      {editing.kind === 'block' && <><div className="grid grid-cols-2 gap-3"><label className="text-sm">{t.page}<select className="mt-2 h-12 w-full rounded-md border bg-background px-3" aria-label={t.page} value={editing.page} onChange={e => setEditing({ ...editing, page: e.target.value as SiteContent['page'] })}>{SITE_PAGES.map(p => <option value={p} key={p}>{t[p]}</option>)}</select></label><label className="text-sm">{t.order}<Input aria-label={t.order} type="number" min={0} max={999} className="mt-2 h-12" value={editing.position} onChange={e => setEditing({ ...editing, position: Number(e.target.value) })} /></label></div>
      {editing.buttons.map((b, i) => <div key={i} className="space-y-2 border-t pt-3"><div className="flex items-end gap-2"><label className="min-w-0 flex-1 text-sm">{t.label}<Input aria-label={`${t.label} ${i + 1}`} className="mt-2 h-12" value={b.label[editLang]} onChange={e => setEditing({ ...editing, buttons: editing.buttons.map((x, j) => j === i ? { ...x, label: { ...x.label, [editLang]: e.target.value } } : x) })} /></label><Button variant="ghost" size="icon" className="h-12 w-12" aria-label={`${t.remove} ${i + 1}`} onClick={() => setEditing({ ...editing, buttons: editing.buttons.filter((_, j) => j !== i) })}><X /></Button></div><label className="block text-sm">{t.link}<Input aria-label={`${t.link} ${i + 1}`} className="mt-2 h-12" value={b.href} placeholder="/assistant" onChange={e => setEditing({ ...editing, buttons: editing.buttons.map((x, j) => j === i ? { ...x, href: e.target.value } : x) })} /></label></div>)}
      <Button variant="outline" className="h-12" disabled={editing.buttons.length >= 8} onClick={() => setEditing({ ...editing, buttons: [...editing.buttons, { label: emptyText(), href: '/' }] })}><Plus />{t.button}</Button></>}
      <label className="flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={editing.published} onChange={e => setEditing({ ...editing, published: e.target.checked })} />{t.visible}</label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex flex-wrap gap-2"><Button disabled={busy} className="h-12 flex-1" onClick={() => void persist()}>{busy && <Loader2 className="animate-spin" />}{t.save}</Button><Button variant="outline" disabled={busy} className="h-12" onClick={() => setEditing(null)}>{t.cancel}</Button></div>
      {editing.kind === 'override' && editing.id && <Button variant="ghost" disabled={busy} className="min-h-12 w-full whitespace-normal" onClick={() => { if (editing.id) { setConfirm({ type: 'delete', id: editing.id }); setEditing(null); } }}>{t.reset}</Button>}
    </div>}</DialogContent></Dialog>
    <Dialog open={Boolean(confirm)} onOpenChange={open => { if (!open && !busy) setConfirm(null); }}><DialogContent className="app-theme letter-card"><DialogTitle>{confirm?.type === 'delete' ? t.deleteQuestion : t.blockQuestion}</DialogTitle><DialogDescription>{confirm?.type === 'user' ? data?.users.find(u => u.id === confirm.userId)?.email : t.custom}</DialogDescription>{error && <p role="alert" className="text-destructive">{error}</p>}<Button variant="destructive" className="h-12" disabled={busy} onClick={() => void execute()}>{t.confirm}</Button><Button variant="outline" className="h-12" disabled={busy} onClick={() => setConfirm(null)}>{t.cancel}</Button></DialogContent></Dialog>
  </div>;
}
