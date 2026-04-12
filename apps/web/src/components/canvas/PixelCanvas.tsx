import { useEffect, useRef } from 'react';
import { App, Rect, Group, Line } from 'leafer';
import { PALETTE } from '../../lib/palette-256';

interface PixelCanvasProps {
  gridData: number[][];
  gridSize: [number, number];
  zoom: number;
  currentColorIndex: number;
  tool: 'select' | 'pen' | 'bucket' | 'eraser';
  onCellClick: (row: number, col: number) => void;
  onCellDrag?: (row: number, col: number) => void;
  onDragStart?: () => void;
}

export function PixelCanvas({
  gridData,
  gridSize,
  zoom,
  currentColorIndex,
  tool,
  onCellClick,
  onCellDrag,
  onDragStart,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const cellsGroupRef = useRef<Group | null>(null);
  const isDraggingRef = useRef(false);

  // Initialize Leafer app
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const cellsGroup = new Group();
    app.tree.add(cellsGroup);
    cellsGroupRef.current = cellsGroup;
    appRef.current = app;

    return () => {
      app.destroy();
      appRef.current = null;
    };
  }, []);

  // Render pixel cells
  useEffect(() => {
    const app = appRef.current;
    const group = cellsGroupRef.current;
    if (!app || !group) return;

    // Clear existing cells
    group.children.forEach((child) => child.remove());

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * zoom;

    const offsetX = (canvasWidth - cellSize * cols) / 2;
    const offsetY = (canvasHeight - cellSize * rows) / 2;

    // Draw grid lines
    for (let i = 0; i <= cols; i++) {
      const line = new Line({
        points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      group.add(line);
    }
    for (let i = 0; i <= rows; i++) {
      const line = new Line({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      group.add(line);
    }

    // Draw pixel cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = gridData[row]?.[col];
        const fill = colorIndex === -1 || colorIndex === undefined
          ? undefined
          : '#' + PALETTE.colors[colorIndex];

        const rect = new Rect({
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: fill || undefined,
          stroke: { color: 'rgba(0,0,0,0.2)', width: 0.5 },
          draggable: false,
        });

        (rect as any).__row = row;
        (rect as any).__col = col;

        rect.on('pointerdown', () => {
          isDraggingRef.current = true;
          onDragStart?.();
          onCellClick(row, col);
        });

        rect.on('pointerup', () => {
          isDraggingRef.current = false;
        });

        if (onCellDrag) {
          rect.on('pointermove', () => {
            if (isDraggingRef.current) {
              onCellDrag(row, col);
            }
          });
        }

        group.add(rect);
      }
    }
  }, [gridData, gridSize, zoom, currentColorIndex, tool, onCellClick, onCellDrag, onDragStart]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: tool === 'select' ? 'default' : 'crosshair' }}
    />
  );
}