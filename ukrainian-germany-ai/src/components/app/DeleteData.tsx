import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CONFIRM_WORD, deleteCopy, exportCopy, isDeleteConfirmed } from "@/lib/account-delete";
import { deleteMyAccount, deleteMyData } from "@/lib/account.functions";
import { exportMyData } from "@/lib/data-export.functions";
import { unsubscribeThisDevice } from "@/lib/push";

export function DeleteData({ lang, onDataDeleted }: { lang: "UK" | "RU" | "DE"; onDataDeleted?: () => void }) {
  const t = deleteCopy[lang];
  const x = exportCopy[lang];
  const navigate = useNavigate();
  const delData = useServerFn(deleteMyData);
  const delAccount = useServerFn(deleteMyAccount);
  const exportData = useServerFn(exportMyData);
  const [mode, setMode] = useState<"data" | "account" | null>(null);
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const close = () => { if (!busy) { setMode(null); setWord(""); setError(""); } };
  const run = async () => {
    setBusy(true); setError("");
    try {
      if (mode === "account") {
        await delAccount();
        await unsubscribeThisDevice(async () => undefined);
        await supabase.auth.signOut();
        toast.success(t.done);
        void navigate({ to: "/", replace: true });
      } else {
        await delData();
        await unsubscribeThisDevice(async () => undefined);
        toast.success(t.done);
        onDataDeleted?.();
      }
      setBusy(false); setMode(null); setWord("");
    } catch { setBusy(false); setError(t.error); }
  };
  const download = async () => {
    setExporting(true); setExportError(false);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `ukrainian-germany-ai-data-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setExportError(true); }
    finally { setExporting(false); }
  };
  return <>
  <section className="letter-card p-6">
    <h2 className="flex items-center gap-2 font-semibold"><Download className="h-5 w-5" />{x.title}</h2>
    <p className="mt-4 text-sm text-muted-foreground">{x.text}</p>
    <Button variant="outline" disabled={exporting} className="letter-pill mt-5 h-12 w-full whitespace-normal" onClick={() => void download()}><Download />{x.go}</Button>
    {exportError && <p role="alert" className="mt-2 text-sm text-destructive">{x.error}</p>}
  </section>
  <section className="letter-card p-6">
    <h2 className="flex items-center gap-2 font-semibold"><Trash2 className="h-5 w-5" />{t.title}</h2>
    <p className="mt-4 text-sm text-muted-foreground">{t.text}</p>
    <div className="mt-5 grid gap-2">
      <Button variant="outline" className="letter-pill h-12 w-full whitespace-normal" onClick={() => setMode("data")}><Trash2 />{t.data}</Button>
      <Button variant="outline" className="letter-pill h-auto min-h-12 w-full whitespace-normal text-destructive" onClick={() => setMode("account")}><UserX />{t.account}</Button>
    </div>
    <Dialog open={mode !== null} onOpenChange={o => { if (!o) close(); }}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader><DialogTitle>{mode === "account" ? t.account : t.data}</DialogTitle><DialogDescription>{mode === "account" ? t.confirmAccount : t.confirmData}</DialogDescription></DialogHeader>
        <label className="text-sm">{t.type} <b>{CONFIRM_WORD[lang]}</b><Input className="mt-2 h-12" value={word} onChange={e => setWord(e.target.value)} autoComplete="off" /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-12" onClick={close} disabled={busy}>{t.cancel}</Button>
          <Button variant="destructive" className="h-12" disabled={busy || !isDeleteConfirmed(word, lang)} onClick={() => void run()}>{t.go}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
  </>;
}
