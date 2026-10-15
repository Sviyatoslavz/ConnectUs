export type DeadlineTone = "urgent" | "soon" | "later" | "none";

export function deadlineIso(value: string | null): string | null {
  if (!value) return null;
  const text = value.trim();
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : text;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : null;
}

export function deadlineStatus(deadline: string | null, today: string): { tone: DeadlineTone; days: number | null } {
  const iso = deadlineIso(deadline);
  if (!iso) return { tone: "none", days: null };
  const days = Math.round((Date.parse(iso) - Date.parse(today)) / 864e5);
  return { tone: days <= 3 ? "urgent" : days <= 7 ? "soon" : "later", days };
}

export function groupLetters<T extends { sender: string | null; deadline: string | null }>(rows: T[], today: string) {
  const groups = new Map<string, { name: string | null; rows: T[] }>();
  for (const row of rows) {
    const name = row.sender?.trim().replace(/\s+/g, " ") || null;
    const key = name?.toLocaleLowerCase("de") ?? "";
    const group = groups.get(key) ?? { name, rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  }
  const rank = (row: T | undefined) => row ? deadlineStatus(row.deadline, today).days ?? Infinity : Infinity;
  return [...groups.entries()].map(([key, group]) => ({ key, ...group, rows: [...group.rows].sort((a, b) => rank(a) - rank(b)) }))
    .sort((a, b) => rank(a.rows[0]) - rank(b.rows[0]) || (a.name ?? "").localeCompare(b.name ?? "", "de"));
}
