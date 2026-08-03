import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Card payments are not configured yet. Add STRIPE_SECRET_KEY to your environment to enable Stripe checkout.",
      },
      { status: 503 }
    );
  }

  const { items, successUrl, cancelUrl } = await req.json();

  const stripe = new Stripe(secretKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: items.map((item: { name: string; price: number; quantity: number; size: number }) => ({
      price_data: {
        currency: "pkr",
        product_data: { name: `${item.name} (${item.size}ml)` },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}
