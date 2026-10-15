// Server-enforced usage rules. Changing these values changes the limits everywhere.
export const FREE_ANALYSES = 10;
export const DAILY_ANALYSIS_CAP = 200;

export type ReserveResult =
  | { result: "reserved"; used: number }
  | { result: "replay"; letter_id: string | null }
  | { result: "busy" }
  | { result: "quota"; used: number }
  | { result: "overloaded" };

/** Error codes sent from the server; the client maps them to UK/RU/DE text. */
export const LIMIT_CODES = ["LIMIT_QUOTA", "LIMIT_BUSY", "LIMIT_OVERLOADED", "SAVE_FAILED"] as const;
export type LimitCode = (typeof LIMIT_CODES)[number];

export function limitCodeOf(message: string): LimitCode | null {
  return LIMIT_CODES.find(c => message.includes(c)) ?? null;
}

export function usageSummary(used: number, subscription: string | null) {
  const active = subscription === "active";
  const u = Math.min(used, FREE_ANALYSES);
  return { used: u, left: active ? Infinity : Math.max(0, FREE_ANALYSES - used), active, exhausted: !active && used >= FREE_ANALYSES };
}
