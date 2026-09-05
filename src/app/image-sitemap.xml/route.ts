import { getAllProducts } from "@/lib/catalog.server";

export const dynamic = "force-dynamic";

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pakauraa.com";
  const products = await getAllProducts();

  // Home / brand assets — anchor the homepage to every logo and the two
  // hero product photos so brand searches surface real bottles, not the
  // old placeholder brand-logo cards.
  const homeImages = [
    { url: `${base}/logo.png`, title: "PakAuraa Luxury Perfumes Logo", caption: "PakAuraa — Luxury perfumes from Pakistan" },
    { url: `${base}/og-default.jpg`, title: "PakAuraa Luxury Perfumes", caption: "PakAuraa — Premium fragrances, crafted in Pakistan" },
    { url: `${base}/zurtaan perfume.png`, title: "Zurtaan — Woody Spicy perfume for men", caption: "Zurtaan by PakAuraa — bold Woody Spicy Eau de Parfum" },
    { url: `${base}/zarfah perfume.png`, title: "Zarfah — Fruity Floral perfume for women", caption: "Zarfah by PakAuraa — vibrant Fruity Floral Eau de Parfum" },
  ];

  // Per-product images — each image is anchored to its own product page so
  // Google attributes the right shot to the right product (the homepage
  // anchor used to lump them all under "/", losing product attribution).
  const productEntries = products
    .filter((p) => !p.comingSoon)
    .flatMap((p) => {
      const productUrl = `${base}/products/${p.id}`;
      const allImages = [p.image, ...p.gallery.filter((src) => src !== p.image)];
      return allImages.map((img) => ({
        pageUrl: productUrl,
        url: `${base}${img}`,
        title: `${p.name} by PakAuraa`,
        caption: `${p.name} — ${p.tagline}. ${p.category}.`,
      }));
    });

  const allImages = [
    ...homeImages.map((img) => ({ ...img, pageUrl: base })),
    ...productEntries,
  ];

  // Group by pageUrl so each <url> block can list multiple <image:image>
  // children — Google's spec prefers this over one <url> per image.
  const byPage = new Map<string, typeof allImages>();
  for (const entry of allImages) {
    if (!byPage.has(entry.pageUrl)) byPage.set(entry.pageUrl, []);
    byPage.get(entry.pageUrl)!.push(entry);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Array.from(byPage.entries())
  .map(
    ([pageUrl, imgs]) =>
      `  <url>\n    <loc>${xmlEscape(pageUrl)}</loc>\n${imgs
        .map(
          (img) =>
            `    <image:image>
      <image:loc>${xmlEscape(img.url)}</image:loc>
      <image:title>${xmlEscape(img.title)}</image:title>
      <image:caption>${xmlEscape(img.caption)}</image:caption>
    </image:image>`
        )
        .join("\n")}\n  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
