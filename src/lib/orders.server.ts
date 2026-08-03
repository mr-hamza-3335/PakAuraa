import { createAdminClient } from "./supabase/server";
import type { Order } from "./store";

/**
 * Looks up an order by id, requiring the caller to know the customer email
 * on file — the safe way to let guests (no auth session) revisit their own
 * confirmation/tracking page without exposing every order by id alone.
 */
export async function getOrderByIdForEmail(id: string, email: string): Promise<Order | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data, error } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;

  const customerEmail = (data.customer as { email?: string } | null)?.email?.toLowerCase();
  if (!customerEmail || customerEmail !== email.trim().toLowerCase()) return null;

  return {
    id: data.id,
    items: data.items,
    total: data.total,
    paymentMethod: data.payment_method,
    status: data.status,
    customer: data.customer,
    createdAt: data.created_at,
    couponCode: data.coupon_code ?? undefined,
    giftCardCode: data.gift_card_code ?? undefined,
    giftCardAmount: data.gift_card_amount ?? undefined,
    courierCompany: data.courier_company ?? undefined,
    courierHelpline: data.courier_helpline ?? undefined,
    riderName: data.rider_name ?? undefined,
    riderPhone: data.rider_phone ?? undefined,
    deliveredBy: data.delivered_by ?? undefined,
    deliveredTo: data.delivered_to ?? undefined,
    deliveredAt: data.delivered_at ?? undefined,
    cancelReason: data.cancel_reason ?? undefined,
    cancelNote: data.cancel_note ?? undefined,
    cancelledBy: data.cancelled_by ?? undefined,
    cancelledAt: data.cancelled_at ?? undefined,
  };
}

export interface IssuedGiftCard {
  code: string;
  initialAmount: number;
  recipientName: string | null;
  senderName: string | null;
  message: string | null;
}

/** Gift cards issued as line items within an order — used to render a
 * downloadable/shareable card on the order confirmation page right after
 * purchase, since the codes only exist in the (admin-only) gift_cards table. */
export async function getGiftCardsForOrder(orderId: string): Promise<IssuedGiftCard[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("gift_cards")
    .select("code, initial_amount, recipient_name, sender_name, message")
    .eq("order_id", orderId);

  return (data ?? []).map((r) => ({
    code: r.code,
    initialAmount: r.initial_amount,
    recipientName: r.recipient_name,
    senderName: r.sender_name,
    message: r.message,
  }));
}
