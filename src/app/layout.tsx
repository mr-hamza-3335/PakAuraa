import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Playfair_Display, Cormorant_Garamond, Inter, Scheherazade_New } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";
import CartDrawer from "@/components/CartDrawer";
import QuickView from "@/components/QuickView";
import StoreHydration from "@/components/StoreHydration";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import CompareBar from "@/components/CompareBar";
import ReferralTracker from "@/components/ReferralTracker";
import LocaleEffect from "@/components/LocaleEffect";
import { organizationJsonLd, localBusinessJsonLd, websiteJsonLd, BRAND_KEYWORDS } from "@/lib/seo";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pakauraa.com"),
  title: {
    default: "PakAuraa — Luxury Perfumes | Premium Fragrances from Pakistan",
    template: "%s | PakAuraa Luxury Perfumes",
  },
  description:
    "Discover world-class luxury perfumes by PakAuraa. Authentic Arabic-inspired fragrances crafted for royalty in Lahore, Pakistan. Sultan-e-Zafroon, Naazif, Zurtaan, Zarfah, Nuxtar.",
  keywords: [
    ...BRAND_KEYWORDS,
    "Arabic fragrance",
    "premium perfume",
    "Lahore perfume",
    "Pakistani luxury brand",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pakauraa.com",
    siteName: "PakAuraa Luxury Perfumes",
    title: "PakAuraa — Luxury Perfumes | Born in Pakistan",
    description:
      "World-class luxury fragrances, crafted in Pakistan for the global connoisseur.",
    images: [{ url: "/sultan-e-zafroon-v2.jpeg", width: 1200, height: 630, alt: "PakAuraa Luxury Perfumes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PakAuraa — Luxury Perfumes",
    description: "Born in Pakistan. Worn by royalty.",
    images: ["/sultan-e-zafroon-v2.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${scheherazade.variable}`}
    >
      <body className="min-h-screen bg-obsidian antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]),
          }}
        />
        <StoreHydration />
        <LocaleEffect />
        <Suspense fallback={null}>
          <ReferralTracker />
        </Suspense>
        <PageViewTracker />
        <WhatsAppWidget />
        <CompareBar />
        <LoadingScreen />
        <CartDrawer />
        <QuickView />
        {children}
      </body>
    </html>
  );
}
