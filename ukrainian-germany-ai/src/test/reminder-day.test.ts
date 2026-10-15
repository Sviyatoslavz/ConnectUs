import { describe, expect, it } from "vitest";
import { reminderDayInMonth } from "@/components/app/ReminderCalendar";

describe("monthly reminder day", () => {
  it("keeps the chosen day when the month has it", () => expect(reminderDayInMonth(15, 2026, 9)).toBe(15));
  it("moves day 31 to the last day of February", () => expect(reminderDayInMonth(31, 2026, 1)).toBe(28));
});

import { reminderFallsOn } from "@/components/app/ReminderCalendar";
import { deadlineToIso } from "@/components/app/ReminderOffer";
describe("one-time reminder from letter deadline", () => {
  it("converts 14.10.2026 to 2026-10-14", () => expect(deadlineToIso("14.10.2026")).toBe("2026-10-14"));
  it("shows only on its date, not next month", () => {
    const r = { day: 14, due_date: "2026-10-14" };
    expect(reminderFallsOn(r, 2026, 9, 14)).toBe(true);
    expect(reminderFallsOn(r, 2026, 10, 14)).toBe(false);
  });
});

import { berlinHour, monthlyDue, monthlyKey, pushStage, remindHour } from "@/lib/push";
describe("deadline push timing", () => {
  it("pushes 3 days before", () => expect(pushStage("2026-10-14", "2026-10-11")).toBe("3d"));
  it("pushes on the deadline day", () => expect(pushStage("2026-10-14", "2026-10-14")).toBe("day"));
  it("does not push 2 days before", () => expect(pushStage("2026-10-14", "2026-10-12")).toBe(null));
  it("reads the reminder hour and falls back to 9", () => {
    expect(remindHour("07:30")).toBe(7);
    expect(remindHour("18:00")).toBe(18);
    expect(remindHour(null)).toBe(9);
    expect(remindHour("25:00")).toBe(9);
  });
  it("uses the Berlin hour", () => {
    expect(berlinHour(new Date("2026-10-15T05:30:00Z"))).toBe(7); // CEST
    expect(berlinHour(new Date("2026-12-15T05:30:00Z"))).toBe(6); // CET
  });
  it("monthly reminders fall on their day, day 31 on the last day of short months", () => {
    expect(monthlyDue(15, "2026-10-15")).toBe(true);
    expect(monthlyDue(15, "2026-10-16")).toBe(false);
    expect(monthlyDue(31, "2026-02-28")).toBe(true);
    expect(monthlyKey("2026-10-15")).toBe("m:2026-10");
  });
});

import { selectDue } from "@/routes/api/public/hooks/reminder-push";
describe("hourly reminder push selection", () => {
  const row = (o: Partial<{ id: string; day: number; due_date: string | null; remind_time: string | null; notified: string[] }>) => ({ id: "r", user_id: "u", title: "Jobcenter", day: 14, due_date: null, remind_time: null, notified: [], ...o });
  it("sends a one-time reminder only from its chosen hour on", () => {
    const r = row({ due_date: "2026-10-14", remind_time: "15:00" });
    expect(selectDue([r], "2026-10-14", 14)).toHaveLength(0);
    expect(selectDue([r], "2026-10-14", 15)).toMatchObject([{ stage: "day", key: "day" }]);
  });
  it("sends the 3-day warning and never the same stage twice", () => {
    const r = row({ due_date: "2026-10-17" });
    expect(selectDue([r], "2026-10-14", 9)).toMatchObject([{ stage: "3d" }]);
    expect(selectDue([{ ...r, notified: ["3d"] }], "2026-10-14", 23)).toHaveLength(0);
  });
  it("sends monthly reminders once per month at 9:00", () => {
    const r = row({ day: 14 });
    expect(selectDue([r], "2026-10-14", 8)).toHaveLength(0);
    expect(selectDue([r], "2026-10-14", 9)).toMatchObject([{ stage: "monthly", key: "m:2026-10" }]);
    expect(selectDue([{ ...r, notified: ["m:2026-10"] }], "2026-10-14", 12)).toHaveLength(0);
    expect(selectDue([{ ...r, notified: ["m:2026-09"] }], "2026-10-14", 12)).toHaveLength(1);
    expect(selectDue([r], "2026-10-15", 12)).toHaveLength(0);
  });
});
