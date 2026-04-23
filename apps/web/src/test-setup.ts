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
  lineWidth = 1;
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

  createLinearGradient(x1: number, y1: number, x2: number, y2: number) {
    // Return a mock gradient object
    const colors: string[] = [];
    return {
      addColorStop: (offset: number, color: string) => {
        colors.push(color);
      }
    };
  }

  beginPath() {}
  closePath() {}
  moveTo(_x: number, _y: number) {}
  lineTo(_x: number, _y: number) {}
  stroke() {}
  fill(_fillRule?: CanvasFillRule) {}
  roundRect(_x: number, _y: number, _w: number, _h: number, _r: number | number[]) {}

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

// Store original getContext
const origGetContext = HTMLCanvasElement.prototype.getContext;

// Override getContext to return mock context for '2d'
HTMLCanvasElement.prototype.getContext = function(type: string) {
  if (type === '2d') {
    const ctx = new MockCanvasRenderingContext2D(this.width || 100, this.height || 100);
    return ctx as unknown as CanvasRenderingContext2D;
  }
  return origGetContext.call(this, type);
};

import '@testing-library/jest-dom';
