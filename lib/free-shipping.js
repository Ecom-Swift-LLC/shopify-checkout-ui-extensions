/**
 * Pure calculation for a free-shipping progress indicator.
 * Kept dependency-free and framework-free so it can be unit tested without
 * mocking the checkout runtime, then copied verbatim into an extension.
 *
 * @param {number} subtotal - Cart subtotal in the store's decimal currency unit (e.g. 42.5 for $42.50).
 * @param {number} threshold - Free-shipping threshold in the same unit.
 * @returns {{remaining: number, percent: number, met: boolean}}
 */
export function computeFreeShippingProgress(subtotal, threshold) {
  const safeSubtotal = Math.max(Number(subtotal) || 0, 0);
  const safeThreshold = Math.max(Number(threshold) || 0, 0);

  if (safeThreshold === 0) {
    return {remaining: 0, percent: 1, met: true};
  }

  const remaining = Math.max(safeThreshold - safeSubtotal, 0);
  const percent = Math.min(safeSubtotal / safeThreshold, 1);

  return {
    remaining: Math.round(remaining * 100) / 100,
    percent,
    met: remaining === 0,
  };
}
