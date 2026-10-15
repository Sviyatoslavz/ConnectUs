import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLetter } from "@/components/app/LetterContext";
import { loadLetter } from "@/lib/letter-persist";

export type RouteLetterState = "ready" | "loading" | "missing" | "demo" | "login";

/** Resolves the letter shown on /result and /reply: the analysis in memory, a saved letter by ?id=, or the demo by ?demo=1. */
export function useRouteLetter(id: string | undefined, demo: boolean | undefined): RouteLetterState {
  const { analysis, setAnalysis, setLetter, session, authReady } = useLetter();
  const navigate = useNavigate();
  const inMemory = !!analysis && (!id || analysis.id === id);
  const [state, setState] = useState<RouteLetterState>(inMemory ? "ready" : id ? "loading" : demo ? "demo" : "missing");
  useEffect(() => {
    if (inMemory) { setState("ready"); return; }
    if (!id) { if (demo) setState("demo"); else { setState("missing"); void navigate({ to: "/", replace: true }); } return; }
    if (!authReady) { setState("loading"); return; }
    if (!session) { setState("login"); return; }
    let live = true; setState("loading");
    void loadLetter(id).then(found => {
      if (!live) return;
      if (!found) { setState("missing"); return; }
      setLetter({ name: found.name, text: "" });
      setAnalysis(found.analysis);
      setState("ready");
    });
    return () => { live = false; };
  }, [id, demo, inMemory, authReady, session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}
