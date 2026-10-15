import { describe,it,expect,vi } from 'vitest';
import { assertAdmin,feedbackStatsSchema,ownerSettingsSchema,negativeDue,ownerPushMessage,ownerCopy,ownerSubscriptionSchema } from '../lib/owner-monitor';
const stats={day:'2026-10-14',users:4,analyses:12,assistant:9,up:8,down:2,errors:21,dailyLimit:false};
const period={up:8,down:2,percent:80,reasons:{deadline:2}};
describe('owner monitoring',()=>{
 it('denies non-admin and failed role checks',()=>{for(const v of [false,null,undefined,'admin',1])expect(()=>assertAdmin(v)).toThrow('ADMIN_FORBIDDEN');expect(()=>assertAdmin(true,new Error())).toThrow();expect(()=>assertAdmin(true)).not.toThrow();});
 it('strips ids, email and letter contents from aggregates and comments',()=>{const result=feedbackStatsSchema.parse({user_id:'secret',email:'secret@example.test',periods:{all:period,week:period,today:period},comments:[{date:'2026-10-14',reason:'deadline',comment:'Please check',user_id:'secret',email:'secret@example.test',letter_text:'private'}]});expect(JSON.stringify(result)).not.toMatch(/user_id|email|letter_text|secret/);expect(result.comments[0]?.comment).toBe('Please check');});
 it('allows first push immediately',()=>expect(negativeDue(null,new Date('2026-10-14T12:00Z'))).toBe(true));
 it('blocks repeated negative push before ten minutes',()=>expect(negativeDue('2026-10-14T12:00:00Z',new Date('2026-10-14T12:09:59Z'))).toBe(false));
 it('permits push at exactly ten minutes',()=>expect(negativeDue('2026-10-14T12:00:00Z',new Date('2026-10-14T12:10:00Z'))).toBe(true));
 it('groups accumulated negatives without identifying data',()=>{expect(ownerPushMessage('negative',7,'deadline',stats,'RU')).toEqual({title:'7 новых 👎',body:'7 новых 👎',url:'/admin'});expect(ownerPushMessage('negative',1,'deadline',stats,'RU').body).toBe('Неправильный срок');});
 it('formats all six daily counters in three languages',()=>{for(const lang of ['UK','RU','DE'] as const){const message=ownerPushMessage('summary',0,null,stats,lang);expect(message.title).toContain('2026-10-14');for(const n of [4,12,9,8,2,21])expect(message.body).toContain(String(n));expect(message.body).not.toMatch(/email|user_id/);expect(ownerCopy[lang].enable.length).toBeGreaterThan(0);}});
 it('uses default error threshold 20 and rejects forged settings',()=>{const input={lang:'UK',negative_enabled:false,summary_enabled:false,alert_enabled:false,error_threshold:20,analysis_threshold:200};expect(ownerSettingsSchema.parse(input).error_threshold).toBe(20);expect(ownerSettingsSchema.safeParse({...input,error_threshold:0}).success).toBe(false);expect(ownerSettingsSchema.safeParse({...input,user_id:'forged'}).success).toBe(false);});
 it('rejects push endpoints that could access private servers',()=>{const input={lang:'UK',keys:{p256dh:'a'.repeat(87),auth:'b'.repeat(22)}};for(const endpoint of ['https://localhost/x','http://fcm.googleapis.com/x','https://evil.test/x','https://user:password@fcm.googleapis.com/x'])expect(ownerSubscriptionSchema.safeParse({...input,endpoint}).success).toBe(false);expect(ownerSubscriptionSchema.safeParse({...input,endpoint:'https://fcm.googleapis.com/test'}).success).toBe(true);});
});
// Exercise actual authenticated wrappers, not just the UI guard.
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>({middleware(){return this;},inputValidator(){return this;},handler(fn:unknown){return fn;}})}));
vi.mock('@/integrations/supabase/auth-middleware',()=>({requireSupabaseAuth:{}}));
import { getOwnerMonitor,saveOwnerSettings,registerOwnerPush,removeOwnerPush } from '../lib/owner-monitor.functions';
it('rejects all owner RPC handlers before admin-client access for ordinary users',async()=>{for(const fn of [getOwnerMonitor,saveOwnerSettings,registerOwnerPush,removeOwnerPush]){const call=fn as unknown as (v:unknown)=>Promise<unknown>;await expect(call({data:{},context:{userId:'ordinary-user',supabase:{rpc:async()=>({data:false,error:null})}}})).rejects.toThrow('ADMIN_FORBIDDEN');}});
