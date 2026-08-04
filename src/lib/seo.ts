import type { Metadata } from "next";
import type { Product, Review } from "./data";

export const SITE_URL = "https://pakauraa.com";
export const SITE_NAME = "PakAuraa";
export const SITE_DESCRIPTION =
  "PakAuraa is a Lahore-born luxury fragrance house crafting Arabic-inspired perfumes in Pakistan — Sultan-e-Zafroon, Naazif, Zurtaan, Zarfah, and Nuxtar — with rare oud, saffron, and long-lasting extrait de parfum concentration.";

/** Core phrases every public page should reinforce without keyword-stuffing. */
export const BRAND_KEYWORDS = [
  "Pakistani perfumes",
  "luxury perfumes in Pakistan",
  "Arabic perfumes",
  "long-lasting perfumes",
  "Sultan-e-Zafroon perfume",
  "oud perfume Pakistan",
  "extrait de parfum Pakistan",
  "PakAuraa",
];

export const BUSINESS = {
  legalName: "PakAuraa Luxury Perfumes",
  phone: "+923252106239",
  phoneDisplay: "0325 2106239",
  email: "ameerhamza94572@gmail.com",
  city: "Karachi",
  region: "Sindh",
  country: "PK",
};

export const SOCIAL_LINKS = [
  "https://www.instagram.com/pakauraaa/",
  "https://www.tiktok.com/@pakauraaa",
  "https://www.facebook.com/profile.php?id=61592916234492",
  "https://www.linkedin.com/in/ameer-hamza-8615a02a5/",
];

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Standard OG/Twitter image block, reused so every page shares one canonical fallback image. */
function ogImages(image: string, alt: string) {
  return [{ url: absoluteUrl(image), width: 1200, height: 630, alt }];
}

/** Drop-in `metadata` for any static server page: title, description, canonical, OG, Twitter. */
export function pageMetadata({
  title,
  description,
  path,
  image = "/sultan-e-zafroon-v2.jpeg",
  keywords,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords: keywords ?? BRAND_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: ogImages(image, title),
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

/** Rich, keyword-targeted metadata for a single product page. */
export function productMetadata(product: Product): Metadata {
  const title = `${product.name} — ${product.tagline} | Luxury Arabic Perfume Pakistan`;
  const description =
    `${product.description} ${product.longevity}+ hour long-lasting ${product.concentration.toLowerCase()} ` +
    `from PakAuraa — luxury Arabic perfume, made in ${product.madeIn}. Shop ${product.name} online in Pakistan.`;
  const url = absoluteUrl(`/products/${product.id}`);
  const image = absoluteUrl(product.image);

  return {
    title,
    description,
    keywords: [
      product.name,
      `${product.name} perfume`,
      `${product.name} price in Pakistan`,
      ...product.fragranceFamily.map((f) => `${f} perfume Pakistan`),
      "Pakistani perfumes",
      "luxury perfumes in Pakistan",
      "Arabic perfumes",
      "long-lasting perfumes",
      "Sultan-e-Zafroon perfume",
    ],
    alternates: { canonical: url },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 1500, alt: `${product.name} — PakAuraa luxury perfume bottle` }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** Site-wide Organization node — anchors every other schema via `@id` reference. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: BUSINESS.legalName,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png"), width: 294, height: 209 },
    image: absoluteUrl("/logo.png"),
    description: SITE_DESCRIPTION,
    sameAs: SOCIAL_LINKS,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: BUSINESS.phone,
      contactType: "customer service",
      email: BUSINESS.email,
      areaServed: "PK",
      availableLanguage: ["English", "Urdu", "Arabic"],
    },
  };
}

/** LocalBusiness node for the storefront's real-world address — feeds Google's local/map results. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BUSINESS.legalName,
    image: absoluteUrl("/logo.png"),
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: "PKR 5,500 - PKR 20,000",
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash, JazzCash",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/collections?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Full Product node — offers, aggregateRating and individual reviews when available. */
export function productJsonLd(product: Product, reviews: Review[]) {
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/products/${product.id}#product`),
    name: product.name,
    description: product.description,
    image: product.gallery.map((src) => absoluteUrl(src)),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    countryOfOrigin: product.madeIn,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Concentration", value: product.concentration },
      { "@type": "PropertyValue", name: "Longevity", value: `${product.longevity}/10` },
      { "@type": "PropertyValue", name: "Projection", value: `${product.projection}/10` },
      { "@type": "PropertyValue", name: "Fragrance Family", value: product.fragranceFamily.join(", ") },
    ],
    offers: product.sizes.map((s) => ({
      "@type": "Offer",
      name: `${product.name} — ${s.ml}ml`,
      price: s.price,
      priceCurrency: "PKR",
      availability:
        product.stock !== undefined && product.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: absoluteUrl(`/products/${product.id}`),
      seller: { "@id": `${SITE_URL}/#organization` },
    })),
  };

  if (avgRating !== null) {
    json.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
    json.review = reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      author: { "@type": "Person", name: r.author },
      reviewBody: r.quote,
    }));
  }

  return json;
}

/** Standard shipping/returns/authenticity FAQ, reused verbatim as on-page accordion copy — kept in
 * sync with ProductPageClient's "Details" tab so the schema never contradicts visible content. */
export function productFaqItems(product: Product): { q: string; a: string }[] {
  return [
    {
      q: `Is ${product.name} a long-lasting perfume?`,
      a: `Yes — ${product.name} is an ${product.concentration} with a longevity rating of ${product.longevity}/10, typically lasting through the day on skin.`,
    },
    {
      q: `Is ${product.name} available in Pakistan?`,
      a: `Yes, ${product.name} ships free across Pakistan with delivery in 3–5 business days, and Cash on Delivery is available.`,
    },
    {
      q: `What sizes does ${product.name} come in?`,
      a: `${product.name} is available in ${product.sizes.map((s) => `${s.ml}ml`).join(", ")}.`,
    },
    {
      q: "What is PakAuraa's return policy?",
      a: "Returns are accepted within 5 days of delivery — if you don't like the fragrance or there's any issue, contact us and we'll make it right.",
    },
  ];
}
