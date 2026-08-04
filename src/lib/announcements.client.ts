"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Announcement {
  id: string;
  message: string;
  link: string | null;
  sortOrder: number;
}

function mapRow(row: {
  id: string;
  message: string;
  link: string | null;
  sort_order: number;
}): Announcement {
  return { id: row.id, message: row.message, link: row.link, sortOrder: row.sort_order };
}

/** Live, active announcements for the site-wide promo strip — empty when Supabase isn't configured. */
export function useActiveAnnouncements(): Announcement[] {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("announcements")
      .select("id, message, link, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setItems((data ?? []).map(mapRow));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
