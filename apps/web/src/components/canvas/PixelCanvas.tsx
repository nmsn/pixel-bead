import { useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import { PALETTE } from '../../lib/palette-256';

// Create checkerboard pattern image for transparent cells
// Using a data URL to avoid canvas.toDataURL() issues in test environments
const CHECKERBOARD_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAH0lEQVQ4T2NkYGD4z0ABYBw1YDQMRsNgNAyGbhgAAPE/APHyRqFYAAAAAElFTkSuQmCC';

function getCheckerboardImage(): HTMLImageElement {
  const img = new Image();
  img.src = CHECKERBOARD_DATA_URL;
  return img;
}

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

const CANVAS_SIZE = 800;
const LABEL_WIDTH = 24;
const LABEL_HEIGHT = 16;

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
      if (e.button === 1) {
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
        onPanChangeRef.current({
          x: panOffsetRef.current.x + dx,
          y: panOffsetRef.current.y + dy,
        });
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

  // Calculate grid geometry
  const gridGeometry = useMemo(() => {
    const [cols, rows] = gridSize;
    const cellSize = CANVAS_SIZE / Math.max(cols, rows);
    const offsetX = (CANVAS_SIZE - cellSize * cols) / 2 + panOffset.x;
    const offsetY = (CANVAS_SIZE - cellSize * rows) / 2 + panOffset.y;
    return { cols, rows, cellSize, offsetX, offsetY };
  }, [gridSize, panOffset]);

  // Memoize grid lines
  const gridLines = useMemo(() => {
    const { cols, rows, cellSize, offsetX, offsetY } = gridGeometry;
    const lines: { points: number[]; key: string }[] = [];

    for (let i = 0; i <= cols; i++) {
      lines.push({
        points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
        key: `v-${i}`,
      });
    }
    for (let i = 0; i <= rows; i++) {
      lines.push({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        key: `h-${i}`,
      });
    }
    return lines;
  }, [gridGeometry]);

  // Memoize labels
  const labels = useMemo(() => {
    const { cols, rows, cellSize, offsetX, offsetY } = gridGeometry;
    const labelItems: { text: string; x: number; y: number; key: string }[] = [];

    for (let col = 0; col < cols; col++) {
      labelItems.push({
        text: String(col),
        x: offsetX + col * cellSize + cellSize / 2,
        y: offsetY - LABEL_HEIGHT,
        key: `col-${col}`,
      });
    }
    for (let row = 0; row < rows; row++) {
      labelItems.push({
        text: String(row),
        x: offsetX - LABEL_WIDTH,
        y: offsetY + row * cellSize + cellSize / 2,
        key: `row-${row}`,
      });
    }
    return labelItems;
  }, [gridGeometry]);

  // Memoize cell data
  const cells = useMemo(() => {
    const { cols, rows, cellSize, offsetX, offsetY } = gridGeometry;
    const cellData: {
      row: number;
      col: number;
      fill: string | undefined;
      fillPatternImage?: HTMLImageElement;
      key: string;
      x: number;
      y: number;
    }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = gridData[row]?.[col];
        const isTransparent = colorIndex === -1 || colorIndex === undefined;

        cellData.push({
          row,
          col,
          fill: isTransparent ? undefined : '#' + PALETTE.colors[colorIndex],
          fillPatternImage: isTransparent ? getCheckerboardImage() : undefined,
          key: `${row},${col}`,
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
        });
      }
    }
    return cellData;
  }, [gridData, gridGeometry]);

  // Memoize highlight rects
  const highlightRects = useMemo(() => {
    const { cellSize, offsetX, offsetY } = gridGeometry;
    const style = selectionStyle ?? 'outline';
    const rects: {
      key: string;
      x: number;
      y: number;
      width: number;
      height: number;
      stroke?: string;
      strokeWidth?: number;
      fill?: string;
      shadowColor?: string;
      shadowBlur?: number;
      shadowEnabled?: boolean;
    }[] = [];

    (selectedCells ?? new Set()).forEach((key) => {
      const [row, col] = key.split(',').map(Number);
      const rect: (typeof rects)[0] = {
        key: `highlight-${key}`,
        x: offsetX + col * cellSize,
        y: offsetY + row * cellSize,
        width: cellSize,
        height: cellSize,
      };

      if (style === 'outline') {
        rect.stroke = '#a5b4fc';
        rect.strokeWidth = 2.5;
        rect.shadowColor = 'rgba(165,180,252,0.5)';
        rect.shadowBlur = 6;
        rect.shadowEnabled = true;
      } else if (style === 'overlay') {
        rect.fill = 'rgba(99,102,241,0.5)';
      } else {
        rect.stroke = '#ffffff';
        rect.strokeWidth = 2;
      }

      rects.push(rect);
    });
    return rects;
  }, [selectedCells, selectionStyle, gridGeometry]);

  // Event handlers
  const handleCellMouseDown = (row: number, col: number) => {
    isDraggingRef.current = true;
    onDragStart?.();
    onCellClickRef.current(row, col);
  };

  const handleCellMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCellMouseMove = (row: number, col: number) => {
    if (isDraggingRef.current) {
      onCellDragRef.current?.(row, col);
    }
  };

  const strokeColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  return (
    <div
      ref={containerRef}
      style={{
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        cursor: 'crosshair',
        backgroundColor: isDark ? '#18181b' : '#f4f4f5',
      }}
    >
      <Stage width={CANVAS_SIZE} height={CANVAS_SIZE}>
        {/* Cells layer - bottom */}
        <Layer>
          {cells.map((cell) => (
            <Rect
              key={cell.key}
              x={cell.x}
              y={cell.y}
              width={gridGeometry.cellSize}
              height={gridGeometry.cellSize}
              fill={cell.fill}
              fillPatternImage={cell.fillPatternImage}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={0.5}
              onMouseDown={() => handleCellMouseDown(cell.row, cell.col)}
              onMouseUp={handleCellMouseUp}
              onMouseMove={() => handleCellMouseMove(cell.row, cell.col)}
            />
          ))}
        </Layer>

        {/* Grid layer - non-interactive */}
        <Layer>
          {gridLines.map((line) => (
            <Line
              key={line.key}
              points={line.points}
              stroke={strokeColor}
              strokeWidth={1}
            />
          ))}
        </Layer>

        {/* Highlight layer */}
        <Layer>
          {highlightRects.map((rect) => (
            <Rect
              key={rect.key}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke={rect.stroke}
              strokeWidth={rect.strokeWidth}
              fill={rect.fill}
              shadowColor={rect.shadowColor}
              shadowBlur={rect.shadowBlur}
              shadowEnabled={rect.shadowEnabled}
            />
          ))}
        </Layer>

        {/* Labels layer - topmost */}
        <Layer>
          {labels.map((label) => (
            <Text
              key={label.key}
              text={label.text}
              x={label.x}
              y={label.y}
              width={label.key.startsWith('col-') ? gridGeometry.cellSize : LABEL_WIDTH}
              height={LABEL_HEIGHT}
              align="center"
              verticalAlign="middle"
              fontSize={10}
              fill={labelColor}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}