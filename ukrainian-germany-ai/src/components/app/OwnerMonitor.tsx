import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Bell, BellOff, ThumbsUp, ThumbsDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLetter } from './LetterContext';
import { getOwnerMonitor, saveOwnerSettings, registerOwnerPush, removeOwnerPush } from '@/lib/owner-monitor.functions';
import { ownerCopy } from '@/lib/owner-monitor';
import { ERROR_TYPES, feedbackCopy } from '@/lib/letter-feedback';
import { subscribePush } from '@/lib/push';
type Monitor=Awaited<ReturnType<typeof getOwnerMonitor>>;
export function OwnerMonitor(){
 const {lang}=useLetter();const t=ownerCopy[lang];const load=useServerFn(getOwnerMonitor),save=useServerFn(saveOwnerSettings),register=useServerFn(registerOwnerPush),remove=useServerFn(removeOwnerPush);
 const [data,setData]=useState<Monitor|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const refresh=async()=>{try{setData(await load());}catch{setMessage(t.failed);}};
 useEffect(()=>{void refresh();},[]);
 async function action(task:()=>Promise<unknown>){setBusy(true);setMessage('');try{await task();await refresh();setMessage(t.saved);}catch{setMessage(t.failed);}finally{setBusy(false);}}
 const date=(s:string)=>new Intl.DateTimeFormat(lang==='UK'?'uk-UA':lang==='RU'?'ru-RU':'de-DE',{timeZone:'Europe/Berlin',dateStyle:'short',timeStyle:'short'}).format(new Date(s));
 return <div className="space-y-8">
 <section aria-label={t.ratings} className="border-t pt-6"><h2 className="text-xl font-bold">{t.ratings}</h2>{data&&<>
 <div className="mt-4 grid gap-4 sm:grid-cols-3">{(['all','week','today'] as const).map(k=><div key={k} className="border-b pb-4"><h3 className="font-bold">{t[k]}</h3><p className="mt-3 flex flex-wrap gap-4"><span className="flex gap-2"><ThumbsUp className="h-5 w-5"/>{data.stats.periods[k].up}</span><span className="flex gap-2"><ThumbsDown className="h-5 w-5"/>{data.stats.periods[k].down}</span></p><p className="mt-2 text-sm">{t.percent}: {data.stats.periods[k].percent}%</p><h4 className="mt-4 text-sm font-semibold">{t.reasons}</h4>{ERROR_TYPES.map(reason=><p key={reason} className="mt-1 flex justify-between gap-3 text-sm"><span>{feedbackCopy[lang].reasons[reason]}</span><span>{data.stats.periods[k].reasons[reason]??0}</span></p>)}</div>)}</div>
 <h3 className="mt-6 font-bold">{t.comments}</h3>{!data.stats.comments.length&&<p className="mt-3 text-sm">{t.empty}</p>}{data.stats.comments.map((c,i)=><article key={i} className="border-b py-4"><p className="text-xs text-muted-foreground">{date(c.date)} · {feedbackCopy[lang].reasons[c.reason]}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{c.comment}</p></article>)}
 </>}</section>
 <section className="border-t pt-6"><h2 className="text-xl font-bold">{t.notifications}</h2>{data&&<div className="mt-4 space-y-4">
 <p className="text-sm">{t.active}: {data.devices}</p><div className="flex flex-wrap gap-2"><Button disabled={busy} className="min-h-12 h-auto whitespace-normal" onClick={()=>void action(async()=>{const subscription=await subscribePush();await register({data:{...subscription,lang}});})}><Bell/>{t.enable}</Button><Button variant="outline" disabled={busy} className="min-h-12 h-auto whitespace-normal" onClick={()=>void action(async()=>{const reg=await navigator.serviceWorker.getRegistration('/push-sw.js');const sub=await reg?.pushManager.getSubscription();if(sub)await remove({data:{endpoint:sub.endpoint}});})}><BellOff/>{t.disable}</Button></div>
 {(['negative_enabled','summary_enabled','alert_enabled'] as const).map((key,i)=><label key={key} className="flex min-h-12 items-center justify-between gap-4 text-sm"><span>{[t.negative,t.summary,t.alert][i]}</span><Switch checked={data.settings[key]} onCheckedChange={checked=>setData({...data,settings:{...data.settings,[key]:checked}})}/></label>)}
 <div className="grid gap-4 sm:grid-cols-2">{(['error_threshold','analysis_threshold'] as const).map((key,i)=><label key={key} className="text-sm">{[t.errors,t.analyses][i]}<Input type="number" min={1} max={key==='error_threshold'?10000:100000} value={data.settings[key]} className="mt-2 h-12" onChange={e=>setData({...data,settings:{...data.settings,[key]:Number(e.target.value)}})}/></label>)}</div>
 <Button disabled={busy} className="h-12" onClick={()=>void action(()=>save({data:{...data.settings,lang}}))}><Save/>{t.save}</Button>
 </div>}</section>{message&&<p role="status" className="text-sm">{message}</p>}
 </div>;
}
