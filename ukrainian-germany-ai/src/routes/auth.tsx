import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand, LetterBackground } from "@/components/app/AppShell";
import { useLetter } from "@/components/app/LetterContext";
import { supabase } from "@/integrations/supabase/client";
import { authErrorText } from "@/lib/auth-errors";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Вхід — Ukrainian Germany AI" },
      { name: "description", content: "Увійдіть, щоб AI розбирав ваші листи та зберігав відповіді." },
      { property: "og:title", content: "Вхід — Ukrainian Germany AI" },
      { property: "og:description", content: "Ваші листи та відповіді — в одному місці." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "reset";

const T = {
  UK: { login: "З поверненням", register: "Створити акаунт", reset: "Відновити пароль", resetHint: "Надішлемо посилання для скидання на вашу пошту.", lead: "Ваші листи та відповіді — в одному місці.", tabLogin: "Вхід", tabRegister: "Реєстрація", google: "Продовжити з Google", password: "Пароль", forgot: "Забули пароль?", doLogin: "Увійти", doRegister: "Зареєструватися", doReset: "Надіслати посилання", back: "← Назад до входу", home: "← На головну", confirm: "Перевірте пошту та підтвердьте реєстрацію.", sent: "Посилання надіслано на пошту.", googleFail: "Не вдалося увійти через Google.", generic: "Помилка. Спробуйте ще раз.", invalid: "Неправильний email або пароль.", exists: "Акаунт із цим email уже існує. Увійдіть або скиньте пароль.", weak: "Пароль занадто слабкий: щонайменше 8 символів.", unconfirmed: "Спочатку підтвердьте email за посиланням у листі.", min: "Щонайменше 8 символів", language: "Мова" },
  RU: { login: "С возвращением", register: "Создать аккаунт", reset: "Восстановить пароль", resetHint: "Отправим ссылку для сброса на вашу почту.", lead: "Ваши письма и ответы — в одном месте.", tabLogin: "Вход", tabRegister: "Регистрация", google: "Продолжить с Google", password: "Пароль", forgot: "Забыли пароль?", doLogin: "Войти", doRegister: "Зарегистрироваться", doReset: "Отправить ссылку", back: "← Назад ко входу", home: "← На главную", confirm: "Проверьте почту и подтвердите регистрацию.", sent: "Ссылка отправлена на почту.", googleFail: "Не удалось войти через Google.", generic: "Ошибка. Попробуйте ещё раз.", invalid: "Неверный email или пароль.", exists: "Аккаунт с этим email уже существует. Войдите или сбросьте пароль.", weak: "Пароль слишком слабый: минимум 8 символов.", unconfirmed: "Сначала подтвердите email по ссылке в письме.", min: "Минимум 8 символов", language: "Язык" },
  DE: { login: "Willkommen zurück", register: "Konto erstellen", reset: "Passwort zurücksetzen", resetHint: "Wir senden Ihnen einen Link zum Zurücksetzen per E-Mail.", lead: "Ihre Briefe und Antworten an einem Ort.", tabLogin: "Anmelden", tabRegister: "Registrieren", google: "Weiter mit Google", password: "Passwort", forgot: "Passwort vergessen?", doLogin: "Anmelden", doRegister: "Registrieren", doReset: "Link senden", back: "← Zurück zur Anmeldung", home: "← Zur Startseite", confirm: "Bitte prüfen Sie Ihr Postfach und bestätigen Sie die Registrierung.", sent: "Der Link wurde per E-Mail gesendet.", googleFail: "Anmeldung mit Google fehlgeschlagen.", generic: "Fehler. Bitte erneut versuchen.", invalid: "E-Mail oder Passwort ist falsch.", exists: "Für diese E-Mail gibt es bereits ein Konto. Bitte anmelden oder Passwort zurücksetzen.", weak: "Passwort zu schwach: mindestens 8 Zeichen.", unconfirmed: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link.", min: "Mindestens 8 Zeichen", language: "Sprache" },
} as const;

function AuthPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLetter();
  const t = T[lang];
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const title = { login: t.login, register: t.register, reset: t.reset }[mode];

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setMsg("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void navigate({ to: "/" });
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (data.session) void navigate({ to: "/" }); else setMsg(t.confirm);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMsg(t.sent);
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      const status = (e as { status?: number })?.status;
      setErr(authErrorText(m, status, lang));
    }
    finally { setBusy(false); }
  }

  async function google() {
    setErr("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setErr(t.googleFail); return; }
    if (result.redirected) return;
    void navigate({ to: "/" });
  }

  return (
    <div className="app-theme letter-shell grid min-h-screen place-items-center px-5 py-10">
      <LetterBackground />
      <div className="letter-card w-full max-w-sm p-6">
        <div className="flex items-start justify-between gap-2"><Brand compact /><div role="group" aria-label={t.language} className="flex">{(["UK", "RU", "DE"] as const).map(l => <Button key={l} type="button" variant="ghost" className={`h-11 min-w-11 rounded-full px-2 text-xs ${lang === l ? "bg-secondary" : ""}`} aria-pressed={lang === l} onClick={() => setLang(l)}>{l}</Button>)}</div></div>
        <h1 className="mt-8 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{mode === "reset" ? t.resetHint : t.lead}</p>

        {mode !== "reset" && (
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-medium">
            {(["login", "register"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`min-h-11 rounded-lg transition ${mode === m ? "bg-card shadow-card" : "text-muted-foreground"}`}>{m === "login" ? t.tabLogin : t.tabRegister}</button>
            ))}
          </div>
        )}

        {mode !== "reset" && <Button type="button" variant="outline" className="letter-pill mt-6 h-12 w-full bg-transparent" onClick={() => void google()}>{t.google}</Button>}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl" placeholder="you@example.com" /></div>
          {mode !== "reset" && (
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label htmlFor="pw">{t.password}</Label>{mode === "login" && <button type="button" onClick={() => setMode("reset")} className="text-xs text-primary">{t.forgot}</button>}</div>
              <Input id="pw" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 8 : 6} value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-xl" />
              {mode === "register" && <p className="text-xs text-muted-foreground">{t.min}</p>}
            </div>
          )}
          <Button type="submit" disabled={busy} className="letter-pill h-12 w-full">{mode === "login" ? t.doLogin : mode === "register" ? t.doRegister : t.doReset}</Button>
          {mode === "reset" && <button type="button" onClick={() => setMode("login")} className="min-h-11 w-full text-sm text-muted-foreground">{t.back}</button>}
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          {msg && <p role="status" className="text-sm">{msg}</p>}
        </form>
        <p className="mt-6 text-center text-sm"><Link to="/datenschutz" className="inline-flex min-h-12 items-center underline underline-offset-4">Datenschutz</Link></p>
        <p className="mt-8 text-center text-xs text-muted-foreground"><Link to="/" className="text-primary">{t.home}</Link></p>
      </div>
    </div>
  );
}
