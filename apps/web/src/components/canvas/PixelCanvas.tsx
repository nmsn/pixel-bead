import { useEffect, useRef } from 'react';
import { Leafer, Rect, Group, Line, Text, PointerEvent } from 'leafer-ui';
import { PALETTE } from '../../lib/palette-256';

interface PixelCanvasProps {
  gridData: number[][];
  gridSize: [number, number];
  zoom: number;
  panOffset: { x: number; y: number };
  onCellClick: (row: number, col: number) => void;
  onCellDrag?: (row: number, col: number) => void;
  onDragStart?: () => void;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (panOffset: { x: number; y: number }) => void;
  selectedCells?: Set<string>;
  selectionStyle?: 'outline' | 'overlay' | 'inset';
}

export function PixelCanvas({
  gridData,
  gridSize,
  zoom: _zoom,
  panOffset,
  onCellClick,
  onCellDrag,
  onDragStart,
  onPanChange,
  selectedCells,
  selectionStyle,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Leafer | null>(null);
  const cellsGroupRef = useRef<Group | null>(null);
  const highlightGroupRef = useRef<Group | null>(null);
  const gridGroupRef = useRef<Group | null>(null);
  const labelsGroupRef = useRef<Group | null>(null);
  const cellRectsRef = useRef<Map<string, Rect>>(new Map());
  const prevGridSizeRef = useRef<[number, number] | null>(null);
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const panOffsetRef = useRef(panOffset);
  const onPanChangeRef = useRef(onPanChange);
  const onCellClickRef = useRef(onCellClick);
  const onCellDragRef = useRef(onCellDrag);

  // Keep refs in sync with props
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    onPanChangeRef.current = onPanChange;
  }, [onPanChange]);

  useEffect(() => {
    onCellClickRef.current = onCellClick;
  }, [onCellClick]);

  useEffect(() => {
    onCellDragRef.current = onCellDrag;
  }, [onCellDrag]);

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

    // Create highlight group (middle layer)
    const highlightGroup = new Group();
    highlightGroup.hitChildren = false;
    app.add(highlightGroup);
    highlightGroupRef.current = highlightGroup;

    // Create grid group (top layer, pointer-events: none)
    const gridGroup = new Group();
    // Disable hit testing to make grid non-interactive
    gridGroup.hitChildren = false;
    app.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // Create labels group for row/column numbers
    const labelsGroup = new Group();
    labelsGroup.hitChildren = false;
    app.add(labelsGroup);
    labelsGroupRef.current = labelsGroup;

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
    const labelsGroup = labelsGroupRef.current;
    if (!group || !gridGroup || !labelsGroup) return;

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * 1;
    const labelWidth = 24;
    const labelHeight = 16;

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

    // Update labels
    labelsGroup.children.forEach((child) => child.remove());

    // Column numbers (top)
    for (let col = 0; col < cols; col++) {
      const text = new Text({
        text: String(col),
        x: offsetX + col * cellSize + cellSize / 2,
        y: offsetY - labelHeight,
        width: cellSize,
        height: labelHeight,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: 'rgba(255,255,255,0.5)',
      });
      labelsGroup.add(text);
    }

    // Row numbers (left)
    for (let row = 0; row < rows; row++) {
      const text = new Text({
        text: String(row),
        x: offsetX - labelWidth,
        y: offsetY + row * cellSize + cellSize / 2,
        width: labelWidth,
        height: cellSize,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: 'rgba(255,255,255,0.5)',
      });
      labelsGroup.add(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_zoom, panOffset]);

  // Rebuild highlight overlay when selectedCells or selectionStyle changes
  useEffect(() => {
    const group = highlightGroupRef.current;
    if (!group) return;
    group.clear();

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * 1;

    const offsetX = (canvasWidth - cellSize * cols) / 2 + panOffset.x;
    const offsetY = (canvasHeight - cellSize * rows) / 2 + panOffset.y;

    const style = selectionStyle ?? 'outline';
    (selectedCells ?? new Set()).forEach((key) => {
      const [row, col] = key.split(',').map(Number);
      const rect = new Rect({
        x: offsetX + col * cellSize,
        y: offsetY + row * cellSize,
        width: cellSize,
        height: cellSize,
      });

      if (style === 'outline') {
        rect.stroke = '#a5b4fc';
        rect.strokeWidth = 2.5;
        rect.shadow = { color: 'rgba(165,180,252,0.5)', blur: 6, offsetX: 0, offsetY: 0 };
      } else if (style === 'overlay') {
        rect.fill = 'rgba(99,102,241,0.5)';
      } else {
        rect.stroke = '#ffffff';
        rect.strokeWidth = 2;
        rect.strokeAlign = 'inside';
      }

      group.add(rect);
    });
  }, [selectedCells, selectionStyle, gridSize, panOffset, _zoom]);

  // Rebuild canvas when gridSize changes
  useEffect(() => {
    const group = cellsGroupRef.current;
    const gridGroup = gridGroupRef.current;
    if (!group || !gridGroup) return;

    rebuildCanvas(gridData, gridSize, panOffset);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, gridData]);

  function rebuildCanvas(data: number[][], size: [number, number], pan: { x: number; y: number }) {
    const group = cellsGroupRef.current!;
    const gridGroup = gridGroupRef.current!;
    const labelsGroup = labelsGroupRef.current!;

    const [cols, rows] = size;

    // Clear all existing cells and grid lines completely
    group.clear();
    gridGroup.clear();
    labelsGroup.clear();
    cellRectsRef.current.clear();
    prevGridSizeRef.current = [cols, rows];

    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * 1;
    const labelWidth = 24;
    const labelHeight = 16;

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

    // Draw column numbers (top)
    for (let col = 0; col < cols; col++) {
      const text = new Text({
        text: String(col),
        x: offsetX + col * cellSize + cellSize / 2,
        y: offsetY - labelHeight,
        width: cellSize,
        height: labelHeight,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: 'rgba(255,255,255,0.5)',
      });
      labelsGroup.add(text);
    }

    // Draw row numbers (left)
    for (let row = 0; row < rows; row++) {
      const text = new Text({
        text: String(row),
        x: offsetX - labelWidth,
        y: offsetY + row * cellSize + cellSize / 2,
        width: labelWidth,
        height: cellSize,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: 'rgba(255,255,255,0.5)',
      });
      labelsGroup.add(text);
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

        rect.on(PointerEvent.DOWN, () => {
          isDraggingRef.current = true;
          onDragStart?.();
          onCellClickRef.current(row, col);
        });

        rect.on(PointerEvent.UP, () => {
          isDraggingRef.current = false;
        });

        if (onCellDragRef.current) {
          rect.on(PointerEvent.MOVE, () => {
            if (isDraggingRef.current) {
              onCellDragRef.current?.(row, col);
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
      style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
    />
  );
}