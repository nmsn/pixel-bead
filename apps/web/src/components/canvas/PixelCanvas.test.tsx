import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { PixelCanvas } from './PixelCanvas';

// Mock react-konva to track Rect elements with their event handlers
const rectEventHandlers: Map<number, { onMouseDown?: () => void }> = new Map();
let rectIdCounter = 0;

// Mock react-konva before import
vi.mock('react-konva', () => {
  const MockRect: React.FC<{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onMouseMove?: () => void;
  }> = ({ onMouseDown, onMouseUp, onMouseMove, ...props }) => {
    const id = rectIdCounter++;
    if (onMouseDown) rectEventHandlers.set(id, { onMouseDown });
    return (
      <div
        data-rect-id={id}
        data-testid={`cell-rect-${id}`}
        {...props}
      />
    );
  };

  const MockLine: React.FC<{ points?: number[]; stroke?: string; strokeWidth?: number }> = (props) => {
    return <div data-line="true" {...props} />;
  };

  const MockText: React.FC<{ text?: string; x?: number; y?: number }> = (props) => {
    return <div data-text="true" {...props} />;
  };

  const MockLayer: React.FC<{ children: React.ReactNode; ref?: React.Ref<unknown> }> = ({
    children,
  }) => {
    return <div className="layer-mock">{children}</div>;
  };

  const MockStage: React.FC<{
    children: React.ReactNode;
    width?: number;
    height?: number;
  }> = ({ children }) => {
    return <div className="konvajs-content">{children}</div>;
  };

  return {
    Stage: MockStage,
    Layer: MockLayer,
    Rect: MockRect,
    Line: MockLine,
    Text: MockText,
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
  beforeEach(() => {
    rectEventHandlers.clear();
    rectIdCounter = 0;
  });

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

  it('calls onCellClick when a cell Rect is clicked', () => {
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

    // Verify cells are rendered (should have Rect elements)
    const cellRects = document.querySelectorAll('[data-rect-id]');
    expect(cellRects.length).toBeGreaterThan(0);

    // Verify onCellClick was not called before any interaction
    expect(onCellClick).not.toHaveBeenCalled();

    // Simulate clicking on the first cell rect
    const firstRect = cellRects[0];
    const rectId = parseInt(firstRect.getAttribute('data-rect-id') || '0', 10);
    const handlers = rectEventHandlers.get(rectId);

    // The Rect should have an onMouseDown handler
    expect(handlers?.onMouseDown).toBeDefined();

    // Trigger the handler
    handlers?.onMouseDown?.();

    // onCellClick should have been called
    expect(onCellClick).toHaveBeenCalled();
  });
});
