import { createClient } from "./supabase/server";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string;
  publishedAt: string | null;
}

function mapRow(r: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author: string;
  published_at: string | null;
}): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverImage: r.cover_image,
    author: r.author,
    publishedAt: r.published_at,
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, cover_image, author, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []).map(mapRow);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, cover_image, author, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ? mapRow(data) : null;
}
