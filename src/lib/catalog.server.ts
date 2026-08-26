import { createClient } from "./supabase/server";
import { products as staticProducts, type Product } from "./data";
import { mergeCatalog } from "./catalog-merge";

/** Server-only (Server Components, Route Handlers). Falls back to the static seed catalog when Supabase isn't configured.
 * Force-dynamic so admin edits appear on the next request instead of being
 * cached by the static renderer. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return staticProducts;

  const { data, error } = await supabase
    .from("products")
    .select("id, stock, data, updated_at, created_at")
    .order("updated_at", { ascending: false });
  if (error || !data || data.length === 0) return staticProducts;

  return mergeCatalog(data);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.id === id);
}
