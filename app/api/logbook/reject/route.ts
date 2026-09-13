import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { setLogbookStatus } from "@/lib/repository";
import { decisionPage } from "../result";

/**
 * Kaptanın e-postadaki "Reddet" bağlantısı.
 * Reddedilen fotoğraf Storage'dan silinir (lib/logbook-server.ts).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const result = await setLogbookStatus(token, "rejected");

  if (result.ok && !result.alreadyDecided) {
    revalidatePath("/", "layout");
  }

  return new NextResponse(decisionPage(result, "rejected"), {
    status: result.ok ? 200 : 400,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
