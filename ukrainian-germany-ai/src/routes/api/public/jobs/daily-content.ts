import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Daily scheduled job: generates today's learning card (UK/RU/DE) and a few missing course lessons.
export const Route = createFileRoute("/api/public/jobs/daily-content")({
  server: { handlers: { POST: async ({ request }) => {
    const authFailure = await authenticateCronRequest(request);
    if (authFailure) return authFailure;
    const { berlinToday } = await import("@/lib/push");
    const { runContentJob } = await import("@/lib/learn-generate");
    return Response.json(await runContentJob(berlinToday()));
  } } },
});
