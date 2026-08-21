import { createClient } from "./supabase/server";
import { getProduct, type Review } from "./data";

export type FeaturedReview = Review & { productName?: string };

/** Server-only. Real, admin-approved customer reviews only — no hardcoded/fake fallback,
 * so an empty result means "no reviews yet" rather than seeded placeholder copy. */
export async function getFeaturedReviews(limit = 8): Promise<FeaturedReview[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, product_id, rating, quote, author, location")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    productId: r.product_id,
    quote: r.quote,
    author: r.author,
    location: r.location ?? "",
    rating: r.rating,
    productName: r.product_id ? getProduct(r.product_id)?.name : undefined,
  }));
}
