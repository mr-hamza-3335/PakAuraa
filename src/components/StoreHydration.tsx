"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Rehydrates the persisted cart/wishlist/orders store after mount, once
 * the server-rendered markup is already committed — avoids the hydration
 * mismatch that a synchronous localStorage read on the client would cause. */
export default function StoreHydration() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return null;
}
