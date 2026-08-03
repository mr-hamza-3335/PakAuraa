import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPosts } from "@/lib/blog.server";

export const metadata: Metadata = {
  title: "Journal",
  description: "Stories on fragrance craft, ingredients, and the world of PakAuraa.",
};

export default async function JournalPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>PakAuraa</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-14 text-center" style={{ fontFamily: "var(--font-display-family)" }}>
            The Journal
          </h1>

          {posts.length === 0 ? (
            <p className="text-[13px] text-warm-gray text-center" style={{ fontFamily: "var(--font-body-family)" }}>No stories published yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/journal/${post.slug}`} className="group block border border-gold/12 bg-charcoal/30 overflow-hidden hover:border-gold/30 transition-colors">
                  {post.coverImage && (
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                    </div>
                  )}
                  <div className="p-6">
                    {post.publishedAt && (
                      <p className="text-[9px] text-gold tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                    <h2 className="font-elegant text-[20px] text-cream mb-2 group-hover:text-gold-light transition-colors" style={{ fontFamily: "var(--font-elegant-family)" }}>
                      {post.title}
                    </h2>
                    <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
