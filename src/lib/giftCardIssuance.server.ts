import { randomBytes } from "crypto";
import { createAdminClient } from "./supabase/server";
import { sendGiftCardEmail } from "./email";

/** Gift card codes are redeemable for real balance, so they're generated with a
 * CSPRNG rather than Math.random() (predictable, not safe for anything with monetary value). */
function generateGiftCardCode(): string {
  return `GC-${randomBytes(6).toString("hex").toUpperCase()}`;
}

interface GiftCardLineItem {
  price: number;
  quantity: number;
  giftCardRecipient?: { email: string; name?: string; senderName?: string; message?: string };
}

export function hasGiftCardItems(items: GiftCardLineItem[]): boolean {
  return items.some((item) => !!item.giftCardRecipient);
}

/**
 * Creates a gift_cards row per unit and emails each recipient their code.
 * Used both for orders that are paid instantly (COD, existing-gift-card
 * balance) and, after an admin confirms the payment screenshot, for
 * JazzCash gift-card purchases that were held back until verified — a
 * JazzCash order gets marked "paid" the moment it's placed even though
 * nobody has actually checked the screenshot yet, so issuing a spendable
 * code immediately would let someone claim a gift card without ever paying.
 */
export async function issueGiftCardsForOrder(orderId: string, items: GiftCardLineItem[]) {
  const admin = createAdminClient();
  if (!admin) return { issued: 0 };

  let issued = 0;
  for (const item of items) {
    if (!item.giftCardRecipient) continue;
    for (let i = 0; i < item.quantity; i++) {
      const code = generateGiftCardCode();
      await admin.from("gift_cards").insert({
        code,
        initial_amount: item.price,
        balance: item.price,
        recipient_email: item.giftCardRecipient.email,
        recipient_name: item.giftCardRecipient.name ?? null,
        sender_name: item.giftCardRecipient.senderName ?? null,
        message: item.giftCardRecipient.message ?? null,
        order_id: orderId,
      });
      sendGiftCardEmail(
        item.giftCardRecipient.email,
        code,
        item.price,
        item.giftCardRecipient.name,
        item.giftCardRecipient.senderName,
        item.giftCardRecipient.message
      ).catch(() => {});
      issued++;
    }
  }
  return { issued };
}
