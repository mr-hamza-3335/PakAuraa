import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products as staticProducts, type Review } from "@/lib/data";
import { getAllProducts, getProductById } from "@/lib/catalog.server";
import { getRelatedProducts } from "@/lib/recommend";
import { createClient } from "@/lib/supabase/server";
import { productMetadata, productJsonLd, breadcrumbJsonLd, faqJsonLd, productFaqItems } from "@/lib/seo";
import ProductPageClient from "./ProductPageClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return staticProducts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  if (product.comingSoon) {
    return {
      title: { absolute: `${product.name} — Coming Soon | PakAuraa` },
      description: `${product.name} by PakAuraa is coming soon. Explore Zurtaan and Zarfah, available now.`,
      robots: { index: false, follow: true },
    };
  }
  return productMetadata(product);
}

// Real, admin-approved reviews only — no fallback to seeded/fake copy. An
// empty array means "no reviews yet", which the UI shows honestly rather
// than dressing up with placeholder testimonials.
async function getApprovedReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, rating, quote, author, location")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    productId: r.product_id,
    quote: r.quote,
    author: r.author,
    location: r.location ?? "",
    rating: r.rating,
  }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [allProducts, product, reviews] = await Promise.all([
    getAllProducts(),
    getProductById(id),
    getApprovedReviews(id),
  ]);
  if (!product) notFound();

  const related = getRelatedProducts(
    allProducts.filter((p) => !p.comingSoon),
    id,
    3
  );

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: product.name, path: `/products/${product.id}` },
  ]);

  return (
    <>
      {!product.comingSoon && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, reviews)) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(productFaqItems(product))) }}
          />
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Header />
      <ProductPageClient product={product} related={related} reviews={reviews} />
      <Footer />
    </>
  );
}
