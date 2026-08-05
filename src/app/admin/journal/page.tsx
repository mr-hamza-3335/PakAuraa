"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, X, Pencil, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

interface FormState {
  id: string | null;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  published: boolean;
}

const blankForm: FormState = { id: null, slug: "", title: "", excerpt: "", content: "", coverImage: "", author: "PakAuraa", published: false };

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const inputClass = "w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors";
const labelClass = "block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-1.5";

export default function AdminJournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoaded(true);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const startNew = () => {
    setError(null);
    setForm({ ...blankForm });
  };

  const startEdit = (p: Post) => {
    setError(null);
    setForm({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.cover_image ?? "",
      author: p.author,
      published: p.published,
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setForm((f) => (f ? { ...f, coverImage: data.url } : f));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    const supabase = createClient();
    if (!supabase) {
      setError("Connect Supabase to save posts.");
      return;
    }
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError("Title, excerpt, and content are required.");
      return;
    }
    const slug = form.slug.trim() || slugify(form.title);
    setSaving(true);
    setError(null);

    const payload = {
      slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      cover_image: form.coverImage || null,
      author: form.author || "PakAuraa",
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
    };

    const { error: dbError } = form.id
      ? await supabase.from("blog_posts").update(payload).eq("id", form.id)
      : await supabase.from("blog_posts").insert(payload);

    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setForm(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    if (!window.confirm("Delete this post permanently?")) return;
    setDeleting(id);
    await supabase.from("blog_posts").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  if (form) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-[28px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>
            {form.id ? "Edit Post" : "New Post"}
          </h1>
          <button onClick={() => setForm(null)} className="flex items-center gap-1.5 text-[10px] text-warm-gray hover:text-cream tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
            <X size={14} strokeWidth={1.5} /> Cancel
          </button>
        </div>
        <p className="text-[12px] text-warm-gray mb-6" style={{ fontFamily: "var(--font-body-family)" }}>Leave slug blank to auto-generate it from the title.</p>

        {error && (
          <p className="text-[12px] text-red-300 mb-4 p-3 border border-red-500/30 bg-red-500/5" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>
        )}

        <div className="space-y-6 max-w-[720px]">
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Title</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ fontFamily: "var(--font-body-family)" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Slug (optional)</label>
              <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.title) || "auto-generated"} style={{ fontFamily: "var(--font-body-family)" }} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Author</label>
              <input className={inputClass} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={{ fontFamily: "var(--font-body-family)" }} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Cover Image (optional)</label>
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="" className="w-full max-w-[320px] aspect-[16/10] object-cover border border-gold/15 mb-3" />
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <input className={inputClass} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="/sultan-e-zafroon.jpeg or https://…" style={{ fontFamily: "var(--font-body-family)" }} />
              <label className="flex items-center justify-center gap-2 text-[10px] text-gold border border-gold/30 px-3 py-2.5 tracking-wider uppercase w-fit cursor-pointer hover:bg-gold/10 transition-colors whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>
                <UploadCloud size={13} strokeWidth={1.5} />
                {uploading ? "Uploading…" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                />
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Excerpt</label>
            <textarea rows={2} className={inputClass} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} style={{ fontFamily: "var(--font-body-family)" }} />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Content (Markdown/plain text)</label>
            <textarea rows={14} className={inputClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ fontFamily: "var(--font-body-family)" }} />
          </div>
          <label className="flex items-center gap-2 text-[11px] text-cream cursor-pointer" style={{ fontFamily: "var(--font-body-family)" }}>
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-gold" />
            Published (visible on the storefront)
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 text-[11px] text-obsidian bg-gold px-6 py-3 tracking-[0.15em] uppercase disabled:opacity-50"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            <Save size={14} strokeWidth={2} /> {saving ? "Saving…" : "Save Post"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <h1 className="font-display text-[28px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>Journal</h1>
        <button onClick={startNew} className="flex items-center gap-2 text-[10px] text-obsidian bg-gold px-4 py-2.5 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
          <Plus size={13} strokeWidth={2} /> New Post
        </button>
      </div>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        {loaded ? `${posts.length} post${posts.length === 1 ? "" : "s"}.` : "Loading…"}
      </p>

      <div className="border border-gold/12 divide-y divide-gold/10">
        {posts.length === 0 && loaded && (
          <p className="p-4 text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>No posts yet.</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <p className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{p.title}</p>
              <p className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>/journal/{p.slug}</p>
            </div>
            <span className={`text-[9px] tracking-wider uppercase px-2.5 py-1 border ${p.published ? "border-gold/40 text-gold" : "border-warm-gray/20 text-warm-gray/85"}`} style={{ fontFamily: "var(--font-body-family)" }}>
              {p.published ? "Published" : "Draft"}
            </span>
            <button onClick={() => startEdit(p)} className="flex items-center gap-1.5 text-[10px] text-warm-gray border border-gold/20 px-3 py-2 hover:border-gold/40 hover:text-cream transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
              <Pencil size={12} strokeWidth={1.5} /> Edit
            </button>
            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="flex items-center gap-1.5 text-[10px] text-red-400 border border-red-500/25 px-3 py-2 hover:bg-red-500/10 transition-colors disabled:opacity-50" style={{ fontFamily: "var(--font-body-family)" }}>
              <Trash2 size={12} strokeWidth={1.5} /> {deleting === p.id ? "…" : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
