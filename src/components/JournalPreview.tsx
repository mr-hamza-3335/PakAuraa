import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/blog.server";

/** Surfaces the latest Journal posts on the homepage — the footer link alone
 * gets almost no clicks, so this is the real discovery path for customers. */
export default async function JournalPreview() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-obsidian">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <p className="text-[9px] text-gold tracking-[0.4em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Stories</p>
            <h2 className="font-display text-[clamp(28px,4vw,44px)] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>From the Journal</h2>
          </div>
          <Link
            href="/journal"
            className="flex items-center gap-2 text-[10px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5 hover:border-gold transition-colors"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Read the Journal <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} className="group block border border-gold/12 bg-charcoal/30 overflow-hidden hover:border-gold/30 transition-colors">
              {post.coverImage && (
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-elegant text-[17px] text-cream mb-2 group-hover:text-gold-light transition-colors" style={{ fontFamily: "var(--font-elegant-family)" }}>
                  {post.title}
                </h3>
                <p className="text-[12px] text-warm-gray leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-body-family)" }}>{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
