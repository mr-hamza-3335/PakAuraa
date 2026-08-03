/** PKR 100 spent = 1 point earned. 1 point = PKR 1 off a future order. */
export const LOYALTY_PKR_PER_POINT_EARNED = 100;
export const LOYALTY_PKR_PER_POINT_REDEEMED = 1;

export function pointsEarnedFor(orderTotal: number): number {
  return Math.floor(orderTotal / LOYALTY_PKR_PER_POINT_EARNED);
}

export function pkrValueOfPoints(points: number): number {
  return points * LOYALTY_PKR_PER_POINT_REDEEMED;
}
