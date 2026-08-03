import { createClient } from "./supabase/server";

export interface PressMention {
  id: string;
  outlet: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  link: string | null;
  publishedAt: string | null;
}

function mapRow(r: {
  id: string;
  outlet: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  link: string | null;
  published_at: string | null;
}): PressMention {
  return {
    id: r.id,
    outlet: r.outlet,
    title: r.title,
    excerpt: r.excerpt,
    image: r.image,
    link: r.link,
    publishedAt: r.published_at,
  };
}

export async function getPublishedPress(): Promise<PressMention[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("press_mentions")
    .select("id, outlet, title, excerpt, image, link, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []).map(mapRow);
}
