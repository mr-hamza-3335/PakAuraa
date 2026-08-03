"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function getSessionId() {
  const key = "pk_sid";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

/** Records an anonymous page view per route change. Skips /admin so the
 * dashboard doesn't count its own operator's visits as customer traffic. */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !pathname || pathname.startsWith("/admin")) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const supabase = createClient();
    if (!supabase) return;

    supabase
      .from("page_views")
      .insert({ path: pathname, referrer: document.referrer || null, session_id: getSessionId() })
      .then(({ error }) => {
        if (error) console.warn("page view tracking failed:", error.message);
      });
  }, [pathname]);

  return null;
}
