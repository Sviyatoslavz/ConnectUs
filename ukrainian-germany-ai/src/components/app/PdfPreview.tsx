import { useEffect, useRef, useState } from "react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function PdfPreview({ url, name }: { url: string; name: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1); const [count, setCount] = useState(1); const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    async function render() {
      try {
        const pdfjs = await import("pdfjs-dist"); pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const data = new Uint8Array(await (await fetch(url)).arrayBuffer());
        const task = pdfjs.getDocument({ data }); cleanup = () => { void task.destroy(); };
        const pdf = await task.promise;
        if (cancelled) return;
        setCount(pdf.numPages);
        const sheet = await pdf.getPage(page); const viewport = sheet.getViewport({ scale: 1.5 });
        const element = canvas.current; if (!element || cancelled) return;
        const ctx = element.getContext("2d"); if (!ctx) return;
        element.width = viewport.width; element.height = viewport.height;
        await sheet.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) { if (!cancelled) { console.error("PDF preview failed", e); setError(true); } }
    }
    void render();
    return () => { cancelled = true; cleanup?.(); };
  }, [url, page]);
  return <div>{error ? <a href={url} target="_blank" rel="noreferrer" className="underline">{name}</a> : <canvas ref={canvas} aria-label={name} className="h-auto w-full" />}<div className="mt-3 flex items-center justify-center gap-3"><Button variant="ghost" size="icon" aria-label="Previous page" className="h-12 w-12" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft /></Button><span className="text-xs">{page} / {count}</span><Button variant="ghost" size="icon" aria-label="Next page" className="h-12 w-12" disabled={page >= count} onClick={() => setPage(p => p + 1)}><ChevronRight /></Button></div></div>;
}
