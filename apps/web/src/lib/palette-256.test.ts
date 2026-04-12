import { describe, it, expect } from 'vitest';
import { PALETTE, nearestColor } from '../lib/palette-256';

describe('PALETTE', () => {
  it('has exactly 256 colors', () => {
    expect(PALETTE.colors.length).toBe(256);
  });

  it('all colors are valid hex strings', () => {
    const hex = /^[0-9a-f]{6}$/i;
    PALETTE.colors.forEach((c) => {
      expect(c).toMatch(hex);
    });
  });

  it('nearestColor returns a palette color', () => {
    const result = nearestColor(255, 0, 0);
    expect(PALETTE.colors).toContain(result);
  });

  it('nearestColor(0,0,0) returns black', () => {
    const result = nearestColor(0, 0, 0);
    expect(result).toBe('000000');
  });

  it('nearestColor(255,255,255) returns white', () => {
    const result = nearestColor(255, 255, 255);
    expect(result).toBe('ffffff');
  });
});