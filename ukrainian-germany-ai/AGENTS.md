<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- App pages live under the pathless `_shell` layout; the public `/` entry reuses AppShell and `/auth` remains standalone — keeps letter navigation consistent without duplicate shells. Legacy routes (`/chat`, `/profile`, `/tasks`, `/documents`, `/documents/$id`) only redirect.
- Public legal pages use shared localized copy and an explicit operator config (`legal-config.ts`, incl. AI transfer note and supervisory authority) with an incomplete-data warning; the root footer links to both — keeps disclosures consistent without inventing operator details.
- The only demo content is `letterExample` in `src/lib/demo-data.ts`; it opens as `/result?demo=1` and is always labelled as an example.
- Scope letter-theme tokens to AppShell and its dialogs — legacy standalone pages retain their own styling.
- Fonts are self-hosted via `@fontsource-variable/*` (Inter/Manrope/Onest) — no requests to Google Fonts (DSGVO).
- App page entrance transitions are keyed by pathname inside AppShell and use reduced-motion-aware CSS — shared navigation stays mounted while each page enters without an animation dependency.
- LetterProvider owns language, consent and the active document; `/result` and `/reply` are addressed by `?id=<uuid>` (or `?demo=1`) and load the saved letter via `useRouteLetter`, so reloads and shared links work. Blob URLs are cleaned up on removal; state is cleared on sign-out.
- Document-processing consent (Art. 6/7/9 DSGVO) is stored in the `consents` table with `CONSENT_VERSION` from `src/lib/consent.ts`; `analyzeLetter` refuses to run (`CONSENT_REQUIRED`) without a row for the current version. Bump the version when the consent text changes.
- PDF/DOCX exports are dynamically imported in browser handlers and embed a local Unicode font for PDFs — no server runtime or document upload is required.
- PDF previews use browser-compatible PDF.js 4.x dynamically with a bundled worker and render pages to canvas — newer 6.x requires Map APIs unavailable in common browsers.
- Share Brand and LetterBackground across AppShell/auth; keep silver letter tokens — consistent visuals.
- Render splash visible on server and initial client render, without overlay fade-in; check session storage after hydration — no first-screen flash.
- Letter analysis runs in the authenticated `analyzeLetter` server function (src/lib/letters.functions.ts) through the shared gateway in `src/lib/ai-gateway.server.ts` with a strict schema, validates size/page limits server-side, and saves results to the RLS-protected `letters` table — keeps the AI key server-side and data per user. User-facing AI errors map through `src/lib/ai-errors.ts`.
- Demo example path stays available without login; real uploads require sign-in — so the AI and storage are always tied to an account.
- AI analysis quota is enforced only in SQL functions `reserve_analysis` / `complete_analysis` / `fail_analysis` (service_role only, advisory-locked, idempotent per operation_id) called from `analyzeLetter`; clients have read-only access to `usage_records` and `subscriptions` — so parallel/replayed/forged requests cannot bypass limits. The free limit is passed from `FREE_ANALYSES` in `src/lib/billing.ts` (never hardcoded in SQL or copy) — one value changes it everywhere. No price is shown until real payments exist.
- Reply translations have their own daily limit in SQL (`reply_usage`, `reserve_reply_translation` / `release_reply_translation`, service_role only), independent of analysis quota — limit values live in `src/lib/reply-translate.ts`.
- Self-service data deletion calls the service-role-only SQL function `delete_user_data` (one transaction); account deletion deletes the auth user and every user-owned table cascades via `<table>_user_id_auth_fkey` (migration 0014). Both run in `src/lib/account.functions.ts` with the session user only. `exportMyData` (Art. 15/20) returns the user's rows as JSON.
- Deadline reminders are bound to their letter (`reminders.letter_id`, unique per user+letter, cascade on letter delete). The `reminder-push` cron route runs hourly (migration 0015) and sends at the user's chosen Berlin hour; a reminder is marked notified only after a successful delivery.
- Push subscriptions are registered through `registerPushSubscription` (server function) and removed from this device on sign-out (`src/lib/sign-out.ts`).
- The topic assistant (`/assistant`, 5 modules) uses authenticated `askAssistant` (src/lib/assistant.functions.ts) with zod input, per-module prompts and a strict answer schema in src/lib/assistant-modules.ts; its daily limit lives in SQL `assistant_usage` (`reserve_/release_assistant_question`, service_role only) and conversations are never stored — independent of letter quota.

- Subdirectories have their own `AGENTS.md` (e.g. src/lib); read it before changing files there.
- Owner administration lives at `/admin`; all private reads and writes revalidate `user_roles` through the authenticated client before privileged access. `site_content` stores localized published blocks and explicit UI text overrides; never changes AI prompts, quotas or legal disclosures.
- Learning and assistant photos come from the shared editorial registry with accessible-only captions.
- The daily learning hub (`/learn`) reads public `daily_content`/`course_lessons` written only by the cron route `/api/public/jobs/daily-content`; complete localized lessons in `course-lessons.ts` provide immediate fallback for every course link, and only schema-valid generated lessons replace them — keeps courses usable independently of daily generation without changing official news sources.

- Owner feedback monitoring verifies has_role through the authenticated client before service-only aggregates/settings; separate owner push subscriptions and SQL leases enforce batching, Berlin-day summaries and thresholds, with anonymous AI event counters and authenticated cron sends.
- Primary actions are full-width labelled pills (localized text beside the icon), never icon-only circles; the shell keeps bottom padding above the fixed mobile nav.
- Engagement copy lives in `experience-copy.ts`; `ReadingNote` and `LessonPhrases` present notes and bilingual practice without changing stored lessons or AI prompts.
