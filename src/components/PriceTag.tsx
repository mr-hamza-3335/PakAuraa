import type { Currency } from "@/lib/settings";
import { formatPrice } from "@/lib/settings";

/** Sale-aware price display: strikes through `originalPrice` beside the current `price` when set. */
export default function PriceTag({
  price,
  originalPrice,
  currency,
  className = "text-[13px] text-cream",
  originalClassName = "text-[10px] text-warm-gray/60 line-through",
}: {
  price: number;
  originalPrice?: number;
  currency: Currency;
  className?: string;
  originalClassName?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
      {originalPrice && originalPrice > price && (
        <span className={originalClassName}>{formatPrice(originalPrice, currency)}</span>
      )}
      <span className={className}>{formatPrice(price, currency)}</span>
    </span>
  );
}
