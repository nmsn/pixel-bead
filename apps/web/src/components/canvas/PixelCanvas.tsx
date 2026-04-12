import { useEffect, useRef } from 'react';
import { Leafer, Rect, Group, Line } from 'leafer-ui';
import { PALETTE } from '../../lib/palette-256';
import { Tool } from 'shared/src/types';

interface PixelCanvasProps {
  gridData: number[][];
  gridSize: [number, number];
  zoom: number;
  tool: Tool;
  panOffset: { x: number; y: number };
  onCellClick: (row: number, col: number) => void;
  onCellDrag?: (row: number, col: number) => void;
  onDragStart?: () => void;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (panOffset: { x: number; y: number }) => void;
}

export function PixelCanvas({
  gridData,
  gridSize,
  zoom: _zoom,
  tool,
  panOffset,
  onCellClick,
  onCellDrag,
  onDragStart,
  onPanChange,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Leafer | null>(null);
  const cellsGroupRef = useRef<Group | null>(null);
  const gridGroupRef = useRef<Group | null>(null);
  const cellRectsRef = useRef<Map<string, Rect>>(new Map());
  const prevGridSizeRef = useRef<[number, number] | null>(null);
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const panOffsetRef = useRef(panOffset);
  const onPanChangeRef = useRef(onPanChange);

  // Keep refs in sync with props
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    onPanChangeRef.current = onPanChange;
  }, [onPanChange]);

  // Initialize Leafer app
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new Leafer({
      view: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    // Create cells group (bottom layer)
    const cellsGroup = new Group();
    app.add(cellsGroup);
    cellsGroupRef.current = cellsGroup;

    // Create grid group (top layer, pointer-events: none)
    const gridGroup = new Group();
    // Disable hit testing to make grid non-interactive
    gridGroup.hitChildren = false;
    app.add(gridGroup);
    gridGroupRef.current = gridGroup;

    appRef.current = app;

    // Middle-click pan handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle button
        e.preventDefault();
        isPanningRef.current = true;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current && lastPanPointRef.current && onPanChangeRef.current) {
        const dx = e.clientX - lastPanPointRef.current.x;
        const dy = e.clientY - lastPanPointRef.current.y;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
        onPanChangeRef.current({ x: panOffsetRef.current.x + dx, y: panOffsetRef.current.y + dy });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        isPanningRef.current = false;
        lastPanPointRef.current = null;
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      app.destroy();
      appRef.current = null;
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update cell positions only (no re-render) when zoom/panOffset changes
  useEffect(() => {
    const group = cellsGroupRef.current;
    const gridGroup = gridGroupRef.current;
    if (!group || !gridGroup) return;

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * 1;

    const offsetX = (canvasWidth - cellSize * cols) / 2 + panOffset.x;
    const offsetY = (canvasHeight - cellSize * rows) / 2 + panOffset.y;

    // Update existing cell rects
    cellRectsRef.current.forEach((rect, key) => {
      const [row, col] = key.split(',').map(Number);
      rect.set({
        x: offsetX + col * cellSize,
        y: offsetY + row * cellSize,
        width: cellSize,
        height: cellSize,
      });
    });

    // Update grid lines only (clear and redraw)
    gridGroup.children.forEach((child) => child.remove());

    for (let i = 0; i <= cols; i++) {
      const line = new Line({
        points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
        stroke: 'rgba(255,255,255,0.1)',
        strokeWidth: 1,
      });
      gridGroup.add(line);
    }
    for (let i = 0; i <= rows; i++) {
      const line = new Line({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        stroke: 'rgba(255,255,255,0.1)',
        strokeWidth: 1,
      });
      gridGroup.add(line);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_zoom, panOffset]);

  // Rebuild canvas when gridSize changes
  useEffect(() => {
    const group = cellsGroupRef.current;
    const gridGroup = gridGroupRef.current;
    if (!group || !gridGroup) return;

    rebuildCanvas(gridData, gridSize, panOffset);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  function rebuildCanvas(data: number[][], size: [number, number], pan: { x: number; y: number }) {
    const group = cellsGroupRef.current!;
    const gridGroup = gridGroupRef.current!;

    const [cols, rows] = size;

    // Clear all existing cells and grid lines completely
    group.clear();
    gridGroup.clear();
    cellRectsRef.current.clear();
    prevGridSizeRef.current = [cols, rows];

    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * 1;

    const offsetX = (canvasWidth - cellSize * cols) / 2 + pan.x;
    const offsetY = (canvasHeight - cellSize * rows) / 2 + pan.y;

    // Draw grid lines
    for (let i = 0; i <= cols; i++) {
      gridGroup.add(
        new Line({
          points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
          stroke: 'rgba(255,255,255,0.1)',
          strokeWidth: 1,
        })
      );
    }
    for (let i = 0; i <= rows; i++) {
      gridGroup.add(
        new Line({
          points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
          stroke: 'rgba(255,255,255,0.1)',
          strokeWidth: 1,
        })
      );
    }

    // Draw pixel cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${row},${col}`;
        const colorIndex = data[row]?.[col];
        const fill =
          colorIndex === -1 || colorIndex === undefined
            ? undefined
            : '#' + PALETTE.colors[colorIndex];

        const rect = new Rect({
          stroke: 'rgba(0,0,0,0.2)',
          strokeWidth: 0.5,
          draggable: false,
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: fill || undefined,
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
        cellRectsRef.current.set(key, rect);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: tool === 'select' ? 'default' : 'crosshair' }}
    />
  );
}