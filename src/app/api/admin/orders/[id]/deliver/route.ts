import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

/** Marks an order as delivered AND credits the affiliate commission
 * (earned_at = now, available_at = +10 days).
 * If the order was already delivered, does nothing extra (commission already credited).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const { id } = await params;
  const { deliveredBy, deliveredTo } = await req.json().catch(() => ({}));

  const now = new Date().toISOString();
  const availableAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch current order state
  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("status, referral_code, user_id, total, id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // 2. If already delivered, skip
  if (order.status === "delivered") {
    return NextResponse.json({ ok: true, alreadyDelivered: true });
  }

  // 3. Mark order as delivered
  await admin
    .from("orders")
    .update({
      status: "delivered",
      delivered_by: deliveredBy ?? null,
      delivered_to: deliveredTo ?? null,
      delivered_at: now,
    })
    .eq("id", id);

  // 4. Credit affiliate commission (earned at delivery, available in 10 days)
  if (order.referral_code) {
    const { data: affiliate } = await admin
      .from("affiliates")
      .select("user_id, commission_rate")
      .eq("code", order.referral_code)
      .maybeSingle();

    if (affiliate && affiliate.user_id !== order.user_id) {
      const amount = Math.round(order.total * affiliate.commission_rate);
      if (amount > 0) {
        // Avoid double-crediting
        const { data: existing } = await admin
          .from("affiliate_commissions")
          .select("id")
          .eq("order_id", id)
          .maybeSingle();

        if (!existing) {
          await admin.from("affiliate_commissions").insert({
            affiliate_user_id: affiliate.user_id,
            order_id: id,
            amount,
            status: "pending",
            earned_at: now,
            available_at: availableAt,
          });
        }
      }
    }
  }

  // Flip any pending loyalty points for this order to "earned" — delivery
  // implies the product reached the customer and the payment settled, so any
  // points held in pending are now spendable. The 7-day return window is
  // still enforced separately: if a return is filed, the admin returns
  // route reverses them.
  await admin
    .from("loyalty_ledger")
    .update({ reason: "earned" })
    .eq("order_id", id)
    .eq("reason", "pending");

  return NextResponse.json({ ok: true });
}