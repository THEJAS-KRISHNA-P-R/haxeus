export const CURRENCY_SYMBOL = "\u20B9";

/**
 * Formats a number as a price string with the Rupee symbol and Indian formatting.
 * Example: 1599 -> ₹1,599
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN")}`;
}
