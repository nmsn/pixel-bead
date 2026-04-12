import { useEffect, useRef } from 'react';
import { App, Rect, Group, Line } from 'leafer';
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
  zoom,
  tool,
  panOffset,
  onCellClick,
  onCellDrag,
  onDragStart,
  onZoomChange,
  onPanChange,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const cellsGroupRef = useRef<Group | null>(null);
  const gridGroupRef = useRef<Group | null>(null);
  const cellRectsRef = useRef<Map<string, Rect>>(new Map());
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const panOffsetRef = useRef(panOffset);

  // Keep panOffsetRef in sync with panOffset prop
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // Initialize Leafer app
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    // Initialize the app
    app.init();

    // Create cells group (bottom layer)
    const cellsGroup = new Group();
    app.add(cellsGroup);
    cellsGroupRef.current = cellsGroup;

    // Create grid group (top layer, pointer-events: none)
    const gridGroup = new Group();
    // Disable hit testing to make grid non-interactive
    gridGroup.hitRect = null;
    app.add(gridGroup);
    gridGroupRef.current = gridGroup;

    appRef.current = app;

    // Scroll zoom handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.5, Math.min(8, zoom + delta));
      onZoomChange?.(newZoom);
    };

    // Middle-click pan handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle button
        e.preventDefault();
        isPanningRef.current = true;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current && lastPanPointRef.current && onPanChange) {
        const dx = e.clientX - lastPanPointRef.current.x;
        const dy = e.clientY - lastPanPointRef.current.y;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
        onPanChange({ x: panOffsetRef.current.x + dx, y: panOffsetRef.current.y + dy });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        isPanningRef.current = false;
        lastPanPointRef.current = null;
      }
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      app.destroy();
      appRef.current = null;
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update cell positions only (no re-render) when zoom changes
  useEffect(() => {
    const group = cellsGroupRef.current;
    const gridGroup = gridGroupRef.current;
    if (!group || !gridGroup) return;

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * zoom;

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
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      gridGroup.add(line);
    }
    for (let i = 0; i <= rows; i++) {
      const line = new Line({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      gridGroup.add(line);
    }
  // Note: zoom and panOffset are the only deps that should trigger position updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, panOffset]);

  // Render pixel cells only when gridData changes
  useEffect(() => {
    const group = cellsGroupRef.current;
    if (!group) return;

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * zoom;

    const offsetX = (canvasWidth - cellSize * cols) / 2 + panOffset.x;
    const offsetY = (canvasHeight - cellSize * rows) / 2 + panOffset.y;

    // Draw pixel cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${row},${col}`;
        const colorIndex = gridData[row]?.[col];
        const fill = colorIndex === -1 || colorIndex === undefined
          ? undefined
          : '#' + PALETTE.colors[colorIndex];

        let rect = cellRectsRef.current.get(key);
        if (!rect) {
          rect = new Rect({
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
          cellRectsRef.current.set(key, rect);
        }

        // Update fill and position
        rect.set({
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: fill || undefined,
        });
      }
    }
  // gridData is the only dependency for cell creation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData, gridSize]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', cursor: tool === 'select' ? 'default' : 'crosshair' }}
    />
  );
}