import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Uzantılı dosyalar (sitemap.xml, robots.txt, görseller, video) ve
  // Next iç yolları dil yönlendirmesine girmez.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
