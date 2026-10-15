import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe, ShieldCheck, Trash2, User, LogOut, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLetter } from "@/components/app/LetterContext";
import { supabase } from "@/integrations/supabase/client";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { ReminderCalendar } from "@/components/app/ReminderCalendar";
import { describeAuthority } from "@/lib/authority";
import { DeleteData } from "@/components/app/DeleteData";
import { AdminEntry } from "@/components/app/SiteContent";
import { signOutOnThisDevice } from "@/lib/sign-out";
export const Route = createFileRoute("/_shell/settings")({
  head: () => ({ meta: [
    { title: "Налаштування — Ukrainian Germany AI" }, { name: "description", content: "Мова інтерфейсу та контроль вашого документа." },
    { property: "og:title", content: "Налаштування — Ukrainian Germany AI" }, { property: "og:description", content: "Українська, російська або німецька. Ваші файли під вашим контролем." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" },
  ] }), component: Settings,
});
const T = {
  UK: { account: "Акаунт", signedAs: "Ви увійшли як", out: "Вийти", in: "Увійти", guest: "Увійдіть, щоб зберігати листи та бачити строки.", dl: "Найближчі строки", none: "Немає листів зі строками.", over: "прострочено", days: "дн." },
  RU: { account: "Аккаунт", signedAs: "Вы вошли как", out: "Выйти", in: "Войти", guest: "Войдите, чтобы сохранять письма и видеть сроки.", dl: "Ближайшие сроки", none: "Нет писем со сроками.", over: "просрочено", days: "дн." },
  DE: { account: "Konto", signedAs: "Angemeldet als", out: "Abmelden", in: "Anmelden", guest: "Melden Sie sich an, um Briefe und Fristen zu sehen.", dl: "Nächste Fristen", none: "Keine Briefe mit Fristen.", over: "überfällig", days: "Tg." },
} as const;
type Row = { id: string; sender: string | null; subject: string | null; deadline: string | null; analysis: unknown };
function parse(d: string) { const m = d.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); return m ? new Date(+m[3]!, +m[2]! - 1, +m[1]!) : null; }

function Deadlines() {
  const { lang, session, setLetter, setAnalysis } = useLetter();
  const t = T[lang]; const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (!session) { setRows([]); return; }
    void supabase.from("letters").select("id,sender,subject,deadline,analysis").not("deadline", "is", null).then(({ data }) => setRows((data ?? []) as Row[]));
  }, [session]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const items = rows.map(r => ({ r, d: r.deadline ? parse(r.deadline) : null })).filter(x => x.d).sort((a, b) => a.d!.getTime() - b.d!.getTime());
  return <>
  <section className="letter-card p-6"><h2 className="flex items-center gap-2 font-semibold"><User className="h-5 w-5" />{t.account}</h2>
    {session ? <><p className="mt-4 text-sm text-muted-foreground">{t.signedAs}</p><p className="truncate font-medium">{session.user.email}</p><Button variant="outline" className="letter-pill mt-5 h-12 w-full" onClick={async () => { await signOutOnThisDevice(); void navigate({ to: "/auth", replace: true }); }}><LogOut />{t.out}</Button></>
      : <><p className="mt-4 text-sm text-muted-foreground">{t.guest}</p><Button className="letter-pill mt-5 h-12 w-full" onClick={() => void navigate({ to: "/auth" })}>{t.in}</Button></>}
  </section>
  {session && <section className="letter-card p-6"><h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-5 w-5" />{t.dl}</h2>
    {items.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">{t.none}</p> : <ul className="mt-4 grid gap-2">{items.map(({ r, d }) => { const n = Math.round((d!.getTime() - today.getTime()) / 864e5); return <li key={r.id}><button className="flex min-h-12 w-full items-center gap-3 rounded-xl border p-3 text-left" onClick={() => { setLetter({ name: r.subject ?? r.sender ?? "", text: "" }); setAnalysis({ ...(r.analysis as LetterAnalysis), id: r.id }); void navigate({ to: "/result", search: { id: r.id } }); }}><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{r.sender ?? r.subject}</span><span className="block text-xs text-muted-foreground">{r.deadline}</span></span><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${n <= 3 ? "bg-destructive text-destructive-foreground" : "bg-foreground text-background"}`}>{n < 0 ? t.over : `${n} ${t.days}`}</span></button></li>; })}</ul>}
  </section>}
  {session && <ReminderCalendar deadlines={items.map(({ r, d }) => ({ title: r.sender ? describeAuthority(r.sender, lang) : r.subject ?? "", date: d! }))} />}
  <AdminEntry />
  {session && <DeleteData lang={lang} onDataDeleted={() => setRows([])} />}</>;
}
function Settings() {
  const { copy: c, lang, setLang, letter, setLetter } = useLetter();
  return <div className="mx-auto max-w-[720px] space-y-4"><header className="letter-card p-6"><h1 className="text-2xl font-semibold">{c.settings}</h1></header><Deadlines /><section className="letter-card p-6"><h2 className="mb-5 flex items-center gap-2 font-semibold"><Globe className="h-5 w-5" />{c.language}</h2><div role="group" aria-label={c.language} className="grid grid-cols-3 gap-2">{(["UK", "RU", "DE"] as const).map(l => <Button key={l} className="letter-pill h-12" variant={l === lang ? "default" : "outline"} aria-pressed={l === lang} onClick={() => setLang(l)}>{l}</Button>)}</div></section><section className="letter-card p-6"><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5" />DSGVO</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.privacy}</p><Button disabled={!letter} variant="outline" className="letter-pill mt-5 h-12 w-full" onClick={() => setLetter(null)}><Trash2 />{c.remove}</Button></section></div>;
}
