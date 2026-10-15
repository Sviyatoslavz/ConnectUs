import { z } from 'zod';
import { dayStatsSchema, ownerPushMessage } from './owner-monitor';
import { VAPID_PUBLIC_KEY } from './push';
const claimSchema=z.object({token:z.string(),kind:z.enum(['negative','summary','alert']),count:z.number(),reason:z.string().nullable(),lang:z.enum(['UK','RU','DE']),stats:dayStatsSchema});
/** Called only from verified feedback or authenticated cron; not an RPC. */
export async function dispatchOwnerPush(onlyNegative=false) {
 const privateKey=process.env['VAPID_PRIVATE_KEY'];if(!privateKey)return {sent:0};
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:owners,error}=await db.from('owner_push_settings').select('user_id');if(error)throw new Error('OWNER_PUSH_LOAD_FAILED');
 let sent=0;
 for(const owner of owners??[]){
  // Recheck current role before privileged sends, including cron and feedback callbacks.
  const role=await db.rpc('has_role',{_user_id:owner.user_id,_role:'admin'});if(role.error||role.data!==true)continue;
  const reserved=await db.rpc('claim_owner_push',{_user_id:owner.user_id,_only_negative:onlyNegative});if(reserved.error)throw new Error('OWNER_PUSH_CLAIM_FAILED');
  const parsed=claimSchema.safeParse(reserved.data);if(!parsed.success)continue;const claim=parsed.data;
  let success=false;
  try{
   const subscriptions=await db.from('owner_push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id',owner.user_id);if(subscriptions.error)throw subscriptions.error;
   const {buildPushPayload}=await import('@block65/webcrypto-web-push');
   for(const s of subscriptions.data??[]){try{
    const payload=await buildPushPayload({data:JSON.stringify(ownerPushMessage(claim.kind,claim.count,claim.reason,claim.stats,claim.lang)),options:{ttl:3600}},{endpoint:s.endpoint,expirationTime:null,keys:{p256dh:s.p256dh,auth:s.auth}},{subject:'mailto:support@ukrainian-germany.ai',publicKey:VAPID_PUBLIC_KEY,privateKey});
    const response=await fetch(s.endpoint,payload);
    if(response.status===404||response.status===410){const removed=await db.from('owner_push_subscriptions').delete().eq('id',s.id);if(removed.error)console.error('owner subscription cleanup failed');}
    else if(response.ok){success=true;sent++;}else console.error('owner push HTTP failure',response.status);
   }catch{console.error('owner push delivery failed');}}
  }finally{const finished=await db.rpc('finish_owner_push',{_user_id:owner.user_id,_token:claim.token,_success:success});if(finished.error)console.error('owner push finish failed');}
 }
 return {sent};
}
export async function recordOwnerAiEvent(kind:'error'|'assistant'|'daily_limit'){
 try{const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const r=await supabaseAdmin.from('owner_ai_events').insert({kind});if(r.error)console.error('owner event save failed');}catch{console.error('owner event save failed');}
}
