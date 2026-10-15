import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLetter } from "@/components/app/LetterContext";
import { supabase } from "@/integrations/supabase/client";
import { submitFeedback } from "@/lib/feedback.functions";
import { ERROR_TYPES, feedbackCopy } from "@/lib/letter-feedback";

type Err = (typeof ERROR_TYPES)[number];

export function LetterFeedback({ letterId }: { letterId: string }) {
  const { lang } = useLetter(); const t = feedbackCopy[lang];
  const save = useServerFn(submitFeedback);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState<Err | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    void supabase.from("letter_feedback").select("rating").eq("letter_id", letterId).maybeSingle()
      .then(({ data }) => { if (data) { setRating(data.rating as "up" | "down"); setDone(true); } });
  }, [letterId]);

  const send = async (r: "up" | "down") => {
    setBusy(true); setErr(false);
    try { await save({ data: { letterId, rating: r, errorType: r === "down" ? reason : null, comment: r === "down" ? comment.trim() || null : null } }); setRating(r); setDone(true); }
    catch { setErr(true); } finally { setBusy(false); }
  };

  if (done) return <section className="letter-card flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
    <p className="flex items-center gap-2 text-sm font-semibold">{rating === "up" ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}{t.thanks}</p>
    <Button variant="outline" className="h-12 rounded-full" onClick={() => setDone(false)}>{t.change}</Button>
  </section>;

  return <section className="letter-card p-5 sm:p-6">
    <h2 className="text-sm font-semibold">{t.q}</h2>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <Button variant={rating === "up" ? "default" : "outline"} className="h-12 rounded-full text-lg" disabled={busy} aria-label="👍" onClick={() => send("up")}>👍</Button>
      <Button variant={rating === "down" ? "default" : "outline"} className="h-12 rounded-full text-lg" disabled={busy} aria-label="👎" onClick={() => setRating("down")}>👎</Button>
    </div>
    {rating === "down" && <div className="mt-4 grid gap-3">
      <p className="text-sm font-semibold">{t.why}</p>
      <div className="flex flex-wrap gap-2">{ERROR_TYPES.map(k => <button key={k} type="button" onClick={() => setReason(k)} className={`min-h-11 rounded-full border px-4 text-sm ${reason === k ? "bg-foreground text-background" : "bg-secondary"}`}>{t.reasons[k]}</button>)}</div>
      <textarea value={comment} maxLength={500} onChange={e => setComment(e.target.value)} placeholder={t.comment} rows={3} className="w-full rounded-2xl border p-3 text-sm" />
      <Button className="letter-pill h-12" disabled={busy} onClick={() => send("down")}>{t.send}</Button>
    </div>}
    {err && <p role="alert" className="mt-3 text-sm text-destructive">{t.error}</p>}
  </section>;
}
