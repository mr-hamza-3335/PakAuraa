import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./data";
import { trackAddToCart, trackWishlist } from "./analytics";

export interface GiftCardRecipient {
  email: string;
  name?: string;
  message?: string;
  senderName?: string;
}

export interface CartItem {
  product: Product;
  size: number;
  price: number;
  quantity: number;
  giftWrap?: boolean;
  engrave?: boolean;
  giftCardRecipient?: GiftCardRecipient;
}

/** Personalisation surcharges, folded into the stored line price at add-to-cart time. */
export const GIFT_WRAP_PRICE = 200;
export const ENGRAVE_PRICE = 500;

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  landmark?: string;
}

export type PaymentMethod = "cod" | "card" | "easypaisa" | "jazzcash" | "giftcard";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: "pending" | "paid" | "cod" | "shipped" | "delivered" | "cancelled";
  customer: OrderCustomer;
  createdAt: string;
  couponCode?: string;
  giftCardCode?: string;
  giftCardAmount?: number;
  referralCode?: string;
  courierCompany?: string;
  courierHelpline?: string;
  riderName?: string;
  riderPhone?: string;
  deliveredBy?: string;
  deliveredTo?: string;
  deliveredAt?: string;
  cancelReason?: string;
  cancelNote?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  giftCardsIssued?: boolean;
}

interface Store {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  quickViewProduct: Product | null;
  orders: Order[];
  recentlyViewed: string[];
  compareList: string[];

  addToCart: (
    product: Product,
    size: number,
    price: number,
    options?: { giftWrap?: boolean; engrave?: boolean; giftCardRecipient?: GiftCardRecipient; quantity?: number }
  ) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, qty: number) => void;
  clearCart: () => void;

  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;

  addRecentlyViewed: (productId: string) => void;

  toggleCompare: (productId: string) => void;
  isComparing: (productId: string) => boolean;
  clearCompare: () => void;

  setCartOpen: (open: boolean) => void;
  setQuickView: (product: Product | null) => void;

  placeOrder: (
    customer: OrderCustomer,
    paymentMethod: PaymentMethod,
    discount?: number,
    couponCode?: string,
    giftCardCode?: string,
    giftCardAmount?: number,
    referralCode?: string
  ) => Order;

  cartCount: () => number;
  cartTotal: () => number;
  distinctProductCount: () => number;
  bundleDiscount: () => number;
}

/** Buy 2+ distinct fragrances, save 10% off the subtotal — applied automatically. */
export const BUNDLE_MIN_ITEMS = 2;
export const BUNDLE_DISCOUNT_RATE = 0.1;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      quickViewProduct: null,
      orders: [],
      recentlyViewed: [],
      compareList: [],

      addToCart: (product, size, price, options) => {
        const giftWrap = options?.giftWrap ?? false;
        const engrave = options?.engrave ?? false;
        const giftCardRecipient = options?.giftCardRecipient;
        const quantity = options?.quantity ?? 1;
        const finalPrice = price + (giftWrap ? GIFT_WRAP_PRICE : 0) + (engrave ? ENGRAVE_PRICE : 0);
        set((state) => {
          // Gift cards always get their own line — the product id is already
          // uniquified per purchase (see /gift-cards), so this never merges.
          if (giftCardRecipient) {
            return { cart: [...state.cart, { product, size, price: finalPrice, quantity, giftCardRecipient }] };
          }
          const existing = state.cart.find(
            (i) => i.product.id === product.id && i.size === size && !!i.giftWrap === giftWrap && !!i.engrave === engrave
          );
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { cart: [...state.cart, { product, size, price: finalPrice, quantity, giftWrap, engrave }] };
        });
        // Gift cards aren't real catalog products — trackPurchase already
        // excludes them, so add_to_cart skips them too for consistency.
        if (!giftCardRecipient) trackAddToCart(product, finalPrice, quantity);
      },

      removeFromCart: (productId, size) => {
        set((state) => ({
          cart: state.cart.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        }));
      },

      updateQuantity: (productId, size, qty) => {
        if (qty < 1) {
          get().removeFromCart(productId, size);
          return;
        }
        set((state) => ({
          cart: state.cart.map((i) =>
            i.product.id === productId && i.size === size
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (product) => {
        const willAdd = !get().wishlist.includes(product.id);
        set((state) => ({
          wishlist: willAdd
            ? [...state.wishlist, product.id]
            : state.wishlist.filter((id) => id !== product.id),
        }));
        trackWishlist(product, willAdd);
      },

      isWishlisted: (productId) => get().wishlist.includes(productId),

      addRecentlyViewed: (productId) => {
        set((state) => ({
          recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 12),
        }));
      },

      toggleCompare: (productId) => {
        set((state) => {
          if (state.compareList.includes(productId)) {
            return { compareList: state.compareList.filter((id) => id !== productId) };
          }
          if (state.compareList.length >= 4) return state;
          return { compareList: [...state.compareList, productId] };
        });
      },

      isComparing: (productId) => get().compareList.includes(productId),

      clearCompare: () => set({ compareList: [] }),

      setCartOpen: (open) => set({ cartOpen: open }),

      setQuickView: (product) => set({ quickViewProduct: product }),

      placeOrder: (customer, paymentMethod, discount = 0, couponCode, giftCardCode, giftCardAmount, referralCode) => {
        const state = get();
        const order: Order = {
          id: `PA-${Date.now().toString(36).toUpperCase()}`,
          items: state.cart,
          total: Math.max(0, state.cartTotal() - discount),
          paymentMethod,
          // JazzCash is a manual bank-transfer style payment — nobody has
          // actually looked at the screenshot yet, so it stays "pending"
          // until an admin confirms it in /admin/orders (see confirm-payment
          // route). COD and an already-verified gift card balance are real
          // money the moment the order is placed, so those go straight to
          // their final state.
          status: paymentMethod === "cod" ? "cod" : paymentMethod === "jazzcash" ? "pending" : "paid",
          customer,
          createdAt: new Date().toISOString(),
          couponCode,
          giftCardCode,
          giftCardAmount,
          referralCode,
        };
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        return order;
      },

      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      cartTotal: () =>
        get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),

      distinctProductCount: () => new Set(get().cart.map((i) => i.product.id)).size,

      bundleDiscount: () =>
        get().distinctProductCount() >= BUNDLE_MIN_ITEMS
          ? Math.round(get().cartTotal() * BUNDLE_DISCOUNT_RATE)
          : 0,
    }),
    {
      name: "pakauraa-store",
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, orders: state.orders, recentlyViewed: state.recentlyViewed, compareList: state.compareList }),
      skipHydration: true,
    }
  )
);
