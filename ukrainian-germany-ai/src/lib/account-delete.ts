export const CONFIRM_WORD = { UK: "ВИДАЛИТИ", RU: "УДАЛИТЬ", DE: "LÖSCHEN" } as const;

/** True only when the typed word matches the confirmation word for the language (trimmed, case-insensitive). */
export function isDeleteConfirmed(input: string, lang: keyof typeof CONFIRM_WORD) {
  return input.trim().toLocaleUpperCase("de-DE") === CONFIRM_WORD[lang];
}

export const deleteCopy = {
  UK: { title: "Видалити мої дані", text: "Ви можете будь-коли стерти свої дані з сервісу. Це не можна скасувати.", data: "Видалити всі мої листи і нагадування", account: "Видалити акаунт і всі дані", confirmData: "Будуть видалені всі ваші листи, нагадування та push-підписки. Акаунт залишиться.", confirmAccount: "Будуть видалені акаунт, листи, нагадування, налаштування, згоди та історія використання.", type: "Щоб підтвердити, введіть", go: "Видалити назавжди", cancel: "Скасувати", done: "Дані видалено", error: "Не вдалося видалити дані. Нічого не змінено — спробуйте ще раз." },
  RU: { title: "Удалить мои данные", text: "Вы можете в любой момент стереть свои данные из сервиса. Это нельзя отменить.", data: "Удалить все мои письма и напоминания", account: "Удалить аккаунт и все данные", confirmData: "Будут удалены все ваши письма, напоминания и push-подписки. Аккаунт останется.", confirmAccount: "Будут удалены аккаунт, письма, напоминания, настройки, согласия и история использования.", type: "Чтобы подтвердить, введите", go: "Удалить навсегда", cancel: "Отмена", done: "Данные удалены", error: "Не удалось удалить данные. Ничего не изменено — попробуйте ещё раз." },
  DE: { title: "Meine Daten löschen", text: "Sie können Ihre Daten jederzeit aus dem Dienst löschen. Das kann nicht rückgängig gemacht werden.", data: "Alle meine Briefe und Erinnerungen löschen", account: "Konto und alle Daten löschen", confirmData: "Alle Briefe, Erinnerungen und Push-Abonnements werden gelöscht. Das Konto bleibt bestehen.", confirmAccount: "Konto, Briefe, Erinnerungen, Einstellungen, Einwilligungen und Nutzungsverlauf werden gelöscht.", type: "Zur Bestätigung eingeben:", go: "Endgültig löschen", cancel: "Abbrechen", done: "Daten gelöscht", error: "Löschen fehlgeschlagen. Es wurde nichts geändert — bitte erneut versuchen." },
} as const;

export const exportCopy = {
  UK: { title: "Копія моїх даних", text: "Завантажте всі збережені про вас дані одним файлом (JSON): листи, розбори, відповіді, нагадування, згоди та історію використання.", go: "Завантажити мої дані", error: "Не вдалося підготувати файл. Спробуйте ще раз." },
  RU: { title: "Копия моих данных", text: "Скачайте все сохранённые о вас данные одним файлом (JSON): письма, разборы, ответы, напоминания, согласия и историю использования.", go: "Скачать мои данные", error: "Не удалось подготовить файл. Попробуйте ещё раз." },
  DE: { title: "Kopie meiner Daten", text: "Laden Sie alle über Sie gespeicherten Daten als eine Datei (JSON) herunter: Briefe, Analysen, Antworten, Erinnerungen, Einwilligungen und Nutzungsverlauf.", go: "Meine Daten herunterladen", error: "Die Datei konnte nicht erstellt werden. Bitte erneut versuchen." },
} as const;
