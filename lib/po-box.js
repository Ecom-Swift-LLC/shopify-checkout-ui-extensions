/**
 * Heuristic PO Box detector for a street address line.
 *
 * Deliberately conservative: it requires a "po"/"post office" prefix
 * immediately before "box"/"bin" so it doesn't false-positive on real
 * street names like "456 Post Road" or "789 Box Canyon Drive".
 *
 * This is a heuristic, not a certified address-validation service — see
 * the "What this does NOT do" section in the README before relying on it
 * for compliance-sensitive shipping restrictions.
 */
const PO_BOX_PATTERN =
  /\bp\.?\s*o\.?\s*box\b|\bpost\s*(?:al)?\s*(?:office)?\s*box\b|\bp\.?\s*o\.?\s*bin\b/i;

/**
 * @param {string | undefined | null} addressLine
 * @returns {boolean}
 */
export function isPoBoxAddress(addressLine) {
  if (!addressLine || typeof addressLine !== 'string') {
    return false;
  }
  return PO_BOX_PATTERN.test(addressLine);
}
