import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostBySlug } from "@/lib/blog.server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Journal" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <article className="max-w-[720px] mx-auto px-6 lg:px-12">
          <Link href="/journal" className="inline-flex items-center gap-1.5 text-[10px] text-gold hover:text-gold-light tracking-[0.15em] uppercase mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
            <ArrowLeft size={12} strokeWidth={1.5} /> The Journal
          </Link>

          {post.publishedAt && (
            <p className="text-[9px] text-gold tracking-[0.2em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.author}
            </p>
          )}
          <h1 className="font-display text-[clamp(28px,4vw,42px)] text-cream mb-8 leading-tight" style={{ fontFamily: "var(--font-display-family)" }}>
            {post.title}
          </h1>

          {post.coverImage && (
            <div className="aspect-[16/9] relative overflow-hidden mb-10 border border-gold/12">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="720px" priority />
            </div>
          )}

          <div className="text-[15px] text-warm-gray leading-[1.9] whitespace-pre-line" style={{ fontFamily: "var(--font-body-family)" }}>
            {post.content}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
