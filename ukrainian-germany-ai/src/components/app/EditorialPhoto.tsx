import { editorialCopy } from "@/lib/editorial-photos";
import type { Lang } from "@/lib/learn-content";

export function EditorialPhoto({ src, alt, lang, eager = false, compact = false }: { src: string; alt: string; lang: Lang; eager?: boolean; compact?: boolean }) {
  return <figure className="min-w-0 overflow-hidden">
    <img src={src} alt={alt} width={1536} height={1024} loading={eager ? "eager" : "lazy"} className={`w-full object-cover ${compact ? "aspect-[3/2]" : "aspect-[16/9]"}`} />
    <figcaption className="sr-only">{editorialCopy[lang].illustration}</figcaption>
  </figure>;
}
