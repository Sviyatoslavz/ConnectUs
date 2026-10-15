import { useState } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { experienceCopy } from '@/lib/experience-copy';
import type { Lang, LessonPayload } from '@/lib/learn-content';

function Phrase({ phrase, index, lang }: { phrase: LessonPayload['phrases'][number]; index: number; lang: Lang }) {
  const t = experienceCopy[lang];
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(phrase.de); setCopied(true); setError(false); }
    catch { setError(true); }
  };
  return <li className="phrase-study overflow-hidden rounded-2xl border border-border">
    <div className="p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-bold text-background">{String(index + 1).padStart(2, '0')}</span><p className="text-xs font-bold text-muted-foreground">{t.say}</p></div>
      <p lang="de" className="text-xl font-bold leading-relaxed sm:text-2xl">{phrase.de}</p>
      {phrase.when && <p className="mt-4 text-sm leading-relaxed text-muted-foreground"><span className="font-bold">{t.when}: </span>{phrase.when}</p>}
    </div>
    {visible && <div className="phrase-translation border-t border-border px-5 py-4 sm:px-6"><p className="text-xs font-bold text-muted-foreground">{t.translation}</p><p className="mt-2 text-base leading-relaxed" lang={lang === 'RU' ? 'ru' : lang === 'UK' ? 'uk' : 'de'}>{phrase.tr}</p></div>}
    <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-2">
      <Button variant="ghost" className="h-auto min-h-12 whitespace-normal rounded-full text-sm" aria-expanded={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff /> : <Eye />}{visible ? t.hide : t.reveal}</Button>
      <Button variant="outline" className="h-auto min-h-12 whitespace-normal rounded-full text-sm" onClick={() => void copy()}>{copied ? <Check /> : <Copy />}{copied ? t.copied : t.copy}</Button>
    </div>
    {error && <p role="status" className="px-5 pb-4 text-sm text-destructive">{t.copyFailed}</p>}
  </li>;
}

export function LessonPhrases({ phrases, lang }: { phrases: LessonPayload['phrases']; lang: Lang }) {
  return <ol className="mt-4 grid gap-4">{phrases.map((phrase, index) => <Phrase key={`${lang}-${phrase.de}`} phrase={phrase} index={index} lang={lang} />)}</ol>;
}
