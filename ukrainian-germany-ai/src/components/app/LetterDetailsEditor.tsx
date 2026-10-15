import { useState } from "react";
import { Building2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLetter } from "@/components/app/LetterContext";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { isValidEmail } from "@/lib/letter-compose";
import { describeAuthority } from "@/lib/authority";
import { persistAnalysis, saveErrorText } from "@/lib/letter-persist";

type Key = "sender" | "senderAddress" | "senderEmail" | "senderPerson" | "letterDate" | "deadline" | "reference" | "recipientName" | "recipientAddress" | "userEmail" | "userPhone" | "subject";

const T = {
  UK: { fix: "Виправити дані", save: "Зберегти", cancel: "Скасувати", hint: "Звірте з фото листа. Шапка відповіді збереться з цих даних, текст листа не зміниться.", addr: "Адреса відправника", rAddr: "Ваша адреса", saved: "Збережено, шапку оновлено", sEmail: "Email установи (лише якщо є в листі)", uEmail: "Ваш email", uPhone: "Ваш телефон", encl: "Додатки (Anlagen) — по одному в рядку", badEmail: "Перевірте формат email" },
  RU: { fix: "Исправить данные", save: "Сохранить", cancel: "Отмена", hint: "Сверьте с фото письма. Шапка ответа соберётся из этих данных, текст письма не изменится.", addr: "Адрес отправителя", rAddr: "Ваш адрес", saved: "Сохранено, шапка обновлена", sEmail: "Email учреждения (только если есть в письме)", uEmail: "Ваш email", uPhone: "Ваш телефон", encl: "Приложения (Anlagen) — по одному в строке", badEmail: "Проверьте формат email" },
  DE: { fix: "Daten korrigieren", save: "Speichern", cancel: "Abbrechen", hint: "Mit dem Foto vergleichen. Der Briefkopf wird neu erstellt, der Brieftext bleibt unverändert.", addr: "Absenderadresse", rAddr: "Ihre Adresse", saved: "Gespeichert, Briefkopf aktualisiert", sEmail: "E-Mail der Behörde (nur wenn im Brief)", uEmail: "Ihre E-Mail", uPhone: "Ihre Telefonnummer", encl: "Anlagen — eine pro Zeile", badEmail: "E-Mail-Format prüfen" },
};

export function LetterDetailsEditor() {
  const { lang, copy: c, analysis: a, setAnalysis } = useLetter();
  const t = T[lang];
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<Key, string>>({} as Record<Key, string>);
  const [encl, setEncl] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  if (!a) return null;

  const fields: [Key, string][] = [["sender", c.fSender], ["senderAddress", t.addr], ["senderEmail", t.sEmail], ["senderPerson", c.fPerson], ["letterDate", c.fDate], ["deadline", c.deadline], ["reference", c.fRef], ["recipientName", c.fRecipient], ["recipientAddress", t.rAddr], ["userEmail", t.uEmail], ["userPhone", t.uPhone], ["subject", c.fSubject]];
  const view = [[c.fSender, [describeAuthority(a.sender, lang), a.senderAddress].filter(Boolean).join(", ")], ["Email", a.senderEmail], [c.fPerson, a.senderPerson], [c.fDate, a.letterDate], [c.fRef, a.reference], [c.fRecipient, a.recipientName], [c.fSubject, a.subject], ["Anlagen", (a.enclosures ?? []).join(", ")]].filter(([, v]) => v) as [string, string][];
  const badEmail = (k: Key) => (k === "senderEmail" || k === "userEmail") && !!form[k]?.trim() && !isValidEmail(form[k]);
  const invalid = fields.some(([k]) => badEmail(k));

  function start() {
    setForm(Object.fromEntries(fields.map(([k]) => [k, a![k] ?? ""])) as Record<Key, string>);
    setEncl((a!.enclosures ?? []).join("\n"));
    setDone(false); setError(false); setEditing(true);
  }

  async function save() {
    if (!a || invalid) return;
    setBusy(true); setError(false);
    const next: LetterAnalysis = { ...a, enclosures: encl.split("\n").map(s => s.trim()).filter(Boolean) };
    for (const [k] of fields) next[k] = form[k].trim() || null;
    try {
      await persistAnalysis(next);
      setAnalysis(next);
      setEditing(false); setDone(true);
    } catch { setError(true); }
    finally { setBusy(false); }
  }

  return <section className="letter-card p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4" />{c.details}</h2>
      {!editing && <Button variant="outline" className="h-11 rounded-full bg-transparent" onClick={start}><Pencil />{t.fix}</Button>}
    </div>
    {editing ? <div className="mt-4 grid gap-3">
      <p className="text-xs text-muted-foreground">{t.hint}</p>
      {fields.map(([k, label]) => <label key={k} className="grid gap-1 text-sm"><span className="text-muted-foreground">{label}</span>
        <input type={k.endsWith("Email") ? "email" : k === "userPhone" ? "tel" : "text"} aria-invalid={badEmail(k)} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="h-12 rounded-xl border bg-background/70 px-3 outline-none focus:ring-2 focus:ring-ring" />
        {badEmail(k) && <span role="alert" className="text-xs text-destructive">{t.badEmail}</span>}</label>)}
      <label className="grid gap-1 text-sm"><span className="text-muted-foreground">{t.encl}</span>
        <textarea value={encl} onChange={e => setEncl(e.target.value)} rows={3} className="rounded-xl border bg-background/70 p-3 outline-none focus:ring-2 focus:ring-ring" /></label>
      {error && <p role="alert" className="text-sm text-destructive">{saveErrorText[lang]}</p>}
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Button disabled={busy || invalid} className="letter-pill h-12" onClick={() => void save()}><Check />{t.save}</Button>
        <Button variant="outline" className="letter-pill h-12 bg-transparent" onClick={() => setEditing(false)}>{t.cancel}</Button>
      </div>
    </div> : <>
      <dl className="mt-3 grid gap-2 text-sm">{view.map(([k, v]) => <div key={k} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}</dl>
      {done && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Check className="h-4 w-4" />{t.saved}</p>}
    </>}
  </section>;
}
