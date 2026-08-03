import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getOrderByIdForEmail } from "@/lib/orders.server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/store";

async function loadOrder(id: string, email: string | null): Promise<Order | null> {
  if (email) return getOrderByIdForEmail(id, email);

  // No email on the query string — allow it only for a signed-in admin.
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") return null;

  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    items: data.items,
    total: data.total,
    paymentMethod: data.payment_method,
    status: data.status,
    customer: data.customer,
    createdAt: data.created_at,
    giftCardCode: data.gift_card_code ?? undefined,
    giftCardAmount: data.gift_card_amount ?? undefined,
  };
}

function buildInvoicePdf(order: Order): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#1a1a1a").text("PakAuraa", { continued: false });
    doc.fontSize(9).fillColor("#888888").text("Luxury Perfumes — pakauraa.com");
    doc.moveDown(1.5);

    // Never print a bare "PAID" unless the money has actually been verified —
    // COD is cash the rider collects, and JazzCash isn't confirmed until an
    // admin checks the payment screenshot (see /admin/orders confirm-payment).
    const paymentStatusLine =
      order.paymentMethod === "cod"
        ? "Cash on Delivery — pay the rider when your order arrives."
        : order.paymentMethod === "jazzcash"
        ? order.status === "pending"
          ? "Payment Verification Pending — WhatsApp your screenshot to 0325-2106239; we'll verify and call you back within 5 minutes."
          : "Paid via JazzCash (payment verified)."
        : order.paymentMethod === "giftcard"
        ? "Paid in full via Gift Card."
        : "Paid.";

    doc.fontSize(14).fillColor("#1a1a1a").text(`Invoice — ${order.id}`);
    doc.fontSize(9).fillColor("#666666").text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
    doc.text(`Payment Status: ${paymentStatusLine}`);
    if ((order.giftCardAmount ?? 0) > 0) {
      doc.text(`Gift Card Applied${order.giftCardCode ? ` (${order.giftCardCode})` : ""}: − PKR ${(order.giftCardAmount ?? 0).toLocaleString()}`);
    }
    doc.moveDown();

    doc.fontSize(10).fillColor("#1a1a1a").text("Bill To:", { underline: true });
    doc.fontSize(9).fillColor("#333333");
    doc.text(order.customer.name);
    doc.text(order.customer.address);
    if (order.customer.landmark) doc.text(order.customer.landmark);
    doc.text(order.customer.city);
    doc.text(order.customer.phone);
    doc.text(order.customer.email);
    doc.moveDown(1.5);

    const tableTop = doc.y;
    doc.fontSize(9).fillColor("#1a1a1a");
    doc.text("Item", 50, tableTop, { width: 260 });
    doc.text("Qty", 320, tableTop, { width: 50, align: "right" });
    doc.text("Price", 380, tableTop, { width: 80, align: "right" });
    doc.text("Total", 460, tableTop, { width: 85, align: "right" });
    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor("#dddddd").stroke();

    let y = tableTop + 22;
    doc.fontSize(9).fillColor("#333333");
    for (const item of order.items) {
      const addons = [item.giftWrap && "Gift Wrapped", item.engrave && "Engraved"].filter(Boolean).join(", ");
      const label = `${item.product.name} (${item.size}ml)${addons ? ` — ${addons}` : ""}`;
      doc.text(label, 50, y, { width: 260 });
      doc.text(String(item.quantity), 320, y, { width: 50, align: "right" });
      doc.text(`PKR ${item.price.toLocaleString()}`, 380, y, { width: 80, align: "right" });
      doc.text(`PKR ${(item.price * item.quantity).toLocaleString()}`, 460, y, { width: 85, align: "right" });
      y += 20;
    }

    doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#dddddd").stroke();
    doc.fontSize(11).fillColor("#1a1a1a").text("Total", 380, y + 14, { width: 80, align: "right" });
    doc.text(`PKR ${order.total.toLocaleString()}`, 460, y + 14, { width: 85, align: "right" });

    doc.fontSize(8).fillColor("#999999").text(
      "Thank you for shopping with PakAuraa. Free shipping, Pakistan-wide, 3-5 business days.",
      50,
      750,
      { width: 495, align: "center" }
    );

    doc.end();
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = req.nextUrl.searchParams.get("email");

  const order = await loadOrder(id, email);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const pdf = await buildInvoicePdf(order);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="PakAuraa-Invoice-${order.id}.pdf"`,
    },
  });
}
