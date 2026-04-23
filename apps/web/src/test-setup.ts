import { vi } from 'vitest';

// Mock canvas for pixelateImage tests
class MockImageData implements ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number) {
    this.data = data;
    this.width = width;
    this.height = data.length / (width * 4);
  }
}

class MockCanvasRenderingContext2D {
  fillStyle = '';
  strokeStyle = '';
  private imageData: Uint8ClampedArray | null = null;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  fillRect(x: number, y: number, w: number, h: number) {
    const size = this.canvasWidth * this.canvasHeight * 4;
    this.imageData = new Uint8ClampedArray(size);
    const color = this.parseColor(this.fillStyle);
    for (let i = 0; i < this.canvasWidth * this.canvasHeight; i++) {
      this.imageData[i * 4] = color.r;
      this.imageData[i * 4 + 1] = color.g;
      this.imageData[i * 4 + 2] = color.b;
      this.imageData[i * 4 + 3] = 255;
    }
  }

  clearRect() {
    const size = this.canvasWidth * this.canvasHeight * 4;
    this.imageData = new Uint8ClampedArray(size);
  }

  getImageData(x: number, y: number, w: number, h: number) {
    if (!this.imageData) {
      const size = this.canvasWidth * this.canvasHeight * 4;
      this.imageData = new Uint8ClampedArray(size);
    }
    return new MockImageData(this.imageData, this.canvasWidth);
  }

  private parseColor(color: string): { r: number; g: number; b: number } {
    if (color === 'red') return { r: 255, g: 0, b: 0 };
    if (color === 'blue') return { r: 0, g: 0, b: 255 };
    if (color === 'green') return { r: 0, g: 128, b: 0 };
    if (color === 'white') return { r: 255, g: 255, b: 255 };
    if (color === 'black') return { r: 0, g: 0, b: 0 };
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return { r: 0, g: 0, b: 0 };
  }
}

class MockCanvas {
  width = 100;
  height = 100;
  private ctx: MockCanvasRenderingContext2D;

  constructor(width = 100, height = 100) {
    this.width = width;
    this.height = height;
    this.ctx = new MockCanvasRenderingContext2D(width, height);
  }

  getContext(type: string) {
    if (type === '2d') return this.ctx;
    return null;
  }
}

// Store original createElement
const origCreateElement = document.createElement.bind(document);

// Override document.createElement for canvas
document.createElement = ((tagName: string) => {
  if (tagName.toLowerCase() === 'canvas') {
    return new MockCanvas() as unknown as HTMLCanvasElement;
  }
  return origCreateElement(tagName);
}) as typeof document.createElement;

import '@testing-library/jest-dom';
