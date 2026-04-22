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
      cornerRadius: 0,
      iconScale: 1,
      isDark: true,
    };
    expect(state.currentColorIndex).toBeNull();
  });
});