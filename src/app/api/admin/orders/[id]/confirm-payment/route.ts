import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { issueGiftCardsForOrder } from "@/lib/giftCardIssuance.server";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

/** Admin confirms a payment has been verified — only then does the order
 * flip from "pending" to "paid", only then does any held-back gift card
 * get issued, and only then do any pending loyalty points flip to "earned"
 * and become redeemable. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const { id } = await params;
  const { data: order, error } = await admin
    .from("orders")
    .select("items, status, payment_method, user_id, total, gift_cards_issued")
    .eq("id", id)
    .maybeSingle();
  if (error || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (order.status === "pending") {
    await admin.from("orders").update({ status: "paid" }).eq("id", id);
  }

  // Flip any pending loyalty points for this order to "earned" — they only
  // become part of the customer's spendable balance once the order is
  // confirmed paid. If the order is later returned, the returns route
  // reverses them.
  if (order.user_id) {
    await admin
      .from("loyalty_ledger")
      .update({ reason: "earned" })
      .eq("order_id", id)
      .eq("reason", "pending");
  }

  let issued = 0;
  if (!order.gift_cards_issued) {
    const result = await issueGiftCardsForOrder(id, order.items);
    issued = result.issued;
    await admin.from("orders").update({ gift_cards_issued: true }).eq("id", id);
  }

  return NextResponse.json({ ok: true, issued });
}
