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
      // Include product images in sitemap for Google Images indexing
      images: [
        {
          url: `${base}${p.image}`,
          title: p.name,
          caption: `${p.name} - ${p.tagline}`,
        },
        ...p.gallery.slice(1).map((src) => ({
          url: `${base}${src}`,
          title: p.name,
          caption: `${p.name} product image`,
        })),
      ],
    }));

  return [...staticRoutes, ...productRoutes];
}
