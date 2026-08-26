/** Predefined return reasons shown in the return-request form on the order
 * confirmation page. */
export const RETURN_REASONS = [
  "Damaged / defective product",
  "Wrong product received",
  "Product does not match description",
  "Changed mind / no longer needed",
  "Allergic reaction / irritation",
  "Other",
] as const;

/** A customer can request a return within this many days of delivery. */
export const RETURN_WINDOW_DAYS = 7;

/** Affiliate commissions clear and become payout-eligible this many days
 * after the order is delivered (the "10-day holding period"). */
export const COMMISSION_HOLD_DAYS = 10;
