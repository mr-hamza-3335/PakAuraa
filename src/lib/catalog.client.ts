"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { products as staticProducts, type Product } from "./data";
import { mergeCatalog } from "./catalog-merge";

/** Browser-safe catalog fetch. Falls back to the static seed catalog when Supabase isn't configured. */
export async function getAllProductsClient(): Promise<Product[]> {
  const supabase = createClient();
  if (!supabase) return staticProducts;

  const { data, error } = await supabase.from("products").select("id, stock, data, created_at");
  if (error || !data || data.length === 0) return staticProducts;

  return mergeCatalog(data);
}

/**
 * Returns the static seed catalog immediately (no flicker, works with zero
 * config), then upgrades to the live Supabase catalog once fetched.
 */
export function useCatalog(): Product[] {
  const [products, setProducts] = useState<Product[]>(staticProducts);

  useEffect(() => {
    let cancelled = false;
    getAllProductsClient().then((list) => {
      if (!cancelled) setProducts(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return products;
}
