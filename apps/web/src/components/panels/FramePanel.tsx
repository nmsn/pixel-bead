import { useEffect, useRef, useState } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface FramePanelProps {
  backgroundColor: string;
  cornerRadius: number;
  iconScale: number;
  gridSize: [number, number];
  gridData: number[][];
  onBackgroundColorChange: (color: string) => void;
  onCornerRadiusChange: (radius: number) => void;
  onIconScaleChange: (scale: number) => void;
}

export function FramePanel({
  backgroundColor,
  cornerRadius,
  iconScale,
  gridSize,
  gridData,
  onBackgroundColorChange,
  onCornerRadiusChange,
  onIconScaleChange,
}: FramePanelProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Render preview when state changes
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [cols, rows] = gridSize;
    const padding = 16;
    const bgSize = canvas.width - padding * 2;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard for transparency
    const checkSize = 8;
    for (let y = 0; y < canvas.height; y += checkSize) {
      for (let x = 0; x < canvas.width; x += checkSize) {
        ctx.fillStyle = ((x + y) / checkSize) % 2 === 0 ? '#fff' : '#ddd';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Draw rounded rect background
    ctx.fillStyle = backgroundColor;
    if (cornerRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(padding, padding, bgSize, bgSize, cornerRadius);
      ctx.fill();
    } else {
      ctx.fillRect(padding, padding, bgSize, bgSize);
    }

    // Calculate icon size based on scale
    const iconSize = bgSize * iconScale;
    const cellSize = iconSize / Math.max(cols, rows);
    const offsetX = padding + (bgSize - iconSize) / 2;
    const offsetY = padding + (bgSize - iconSize) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = gridData[row]?.[col];
        if (colorIndex !== -1 && colorIndex !== undefined) {
          ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
          ctx.fillRect(
            offsetX + col * cellSize,
            offsetY + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }, [backgroundColor, cornerRadius, iconScale, gridSize, gridData]);

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-[280px] bg-surface border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-primary">背景设置</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <canvas
            ref={previewRef}
            width={128}
            height={128}
            className="border border-border rounded"
          />
        </div>

        {/* Background Color */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">背景色:</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-border"
          />
          <span className="text-xs text-text-primary font-mono">{backgroundColor}</span>
        </div>

        {/* Corner Radius */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">圆角:</span>
          <input
            type="range"
            min="0"
            max="32"
            value={cornerRadius}
            onChange={(e) => onCornerRadiusChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-text-primary font-mono w-12 text-right">{cornerRadius}px</span>
        </div>

        {/* Icon Scale */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">图标大小:</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={iconScale}
            onChange={(e) => onIconScaleChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-text-primary font-mono w-12 text-right">{Math.round(iconScale * 100)}%</span>
        </div>
        </div>
      )}
    </div>
  );
}
