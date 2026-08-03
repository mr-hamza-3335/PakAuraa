import { Resend } from "resend";
import type { Order } from "./store";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "PakAuraa <onboarding@resend.dev>";

export const isEmailConfigured = !!resend;

function orderConfirmationHtml(order: Order) {
  const giftCardAmount = order.giftCardAmount ?? 0;
  const hasPendingGiftCard = order.paymentMethod === "jazzcash" && order.items.some((item) => item.giftCardRecipient);
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;color:#e8e2d4;font-family:Georgia,serif;font-size:13px;">${item.product.name} (${item.size}ml) × ${item.quantity}</td>
        <td style="padding:10px 0;text-align:right;color:#e8e2d4;font-family:Georgia,serif;font-size:13px;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.2);">
      <div style="padding:32px 32px 0;text-align:center;">
        <p style="color:#d4af37;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">PakAuraa</p>
        <h1 style="color:#f5f0e6;font-size:22px;font-weight:400;margin:0 0 24px;">Order Confirmed</h1>
      </div>
      <div style="padding:0 32px;">
        <p style="color:#c9c2b3;font-size:13px;line-height:1.6;">
          Thank you, ${order.customer.name}. Your order <strong style="color:#d4af37;">${order.id}</strong> has been placed${
            order.paymentMethod === "giftcard"
              ? " and is fully paid."
              : giftCardAmount > 0
              ? " — see the payment breakdown below."
              : order.paymentMethod === "cod"
              ? " and will be paid on delivery."
              : " and we've received your payment details."
          }
        </p>
        ${
          giftCardAmount > 0
            ? `<div style="margin:16px 0;padding:14px 16px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);">
          <p style="color:#8a8478;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px;">Payment Breakdown</p>
          <p style="color:#e8e2d4;font-size:13px;line-height:1.7;margin:0 0 4px;">
            Gift Card${order.giftCardCode ? ` (${order.giftCardCode})` : ""}: − PKR ${giftCardAmount.toLocaleString()}
          </p>
          ${
            order.paymentMethod === "giftcard"
              ? `<p style="color:#7FA888;font-size:13px;line-height:1.7;margin:0;">Fully paid — no further payment needed.</p>`
              : order.paymentMethod === "cod"
              ? `<p style="color:#e8e2d4;font-size:13px;line-height:1.7;margin:0;">Remaining PKR ${order.total.toLocaleString()} to be paid on delivery.</p>`
              : `<p style="color:#e8e2d4;font-size:13px;line-height:1.7;margin:0;">Remaining PKR ${order.total.toLocaleString()} to be paid via JazzCash — see below.</p>`
          }
        </div>`
            : ""
        }
        ${
          order.paymentMethod !== "jazzcash"
            ? ""
            : `<div style="margin:16px 0;padding:14px 16px;background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);">
          <p style="color:#8a8478;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 6px;">Send payment screenshot on WhatsApp</p>
          <a href="https://wa.me/923252106239" style="color:#d4af37;font-size:20px;font-weight:bold;text-decoration:underline;">0325-2106239</a>
          <div style="margin:12px 0;border-top:1px solid rgba(212,175,55,0.15);"></div>
          <p style="color:#e8e2d4;font-size:12px;line-height:1.7;margin:0;">
            After paying, WhatsApp your payment screenshot to the number above. Your order will be dispatched only after the payment is verified. Your payment will be confirmed right away, and we'll call you back within 5 minutes to confirm your payment and get your order dispatched.
          </p>
          <div style="margin:12px 0;border-top:1px solid rgba(212,175,55,0.15);"></div>
          <p style="color:#e8e2d4;font-size:12px;line-height:1.9;margin:0;" dir="rtl">
            پیمنٹ کرنے کے بعد اپنی پیمنٹ کی اسکرین شاٹ اوپر دیے گئے واٹس ایپ نمبر پر بھیج دیں۔ پیمنٹ ویریفائی ہونے کے بعد ہی پروڈکٹ ڈسپیچ کیا جائے گا۔ آپ کی پیمنٹ فوراً کنفرم کر کے 5 منٹ میں آپ کو کال بیک کی جائے گی، پیمنٹ کی تصدیق اور آرڈر ڈسپیچ کے لیے۔
          </p>
          ${
            hasPendingGiftCard
              ? `<div style="margin:12px 0 0;border-top:1px solid rgba(212,175,55,0.15);padding-top:12px;">
            <p style="color:#e8e2d4;font-size:12px;line-height:1.7;margin:0 0 8px;">
              Your gift card is not attached to this email — once your payment is verified, it will be sent to the recipient in a second, separate email with the gift card code.
            </p>
            <p style="color:#e8e2d4;font-size:12px;line-height:1.9;margin:0;" dir="rtl">
              گفٹ کارڈ اس ای میل کے ساتھ نہیں ہے — پیمنٹ ویریفائی ہونے کے بعد، گفٹ کارڈ کوڈ ایک الگ، دوسری ای میل میں ریسیپینٹ کو بھیجا جائے گا۔
            </p>
          </div>`
              : ""
          }
        </div>`
        }
        <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid rgba(212,175,55,0.15);border-bottom:1px solid rgba(212,175,55,0.15);">
          ${rows}
        </table>
        <table style="width:100%;">
          <tr>
            <td style="color:#d4af37;font-size:15px;padding-top:8px;">Total</td>
            <td style="color:#d4af37;font-size:15px;padding-top:8px;text-align:right;">PKR ${order.total.toLocaleString()}</td>
          </tr>
        </table>
        <p style="color:#8a8478;font-size:12px;line-height:1.6;margin-top:24px;">
          Shipping to: ${order.customer.address}${order.customer.landmark ? `, ${order.customer.landmark}` : ""}, ${order.customer.city}<br/>
          Every order arrives in signature PakAuraa luxury packaging. Free shipping, 3–5 business days.
        </p>
      </div>
      <div style="padding:24px 32px 32px;text-align:center;">
        <p style="color:#565049;font-size:10px;letter-spacing:2px;text-transform:uppercase;">PakAuraa Luxury Perfumes</p>
      </div>
    </div>
  </div>`;
}

export async function sendOrderConfirmationEmail(order: Order) {
  if (!resend) return { sent: false, reason: "not configured" };
  try {
    await resend.emails.send({
      from: FROM,
      to: order.customer.email,
      subject: `Order Confirmed — ${order.id} | PakAuraa`,
      html: orderConfirmationHtml(order),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}

const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "ameerhamza94572@gmail.com";

function adminOrderAlertHtml(order: Order) {
  const hasPendingGiftCard = order.paymentMethod === "jazzcash" && order.items.some((item) => item.giftCardRecipient);
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#e8e2d4;font-family:Georgia,serif;font-size:13px;">${item.product.name} (${item.size}ml) × ${item.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#e8e2d4;font-family:Georgia,serif;font-size:13px;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.2);">
      <div style="padding:32px 32px 0;text-align:center;">
        <p style="color:#d4af37;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">PakAuraa Admin</p>
        <h1 style="color:#f5f0e6;font-size:22px;font-weight:400;margin:0 0 24px;">New Order Received</h1>
      </div>
      <div style="padding:0 32px;">
        <p style="color:#c9c2b3;font-size:13px;line-height:1.6;">
          Order <strong style="color:#d4af37;">${order.id}</strong> — ${order.paymentMethod.toUpperCase()} —
          placed ${new Date(order.createdAt).toLocaleString()}
        </p>
        ${
          hasPendingGiftCard
            ? `<div style="margin:0 0 16px;padding:12px 16px;background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.35);">
          <p style="color:#d4af37;font-size:12px;line-height:1.6;margin:0;">
            ⚠ This order includes a gift card. It will <strong>not</strong> be emailed to the recipient until you verify the
            JazzCash payment and confirm it in /admin/orders.
          </p>
        </div>`
            : ""
        }
        <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:1px solid rgba(212,175,55,0.15);border-bottom:1px solid rgba(212,175,55,0.15);">
          ${rows}
        </table>
        <table style="width:100%;margin-bottom:20px;">
          <tr>
            <td style="color:#d4af37;font-size:15px;padding-top:8px;">Total</td>
            <td style="color:#d4af37;font-size:15px;padding-top:8px;text-align:right;">PKR ${order.total.toLocaleString()}</td>
          </tr>
        </table>
        <p style="color:#8a8478;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Ship To</p>
        <p style="color:#e8e2d4;font-size:13px;line-height:1.7;margin:0 0 4px;">${order.customer.name}</p>
        <p style="color:#c9c2b3;font-size:13px;line-height:1.7;margin:0 0 4px;">${order.customer.address}${order.customer.landmark ? `, ${order.customer.landmark}` : ""}, ${order.customer.city}</p>
        <p style="color:#c9c2b3;font-size:13px;line-height:1.7;margin:0;">
          ${order.customer.phone} · ${order.customer.email}
        </p>
      </div>
      <div style="padding:24px 32px 32px;text-align:center;">
        <p style="color:#565049;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Manage in /admin/orders</p>
      </div>
    </div>
  </div>`;
}

