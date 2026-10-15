import { describe, expect, it } from "vitest";
import { getCourseLesson } from '@/lib/course-lessons';
import { lessonWireSchema } from '@/lib/learn-content';
import { attachNewsUrls, filterNews, parseRss, lessonOfDay, ALL_LESSONS, dailyWireSchema, learnCopy } from "@/lib/learn-content";

const feed = [
  { title: "Kindergeld steigt", link: "https://www.bundesregierung.de/a", description: "", date: "" },
  { title: "Fußball-WM", link: "https://www.bundesregierung.de/b", description: "Sport", date: "" },
];

describe("learn content", () => {
  it("keeps only migration/benefit news", () => { expect(filterNews(feed).map(f => f.link)).toEqual(["https://www.bundesregierung.de/a"]); });
  it("never invents news URLs: unknown item indexes are dropped", () => {
    const r = attachNewsUrls([{ item: 0, title: "x", summary: "y" }, { item: 7, title: "fake", summary: "z" }], feed);
    expect(r).toHaveLength(1); expect(r[0]!.url).toBe("https://www.bundesregierung.de/a");
  });
  it("parses RSS items with https links only", () => {
    expect(parseRss("<item><title>A</title><link>https://x.de/1</link></item><item><title>B</title><link>javascript:1</link></item>")).toHaveLength(1);
  });
  it("lesson of the day rotates through all 14 lessons", () => {
    expect(ALL_LESSONS).toHaveLength(14);
    const seen = new Set(Array.from({ length: 14 }, (_, d) => JSON.stringify(lessonOfDay(new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10)))));
    expect(seen.size).toBe(14);
  });
  it("rejects a quiz with a wrong number of options", () => {
    const base = { tip: { title: "a", text: "b" }, word: { de: "a", translation: "b", explanation: "c", exampleDe: "d", exampleTr: "e" }, news: [] };
    const q = { question: "q", options: ["a", "b", "c"], answer: 1, explanation: "e" };
    expect(dailyWireSchema.safeParse({ ...base, quiz: [q, q] }).success).toBe(true);
    expect(dailyWireSchema.safeParse({ ...base, quiz: [q, { ...q, options: ["a", "b"] }] }).success).toBe(false);
  });
  it("has copy in UK/RU/DE", () => { for (const l of ["UK", "RU", "DE"] as const) expect(learnCopy[l]["nav"]).toBeTruthy(); });
  it('provides all 14 complete lessons in every interface language without generation', () => {
    for (const lang of ['UK', 'RU', 'DE'] as const) {
      for (const { course, idx } of ALL_LESSONS) {
        const lesson = getCourseLesson(course, idx, lang);
        expect(lessonWireSchema.safeParse(lesson).success).toBe(true);
        expect(lesson?.intro.length).toBeGreaterThan(60);
        expect(lesson?.tips.length).toBeGreaterThan(0);
        expect(lesson?.quiz).toHaveLength(2);
      }
    }
  });
  it('does not resolve invalid lesson indexes', () => {
    expect(getCourseLesson('deutsch-amt', -1, 'UK')).toBeNull();
    expect(getCourseLesson('verhalten', 7, 'RU')).toBeNull();
    expect(getCourseLesson('verhalten', 0.5, 'DE')).toBeNull();
  });
});
