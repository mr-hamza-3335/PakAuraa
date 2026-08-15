"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Save, Trash2, X, UploadCloud, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAllProductsClient } from "@/lib/catalog.client";
import type { Product, Gender } from "@/lib/data";

const LOW_STOCK_THRESHOLD = 5;

interface FormSize {
  ml: string;
  price: string;
}

/** Array fields are edited as comma-separated text, then split/joined on save. */
interface FormState {
  id: string;
  createdAt?: string;
  name: string;
  arabicName: string;
  meaning: string;
  tagline: string;
  collection: string;
  category: string;
  fragranceFamily: string;
  gender: Gender;
  audience: string;
  vibe: string;
  description: string;
  longDescription: string;
  sizes: FormSize[];
  originalPrice: string;
  gradient: string;
  image: string;
  gallery: string;
  pdfCard: string;
  badge: string;
  limitedEdition: boolean;
  comingSoon: boolean;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
  longevity: number;
  projection: number;
  sillage: number;
  performanceText: string;
  concentration: string;
  occasions: string;
  seasons: string;
  dayNight: "day" | "night" | "both";
  madeIn: string;
  ingredients: string;
  stock: number;
  seoTitle: string;
  seoDescription: string;
}

const blankForm: FormState = {
  id: "",
  name: "",
  arabicName: "",
  meaning: "",
  tagline: "",
  collection: "Signature Collection",
  category: "",
  fragranceFamily: "",
  gender: "unisex",
  audience: "",
  vibe: "",
  description: "",
  longDescription: "",
  sizes: [{ ml: "50", price: "" }],
  originalPrice: "",
  gradient: "product-gradient-default",
  image: "",
  gallery: "",
  pdfCard: "",
  badge: "",
  limitedEdition: false,
  comingSoon: false,
  notesTop: "",
  notesHeart: "",
  notesBase: "",
  longevity: 7,
  projection: 6,
  sillage: 6,
  performanceText: "",
  concentration: "Eau de Parfum",
  occasions: "",
  seasons: "",
  dayNight: "both",
  madeIn: "Pakistan",
  ingredients: "",
  stock: 50,
  seoTitle: "",
  seoDescription: "",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function csv(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function productToForm(p: Product): FormState {
  return {
    id: p.id,
    createdAt: p.createdAt,
    name: p.name,
    arabicName: p.arabicName,
    meaning: p.meaning,
    tagline: p.tagline,
    collection: p.collection,
    category: p.category,
    fragranceFamily: p.fragranceFamily.join(", "),
    gender: p.gender,
    audience: p.audience.join(", "),
    vibe: p.vibe,
    description: p.description,
    longDescription: p.longDescription,
    sizes: p.sizes.map((s) => ({ ml: String(s.ml), price: String(s.price) })),
    originalPrice: p.originalPrice !== undefined ? String(p.originalPrice) : "",
    gradient: p.gradient,
    image: p.image,
    gallery: p.gallery.join(", "),
    pdfCard: p.pdfCard ?? "",
    badge: p.badge ?? "",
    limitedEdition: Boolean(p.limitedEdition),
    comingSoon: Boolean(p.comingSoon),
    notesTop: p.notes.top.join(", "),
    notesHeart: p.notes.heart.join(", "),
    notesBase: p.notes.base.join(", "),
    longevity: p.longevity,
    projection: p.projection,
    sillage: p.sillage,
    performanceText: p.performanceText ?? "",
    concentration: p.concentration,
    occasions: p.occasions.join(", "),
    seasons: p.seasons.join(", "),
    dayNight: p.dayNight,
    madeIn: p.madeIn,
    ingredients: p.ingredients,
    stock: p.stock ?? 0,
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
  };
}

function formToProduct(f: FormState): Product {
  const sizes = f.sizes
    .map((s) => ({ ml: Number(s.ml) || 0, price: Number(s.price) || 0 }))
    .filter((s) => s.ml > 0);
  const defaultEntry = sizes[1] ?? sizes[0] ?? { ml: 0, price: 0 };
  const gallery = csv(f.gallery);
  const originalPrice = f.originalPrice.trim() ? Number(f.originalPrice) : undefined;
  return {
    id: f.id,
    createdAt: f.createdAt ?? new Date().toISOString(),
    name: f.name,
    arabicName: f.arabicName,
    meaning: f.meaning,
    tagline: f.tagline,
    collection: f.collection,
    category: f.category,
    fragranceFamily: csv(f.fragranceFamily),
    gender: f.gender,
    audience: csv(f.audience),
    vibe: f.vibe,
    description: f.description,
    longDescription: f.longDescription,
    price: defaultEntry.price,
    originalPrice,
    sizes,
    size: `${defaultEntry.ml}ml`,
    gradient: f.gradient || "product-gradient-default",
    image: f.image,
    gallery: gallery.length ? gallery : [f.image],
    pdfCard: f.pdfCard.trim() || undefined,
    badge: f.badge || undefined,
    limitedEdition: f.limitedEdition,
    comingSoon: f.comingSoon || undefined,
    notes: { top: csv(f.notesTop), heart: csv(f.notesHeart), base: csv(f.notesBase) },
    longevity: f.longevity,
    projection: f.projection,
    sillage: f.sillage,
    performanceText: f.performanceText.trim() || undefined,
    concentration: f.concentration,
    occasions: csv(f.occasions),
    seasons: csv(f.seasons),
    dayNight: f.dayNight,
    madeIn: f.madeIn,
    ingredients: f.ingredients,
    seoTitle: f.seoTitle.trim() || undefined,
    seoDescription: f.seoDescription.trim() || undefined,
  };
}

const inputClass =
  "w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors";
const labelClass = "block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "pdfCard" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const list = await getAllProductsClient();
    setProducts(list);
    setLoaded(true);
  };

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const startNew = () => {
    setError(null);
    setIsNew(true);
    setForm({ ...blankForm });
  };

  const startEdit = (p: Product) => {
    setError(null);
    setIsNew(false);
    setForm(productToForm(p));
  };

  const handleUpload = async (file: File, field: "image" | "pdfCard") => {
    setUploading(field);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setForm((f) => (f ? { ...f, [field]: data.url } : f));
    } finally {
      setUploading(null);
    }
  };

  const updateSize = (i: number, patch: Partial<FormSize>) => {
    setForm((f) => (f ? { ...f, sizes: f.sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) } : f));
  };
  const addSize = () => {
    setForm((f) => (f ? { ...f, sizes: [...f.sizes, { ml: "", price: "" }] } : f));
  };
  const removeSize = (i: number) => {
    setForm((f) => (f ? { ...f, sizes: f.sizes.filter((_, idx) => idx !== i) } : f));
  };

  const handleSave = async () => {
    if (!form) return;
    const supabase = createClient();
    if (!supabase) {
      setError("Connect Supabase to save products — see supabase/schema.sql.");
      return;
    }
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    const id = isNew ? slugify(form.name) : form.id;
    if (!id) {
      setError("Couldn't generate a valid product ID from that name.");
      return;
    }
    setSaving(true);
    setError(null);
    const previousStock = products.find((p) => p.id === id)?.stock;
    const product = formToProduct({ ...form, id });
    const { error: dbError } = await supabase.from("products").upsert({
      id,
      name: product.name,
      price: product.price,
      stock: form.stock,
      data: product,
    });
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    if (previousStock !== undefined && previousStock <= 0 && form.stock > 0) {
      fetch("/api/admin/notify-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, productName: product.name }),
      }).catch(() => {});
    }
    if (previousStock !== undefined && previousStock > LOW_STOCK_THRESHOLD && form.stock > 0 && form.stock <= LOW_STOCK_THRESHOLD) {
      fetch("/api/admin/notify-lowstock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: product.name, stock: form.stock }),
      }).catch(() => {});
    }
    setForm(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    if (!window.confirm("Delete this product permanently?")) return;
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  if (form) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-[28px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>
            {isNew ? "Add Product" : `Edit — ${form.name}`}
          </h1>
          <button
            onClick={() => setForm(null)}
            className="flex items-center gap-1.5 text-[10px] text-warm-gray hover:text-cream tracking-wider uppercase"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            <X size={14} strokeWidth={1.5} /> Cancel
          </button>
        </div>
        <p className="text-[12px] text-warm-gray mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
          Fields marked with commas accept multiple values, e.g. <code className="text-gold">Oriental, Oud, Spicy</code>.
        </p>

        {error && (
          <p className="text-[12px] text-red-300 mb-4 p-3 border border-red-500/30 bg-red-500/5" style={{ fontFamily: "var(--font-body-family)" }}>
            {error}
          </p>
        )}

        <div className="space-y-8 max-w-[860px]">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Arabic Name">
              <input className={inputClass} value={form.arabicName} onChange={(e) => setForm({ ...form, arabicName: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <input className={inputClass} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </Field>
            <Field label="Meaning">
              <input className={inputClass} value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
            </Field>
            <Field label="Collection">
              <input className={inputClass} value={form.collection} onChange={(e) => setForm({ ...form, collection: e.target.value })} />
            </Field>
            <Field label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
            <Field label="Gender">
              <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </Field>
            <Field label="Badge (optional)">
              <input className={inputClass} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="NEW ARRIVAL, LIMITED…" />
            </Field>
          </div>

          {/* Copy */}
          <div className="space-y-4">
            <Field label="Short Description">
              <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Long Description">
              <textarea rows={5} className={inputClass} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} />
            </Field>
            <Field label="Vibe">
              <input className={inputClass} value={form.vibe} onChange={(e) => setForm({ ...form, vibe: e.target.value })} />
            </Field>
            <Field label="Audience (comma-separated)">
              <input className={inputClass} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            </Field>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Sizes &amp; Pricing (PKR)</p>
            <div className="space-y-3">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex items-end gap-3">
                  <Field label="ML"><input type="number" className={inputClass} value={s.ml} onChange={(e) => updateSize(i, { ml: e.target.value })} /></Field>
                  <Field label="Price"><input type="number" className={inputClass} value={s.price} onChange={(e) => updateSize(i, { price: e.target.value })} /></Field>
                  <button
                    onClick={() => removeSize(i)}
                    disabled={form.sizes.length <= 1}
                    className="mb-0.5 text-warm-gray hover:text-red-400 disabled:opacity-30 disabled:hover:text-warm-gray p-2.5 border border-gold/18"
                    aria-label="Remove size"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              <button
                onClick={addSize}
                className="flex items-center gap-1.5 text-[10px] text-gold border border-gold/25 px-3 py-2 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <Plus size={12} strokeWidth={2} /> Add Size
              </button>
            </div>
            <p className="text-[10px] text-warm-gray/85 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>
              The second size listed (or the first, if there&apos;s only one) is shown as the default price on cards.
            </p>
            <div className="mt-4 max-w-[280px]">
              <Field label="Original Price (optional — strikethrough sale price)">
                <input type="number" className={inputClass} value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Leave blank if not on sale" />
              </Field>
            </div>
          </div>

          {/* Image */}
          <div>
            <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Image</p>
            <div className="flex items-start gap-4">
              {form.image && (
                <div className="w-20 h-20 relative flex-shrink-0 border border-gold/15 overflow-hidden">
                  <Image src={form.image} alt="" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <Field label="Image URL">
                  <input className={inputClass} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/my-product.jpeg or https://…" />
                </Field>
                <label className="flex items-center gap-2 text-[10px] text-gold border border-gold/30 px-3 py-2 tracking-wider uppercase w-fit cursor-pointer hover:bg-gold/10 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                  <UploadCloud size={13} strokeWidth={1.5} />
                  {uploading === "image" ? "Uploading…" : "Upload to Cloudinary"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "image"); }}
                  />
                </label>
              </div>
            </div>
            <div className="mt-4">
              <Field label="Gallery URLs (comma-separated, optional)">
                <input className={inputClass} value={form.gallery} onChange={(e) => setForm({ ...form, gallery: e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Fragrance Card */}
          <div>
            <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Fragrance Card (optional)</p>
            <div className="flex items-start gap-4">
              {form.pdfCard && (
                <div className="w-20 h-20 relative flex-shrink-0 border border-gold/15 overflow-hidden">
                  <Image src={form.pdfCard} alt="" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <Field label="Card Image URL">
                  <input className={inputClass} value={form.pdfCard} onChange={(e) => setForm({ ...form, pdfCard: e.target.value })} placeholder="/zurtaan-card.png or https://…" />
                </Field>
                <label className="flex items-center gap-2 text-[10px] text-gold border border-gold/30 px-3 py-2 tracking-wider uppercase w-fit cursor-pointer hover:bg-gold/10 transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                  <UploadCloud size={13} strokeWidth={1.5} />
                  {uploading === "pdfCard" ? "Uploading…" : "Upload to Cloudinary"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading !== null}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "pdfCard"); }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Fragrance profile */}
          <div>
            <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Fragrance Profile</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Field label="Top Notes"><input className={inputClass} value={form.notesTop} onChange={(e) => setForm({ ...form, notesTop: e.target.value })} /></Field>
              <Field label="Heart Notes"><input className={inputClass} value={form.notesHeart} onChange={(e) => setForm({ ...form, notesHeart: e.target.value })} /></Field>
              <Field label="Base Notes"><input className={inputClass} value={form.notesBase} onChange={(e) => setForm({ ...form, notesBase: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Fragrance Family (comma-separated)"><input className={inputClass} value={form.fragranceFamily} onChange={(e) => setForm({ ...form, fragranceFamily: e.target.value })} /></Field>
              <Field label="Concentration"><input className={inputClass} value={form.concentration} onChange={(e) => setForm({ ...form, concentration: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Longevity (1–10)"><input type="number" min={1} max={10} className={inputClass} value={form.longevity} onChange={(e) => setForm({ ...form, longevity: Number(e.target.value) })} /></Field>
              <Field label="Projection (1–10)"><input type="number" min={1} max={10} className={inputClass} value={form.projection} onChange={(e) => setForm({ ...form, projection: Number(e.target.value) })} /></Field>
              <Field label="Sillage (1–10)"><input type="number" min={1} max={10} className={inputClass} value={form.sillage} onChange={(e) => setForm({ ...form, sillage: Number(e.target.value) })} /></Field>
              <Field label="Day / Night">
                <select className={inputClass} value={form.dayNight} onChange={(e) => setForm({ ...form, dayNight: e.target.value as FormState["dayNight"] })}>
                  <option value="day">Day</option>
                  <option value="night">Night</option>
                  <option value="both">Both</option>
                </select>
              </Field>
              <Field label="Made In"><input className={inputClass} value={form.madeIn} onChange={(e) => setForm({ ...form, madeIn: e.target.value })} /></Field>
              <Field label="Performance Text (optional, e.g. &ldquo;8–10 Hours&rdquo;)"><input className={inputClass} value={form.performanceText} onChange={(e) => setForm({ ...form, performanceText: e.target.value })} /></Field>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Occasions (comma-separated)"><input className={inputClass} value={form.occasions} onChange={(e) => setForm({ ...form, occasions: e.target.value })} /></Field>
            <Field label="Seasons (comma-separated)"><input className={inputClass} value={form.seasons} onChange={(e) => setForm({ ...form, seasons: e.target.value })} /></Field>
          </div>

          <Field label="Ingredients">
            <textarea rows={2} className={inputClass} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          </Field>

          {/* SEO */}
          <div>
            <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>SEO (optional overrides)</p>
            <div className="space-y-4">
              <Field label="Page Title"><input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Auto-generated if left blank" /></Field>
              <Field label="Meta Description"><textarea rows={2} className={inputClass} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="Auto-generated if left blank" /></Field>
            </div>
          </div>

          {/* Inventory & Status */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <Field label="Stock">
              <input type="number" min={0} className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </Field>
            <div className="flex flex-col gap-2 pb-2.5">
              <label className="flex items-center gap-2 text-[11px] text-cream cursor-pointer" style={{ fontFamily: "var(--font-body-family)" }}>
                <input type="checkbox" checked={form.limitedEdition} onChange={(e) => setForm({ ...form, limitedEdition: e.target.checked })} className="accent-gold" />
                Limited Edition
              </label>
              <label className="flex items-center gap-2 text-[11px] text-cream cursor-pointer" style={{ fontFamily: "var(--font-body-family)" }}>
                <input type="checkbox" checked={form.comingSoon} onChange={(e) => setForm({ ...form, comingSoon: e.target.checked })} className="accent-gold" />
                Coming Soon (hides from shop, non-purchasable teaser)
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 text-[11px] text-obsidian bg-gold px-6 py-3 tracking-[0.15em] uppercase disabled:opacity-50"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            <Save size={14} strokeWidth={2} /> {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="font-display text-[28px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>Products &amp; Inventory</h1>
        <button
          onClick={startNew}
          className="flex items-center gap-2 text-[10px] text-obsidian bg-gold px-4 py-2.5 tracking-[0.15em] uppercase"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          <Plus size={13} strokeWidth={2} /> Add Product
        </button>
      </div>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        {loaded ? `${products.length} product${products.length === 1 ? "" : "s"} live.` : "Loading…"} Changes save to Supabase and appear on the storefront immediately.
      </p>

      <div className="border border-gold/12 divide-y divide-gold/10">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 flex-wrap">
            <div className="w-14 h-14 relative flex-shrink-0 border border-gold/15 overflow-hidden">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <p className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{p.name}</p>
              <p className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                {p.collection} · PKR {p.price.toLocaleString()}
                {p.originalPrice !== undefined && (
                  <span className="line-through opacity-60 ml-1">PKR {p.originalPrice.toLocaleString()}</span>
                )}
                {" "}· Stock: {p.stock ?? "∞"}
                {p.stock !== undefined && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && (
                  <span className="ml-2 text-[9px] text-red-300 tracking-wider uppercase">Low Stock</span>
                )}
                {p.comingSoon && (
                  <span className="ml-2 text-[9px] text-gold tracking-wider uppercase">Coming Soon</span>
                )}
              </p>
            </div>
            <button
              onClick={() => startEdit(p)}
              className="flex items-center gap-1.5 text-[10px] text-warm-gray border border-gold/20 px-3 py-2 hover:border-gold/40 hover:text-cream transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <Pencil size={12} strokeWidth={1.5} /> Edit
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              disabled={deleting === p.id}
              className="flex items-center gap-1.5 text-[10px] text-red-400 border border-red-500/25 px-3 py-2 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <Trash2 size={12} strokeWidth={1.5} /> {deleting === p.id ? "…" : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
