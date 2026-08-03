"use client";

import { usePathname } from "next/navigation";

export const WHATSAPP_NUMBER = "923252106239"; // +92 325 2106239 — PakAuraa support line

export function whatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Floating chat button, on every storefront page except the admin panel and checkout. */
export default function WhatsAppWidget() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) return null;

  return (
    <a
      href={whatsAppLink("Hi PakAuraa! I'd like to ask about a fragrance.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with PakAuraa on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.4 1.32-1.94 1.4-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.16-4.93-4.35-.15-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.27.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.2 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.65.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
      </svg>
    </a>
  );
}
