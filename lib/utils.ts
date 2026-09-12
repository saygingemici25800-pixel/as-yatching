/** Sınıf adlarını birleştirir; falsy değerleri atar. (shadcn `cn` — bağımlılıksız) */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
