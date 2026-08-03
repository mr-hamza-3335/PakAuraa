import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendAbandonedCartEmail } from "@/lib/email";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Runs hourly via Vercel Cron (see vercel.json). Emails anyone whose cart
 * has sat untouched for 1–25 hours and hasn't already gotten a reminder —
 * the 25h ceiling stops ancient/stale rows from being retried forever.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true, sent: 0 });

  const now = Date.now();
  const oneHourAgo = new Date(now - HOUR_MS).toISOString();
  const twentyFiveHoursAgo = new Date(now - 25 * HOUR_MS).toISOString();

  const { data: carts } = await admin
    .from("abandoned_carts")
    .select("id, email, items, total")
    .eq("recovered", false)
    .eq("reminder_sent", false)
    .lt("last_seen_at", oneHourAgo)
    .gt("last_seen_at", twentyFiveHoursAgo);

  if (!carts || carts.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  for (const cart of carts) {
    await sendAbandonedCartEmail(cart.email, cart.items, cart.total).catch(() => {});
    await admin.from("abandoned_carts").update({ reminder_sent: true }).eq("id", cart.id);
  }

  return NextResponse.json({ ok: true, sent: carts.length });
}
