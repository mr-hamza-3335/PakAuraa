import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from "@/lib/email";
import { pointsEarnedFor } from "@/lib/loyalty";
import { issueGiftCardsForOrder, hasGiftCardItems } from "@/lib/giftCardIssuance.server";

/**
 * Persists an order placed at checkout to Supabase for the admin panel.
 * Uses the service-role client since guest checkout has no user session —
 * this is a trusted server-side write, not exposed to the browser. The
 * cookie-bound client is used only to read the current user id (if any) so
 * signed-in orders show up in that account's order history.
 * No-ops (still 200s) when Supabase isn't configured, so checkout never
 * fails just because the backend isn't wired up yet.
 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true, persisted: false });

  const order = await req.json();

  const sessionClient = await createClient();
  const { data: userData } = sessionClient ? await sessionClient.auth.getUser() : { data: { user: null } };

  // A JazzCash order starts at "pending" (see store.ts placeOrder) — nobody
  // has actually looked at the payment screenshot yet — so a gift card
  // bought via JazzCash is held back too (no code generated, no email sent)
  // until an admin confirms the payment in /admin/orders. Every other
  // payment method (COD collected in person, or an existing gift-card
  // balance that was already real money) issues immediately, same as before.
  const deferGiftCards = order.paymentMethod === "jazzcash" && hasGiftCardItems(order.items);

  const { error } = await admin.from("orders").insert({
    id: order.id,
    user_id: userData?.user?.id ?? null,
    items: order.items,
    total: order.total,
    payment_method: order.paymentMethod,
    status: order.status,
    customer: order.customer,
    coupon_code: order.couponCode ?? null,
    gift_card_code: order.giftCardCode ?? null,
    gift_card_amount: order.giftCardAmount ?? 0,
    referral_code: order.referralCode ?? null,
    gift_cards_issued: !deferGiftCards,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  if (order.couponCode) {
    const { data: coupon } = await admin.from("coupons").select("used_count").eq("code", order.couponCode).maybeSingle();
    if (coupon) {
      await admin.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("code", order.couponCode);
    }
  }

  // Redeem an applied gift card — re-checked and clamped server-side so a
  // forged client amount can never drain more than the card's real balance.
  if (order.giftCardCode && order.giftCardAmount > 0) {
    const { data: card } = await admin.from("gift_cards").select("balance").eq("code", order.giftCardCode).maybeSingle();
    if (card) {
      const spend = Math.min(card.balance, order.giftCardAmount);
      await admin.from("gift_cards").update({ balance: card.balance - spend }).eq("code", order.giftCardCode);
    }
  }

  // Issue new gift cards for any gift-card line items in this order, and
  // email each recipient their redemption code — unless deferred above.
  if (!deferGiftCards) {
    await issueGiftCardsForOrder(order.id, order.items);
  }

  if (userData?.user) {
    const earned = pointsEarnedFor(order.total);
    if (earned > 0) {
      await admin.from("loyalty_ledger").insert({ user_id: userData.user.id, order_id: order.id, points: earned, reason: "earned" });
    }
  }

  // Commission is now credited when the order is marked "delivered" (see
  // /api/admin/orders/[id]/deliver), not here at order placement.
  // This ensures affiliates only earn when the product actually reaches the customer.

  // Best-effort — a failed email shouldn't fail an already-placed order.
  sendOrderConfirmationEmail(order).catch(() => {});
  sendAdminOrderAlertEmail(order).catch(() => {});

  return NextResponse.json({ ok: true, persisted: true });
}
