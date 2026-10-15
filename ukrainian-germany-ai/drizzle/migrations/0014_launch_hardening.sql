-- Launch hardening: ownership FKs, letter-bound reminders, consent log, atomic self-service deletion.
-- Idempotent so it can be re-applied safely.

-- 1) Every user-owned row disappears together with the auth user (DSGVO Art. 17).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['letters','reminders','push_subscriptions','user_settings','usage_records','reply_usage','assistant_usage','subscriptions','letter_feedback','owner_push_settings','owner_push_subscriptions'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = t || '_user_id_auth_fkey') THEN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE', t, t || '_user_id_auth_fkey');
    END IF;
  END LOOP;
END $$;

-- 2) Deadline reminders belong to their letter: removed with it, and at most one per letter.
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS letter_id uuid REFERENCES public.letters(id) ON DELETE CASCADE;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reminders_user_letter_key') THEN
    ALTER TABLE public.reminders ADD CONSTRAINT reminders_user_letter_key UNIQUE (user_id, letter_id);
  END IF;
END $$;
DROP POLICY IF EXISTS "own reminders" ON public.reminders;
CREATE POLICY "own reminders" ON public.reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND (letter_id IS NULL OR EXISTS (SELECT 1 FROM public.letters l WHERE l.id = letter_id AND l.user_id = auth.uid())));

-- 3) Consent log: proof of the user's consent to document processing (Art. 7 Abs. 1, Art. 9 Abs. 2 lit. a DSGVO).
CREATE TABLE IF NOT EXISTS public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('document_processing')),
  version text NOT NULL CHECK (char_length(version) BETWEEN 1 AND 40),
  lang text NOT NULL CHECK (lang IN ('UK','RU','DE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, version)
);
GRANT SELECT, INSERT ON public.consents TO authenticated;
GRANT ALL ON public.consents TO service_role;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own consents read" ON public.consents;
DROP POLICY IF EXISTS "own consents insert" ON public.consents;
CREATE POLICY "own consents read" ON public.consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own consents insert" ON public.consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4) "Delete my data" runs in one transaction: either everything is removed or nothing.
CREATE OR REPLACE FUNCTION public.delete_user_data(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.owner_push_subscriptions WHERE user_id = _user_id;
  DELETE FROM public.owner_push_settings WHERE user_id = _user_id;
  DELETE FROM public.letter_feedback WHERE user_id = _user_id;
  DELETE FROM public.reminders WHERE user_id = _user_id;
  DELETE FROM public.letters WHERE user_id = _user_id;
  DELETE FROM public.push_subscriptions WHERE user_id = _user_id;
  DELETE FROM public.assistant_usage WHERE user_id = _user_id;
END $$;
REVOKE ALL ON FUNCTION public.delete_user_data(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO service_role;

-- 5) Owner notifications every 5 minutes instead of every minute.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.alter_job(jobid, schedule := '*/5 * * * *') FROM cron.job WHERE jobname = 'owner-notifications';
  END IF;
END $$;
