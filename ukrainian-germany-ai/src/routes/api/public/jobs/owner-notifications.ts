import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
export const Route=createFileRoute('/api/public/jobs/owner-notifications')({server:{handlers:{POST:async({request})=>{
 const denied=await authenticateCronRequest(request);if(denied)return denied;
 const {dispatchOwnerPush}=await import('@/lib/owner-monitor.server');
 try{return Response.json(await dispatchOwnerPush());}catch{console.error('owner notification job failed');return Response.json({error:'job_failed'},{status:500});}
}}}});
