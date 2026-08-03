import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrderByIdForEmail, getGiftCardsForOrder } from "@/lib/orders.server";
import OrderConfirmationClient from "./OrderConfirmationClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { email } = await searchParams;
  const order = email ? await getOrderByIdForEmail(id, email) : null;
  const giftCards = order ? await getGiftCardsForOrder(id) : [];

  return (
    <>
      <Header />
      <OrderConfirmationClient orderId={id} initialOrder={order} giftCards={giftCards} />
      <Footer />
    </>
  );
}
