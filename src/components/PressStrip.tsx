import Link from "next/link";
import Image from "next/image";
import { getPublishedPress } from "@/lib/press.server";

/** "As seen in" trust strip — only renders once at least one press mention
 * is published, so the homepage never shows an empty placeholder. */
export default async function PressStrip() {
  const mentions = await getPublishedPress();
  if (mentions.length === 0) return null;

  return (
    <section className="py-14 px-6 lg:px-12 bg-charcoal/30 border-y border-gold/8">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-[9px] text-gold tracking-[0.4em] uppercase text-center mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
          As Seen In
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {mentions.map((m) => {
            const content = m.image ? (
              <Image src={m.image} alt={m.outlet} width={120} height={40} className="h-8 w-auto object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300" />
            ) : (
              <span className="text-[13px] text-warm-gray hover:text-gold tracking-[0.1em] uppercase transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                {m.outlet}
              </span>
            );
            return m.link ? (
              <Link key={m.id} href={m.link} target="_blank" rel="noopener noreferrer">
                {content}
              </Link>
            ) : (
              <span key={m.id}>{content}</span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
