import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type StaticPathname } from "@/i18n/routing";
import { getProductSlugs, getRouteGuideSlugs } from "@/lib/repository";
import { SITE_URL } from "@/lib/seo";

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * Site haritası üç dili de içerir: her adres dil başına bir kayıt, kaydın
 * `alternates.languages` alanında diğer dillerdeki karşılıkları.
 * Tur sayfaları veriden üretiliyor — seed'e doğrudan dokunulmuyor (Kural 4).
 * Yeni bir ürün eklendiğinde site haritası kendiliğinden büyür.
 */
const STATIC: {
  href: StaticPathname;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/turlar", changeFrequency: "weekly", priority: 0.9 },
  { href: "/rotalar", changeFrequency: "monthly", priority: 0.7 },
  { href: "/tekne", changeFrequency: "monthly", priority: 0.7 },
  { href: "/hakkimizda", changeFrequency: "monthly", priority: 0.6 },
  { href: "/iletisim", changeFrequency: "yearly", priority: 0.6 },
  { href: "/sss", changeFrequency: "monthly", priority: 0.6 },
];

function entries(
  href: Href,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      `${SITE_URL}${getPathname({ href, locale })}`,
    ]),
  );
  return routing.locales.map((locale) => ({
    url: languages[locale],
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes = STATIC.flatMap((item) =>
    entries(item.href, lastModified, item.changeFrequency, item.priority),
  );

  const slugs = await getProductSlugs();
  const productRoutes = slugs.flatMap((urun) =>
    entries(
      { pathname: "/turlar/[urun]", params: { urun } },
      lastModified,
      "weekly",
      0.8,
    ),
  );

  const guideSlugs = await getRouteGuideSlugs();
  const guideRoutes = guideSlugs.flatMap((koy) =>
    entries(
      { pathname: "/rotalar/[koy]", params: { koy } },
      lastModified,
      "monthly",
      0.6,
    ),
  );

  return [...staticRoutes, ...productRoutes, ...guideRoutes];
}
