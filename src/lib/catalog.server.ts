import { createClient } from "./supabase/server";
import { products as staticProducts, type Product } from "./data";
import { mergeCatalog } from "./catalog-merge";

/** Server-only (Server Components, Route Handlers). Falls back to the static seed catalog when Supabase isn't configured. */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return staticProducts;

  const { data, error } = await supabase.from("products").select("id, stock, data, created_at");
  if (error || !data || data.length === 0) return staticProducts;

  return mergeCatalog(data);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.id === id);
}
