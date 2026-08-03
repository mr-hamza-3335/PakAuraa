"use client";

import { useEffect } from "react";
import { useSettings, rtlLanguages } from "@/lib/settings";

/** Keeps <html lang>/<html dir> in sync with the chosen language — this is
 * what actually flips the site into right-to-left for Urdu and Arabic. */
export default function LocaleEffect() {
  const language = useSettings((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.includes(language) ? "rtl" : "ltr";
  }, [language]);

  return null;
}
