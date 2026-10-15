import type { LetterLanguage } from "./letter-copy";

export const rootCopy: Record<LetterLanguage, { notFoundTitle: string; notFoundText: string; home: string; errorTitle: string; errorText: string; retry: string }> = {
  UK: { notFoundTitle: "Сторінку не знайдено", notFoundText: "Такої сторінки не існує або її перенесено.", home: "На головну", errorTitle: "Сторінка не завантажилася", errorText: "Сталася помилка. Оновіть сторінку або поверніться на головну.", retry: "Спробувати ще раз" },
  RU: { notFoundTitle: "Страница не найдена", notFoundText: "Такой страницы не существует или она перемещена.", home: "На главную", errorTitle: "Страница не загрузилась", errorText: "Произошла ошибка. Обновите страницу или вернитесь на главную.", retry: "Попробовать ещё раз" },
  DE: { notFoundTitle: "Seite nicht gefunden", notFoundText: "Diese Seite gibt es nicht oder sie wurde verschoben.", home: "Zur Startseite", errorTitle: "Die Seite wurde nicht geladen", errorText: "Ein Fehler ist aufgetreten. Laden Sie die Seite neu oder gehen Sie zur Startseite.", retry: "Erneut versuchen" },
};

/** Interface language when no LetterProvider is available: the document language, then the browser language. */
export function uiLangFromDocument(): LetterLanguage {
  if (typeof document === "undefined") return "UK";
  const l = (document.documentElement.lang || (typeof navigator !== "undefined" ? navigator.language : "") || "uk").slice(0, 2).toLowerCase();
  return l === "ru" ? "RU" : l === "de" ? "DE" : "UK";
}
