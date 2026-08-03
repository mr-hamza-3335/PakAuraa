import { NextRequest, NextResponse } from "next/server";
import { getOrderByIdForEmail } from "@/lib/orders.server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is required to look up an order." }, { status: 400 });
  }

  const order = await getOrderByIdForEmail(id, email);
  if (!order) {
    return NextResponse.json({ error: "No order found with that ID and email." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
