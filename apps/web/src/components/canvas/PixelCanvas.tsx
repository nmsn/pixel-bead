import { useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
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
  isDark: boolean;
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
  isDark,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const cellsLayerRef = useRef<Konva.Layer>(null);
  const highlightLayerRef = useRef<Konva.Layer>(null);
  const gridLayerRef = useRef<Konva.Layer>(null);
  const labelsLayerRef = useRef<Konva.Layer>(null);
  const cellRectsRef = useRef<Map<string, Konva.Rect>>(new Map());
  const prevGridSizeRef = useRef<[number, number] | null>(null);
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);
  const panOffsetRef = useRef(panOffset);
  const onPanChangeRef = useRef(onPanChange);
  const onCellClickRef = useRef(onCellClick);
  const onCellDragRef = useRef(onCellDrag);
  const isDarkRef = useRef(isDark);

  // Keep refs in sync with props
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

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

  // Middle-click pan handlers
  useEffect(() => {
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
    container?.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Update cell positions only (no re-render) when zoom/panOffset changes
  useEffect(() => {
    const cellsLayer = cellsLayerRef.current;
    const gridLayer = gridLayerRef.current;
    const labelsLayer = labelsLayerRef.current;
    if (!cellsLayer || !gridLayer || !labelsLayer) return;

    const CANVAS_SIZE = 800;
    const [cols, rows] = gridSize;
    const cellSize = CANVAS_SIZE / Math.max(cols, rows);
    const labelWidth = 24;
    const labelHeight = 16;

    const offsetX = (CANVAS_SIZE - cellSize * cols) / 2 + panOffset.x;
    const offsetY = (CANVAS_SIZE - cellSize * rows) / 2 + panOffset.y;

    // Update existing cell rects
    cellRectsRef.current.forEach((rect, key) => {
      const [row, col] = key.split(',').map(Number);
      rect.setAttrs({
        x: offsetX + col * cellSize,
        y: offsetY + row * cellSize,
        width: cellSize,
        height: cellSize,
      });
    });

    // Update grid lines only (clear and redraw)
    gridLayer.destroyChildren();

    for (let i = 0; i <= cols; i++) {
      const line = new Konva.Line({
        points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
        stroke: isDarkRef.current ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        strokeWidth: 1,
      });
      gridLayer.add(line);
    }
    for (let i = 0; i <= rows; i++) {
      const line = new Konva.Line({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        stroke: isDarkRef.current ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        strokeWidth: 1,
      });
      gridLayer.add(line);
    }

    // Update labels
    labelsLayer.destroyChildren();

    // Column numbers (top)
    for (let col = 0; col < cols; col++) {
      const text = new Konva.Text({
        text: String(col),
        x: offsetX + col * cellSize + cellSize / 2,
        y: offsetY - labelHeight,
        width: cellSize,
        height: labelHeight,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: isDarkRef.current ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
      });
      labelsLayer.add(text);
    }

    // Row numbers (left)
    for (let row = 0; row < rows; row++) {
      const text = new Konva.Text({
        text: String(row),
        x: offsetX - labelWidth,
        y: offsetY + row * cellSize + cellSize / 2,
        width: labelWidth,
        height: cellSize,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: isDarkRef.current ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
      });
      labelsLayer.add(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_zoom, panOffset]);

  // Rebuild highlight overlay when selectedCells or selectionStyle changes
  useEffect(() => {
    const layer = highlightLayerRef.current;
    if (!layer) return;
    layer.destroyChildren();

    const CANVAS_SIZE = 800;
    const [cols, rows] = gridSize;
    const cellSize = CANVAS_SIZE / Math.max(cols, rows);

    const offsetX = (CANVAS_SIZE - cellSize * cols) / 2 + panOffset.x;
    const offsetY = (CANVAS_SIZE - cellSize * rows) / 2 + panOffset.y;

    const style = selectionStyle ?? 'outline';
    (selectedCells ?? new Set()).forEach((key) => {
      const [row, col] = key.split(',').map(Number);
      const rect = new Konva.Rect({
        x: offsetX + col * cellSize,
        y: offsetY + row * cellSize,
        width: cellSize,
        height: cellSize,
      });

      if (style === 'outline') {
        rect.setAttrs({
          stroke: '#a5b4fc',
          strokeWidth: 2.5,
          shadowColor: 'rgba(165,180,252,0.5)',
          shadowBlur: 6,
          shadowEnabled: true,
        });
      } else if (style === 'overlay') {
        rect.setAttrs({ fill: 'rgba(99,102,241,0.5)' });
      } else {
        rect.setAttrs({
          stroke: '#ffffff',
          strokeWidth: 2,
          strokeScaleEnabled: false,
        });
      }

      layer.add(rect);
    });
  }, [selectedCells, selectionStyle, gridSize, panOffset, _zoom]);

  // Rebuild canvas when gridSize changes
  useEffect(() => {
    const cellsLayer = cellsLayerRef.current;
    const gridLayer = gridLayerRef.current;
    if (!cellsLayer || !gridLayer) return;

    rebuildCanvas(gridData, gridSize, panOffset);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, gridData]);

  function rebuildCanvas(data: number[][], size: [number, number], pan: { x: number; y: number }) {
    const cellsLayer = cellsLayerRef.current!;
    const gridLayer = gridLayerRef.current!;
    const labelsLayer = labelsLayerRef.current!;

    const CANVAS_SIZE = 800;
    const [cols, rows] = size;

    // Clear all existing cells and grid lines completely
    cellsLayer.destroyChildren();
    gridLayer.destroyChildren();
    labelsLayer.destroyChildren();
    cellRectsRef.current.clear();
    prevGridSizeRef.current = [cols, rows];

    const cellSize = CANVAS_SIZE / Math.max(cols, rows);
    const labelWidth = 24;
    const labelHeight = 16;

    const offsetX = (CANVAS_SIZE - cellSize * cols) / 2 + pan.x;
    const offsetY = (CANVAS_SIZE - cellSize * rows) / 2 + pan.y;

    // Draw grid lines
    for (let i = 0; i <= cols; i++) {
      gridLayer.add(
        new Konva.Line({
          points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
          stroke: isDarkRef.current ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          strokeWidth: 1,
        })
      );
    }
    for (let i = 0; i <= rows; i++) {
      gridLayer.add(
        new Konva.Line({
          points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
          stroke: isDarkRef.current ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          strokeWidth: 1,
        })
      );
    }

    // Draw column numbers (top)
    for (let col = 0; col < cols; col++) {
      const text = new Konva.Text({
        text: String(col),
        x: offsetX + col * cellSize + cellSize / 2,
        y: offsetY - labelHeight,
        width: cellSize,
        height: labelHeight,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: isDarkRef.current ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
      });
      labelsLayer.add(text);
    }

    // Draw row numbers (left)
    for (let row = 0; row < rows; row++) {
      const text = new Konva.Text({
        text: String(row),
        x: offsetX - labelWidth,
        y: offsetY + row * cellSize + cellSize / 2,
        width: labelWidth,
        height: cellSize,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 10,
        fill: isDarkRef.current ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
      });
      labelsLayer.add(text);
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

        const rect = new Konva.Rect({
          stroke: 'rgba(0,0,0,0.2)',
          strokeWidth: 0.5,
          draggable: false,
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: fill || undefined,
          onMouseDown: () => {
            isDraggingRef.current = true;
            onDragStart?.();
            onCellClickRef.current(row, col);
          },
          onMouseUp: () => {
            isDraggingRef.current = false;
          },
          onMouseMove: () => {
            if (isDraggingRef.current) {
              onCellDragRef.current?.(row, col);
            }
          },
        });

        cellsLayer.add(rect);
        cellRectsRef.current.set(key, rect);
      }
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ width: 800, height: 800, cursor: 'crosshair' }}
    >
      <Stage
        ref={stageRef}
        width={800}
        height={800}
        fill={isDark ? '#18181b' : '#f4f4f5'}
      >
        {/* Cells layer - bottom */}
        <Layer ref={cellsLayerRef}>
          {/* cells rendered via useEffect */}
        </Layer>

        {/* Highlight layer - middle */}
        <Layer ref={highlightLayerRef}>
          {/* selections rendered via useEffect */}
        </Layer>

        {/* Grid layer - top, non-interactive */}
        <Layer ref={gridLayerRef}>
          {/* grid lines rendered via useEffect */}
        </Layer>

        {/* Labels layer */}
        <Layer ref={labelsLayerRef}>
          {/* row/column labels rendered via useEffect */}
        </Layer>
      </Stage>
    </div>
  );
}
