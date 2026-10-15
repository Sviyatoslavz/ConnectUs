import { describe, expect, it } from "vitest";
import { deadlineStatus, groupLetters } from "@/lib/letter-list";

describe("letter deadline indicators", () => {
  it("marks overdue and deadlines within three days red", () => {
    for (const date of ["08.10.2026", "09.10.2026", "12.10.2026"]) expect(deadlineStatus(date, "2026-10-09").tone).toBe("urgent");
  });
  it("marks four to seven days yellow", () => {
    for (const date of ["13.10.2026", "16.10.2026"]) expect(deadlineStatus(date, "2026-10-09").tone).toBe("soon");
  });
  it("marks later deadlines green without claiming completion", () => expect(deadlineStatus("17.10.2026", "2026-10-09")).toEqual({ tone: "later", days: 8 }));
  it("does not invent urgency without a valid deadline", () => {
    for (const date of [null, "не вказано", "31.02.2026"]) expect(deadlineStatus(date, "2026-10-09").tone).toBe("none");
  });
  it("groups the same sender and keeps different organisations separate", () => {
    const groups = groupLetters([{ sender: " Jobcenter  Berlin ", deadline: null }, { sender: "jobcenter berlin", deadline: "12.10.2026" }, { sender: "Finanzamt", deadline: "18.10.2026" }], "2026-10-09");
    expect(groups).toHaveLength(2);
    expect(groups[0]?.rows).toHaveLength(2);
    expect(groups[0]?.rows[0]?.deadline).toBe("12.10.2026");
  });
});
