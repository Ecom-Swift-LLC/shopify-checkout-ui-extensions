import {describe, expect, it} from 'vitest';
import {isPoBoxAddress} from '../lib/po-box.js';

describe('isPoBoxAddress', () => {
  it('detects common PO Box formats', () => {
    expect(isPoBoxAddress('PO Box 123')).toBe(true);
    expect(isPoBoxAddress('P.O. Box 55')).toBe(true);
    expect(isPoBoxAddress('P O Box 9001')).toBe(true);
    expect(isPoBoxAddress('po box 42')).toBe(true);
  });

  it('detects "Post Office Box" and "Postal Box" variants', () => {
    expect(isPoBoxAddress('Post Office Box 300')).toBe(true);
    expect(isPoBoxAddress('Postal Box 12')).toBe(true);
    expect(isPoBoxAddress('Post Box 7')).toBe(true);
  });

  it('does not flag ordinary street addresses that mention "post" or "box"', () => {
    expect(isPoBoxAddress('456 Post Road')).toBe(false);
    expect(isPoBoxAddress('789 Box Canyon Drive')).toBe(false);
    expect(isPoBoxAddress('12 Boxwood Court')).toBe(false);
    expect(isPoBoxAddress('100 Main Street, Apt 4B')).toBe(false);
  });

  it('handles missing or non-string input safely', () => {
    expect(isPoBoxAddress(undefined)).toBe(false);
    expect(isPoBoxAddress(null)).toBe(false);
    expect(isPoBoxAddress('')).toBe(false);
  });
});
