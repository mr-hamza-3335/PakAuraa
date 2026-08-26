import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** Daily cron: flips affiliate commissions from "pending" (10-day hold)
 * to "available" once earned_at + 10 days has passed.
 *
 * Schedule this in Vercel Cron (vercel.json) as:
 * { "path": "/api/cron/release-commissions", "schedule": "0 0 * * *" }
 *
 * Also callable manually by an admin via POST.
 */
export async function POST() {
  return release();
}

export async function GET() {
  return release();
}

async function release() {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const now = new Date().toISOString();

  // Find all pending commissions whose available_at is in the past
  const { data: commissions, error: fetchError } = await admin
    .from("affiliate_commissions")
    .select("id")
    .eq("status", "pending")
    .lte("available_at", now);

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  if (!commissions || commissions.length === 0) {
    return NextResponse.json({ released: 0 });
  }

  // Flip them to available
  const ids = commissions.map((c) => c.id);
  const { error: updateError } = await admin
    .from("affiliate_commissions")
    .update({ status: "available" })
    .in("id", ids);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ released: ids.length });
}