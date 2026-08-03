/**
 * Whether a live Supabase project is wired up. Every Supabase-backed page
 * checks this before making a request, so the site degrades to an honest
 * "not configured yet" message instead of crashing when these env vars
 * are absent (e.g. running the storefront without a backend yet).
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
