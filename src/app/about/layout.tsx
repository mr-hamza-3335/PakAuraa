import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "PakAuraa is a Lahore-born luxury fragrance house crafting Arabic-inspired perfumes — Sultan-e-Zafroon, Naazif, Zurtaan, Zarfah, and Nuxtar — with rare oud, saffron, and Bulgarian rose.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
