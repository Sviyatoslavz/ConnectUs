-- Apply together with the hourly reminder-push code: reminders are sent at the user's chosen time,
-- so the job runs every hour (the code itself waits for the chosen Berlin hour).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.alter_job(jobid, schedule := '7 * * * *') FROM cron.job WHERE jobname = 'reminder-push-daily';
  END IF;
END $$;
