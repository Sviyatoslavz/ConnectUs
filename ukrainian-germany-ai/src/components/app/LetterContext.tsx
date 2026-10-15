import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { letterCopy, type LetterLanguage } from "@/lib/letter-copy";
import type { LetterAnalysis } from "@/lib/letter-analysis";
import { supabase } from "@/integrations/supabase/client";
import { CONSENT_KIND, CONSENT_VERSION } from "@/lib/consent";

type Letter = { name: string; text: string; url?: string; type?: string };
type Ctx = {
  lang: LetterLanguage; setLang: (l: LetterLanguage) => void; copy: typeof letterCopy.UK;
  letter: Letter | null; setLetter: (l: Letter | null) => void;
  consent: boolean; setConsent: (v: boolean) => void;
  analysis: LetterAnalysis | null; setAnalysis: (a: LetterAnalysis | null) => void;
  session: Session | null; authReady: boolean;
};
// Keep one context instance across hot reloads so provider and consumers always match.
const globalStore = globalThis as unknown as { __letterContext?: import("react").Context<Ctx | null> };
const Context = (globalStore.__letterContext ??= createContext<Ctx | null>(null));
export function LetterProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LetterLanguage>("UK");
  const [letter, setLetterState] = useState<Letter | null>(null);
  const [analysis, setAnalysis] = useState<LetterAnalysis | null>(null);
  const [consent, setConsent] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => { document.documentElement.lang = lang === "UK" ? "uk" : lang.toLowerCase(); }, [lang]);
  useEffect(() => () => { if (letter?.url) URL.revokeObjectURL(letter.url); }, [letter?.url]);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setAuthReady(true); });
    void supabase.auth.getSession().then(({ data: d }) => { setSession(d.session); setAuthReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  const uid = session?.user.id;
  useEffect(() => {
    if (!uid) return;
    void supabase.from("user_settings").select("lang").eq("user_id", uid).maybeSingle().then(({ data }) => { if (data?.lang && ["UK", "RU", "DE"].includes(data.lang)) setLangState(data.lang as LetterLanguage); });
    // A consent already given for the current text version does not need to be asked again.
    void supabase.from("consents").select("id").eq("user_id", uid).eq("kind", CONSENT_KIND).eq("version", CONSENT_VERSION).maybeSingle().then(({ data }) => { if (data) setConsent(true); });
  }, [uid]);
  useEffect(() => { if (authReady && !uid) { setConsent(false); setAnalysis(null); setLetterState(null); } }, [authReady, uid]);
  const setLangState = setLang;
  const saveLang = (l: LetterLanguage) => { setLang(l); if (uid) void supabase.from("user_settings").upsert({ user_id: uid, lang: l, updated_at: new Date().toISOString() }); };
  const setLetter = (l: Letter | null) => { setLetterState(l); setAnalysis(null); };
  return <Context.Provider value={{ lang, setLang: saveLang, copy: letterCopy[lang], letter, setLetter, consent, setConsent, analysis, setAnalysis, session, authReady }}>{children}</Context.Provider>;
}
export function useLetter() { const value = useContext(Context); if (!value) throw new Error("LetterProvider missing"); return value; }
/** For components that may render outside the provider (root error/not-found pages). */
export function useOptionalLetter() { return useContext(Context); }

/** Stores the user's consent to document processing for the current text version (idempotent). */
export async function recordConsent(userId: string, lang: LetterLanguage) {
  const { error } = await supabase.from("consents").upsert({ user_id: userId, kind: CONSENT_KIND, version: CONSENT_VERSION, lang }, { onConflict: "user_id,kind,version", ignoreDuplicates: true });
  if (error) throw new Error("CONSENT_SAVE_FAILED");
}