function backInStockHtml(productName: string, productUrl: string) {
  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.2);text-align:center;">
      <div style="padding:40px 32px;">
        <p style="color:#d4af37;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">PakAuraa</p>
        <h1 style="color:#f5f0e6;font-size:22px;font-weight:400;margin:0 0 20px;">Back In Stock</h1>
        <p style="color:#c9c2b3;font-size:13px;line-height:1.6;margin:0 0 28px;">
          <strong style="color:#d4af37;">${productName}</strong> is back — you asked us to let you know, so here we are.
        </p>
        <a href="${productUrl}" style="display:inline-block;background:linear-gradient(90deg,#a8893a,#d4af37);color:#0a0a0a;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;">Shop Now</a>
      </div>
    </div>
  </div>`;
}

/** Sent to every customer waiting on a product once its stock goes from 0 to available. */
export async function sendBackInStockEmail(to: string, productName: string, productUrl: string) {
  if (!resend) return { sent: false, reason: "not configured" };
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `${productName} is Back in Stock — PakAuraa`,
      html: backInStockHtml(productName, productUrl),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}

function giftCardHtml(code: string, amount: number, recipientName: string | undefined, senderName: string | undefined, message: string | undefined) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pakauraa.com";
  const headline = recipientName ? `A Gift For ${recipientName}` : "A Gift, Just For You";
  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.25);text-align:center;">
      <div style="padding:8px;">
        <div style="border:1px solid rgba(212,175,55,0.15);padding:44px 32px;">
          <p style="color:#d4af37;letter-spacing:5px;font-size:11px;text-transform:uppercase;margin:0 0 28px;">PakAuraa Gift Card</p>

          <h1 style="color:#f5f0e6;font-size:34px;font-weight:400;line-height:1.25;margin:0 0 18px;">${headline}</h1>

          <p style="color:#d4af37;font-size:52px;font-weight:700;line-height:1;margin:0 0 18px;">PKR ${amount.toLocaleString()}</p>

          ${senderName ? `<p style="color:#c9c2b3;font-size:15px;font-style:italic;margin:0 0 16px;">With love, from ${senderName}</p>` : ""}
          ${message ? `<p style="color:#c9c2b3;font-size:13px;font-style:italic;line-height:1.7;margin:0 0 28px;">&ldquo;${message}&rdquo;</p>` : ""}

          <div style="border:2px dashed rgba(212,175,55,0.45);padding:20px;margin:0 0 28px;">
            <p style="color:#8a8478;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Your Redemption Code</p>
            <p style="color:#f5f0e6;font-size:26px;font-weight:700;letter-spacing:4px;margin:0;">${code}</p>
          </div>

          <a href="${siteUrl}" style="display:inline-block;background:linear-gradient(90deg,#a8893a,#d4af37);color:#0a0a0a;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;padding:16px 40px;margin-bottom:20px;">Redeem Now</a>

          <p style="color:#8a8478;font-size:12px;line-height:1.6;margin:0;">Enter this code at checkout on ${siteUrl.replace(/^https?:\/\//, "")} to redeem it against any fragrance.</p>
        </div>
      </div>
    </div>
  </div>`;
}

