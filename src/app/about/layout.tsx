import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "PakAuraa is a Karachi-born luxury fragrance house crafting premium perfumes — Zurtaan and Zarfah.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
