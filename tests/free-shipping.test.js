import {describe, expect, it} from 'vitest';
import {computeFreeShippingProgress} from '../lib/free-shipping.js';

describe('computeFreeShippingProgress', () => {
  it('reports partial progress toward the threshold', () => {
    const result = computeFreeShippingProgress(30, 75);
    expect(result.percent).toBeCloseTo(0.4, 5);
    expect(result.remaining).toBe(45);
    expect(result.met).toBe(false);
  });

  it('caps progress at 100% once the subtotal meets the threshold', () => {
    const result = computeFreeShippingProgress(90, 75);
    expect(result.percent).toBe(1);
    expect(result.remaining).toBe(0);
    expect(result.met).toBe(true);
  });

  it('treats an exact match as met', () => {
    const result = computeFreeShippingProgress(75, 75);
    expect(result.remaining).toBe(0);
    expect(result.met).toBe(true);
  });

  it('treats a zero or negative threshold as already met', () => {
    expect(computeFreeShippingProgress(10, 0)).toEqual({remaining: 0, percent: 1, met: true});
    expect(computeFreeShippingProgress(10, -5)).toEqual({remaining: 0, percent: 1, met: true});
  });

  it('clamps a negative subtotal to zero', () => {
    const result = computeFreeShippingProgress(-20, 50);
    expect(result.percent).toBe(0);
    expect(result.remaining).toBe(50);
  });

  it('rounds the remaining amount to cents', () => {
    const result = computeFreeShippingProgress(33.333, 100);
    expect(result.remaining).toBe(66.67);
  });
});
