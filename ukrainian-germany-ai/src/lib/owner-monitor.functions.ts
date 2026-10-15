import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { assertAdmin, feedbackStatsSchema, ownerSettingsSchema, ownerSubscriptionSchema } from './owner-monitor';
import { z } from 'zod';
export const getOwnerMonitor=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});assertAdmin(role.data,role.error);
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const [stats,settings,subs]=await Promise.all([db.rpc('owner_feedback_statistics'),db.from('owner_push_settings').select('lang,negative_enabled,summary_enabled,alert_enabled,error_threshold,analysis_threshold').eq('user_id',context.userId).maybeSingle(),db.from('owner_push_subscriptions').select('id',{count:'exact',head:true}).eq('user_id',context.userId)]);
 if(stats.error||settings.error||subs.error)throw new Error('ADMIN_LOAD_FAILED');
 return {stats:feedbackStatsSchema.parse(stats.data),settings:ownerSettingsSchema.parse(settings.data??{lang:'UK',negative_enabled:false,summary_enabled:false,alert_enabled:false,error_threshold:20,analysis_threshold:200}),devices:subs.count??0};
});
export const saveOwnerSettings=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>ownerSettingsSchema.parse(v)).handler(async({data,context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});assertAdmin(role.data,role.error);
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const r=await db.from('owner_push_settings').upsert({user_id:context.userId,...data,...(!data.negative_enabled?{pending_down:0}: {})});if(r.error)throw new Error('ADMIN_SAVE_FAILED');return {ok:true};
});
export const registerOwnerPush=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>ownerSubscriptionSchema.parse(v)).handler(async({data,context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});assertAdmin(role.data,role.error);
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const s=await db.from('owner_push_settings').upsert({user_id:context.userId,lang:data.lang},{onConflict:'user_id',ignoreDuplicates:true});if(s.error)throw new Error('ADMIN_SAVE_FAILED');
 const prior=await db.from('owner_push_subscriptions').select('user_id').eq('endpoint',data.endpoint).maybeSingle();if(prior.error||prior.data&&prior.data.user_id!==context.userId)throw new Error('ADMIN_SAVE_FAILED');
 const r=await db.from('owner_push_subscriptions').upsert({user_id:context.userId,endpoint:data.endpoint,p256dh:data.keys.p256dh,auth:data.keys.auth},{onConflict:'endpoint'});if(r.error)throw new Error('ADMIN_SAVE_FAILED');return {ok:true};
});
export const removeOwnerPush=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({endpoint:z.string().max(2000)}).strict().parse(v)).handler(async({data,context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});assertAdmin(role.data,role.error);
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const r=await supabaseAdmin.from('owner_push_subscriptions').delete().eq('user_id',context.userId).eq('endpoint',data.endpoint);if(r.error)throw new Error('ADMIN_SAVE_FAILED');return {ok:true};
});
