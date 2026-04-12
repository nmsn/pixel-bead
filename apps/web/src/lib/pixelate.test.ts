import { describe, it, expect, vi, beforeAll } from 'vitest';
import { dominantColor, pixelateImage, imageFileToImageData } from '../lib/pixelate';

// Mock createImageBitmap for imageFileToImageData tests
const mockImageBitmap = {
  width: 1,
  height: 1,
  close: vi.fn(),
};
globalThis.createImageBitmap = vi.fn().mockResolvedValue(mockImageBitmap);

// Mock OffscreenCanvas
class MockOffscreenCanvas {
  width: number;
  height: number;
  private ctx: MockOffscreenCanvasContext;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx = new MockOffscreenCanvasContext();
  }

  getContext(contextType: string) {
    if (contextType === '2d') return this.ctx;
    return null;
  }
}

class MockOffscreenCanvasContext {
  private imageData: Uint8ClampedArray | null = null;
  private canvasWidth = 0;
  private canvasHeight = 0;

  drawImage(_img: ImageBitmap | HTMLCanvasElement, _x: number, _y: number) {
    // No-op for mock
  }

  getImageData(x: number, y: number, w: number, h: number) {
    if (!this.imageData) {
      const size = w * h * 4;
      this.imageData = new Uint8ClampedArray(size);
      // Fill with red for test
      for (let i = 0; i < size; i += 4) {
        this.imageData[i] = 255;     // r
        this.imageData[i + 1] = 0;   // g
        this.imageData[i + 2] = 0;   // b
        this.imageData[i + 3] = 255; // a
      }
    }
    return { data: this.imageData, width: w, height: h } as ImageData;
  }
}

globalThis.OffscreenCanvas = MockOffscreenCanvas as unknown as typeof OffscreenCanvas;

describe('dominantColor', () => {
  it('returns dominant (mode) color from a small region', () => {
    // 2x2 pixels: red, red, blue, blue — mode is red (first in tie)
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,   255, 0, 0, 255,
      0, 0, 255, 255,   0, 0, 255, 255,
    ]);
    const result = dominantColor(data, 2, 2, 0, 0, 2, 2);
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('returns null when all pixels are transparent', () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 0,   0, 0, 0, 0,
      0, 0, 0, 0,   0, 0, 0, 0,
    ]);
    const result = dominantColor(data, 2, 2, 0, 0, 2, 2);
    expect(result).toBeNull();
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

describe('imageFileToImageData', () => {
  it('loads a file and returns ImageData using OffscreenCanvas', async () => {
    // Minimal 1x1 red PNG bytes: signature + IHDR + IDAT + IEND
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR length + type
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT length + type
      0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, // compressed data (red pixel)
      0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xdd, // IEND length + type
      0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00             // IEND CRC
    ]);
    const blob = new Blob([pngBytes], { type: 'image/png' });

    const file = new File([blob], 'test.png', { type: 'image/png' });
    const imageData = await imageFileToImageData(file);

    expect(imageData.width).toBe(1);
    expect(imageData.height).toBe(1);
    expect(imageData.data[0]).toBe(255); // r
    expect(imageData.data[1]).toBe(0);   // g
    expect(imageData.data[2]).toBe(0);   // b
  });
});