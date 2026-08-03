import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** Upserts a snapshot of the in-progress cart once the customer's email is
 * known at checkout — the hourly cron later checks these for recovery
 * emails. Fire-and-forget from the client; never blocks checkout. */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true });

  const { email, items, total } = await req.json();
  if (!email || !Array.isArray(items) || items.length === 0 || typeof total !== "number") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("abandoned_carts")
    .select("id")
    .eq("email", email.toLowerCase())
    .eq("recovered", false)
    .maybeSingle();

  if (existing) {
    await admin
      .from("abandoned_carts")
      .update({ items, total, last_seen_at: new Date().toISOString(), reminder_sent: false })
      .eq("id", existing.id);
  } else {
    await admin.from("abandoned_carts").insert({ email: email.toLowerCase(), items, total });
  }

  return NextResponse.json({ ok: true });
}
