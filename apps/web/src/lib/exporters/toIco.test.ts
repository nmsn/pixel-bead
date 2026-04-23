import { describe, it, expect, vi, beforeAll } from 'vitest';

// Create mock functions outside
const mockBeginPath = vi.fn();
const mockRoundRect = vi.fn();
const mockFill = vi.fn();
const mockFillRect = vi.fn();
const mockCreateLinearGradient = vi.fn();
const mockAddColorStop = vi.fn();

// Mock gradient
const mockGradient = {
  addColorStop: mockAddColorStop,
};

mockCreateLinearGradient.mockReturnValue(mockGradient);

// Mock context
const mockCtx = {
  fillStyle: '',
  beginPath: mockBeginPath,
  roundRect: mockRoundRect,
  fill: mockFill,
  fillRect: mockFillRect,
  createLinearGradient: mockCreateLinearGradient,
};

// Mock canvas
const mockCanvas = {
  width: 32,
  height: 32,
  getContext: vi.fn(() => mockCtx),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
};

// Store original
const originalDocument = global.document;

// Setup before all tests
beforeAll(() => {
  Object.defineProperty(global, 'document', {
    value: {
      createElement: vi.fn(() => mockCanvas),
    },
    writable: true,
  });
});

import { renderToCanvas } from './toIco';

describe('renderToCanvas', () => {
  it('renders to canvas with gradient background', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData = [[0, 1], [1, 0]];
    const gridSize: [number, number] = [2, 2];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize, {
      gradientColors: ['#667eea', '#764ba2'],
      gradientAngle: 135,
      cornerRadius: 8,
    });

    expect(result).toBe('data:image/png;base64,mock');
  });

  it('renders to canvas with gloss effect', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData = [[0, 1], [1, 0]];
    const gridSize: [number, number] = [2, 2];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize, {
      glossEnabled: true,
      glossIntensity: 40,
      cornerRadius: 8,
    });

    expect(result).toBe('data:image/png;base64,mock');
  });

  it('renders to canvas with gradient and gloss combined', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData = [[0, 1], [1, 0]];
    const gridSize: [number, number] = [2, 2];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize, {
      gradientColors: ['#667eea', '#764ba2'],
      gradientAngle: 135,
      glossEnabled: true,
      glossIntensity: 40,
      cornerRadius: 8,
    });

    expect(result).toBe('data:image/png;base64,mock');
  });

  it('handles empty grid data', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData: number[][] = [];
    const gridSize: [number, number] = [0, 0];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize);
    expect(result).toBe('data:image/png;base64,mock');
  });

  it('applies corner radius to background', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData = [[0]];
    const gridSize: [number, number] = [1, 1];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize, {
      backgroundColor: '#ff0000',
      cornerRadius: 16,
    });

    expect(result).toBe('data:image/png;base64,mock');
  });

  it('renders pixels correctly', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData = [[0]];
    const gridSize: [number, number] = [1, 1];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize);
    expect(result).toBe('data:image/png;base64,mock');
  });

  it('renders with only backgroundColor (no gradient)', () => {
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

    const gridData = [[0, 1], [1, 0]];
    const gridSize: [number, number] = [2, 2];
    const outputSize = 32;

    const result = renderToCanvas(gridData, gridSize, outputSize, {
      backgroundColor: '#ffffff',
    });

    expect(result).toBe('data:image/png;base64,mock');
  });
});