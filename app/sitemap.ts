import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/repository";
import { SITE_URL } from "@/lib/seo";

/**
 * Tur sayfaları veriden üretiliyor — seed'e doğrudan dokunulmuyor (Kural 4).
 * Yeni bir ürün eklendiğinde site haritası kendiliğinden büyür.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/turlar`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tekne`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/iletisim`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/sss`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/turlar/${product.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
