// Public VAPID key (safe to ship to the browser); the private half is a server secret.
export const VAPID_PUBLIC_KEY = "BLPg5_2uT8fMd7JhS_H6vbE1Hc0qmPQySsYcO3cOLkAwmebicMBG8dKnUNOvQ7PzW3_AGDDQgybOQvoQ3FIG9Eo";

/** Default time for reminders without an explicit time (Berlin). */
export const DEFAULT_REMIND_HOUR = 9;

/** Today's date (YYYY-MM-DD) in Berlin. */
export function berlinToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
}

/** Current hour (0-23) in Berlin. */
export function berlinHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).format(now));
}

/** Which reminder is due today: "3d" three days before the deadline, "day" on the deadline, else null. */
export function pushStage(dueDate: string, today: string): "3d" | "day" | null {
  const diff = Math.round((Date.parse(dueDate) - Date.parse(today)) / 864e5);
  return diff === 3 ? "3d" : diff === 0 ? "day" : null;
}

/** Hour of an "HH:MM" reminder time; falls back to the default hour. */
export function remindHour(time: string | null | undefined) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time ?? "");
  const h = m ? Number(m[1]) : NaN;
  return Number.isInteger(h) && h >= 0 && h <= 23 ? h : DEFAULT_REMIND_HOUR;
}

/** Day a monthly reminder falls on in a given month (31 → last day in short months). */
export function reminderDayInMonth(day: number, year: number, month: number) {
  return Math.min(day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
}

/** Monthly reminder key for the notified[] log, e.g. "m:2026-10". */
export function monthlyKey(today: string) {
  return `m:${today.slice(0, 7)}`;
}

/** True when a monthly reminder (day 1-31) is due on the given Berlin date. */
export function monthlyDue(day: number, today: string) {
  const [y, m, d] = today.split("-").map(Number) as [number, number, number];
  return reminderDayInMonth(day, y, m - 1) === d;
}

function b64ToBytes(b64: string) {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, c => c.charCodeAt(0));
}

/** Browser: ask permission, subscribe and return the subscription JSON. */
export async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) throw new Error("unsupported");
  if ((await Notification.requestPermission()) !== "granted") throw new Error("denied");
  const reg = await navigator.serviceWorker.register("/push-sw.js");
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID_PUBLIC_KEY) });
  return sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
}

/** Browser: this device's current push endpoint, if any. */
export async function currentPushEndpoint(): Promise<string | null> {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
    const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
    const sub = await reg?.pushManager.getSubscription();
    return sub?.endpoint ?? null;
  } catch { return null; }
}

/** Browser: stop reminders on this device (used on sign-out so the next person on a shared device gets none). */
export async function unsubscribeThisDevice(removeRow: (endpoint: string) => Promise<unknown>) {
  try {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration("/push-sw.js");
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await removeRow(sub.endpoint).catch(() => undefined);
    await sub.unsubscribe().catch(() => undefined);
  } catch { /* push is optional */ }
}
