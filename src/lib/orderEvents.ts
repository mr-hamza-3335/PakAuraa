/** Predefined cancellation reasons for the admin order panel — shown as a
 * dropdown so the reason is consistent and easy to scan, with "Other" as an
 * escape hatch for anything that doesn't fit. */
export const CANCEL_REASONS = [
  "Customer not available",
  "Wrong / incomplete address",
  "Rider couldn't find the address",
  "Customer refused to accept",
  "Customer requested cancellation",
  "Payment not received / failed",
  "Out of stock",
  "Other",
] as const;
