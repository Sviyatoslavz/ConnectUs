import { z } from "zod";

export const ERROR_TYPES = ["deadline", "type", "explanation", "translation", "other"] as const;

export const feedbackSchema = z.object({
  letterId: z.string().uuid(),
  rating: z.enum(["up", "down"]),
  errorType: z.enum(ERROR_TYPES).nullable().optional(),
  comment: z.string().trim().max(500).nullable().optional(),
}).strict().transform((d) => ({
  letterId: d.letterId,
  rating: d.rating,
  errorType: d.rating === "down" ? d.errorType ?? null : null,
  comment: d.rating === "down" && d.comment ? d.comment : null,
}));
export type FeedbackInput = z.output<typeof feedbackSchema>;

/** Throws unless the letter row exists and belongs to the caller. */
export function assertOwnLetter(row: { user_id: string } | null | undefined, userId: string) {
  if (!row || row.user_id !== userId) throw new Error("letter_not_found");
}

export const feedbackCopy = {
  UK: { q: "Чи був розбір корисним?", thanks: "Дякуємо!", change: "Змінити оцінку", why: "Що було не так?", comment: "Коментар (необов’язково)", send: "Надіслати", error: "Не вдалося зберегти оцінку. Спробуйте ще раз.", reasons: { deadline: "Неправильний строк", type: "Неправильний тип документа", explanation: "Незрозуміле пояснення", translation: "Поганий переклад", other: "Інше" } },
  RU: { q: "Был ли разбор полезен?", thanks: "Спасибо!", change: "Изменить оценку", why: "Что было не так?", comment: "Комментарий (необязательно)", send: "Отправить", error: "Не удалось сохранить оценку. Попробуйте ещё раз.", reasons: { deadline: "Неправильный срок", type: "Неправильный тип документа", explanation: "Непонятное объяснение", translation: "Плохой перевод", other: "Другое" } },
  DE: { q: "War die Analyse hilfreich?", thanks: "Danke!", change: "Bewertung ändern", why: "Was war nicht richtig?", comment: "Kommentar (optional)", send: "Senden", error: "Bewertung konnte nicht gespeichert werden. Bitte erneut versuchen.", reasons: { deadline: "Falsche Frist", type: "Falscher Dokumenttyp", explanation: "Unverständliche Erklärung", translation: "Schlechte Übersetzung", other: "Sonstiges" } },
} as const;