/** Emails a purchased gift card's redemption code straight to the recipient. */
export async function sendGiftCardEmail(to: string, code: string, amount: number, recipientName?: string, senderName?: string, message?: string) {
  if (!resend) return { sent: false, reason: "not configured" };
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `You've received a PakAuraa Gift Card — PKR ${amount.toLocaleString()}`,
      html: giftCardHtml(code, amount, recipientName, senderName, message),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}

/** Fires immediately when a new order lands, so the site owner never has to
 * go check the dashboard to notice one — the full ship-to details are right
 * in the email. Best-effort: never blocks or fails order placement. */
export async function sendAdminOrderAlertEmail(order: Order) {
  if (!resend) return { sent: false, reason: "not configured" };
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New Order — ${order.id} — PKR ${order.total.toLocaleString()}`,
      html: adminOrderAlertHtml(order),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}

function contactMessageAlertHtml(name: string, email: string, message: string) {
  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.2);">
      <div style="padding:32px 32px 0;text-align:center;">
        <p style="color:#d4af37;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">PakAuraa Admin</p>
        <h1 style="color:#f5f0e6;font-size:22px;font-weight:400;margin:0 0 24px;">New Contact Message</h1>
      </div>
      <div style="padding:0 32px 32px;">
        <p style="color:#8a8478;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">From</p>
        <p style="color:#e8e2d4;font-size:13px;line-height:1.7;margin:0 0 20px;">${name} · ${email}</p>
        <p style="color:#8a8478;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Message</p>
        <p style="color:#c9c2b3;font-size:13px;line-height:1.7;margin:0 0 24px;white-space:pre-wrap;">${message}</p>
        <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(90deg,#a8893a,#d4af37);color:#0a0a0a;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:12px 28px;">Reply</a>
      </div>
      <div style="padding:0 32px 32px;text-align:center;">
        <p style="color:#565049;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Manage in /admin/messages</p>
      </div>
    </div>
  </div>`;
}

