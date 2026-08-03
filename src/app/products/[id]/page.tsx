import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products as staticProducts, getReviewsFor, type Review } from "@/lib/data";
import { getAllProducts, getProductById } from "@/lib/catalog.server";
import { getRelatedProducts } from "@/lib/recommend";
import { createClient } from "@/lib/supabase/server";
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
  return {
    title: product.name,
    description: product.description,
  };
}

async function getApprovedReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  if (!supabase) return getReviewsFor(productId);

  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, rating, quote, author, location")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return getReviewsFor(productId);

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

  const related = getRelatedProducts(allProducts, id, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `https://pakauraa.com${product.image}`,
    brand: { "@type": "Brand", name: "PakAuraa" },
    offers: product.sizes.map((s) => ({
      "@type": "Offer",
      price: s.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: `https://pakauraa.com/products/${product.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <ProductPageClient product={product} related={related} reviews={reviews} />
      <Footer />
    </>
  );
}
