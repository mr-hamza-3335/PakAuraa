"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { trackPageView } from "@/lib/analytics";
import { getConsent, onConsentChange } from "@/lib/consent";

function getSessionId() {
  const key = "pk_sid";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

/** Records a page view per route change, both internally (Supabase, always
 * on) and to GTM/Meta (only once consent is granted). The marketing side is
 * deliberately a separate effect+ref from the Supabase side: it re-runs when
 * consent flips from pending to granted, so the very first page a visitor
 * landed on before deciding still gets its page_view once they accept —
 * without this, that view would be marked "seen" and never sent. Skips
 * /admin so the dashboard doesn't count its own operator's visits as
 * customer traffic. */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTrackedMarketing = useRef<string | null>(null);
  const lastTrackedInternal = useRef<string | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    // Hydration guard: consent lives in localStorage, so it must render as
    // "not granted" on the server and first client paint before the real
    // state appears.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentGranted(getConsent() === "granted");
    return onConsentChange((state) => setConsentGranted(state === "granted"));
  }, []);

  useEffect(() => {
    if (!consentGranted || !pathname || pathname.startsWith("/admin")) return;
    if (lastTrackedMarketing.current === pathname) return;
    lastTrackedMarketing.current = pathname;
    trackPageView(pathname);
  }, [pathname, consentGranted]);

  useEffect(() => {
    if (!isSupabaseConfigured || !pathname || pathname.startsWith("/admin")) return;
    if (lastTrackedInternal.current === pathname) return;
    lastTrackedInternal.current = pathname;

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