/** Fires the moment a customer submits the Contact Us form. */
export async function sendContactMessageAlertEmail(name: string, email: string, message: string) {
  if (!resend) return { sent: false, reason: "not configured" };
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_NOTIFY_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: contactMessageAlertHtml(name, email, message),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}

function lowStockHtml(productName: string, stock: number) {
  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.2);text-align:center;">
      <div style="padding:40px 32px;">
        <p style="color:#d4af37;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">PakAuraa Admin</p>
        <h1 style="color:#f5f0e6;font-size:22px;font-weight:400;margin:0 0 20px;">Low Stock Alert</h1>
        <p style="color:#c9c2b3;font-size:13px;line-height:1.6;">
          <strong style="color:#d4af37;">${productName}</strong> is down to <strong style="color:#d4af37;">${stock}</strong> unit${stock === 1 ? "" : "s"} — restock it soon in <code>/admin/products</code>.
        </p>
      </div>
    </div>
  </div>`;
}

/** Fires once per dip below the threshold (checked at admin save time — the
 * caller only invokes this on a genuine high-to-low crossing). */
export async function sendLowStockAlertEmail(productName: string, stock: number) {
  if (!resend) return { sent: false, reason: "not configured" };
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Low Stock — ${productName} (${stock} left)`,
      html: lowStockHtml(productName, stock),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}

function abandonedCartHtml(items: { product: { name: string }; size: number; quantity: number }[], total: number, siteUrl: string) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#e8e2d4;font-family:Georgia,serif;font-size:13px;">${item.product.name} (${item.size}ml) × ${item.quantity}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#141210;border:1px solid rgba(212,175,55,0.2);text-align:center;">
      <div style="padding:40px 32px;">
        <p style="color:#d4af37;letter-spacing:4px;font-size:11px;text-transform:uppercase;margin:0 0 8px;">PakAuraa</p>
        <h1 style="color:#f5f0e6;font-size:22px;font-weight:400;margin:0 0 20px;">You Left Something Behind</h1>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;text-align:left;border-top:1px solid rgba(212,175,55,0.15);border-bottom:1px solid rgba(212,175,55,0.15);">
          ${rows}
        </table>
        <p style="color:#d4af37;font-size:15px;margin:16px 0 24px;">Total: PKR ${total.toLocaleString()}</p>
        <a href="${siteUrl}/checkout" style="display:inline-block;background:linear-gradient(90deg,#a8893a,#d4af37);color:#0a0a0a;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;">Complete Your Order</a>
      </div>
    </div>
  </div>`;
}

/** Sent by the hourly cron once a tracked cart has sat untouched for 1+ hour. */
export async function sendAbandonedCartEmail(email: string, items: { product: { name: string }; size: number; quantity: number }[], total: number) {
  if (!resend) return { sent: false, reason: "not configured" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pakauraa.com";
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You left something behind at PakAuraa",
      html: abandonedCartHtml(items, total, siteUrl),
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown error" };
  }
}
