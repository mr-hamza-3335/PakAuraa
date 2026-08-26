/** PKR 200 spent = 1 point earned. 1 point = PKR 1 off a future order.
 * Points are "pending" until the admin marks the order paid — they don't
 * count toward balance, can't be redeemed, and get reversed if the order
 * is cancelled or returned. */
export const LOYALTY_PKR_PER_POINT_EARNED = 200;
export const LOYALTY_PKR_PER_POINT_REDEEMED = 1;

export function pointsEarnedFor(orderTotal: number): number {
  return Math.floor(orderTotal / LOYALTY_PKR_PER_POINT_EARNED);
}

export function pkrValueOfPoints(points: number): number {
  return points * LOYALTY_PKR_PER_POINT_REDEEMED;
}

/** Only rows with reason = 'earned' count toward the user's spendable balance.
 * 'pending' rows are held until admin payment confirmation, then flipped. */
export function isAvailableLoyaltyRow(reason: string): boolean {
  return reason === "earned";
}
