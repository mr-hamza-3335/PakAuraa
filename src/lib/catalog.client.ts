"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "./supabase/client";
import { products as staticProducts, type Product } from "./data";
import { mergeCatalog } from "./catalog-merge";

/** Browser-safe catalog fetch. Falls back to the static seed catalog when Supabase isn't configured.
 * Always fetches fresh — no browser-level caching — so admin edits show up immediately. */
export async function getAllProductsClient(): Promise<Product[]> {
  const supabase = createClient();
  if (!supabase) return staticProducts;

  const { data, error } = await supabase
    .from("products")
    .select("id, stock, data, updated_at, created_at")
    .order("updated_at", { ascending: false });
  if (error || !data || data.length === 0) return staticProducts;

  return mergeCatalog(data);
}

/**
 * Returns the static seed catalog immediately (no flicker, works with zero
 * config), then upgrades to the live Supabase catalog once fetched.
 *
 * Re-fetches when the tab regains focus or every 30 seconds so admin panel
 * edits appear on the storefront without a hard refresh.
 */
export function useCatalog(): Product[] {
  const [products, setProducts] = useState<Product[]>(staticProducts);

  const refresh = useCallback(() => {
    let cancelled = false;
    getAllProductsClient().then((list) => {
      if (!cancelled) setProducts(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  // Re-fetch when the tab becomes visible again (admin made a change, user
  // switches back to the storefront tab)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refresh]);

  // Background revalidation every 30s — admin panel users will see their
  // edits appear within half a minute of saving.
  useEffect(() => {
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return products;
}
