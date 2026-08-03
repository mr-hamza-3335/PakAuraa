import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Fragrances",
  description:
    "Browse PakAuraa's full collection — For Him, For Her, Unisex, Arabic Collection, Signature Collection, Limited Edition, and Gift Sets.",
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
