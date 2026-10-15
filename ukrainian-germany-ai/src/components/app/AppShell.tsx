import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { House, Inbox, LifeBuoy, Newspaper, SlidersHorizontal, Settings } from "lucide-react";
import { learnCopy } from "@/lib/learn-content";
import { assistantCopy } from "@/lib/assistant-copy";
import { Button } from "@/components/ui/button";
import { useLetter } from "@/components/app/LetterContext";
import { LegalFooter } from "@/components/app/LegalFooter";
import logoAsset from "@/assets/ug-ai-logo.webp.asset.json";
import backgroundAsset from "@/assets/ukrainian-wave-background.jpg.asset.json";

export function LetterBackground() {
  return <img src={backgroundAsset.url} alt="" aria-hidden="true" className="letter-mesh" />;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  const { copy: c } = useLetter();
  return <Link to="/" aria-label="Ukrainian Germany AI" className="flex min-w-0 items-center gap-3">
    <img src={logoAsset.url} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg object-contain" />
    {!compact && <span className="min-w-0"><span className="block text-sm font-semibold sm:text-base">Ukrainian Germany AI</span><span className="mt-1 block text-[10px] text-muted-foreground sm:text-xs">{c.subtitle} <span className="inline-flex gap-1 align-middle"><span className="letter-flag-uk" role="img" aria-label="🇺🇦" /><span className="letter-flag-de" role="img" aria-label="🇩🇪" /></span></span></span>}
  </Link>;
}
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { lang, setLang, copy: c } = useLetter();
  const SOFT: Record<string, string> = { "Налаштування": "На­лаш­ту­вання", "Einstellungen": "Ein­stel­lun­gen", "Помощник": "По­мощ­ник", "Настройки": "На­строй­ки", "Assistent": "As­sis­tent", "Помічник": "По­міч­ник", "Головна": "Го­лов­на", "Щодня": "Що­дня", "Главная": "Гла­вная", "Täglich": "Täg­lich" }; const nav = [{ to: "/" as const, label: c.home, icon: House }, { to: "/letters" as const, label: c.letters, icon: Inbox }, { to: "/assistant" as const, label: assistantCopy[lang].nav, icon: LifeBuoy }, { to: "/learn" as const, label: learnCopy[lang]["nav"] ?? "", icon: Newspaper }, { to: "/settings" as const, label: c.settings, icon: SlidersHorizontal }];
  return <div className="app-theme letter-shell relative z-10 min-h-screen">
    <LetterBackground />
    <header className="relative z-10 mx-auto max-w-6xl px-4 pt-4 sm:px-8 sm:pt-7">
      <div className="letter-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 sm:flex sm:justify-between sm:px-6">
        <Brand />
        <nav aria-label="Navigation" className="hidden items-center gap-2 md:flex">{nav.map(n => <Button key={n.to} asChild variant="ghost" className="h-12 rounded-full"><Link to={n.to} activeProps={{ className: "bg-secondary" }}>{n.label}</Link></Button>)}</nav>
        <div className="flex shrink-0 items-center gap-1"><div role="group" aria-label={c.language} className="hidden sm:flex">{(["UK", "RU", "DE"] as const).map(l => <Button key={l} variant="ghost" className={`h-12 min-w-12 rounded-full text-xs ${lang === l ? "bg-secondary" : ""}`} onClick={() => setLang(l)} aria-pressed={lang === l}>{l}</Button>)}</div><Button asChild size="icon" variant="ghost" className="h-12 w-12 rounded-full"><Link to="/settings" aria-label={c.settings}><Settings className="!h-5 !w-5" /></Link></Button></div>
      </div>
      <div role="group" aria-label={c.language} className="letter-card mx-auto mt-3 flex w-fit p-1 sm:hidden">{(["UK", "RU", "DE"] as const).map(l => <Button key={l} variant={lang === l ? "default" : "ghost"} className="h-12 min-w-14 rounded-full text-xs" onClick={() => setLang(l)} aria-pressed={lang === l}>{l}</Button>)}</div>
    </header>
    <main className="relative z-10 mx-auto max-w-6xl px-4 pb-4 pt-5 sm:px-8 sm:pt-10 md:pb-12"><div key={pathname} className="app-page-enter">{children}</div></main>
    <LegalFooter />
    <nav aria-label="Основна навігація" className="letter-bottom fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 gap-1 rounded-3xl p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden">{nav.map(n => { const on = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to); return <Link key={n.to} to={n.to} title={n.label} aria-current={on ? "page" : undefined} className={`app-tab flex h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><n.icon className="h-[22px] w-[22px] shrink-0" strokeWidth={1.9} /><span className="line-clamp-2 w-full text-center text-[10px] font-medium leading-[1.1] [overflow-wrap:break-word]">{SOFT[n.label] ?? n.label}</span></Link>; })}</nav>
  </div>;
}
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="letter-card mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 p-5"><div className="min-w-0"><h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>{action}</div>;
}
