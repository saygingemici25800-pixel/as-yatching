/**
 * Demo verisinde henüz doldurulmamış alanları tespit eder.
 *
 * `data/seed.ts` içinde bilinmeyen alanlar üç şekilde duruyor:
 *   - "TODO: ..." ile başlayan metin
 *   - null
 *   - 0 (uzunluk gibi sayısal alanlar)
 *
 * Bu alanlar arayüzde ASLA ham hâliyle basılmaz; "bilgi bekleniyor" olarak
 * gösterilir. Gerçek bilgi seed'e girildiği anda otomatik görünür olur.
 */
export function isMissing(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "number") return value === 0;
  return value.trim() === "" || value.trim().startsWith("TODO");
}

/** Bilinmeyen alanlar için tek tip etiket */
export const MISSING_LABEL = "Bilgi bekleniyor";

export interface Spec {
  label: string;
  value: string | null;
}

/** Bilinen ve bilinmeyen özellikleri ayırır */
export function splitSpecs(specs: Spec[]) {
  return {
    known: specs.filter((s) => s.value !== null),
    missing: specs.filter((s) => s.value === null).map((s) => s.label),
  };
}
