"use client";

import type { Product } from "./data";
import type { Order } from "./store";
import { getConsent } from "./consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

/** GA4 is configured as a tag inside the GTM container (not loaded directly
 * via gtag.js), so every GA4-bound event is really just a dataLayer push —
 * this guarantees the array exists even if gtm.js itself hasn't executed
 * yet, so no push is silently dropped while the script is still loading. */
function pushToDataLayer(payload: Record<string, unknown>) {
  (window.dataLayer = window.dataLayer || []).push(payload);
}

/** All events route through here — a single place that respects consent and
 * fans out to whichever scripts are actually configured and loaded. */
function fire(gaName: string, gaParams: Record<string, unknown>, metaName?: string, metaParams?: Record<string, unknown>) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  pushToDataLayer({ event: gaName, ...gaParams });
  if (metaName) window.fbq?.("track", metaName, metaParams ?? gaParams);
}

function productItem(product: Product, opts?: { price?: number; quantity?: number }) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.collection,
    item_brand: "PakAuraa",
    price: opts?.price ?? product.price,
    quantity: opts?.quantity ?? 1,
  };
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || getConsent() !== "granted") return;
  pushToDataLayer({ event: "page_view", page_path: path });
  window.fbq?.("track", "PageView");
}

export function trackSearch(query: string) {
  if (!query.trim()) return;
  fire("search", { search_term: query }, "Search", { search_string: query });
}

/** Fired when a product card/tile is clicked through to its PDP. */
export function trackProductClick(product: Product) {
  fire(
    "select_item",
    { item_list_name: "product_list", items: [productItem(product)] },
    "ViewContent",
    { content_ids: [product.id], content_name: product.name, content_type: "product", value: product.price, currency: "PKR" }
  );
}

export function trackViewProduct(product: Product) {
  fire(
    "view_item",
    { currency: "PKR", value: product.price, items: [productItem(product)] },
    "ViewContent",
    { content_ids: [product.id], content_name: product.name, content_type: "product", value: product.price, currency: "PKR" }
  );
}

export function trackAddToCart(product: Product, price: number, quantity = 1) {
  fire(
    "add_to_cart",
    { currency: "PKR", value: price * quantity, items: [productItem(product, { price, quantity })] },
    "AddToCart",
    { content_ids: [product.id], content_name: product.name, content_type: "product", value: price * quantity, currency: "PKR" }
  );
}

export function trackWishlist(product: Product, added: boolean) {
  if (!added) {
    fire("remove_from_wishlist", { items: [productItem(product)] });
    return;
  }
  fire(
    "add_to_wishlist",
    { currency: "PKR", value: product.price, items: [productItem(product)] },
    "AddToWishlist",
    { content_ids: [product.id], content_name: product.name, content_type: "product", value: product.price, currency: "PKR" }
  );
}

export function trackBeginCheckout(items: { product: Product; price: number; quantity: number }[], value: number) {
  fire(
    "begin_checkout",
    { currency: "PKR", value, items: items.map((i) => productItem(i.product, { price: i.price, quantity: i.quantity })) },
    "InitiateCheckout",
    { value, currency: "PKR", content_ids: items.map((i) => i.product.id), num_items: items.length }
  );
}

export function trackContactFormSubmit() {
  fire("generate_lead", { method: "contact_form" }, "Contact");
}

export function trackNewsletterSubscribe() {
  fire("sign_up", { method: "newsletter" }, "Lead", { content_name: "newsletter" });
}

/** Fired once per completed order — callers must dedupe by order id (see OrderConfirmationClient). */
export function trackPurchase(order: Order) {
  const nonGiftCardItems = order.items.filter((i) => !i.product.id.startsWith("gift-card-"));
  fire(
    "purchase",
    {
      transaction_id: order.id,
      currency: "PKR",
      value: order.total,
      items: nonGiftCardItems.map((i) => productItem(i.product, { price: i.price, quantity: i.quantity })),
    },
    "Purchase",
    { value: order.total, currency: "PKR", content_ids: nonGiftCardItems.map((i) => i.product.id), num_items: nonGiftCardItems.length }
  );
}
