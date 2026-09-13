import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { setLogbookStatus } from "@/lib/repository";
import { decisionPage } from "../result";

/**
 * Kaptanın e-postadaki "Onayla" bağlantısı.
 * Doğrulama TOKEN ile: token yoksa/yanlışsa hiçbir şey değişmez.
 * Başarılıysa ana sayfa yeniden üretilir (pano ISR'yi beklemeden güncellenir).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const result = await setLogbookStatus(token, "approved");

  if (result.ok && !result.alreadyDecided) {
    revalidatePath("/", "layout");
  }

  return new NextResponse(decisionPage(result, "approved"), {
    status: result.ok ? 200 : 400,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Onay bağlantısı hiçbir yerde önbelleğe alınmamalı
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
