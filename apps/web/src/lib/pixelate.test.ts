import { describe, it, expect } from 'vitest';
import { dominantColor, pixelateImage } from '../lib/pixelate';

describe('dominantColor', () => {
  it('returns dominant color from a small region', () => {
    // 2x2 pixels: red, red, blue, blue — mode is red
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,   255, 0, 0, 255,
      0, 0, 255, 255,   0, 0, 255, 255,
    ]);
    const result = dominantColor(data, 2, 2, 0, 0, 2, 2);
    // R: 255+255+0+0=510/4=127, G: 0, B: 0+0+255+255=510/4=127
    expect(result).toEqual({ r: 127, g: 0, b: 127 });
  });
});

describe('pixelateImage', () => {
  it('returns 2D array matching grid size', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 4, 4);
    const imageData = ctx.getImageData(0, 0, 4, 4);

    const result = pixelateImage(imageData, [2, 2]);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
  });

  it('fills transparent regions with -1', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 4, 4);
    const imageData = ctx.getImageData(0, 0, 4, 4);

    const result = pixelateImage(imageData, [2, 2]);
    const hasTransparent = result.flat().includes(-1);
    expect(hasTransparent).toBe(true);
  });
});