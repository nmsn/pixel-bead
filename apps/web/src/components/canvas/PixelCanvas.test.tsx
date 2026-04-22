import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { PixelCanvas } from './PixelCanvas';

// Mock react-konva before import
vi.mock('react-konva', () => {
  const MockLayer: React.FC = ({ children }) => {
    return <div className="layer-mock">{children}</div>;
  };
  const MockStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div className="konvajs-content">{children}</div>;
  };
  return {
    Stage: MockStage,
    Layer: MockLayer,
  };
});

// Mock Konva
vi.mock('konva', () => ({
  default: {
    Stage: vi.fn(),
    Line: vi.fn(),
    Rect: vi.fn(),
    Text: vi.fn(),
    Group: vi.fn(),
  },
  Stage: vi.fn(),
  Line: vi.fn(),
  Rect: vi.fn(),
  Text: vi.fn(),
  Group: vi.fn(),
}));

describe('PixelCanvas', () => {
  it('renders a Konva Stage', () => {
    const mockGrid = Array(8).fill(null).map(() => Array(8).fill(-1));
    render(
      <PixelCanvas
        gridData={mockGrid}
        gridSize={[8, 8]}
        zoom={1}
        panOffset={{ x: 0, y: 0 }}
        onCellClick={vi.fn()}
        isDark={false}
      />
    );
    // Konva creates a container div with stage-content class
    const container = document.querySelector('.konvajs-content');
    expect(container).not.toBeNull();
  });

  it('does not call onCellClick on initial render', async () => {
    const onCellClick = vi.fn();
    const mockGrid = Array(8).fill(null).map(() => Array(8).fill(-1));

    render(
      <PixelCanvas
        gridData={mockGrid}
        gridSize={[8, 8]}
        zoom={1}
        panOffset={{ x: 0, y: 0 }}
        onCellClick={onCellClick}
        isDark={false}
      />
    );

    // Find the Stage
    const stage = document.querySelector('.konvajs-content');
    expect(stage).toBeTruthy();

    // Verify the component renders without error
    expect(onCellClick).not.toHaveBeenCalled();
  });
});
