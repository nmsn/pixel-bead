import { describe, it, expect } from 'vitest';
import type { PixelCanvasState } from './usePixelCanvas';

describe('usePixelCanvas', () => {
  it('allows null as currentColorIndex for transparent', () => {
    // This test verifies the state type accepts null
    const state = {
      currentColorIndex: null as PixelCanvasState['currentColorIndex'],
    };
    expect(state.currentColorIndex).toBeNull();
  });

  it('PixelCanvasState.currentColorIndex accepts null', () => {
    const state: PixelCanvasState = {
      gridData: [],
      gridSize: [32, 32],
      tool: 'pen',
      currentColorIndex: null, // null = transparent
      zoom: 1,
      selectedCells: new Set(),
      selectionStyle: 'outline',
      backgroundColor: '#ffffff',
      backgroundType: 'solid',
      gradientColors: ['#667eea', '#764ba2'],
      gradientAngle: 135,
      cornerRadius: 0,
      iconScale: 1,
      isDark: true,
      glossEnabled: true,
      glossIntensity: 40,
    };
    expect(state.currentColorIndex).toBeNull();
  });

  it('PixelCanvasState accepts gradientColors', () => {
    const state: PixelCanvasState = {
      gridData: [],
      gridSize: [32, 32],
      tool: 'pen',
      currentColorIndex: null,
      zoom: 1,
      selectedCells: new Set(),
      selectionStyle: 'outline',
      backgroundColor: '#ffffff',
      backgroundType: 'gradient',
      gradientColors: ['#667eea', '#f093fb', '#764ba2'],
      gradientAngle: 90,
      cornerRadius: 8,
      iconScale: 1,
      isDark: true,
      glossEnabled: true,
      glossIntensity: 60,
    };
    expect(state.gradientColors).toEqual(['#667eea', '#f093fb', '#764ba2']);
    expect(state.gradientAngle).toBe(90);
    expect(state.backgroundType).toBe('gradient');
  });

  it('PixelCanvasState accepts glossEnabled and glossIntensity', () => {
    const state: PixelCanvasState = {
      gridData: [],
      gridSize: [32, 32],
      tool: 'pen',
      currentColorIndex: null,
      zoom: 1,
      selectedCells: new Set(),
      selectionStyle: 'outline',
      backgroundColor: '#ffffff',
      backgroundType: 'solid',
      gradientColors: ['#667eea', '#764ba2'],
      gradientAngle: 135,
      cornerRadius: 0,
      iconScale: 1,
      isDark: true,
      glossEnabled: false,
      glossIntensity: 0,
    };
    expect(state.glossEnabled).toBe(false);
    expect(state.glossIntensity).toBe(0);
  });
});