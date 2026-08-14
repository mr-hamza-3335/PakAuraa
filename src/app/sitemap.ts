import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/catalog.server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pakauraa.com";
  const products = await getAllProducts();

  const staticRoutes = [
    "",
    "/about",
    "/collections",
    "/contact",
    "/faqs",
    "/shipping",
    "/size-guide",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const productRoutes = products
    .filter((p) => !p.comingSoon)
    .map((p) => ({
      url: `${base}/products/${p.id}`,
      lastModified: new Date(),
    }));

  return [...staticRoutes, ...productRoutes];
}
