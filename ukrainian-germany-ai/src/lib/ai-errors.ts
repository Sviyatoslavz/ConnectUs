import type { LetterLanguage } from "./letter-copy";

/** Server error codes for AI features, mapped to the interface language. */
export const AI_ERROR_CODES = ["AI_CREDITS", "AI_RATE", "AI_BLOCKED", "ANALYZE_FAILED", "CONSENT_REQUIRED", "PDF_TOO_LONG", "FILE_TOO_LARGE", "BAD_FILE"] as const;
export type AiErrorCodeUi = (typeof AI_ERROR_CODES)[number];

export function aiErrorCodeOf(message: string): AiErrorCodeUi | null {
  return AI_ERROR_CODES.find(c => message.includes(c)) ?? null;
}

export const aiErrorText: Record<LetterLanguage, Record<AiErrorCodeUi, string>> = {
  UK: {
    AI_CREDITS: "Сервіс тимчасово недоступний. Розбір не списано — спробуйте пізніше.",
    AI_RATE: "Забагато запитів. Зачекайте хвилину й спробуйте ще раз.",
    AI_BLOCKED: "Сервіс тимчасово недоступний. Розбір не списано — спробуйте пізніше.",
    ANALYZE_FAILED: "Не вдалося розібрати лист. Розбір не списано — спробуйте чіткіше фото або PDF.",
    CONSENT_REQUIRED: "Підтвердьте згоду на обробку документа й спробуйте ще раз.",
    PDF_TOO_LONG: "PDF має понад 5 сторінок. Оберіть коротший документ.",
    FILE_TOO_LARGE: "Файл завеликий. Оберіть файл до 20 МБ.",
    BAD_FILE: "Не вдалося відкрити файл. Перевірте, чи він не пошкоджений або захищений паролем.",
  },
  RU: {
    AI_CREDITS: "Сервис временно недоступен. Разбор не списан — попробуйте позже.",
    AI_RATE: "Слишком много запросов. Подождите минуту и попробуйте ещё раз.",
    AI_BLOCKED: "Сервис временно недоступен. Разбор не списан — попробуйте позже.",
    ANALYZE_FAILED: "Не удалось разобрать письмо. Разбор не списан — попробуйте более чёткое фото или PDF.",
    CONSENT_REQUIRED: "Подтвердите согласие на обработку документа и попробуйте ещё раз.",
    PDF_TOO_LONG: "В PDF больше 5 страниц. Выберите более короткий документ.",
    FILE_TOO_LARGE: "Файл слишком большой. Выберите файл до 20 МБ.",
    BAD_FILE: "Не удалось открыть файл. Проверьте, не повреждён ли он и не защищён ли паролем.",
  },
  DE: {
    AI_CREDITS: "Der Dienst ist vorübergehend nicht verfügbar. Nichts wurde abgerechnet — bitte später erneut versuchen.",
    AI_RATE: "Zu viele Anfragen. Bitte warten Sie eine Minute und versuchen Sie es erneut.",
    AI_BLOCKED: "Der Dienst ist vorübergehend nicht verfügbar. Nichts wurde abgerechnet — bitte später erneut versuchen.",
    ANALYZE_FAILED: "Der Brief konnte nicht analysiert werden. Nichts wurde abgerechnet — versuchen Sie ein schärferes Foto oder ein PDF.",
    CONSENT_REQUIRED: "Bitte bestätigen Sie die Einwilligung zur Dokumentverarbeitung und versuchen Sie es erneut.",
    PDF_TOO_LONG: "Das PDF hat mehr als 5 Seiten. Wählen Sie ein kürzeres Dokument.",
    FILE_TOO_LARGE: "Die Datei ist zu groß. Wählen Sie eine Datei bis 20 MB.",
    BAD_FILE: "Datei nicht lesbar. Prüfen Sie auf Schäden oder Passwortschutz.",
  },
};
