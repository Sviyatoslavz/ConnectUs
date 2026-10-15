import { describe, expect, it } from "vitest";
import { publicationPhoto, publicationPhotos } from "@/lib/editorial-photos";

describe("publicationPhoto", () => {
  it("gives two neighbouring same-topic cards different photos", () => {
    const a = "Дослідження життя біженців з України: житло, робота, сімейне життя";
    const b = "Опитування біженців: сімейне життя і потреби в підтримці";
    expect(publicationPhoto(a, 0)).not.toBe(publicationPhoto(b, 1));
  });

  it("shifts the pick when the same text repeats with another variant", () => {
    const t = "Дослідження життя біженців з України";
    const first = publicationPhoto(t, 0);
    const second = publicationPhoto(t, 1);
    expect(first).not.toBe(second);
  });

  it("without a variant keeps the original deterministic pick", () => {
    const t = "Termin beim Jobcenter: Frist und Brief";
    expect(publicationPhoto(t)).toBe(publicationPhoto(t, 0));
  });
});

describe("publicationPhotos", () => {
  it("never repeats a photo within one list, even across topic groups", () => {
    const texts = [
      "Нові мовні курси та інтеграція",
      "Дослідження життя біженців з України",
      "Ще одне опитування біженців і сімейне життя",
      "Bürgergeld und Finanzhilfe",
      "Termin und Frist beim Amt",
      "Gesundheit und Arztbesuch",
      "Wohnung und Miete",
    ];
    const photos = publicationPhotos(texts);
    expect(new Set(photos).size).toBe(photos.length);
  });

  it("keeps the list length", () => {
    expect(publicationPhotos(["a", "b", "c"])).toHaveLength(3);
  });
});
