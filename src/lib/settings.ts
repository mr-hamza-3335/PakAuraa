import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "PKR" | "USD" | "AED" | "GBP";
export type Language = "en" | "ur";

export const rtlLanguages: Language[] = ["ur"];

/** Static illustrative FX rates against PKR. Swap for a live rate feed in production. */
export const currencyRates: Record<Currency, { rate: number; symbol: string }> = {
  PKR: { rate: 1, symbol: "PKR" },
  USD: { rate: 1 / 278, symbol: "$" },
  AED: { rate: 1 / 75.7, symbol: "AED" },
  GBP: { rate: 1 / 351, symbol: "£" },
};

interface SettingsStore {
  currency: Currency;
  language: Language;
  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      currency: "PKR",
      language: "en",
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
    }),
    { name: "pakauraa-settings" }
  )
);

/** Formats a PKR-denominated amount into the selected display currency. */
export function formatPrice(pkrAmount: number, currency: Currency): string {
  const { rate, symbol } = currencyRates[currency];
  const converted = pkrAmount * rate;
  const rounded = currency === "PKR" ? Math.round(converted) : Math.round(converted * 100) / 100;
  return `${symbol} ${rounded.toLocaleString(undefined, {
    minimumFractionDigits: currency === "PKR" ? 0 : 2,
    maximumFractionDigits: currency === "PKR" ? 0 : 2,
  })}`;
}
