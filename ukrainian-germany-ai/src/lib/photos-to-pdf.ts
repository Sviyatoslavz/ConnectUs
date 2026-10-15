/** Combine several photos (in order) into one PDF, one page per photo. Browser only. */
export const MAX_PHOTOS = 5;

async function toJpeg(file: File, maxSide = 2000): Promise<Uint8Array> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k); canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob>((ok, no) => canvas.toBlob(b => (b ? ok(b) : no(new Error("encode"))), "image/jpeg", 0.85));
  return new Uint8Array(await blob.arrayBuffer());
}

export async function photosToPdf(photos: File[]): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (const p of photos) {
    const img = await doc.embedJpg(await toJpeg(p));
    doc.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await doc.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
