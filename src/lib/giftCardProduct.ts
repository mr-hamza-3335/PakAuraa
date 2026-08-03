import type { Product } from "./data";

/** Set by the "Check a Gift Card" page when the customer clicks "Shop &
 * Redeem" — checkout reads and auto-applies it on mount so the code they
 * just verified doesn't have to be retyped from memory. */
export const PENDING_GIFT_CARD_KEY = "pakauraa-pending-giftcard";

/**
 * A gift card is modeled as a real Product so it can flow through the
 * existing cart/checkout/payment pipeline unchanged (COD, Stripe, EasyPaisa,
 * JazzCash all already work for any Product) instead of a bespoke parallel
 * payment path. The descriptive fragrance fields are intentionally inert.
 */
export function createGiftCardProduct(amount: number): Product {
  return {
    id: `gift-card-${amount}`,
    name: "PakAuraa Gift Card",
    arabicName: "",
    meaning: "",
    tagline: "Give the gift of fragrance",
    collection: "Gift Cards",
    category: "Gift Card",
    fragranceFamily: [],
    gender: "unisex",
    audience: [],
    vibe: "",
    description: "A digital PakAuraa gift card, delivered by email.",
    longDescription: "A digital PakAuraa gift card, delivered straight to the recipient's inbox — redeemable against any fragrance at checkout.",
    price: amount,
    sizes: [{ ml: 0, price: amount }],
    size: "Digital",
    gradient: "product-gradient-default",
    image: "/packaging-lifestyle.jpeg",
    gallery: ["/packaging-lifestyle.jpeg"],
    notes: { top: [], heart: [], base: [] },
    longevity: 0,
    projection: 0,
    concentration: "Gift Card",
    occasions: ["Gifting"],
    seasons: [],
    dayNight: "both",
    madeIn: "Pakistan",
    ingredients: "",
  };
}
