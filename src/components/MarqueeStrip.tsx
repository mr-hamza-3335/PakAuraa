export default function MarqueeStrip() {
  const text =
    "LUXURY · ELEGANCE · PAKISTAN · ROYAL · CRAFTED · AUTHENTIC · TIMELESS · SIGNATURE · ";
  const repeated = text.repeat(6);

  return (
    <div className="relative overflow-hidden py-5 bg-charcoal border-y border-gold/10">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-charcoal to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-charcoal to-transparent z-10 pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        <span
          className="text-[11px] tracking-[0.3em] text-warm-gray"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          {repeated}
        </span>
        {/* Duplicate for seamless loop */}
        <span
          className="text-[11px] tracking-[0.3em] text-warm-gray"
          aria-hidden
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          {repeated}
        </span>
      </div>
    </div>
  );
}
