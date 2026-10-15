import { useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Q = { question: string; options: string[]; answer: number; explanation: string };

export function LearnQuiz({ items, t }: { items: Q[]; t: Record<string, string> }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  return <ol className="space-y-4">{items.map((q, i) => {
    const p = picked[i];
    return <li key={i} className="lesson-box">
      <p className="font-semibold">{i + 1}. {q.question}</p>
      <div className="mt-2 grid gap-2">{q.options.map((o, j) => {
        const state = p === undefined ? "" : j === q.answer ? "border-success bg-success-soft" : j === p ? "border-destructive bg-destructive/10" : "opacity-60";
        return <Button variant="secondary" key={j} type="button" disabled={p !== undefined} onClick={() => setPicked(s => ({ ...s, [i]: j }))} className={`h-auto min-h-12 justify-start whitespace-normal rounded-xl border px-4 py-3 text-left text-sm leading-relaxed ${state}`}>
          {p !== undefined && j === q.answer && <Check className="h-4 w-4 shrink-0 text-success" />}{p === j && j !== q.answer && <X className="h-4 w-4 shrink-0 text-destructive" />}{o}
        </Button>;
      })}</div>
      {p !== undefined && <p role="status" className="mt-3 rounded-xl border border-border bg-background p-3 text-sm"><b>{p === q.answer ? t["right"] : t["wrong"]}</b> {q.explanation}</p>}
    </li>;
  })}</ol>;
}
