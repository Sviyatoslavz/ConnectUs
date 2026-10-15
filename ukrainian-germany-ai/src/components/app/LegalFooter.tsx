import { Link } from "@tanstack/react-router";
import connectusMark from "@/assets/connectus-mark.png.asset.json";

export function LegalFooter() {
  return <footer className="app-theme letter-shell relative z-10 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-3 md:pb-8 md:pt-10">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-2">
    <nav aria-label="Legal" className="flex items-center justify-center gap-x-5 text-[11px] text-foreground md:gap-x-6 md:text-sm">
      <Link to="/impressum" className="inline-flex min-h-8 items-center underline underline-offset-4 md:min-h-12">Impressum</Link>
      <Link to="/datenschutz" className="inline-flex min-h-8 items-center underline underline-offset-4 md:min-h-12">Datenschutz</Link>
    </nav>
      <span className="powered-by">
        <img src={connectusMark.url} alt="" width={26} height={26} className="powered-by-mark" />
        <span className="powered-by-label">powered by</span>
        <span className="powered-by-name">ConnectUs</span>
      </span>
    </div>
  </footer>;
}
