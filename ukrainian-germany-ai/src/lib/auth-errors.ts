export function isRateLimitError(message: string, status?: number): boolean {
  return status === 429 || /for security purposes|rate limit|too many requests/i.test(message);
}

export const rateLimitText = {
  UK: "Зачекайте кілька секунд і спробуйте ще раз",
  RU: "Подождите несколько секунд и попробуйте ещё раз",
  DE: "Bitte warten Sie einige Sekunden und versuchen Sie es erneut",
} as const;

const AUTH_ERRORS = {
  UK: { generic: "Помилка. Спробуйте ще раз.", invalid: "Неправильний email або пароль.", exists: "Акаунт із цим email уже існує. Увійдіть або скиньте пароль.", weak: "Пароль занадто слабкий: щонайменше 8 символів.", unconfirmed: "Спочатку підтвердьте email за посиланням у листі." },
  RU: { generic: "Ошибка. Попробуйте ещё раз.", invalid: "Неверный email или пароль.", exists: "Аккаунт с этим email уже существует. Войдите или сбросьте пароль.", weak: "Пароль слишком слабый: минимум 8 символов.", unconfirmed: "Сначала подтвердите email по ссылке в письме." },
  DE: { generic: "Fehler. Bitte erneut versuchen.", invalid: "E-Mail oder Passwort ist falsch.", exists: "Für diese E-Mail gibt es bereits ein Konto. Bitte anmelden oder Passwort zurücksetzen.", weak: "Passwort zu schwach: mindestens 8 Zeichen.", unconfirmed: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link." },
} as const;

/** Maps Supabase Auth error messages to the interface language. */
export function authErrorText(message: string, status: number | undefined, lang: keyof typeof AUTH_ERRORS) {
  const t = AUTH_ERRORS[lang];
  if (isRateLimitError(message, status)) return rateLimitText[lang];
  if (/invalid login credentials/i.test(message)) return t.invalid;
  if (/already registered|already exists/i.test(message)) return t.exists;
  if (/password/i.test(message) && /(weak|short|least|characters)/i.test(message)) return t.weak;
  if (/email not confirmed/i.test(message)) return t.unconfirmed;
  return t.generic;
}
