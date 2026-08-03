import { products as staticProducts, type Product } from "./data";

export interface CatalogRow {
  id: string;
  stock: number | null;
  data: Product;
  created_at?: string | null;
}

/**
 * Merges live Supabase `products` rows over the static seed catalog.
 * Seed products stay resolvable (correct images/copy) even if a DB row is
 * partial; any row upserted purely through the admin panel is appended.
 */
export function mergeCatalog(rows: CatalogRow[]): Product[] {
  const byId = new Map(staticProducts.map((p) => [p.id, p]));
  for (const row of rows) {
    const base = byId.get(row.id);
    byId.set(row.id, {
      ...(base ?? row.data),
      ...row.data,
      id: row.id,
      stock: row.stock ?? undefined,
      createdAt: row.created_at ?? undefined,
    });
  }
  return Array.from(byId.values());
}
