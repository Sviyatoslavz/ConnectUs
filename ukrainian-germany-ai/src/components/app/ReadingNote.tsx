import { Lightbulb } from 'lucide-react';

export function ReadingNote({ title, children }: { title: string; children: React.ReactNode }) {
  return <aside className="reading-note flex items-start gap-3">
    <Lightbulb aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
    <div className="min-w-0"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-sm leading-relaxed">{children}</p></div>
  </aside>;
}
