import { supabase } from "@/integrations/supabase/client";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { composeLetter, letterToText } from "@/lib/letter-compose";

/** Save the edited analysis; reply_de always holds the fully assembled letter. Throws when the save fails. */
export async function persistAnalysis(a: LetterAnalysis) {
  if (!a.id) return;
  const { id, ...stored } = a;
  const { error } = await supabase.from("letters").update({
    sender: a.sender, sender_person: a.senderPerson, letter_date: a.letterDate, deadline: a.deadline,
    reference: a.reference, recipient_name: a.recipientName, subject: a.subject,
    analysis: stored as never, reply_de: letterToText(composeLetter(a)),
  }).eq("id", id);
  if (error) { console.error("letter save failed", error.message); throw new Error("SAVE_FAILED"); }
}

/** Load one of the signed-in user's letters (RLS) as an analysis with its id. */
export async function loadLetter(id: string): Promise<{ analysis: LetterAnalysis; name: string } | null> {
  const { data, error } = await supabase.from("letters").select("id,file_name,subject,analysis").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return { analysis: { ...(data.analysis as unknown as LetterAnalysis), id: data.id }, name: data.subject || data.file_name };
}

export const saveErrorText = {
  UK: "Не вдалося зберегти зміни. Перевірте з’єднання й спробуйте ще раз.",
  RU: "Не удалось сохранить изменения. Проверьте соединение и попробуйте ещё раз.",
  DE: "Änderungen konnten nicht gespeichert werden. Bitte Verbindung prüfen und erneut versuchen.",
} as const;
