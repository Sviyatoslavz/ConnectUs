import type { ComposedLetter } from "@/lib/letter-compose";

export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

async function font(path: string) {
  const r = await fetch(path);
  if (!r.ok) throw new Error("Font unavailable");
  return r.arrayBuffer();
}

export async function buildLetterBlob(format: "pdf" | "docx", c: ComposedLetter): Promise<Blob> {
  return format === "pdf" ? buildPdf(c) : buildDocx(c);
}

/** Greedy line wrapping; words wider than a line (IBAN, URLs) are split by characters so nothing runs off the page. */
export function wrapText(text: string, width: (s: string) => number, maxW: number): string[] {
  const pieces: string[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (width(word) <= maxW) { pieces.push(word); continue; }
    let chunk = "";
    for (const ch of word) {
      if (chunk && width(chunk + ch) > maxW) { pieces.push(chunk); chunk = ch; } else chunk += ch;
    }
    if (chunk) pieces.push(chunk);
  }
  const out: string[] = []; let line = "";
  for (const word of pieces) {
    const next = line ? `${line} ${word}` : word;
    if (line && width(next) > maxW) { out.push(line); line = word; } else line = next;
  }
  out.push(line); return out;
}

async function buildPdf(c: ComposedLetter) {
  const { PDFDocument } = await import("pdf-lib");
  const { default: fontkit } = await import("@pdf-lib/fontkit");
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const [reg, bold] = await Promise.all([font("/fonts/letter-unicode.ttf"), font("/fonts/letter-unicode-bold.ttf")]);
  const regular = await pdf.embedFont(reg, { subset: true });
  const strong = await pdf.embedFont(bold, { subset: true });
  const MM = 72 / 25.4, W = 595.28, H = 841.89, L = 25 * MM, R = W - 20 * MM, TOP = H - 20 * MM, BOTTOM = 25 * MM, maxW = R - L;
  let page = pdf.addPage([W, H]); let y = TOP;
  const newPage = () => { page = pdf.addPage([W, H]); y = TOP; };
  type F = typeof regular;
  const write = (text: string, size = 11, f: F = regular) => {
    const gap = size * 1.45;
    for (const para of text.split("\n")) {
      if (!para.trim()) { y -= gap; continue; }
      for (const l of wrapText(para, s => f.widthOfTextAtSize(s, size), maxW)) { if (y < BOTTOM) newPage(); page.drawText(l, { x: L, y, size, font: f }); y -= gap; }
    }
  };
  write(c.senderBlock.join("\n"), 9);
  y = Math.min(y - 14, H - 45 * MM);
  write(c.recipientBlock.join("\n"));
  y -= 26;
  page.drawText(c.placeDate, { x: R - regular.widthOfTextAtSize(c.placeDate, 11), y, size: 11, font: regular }); y -= 32;
  write(c.subject.join("\n"), 11, strong); y -= 14;
  write(c.salutation); y -= 8;
  write(c.body); y -= 10;
  if (y < BOTTOM + 80) newPage();
  write(c.closing); y -= 48; // space for handwritten signature
  write(c.signatureName);
  if (c.enclosures.length) { y -= 16; write(`Anlagen:\n${c.enclosures.map(e => `- ${e}`).join("\n")}`); }
  const pages = pdf.getPages();
  pages.forEach((p, i) => { if (i === 0 || pages.length < 2) return; const t = `Seite ${i + 1} von ${pages.length}`; p.drawText(t, { x: R - regular.widthOfTextAtSize(t, 9), y: 12 * MM, size: 9, font: regular }); });
  return new Blob([new Uint8Array(await pdf.save())], { type: "application/pdf" });
}

async function buildDocx(c: ComposedLetter) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  type Opt = { bold?: boolean; size?: number; right?: boolean; before?: number; after?: number };
  const P = (text: string, o: Opt = {}) => new Paragraph({ alignment: o.right ? AlignmentType.RIGHT : AlignmentType.LEFT, spacing: { before: o.before ?? 0, after: o.after ?? 0, line: 300 }, children: [new TextRun({ text, bold: !!o.bold, size: o.size ?? 22 })] });
  const children = [
    ...c.senderBlock.map(t => P(t, { size: 18 })),
    ...c.recipientBlock.map((t, i) => P(t, { before: i === 0 ? 900 : 0 })),
    P(c.placeDate, { right: true, before: 480, after: 480 }),
    ...c.subject.map(t => P(t, { bold: true })),
    P(c.salutation, { before: 360, after: 200 }),
    ...c.body.split("\n").map(t => P(t, { after: 80 })),
    P(c.closing, { before: 240 }), P(""), P(""), P(""),
    P(c.signatureName),
    ...(c.enclosures.length ? [P("Anlagen:", { before: 360 }), ...c.enclosures.map(e => P(`- ${e}`))] : []),
  ];
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1417 } } }, children }],
  });
  return Packer.toBlob(doc);
}
