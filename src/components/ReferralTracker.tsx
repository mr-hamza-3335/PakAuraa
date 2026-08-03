"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { REFERRAL_STORAGE_KEY } from "@/lib/affiliate";

/** Captures ?ref=CODE on any landing page and remembers it (30-day
 * attribution window) so checkout can credit the right affiliate even if
 * the customer browses for days before buying. */
export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({ code: ref.toUpperCase(), expires: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
  }, [searchParams]);

  return null;
}
