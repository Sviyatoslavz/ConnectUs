export type LetterSearch = { id?: string | undefined; demo?: boolean | undefined };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Search params of /result and /reply: a saved letter id or the demo flag. */
export function letterSearch(s: Record<string, unknown>): LetterSearch {
  const id = typeof s["id"] === "string" && UUID.test(s["id"]) ? s["id"] : undefined;
  const demo = s["demo"] === true || s["demo"] === "true" || s["demo"] === 1 || s["demo"] === "1" ? true : undefined;
  return { id, demo };
}
