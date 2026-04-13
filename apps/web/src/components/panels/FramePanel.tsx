import { useEffect, useRef } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface FramePanelProps {
  backgroundColor: string;
  cornerRadius: number;
  gridSize: [number, number];
  gridData: number[][];
  onBackgroundColorChange: (color: string) => void;
  onCornerRadiusChange: (radius: number) => void;
}

export function FramePanel({
  backgroundColor,
  cornerRadius,
  gridSize,
  gridData,
  onBackgroundColorChange,
  onCornerRadiusChange,
}: FramePanelProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Render preview when state changes
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [cols, rows] = gridSize;
    const cellSize = canvas.width / Math.max(cols, rows);

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
    const padding = 16;
    const size = canvas.width - padding * 2;
    if (cornerRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(padding, padding, size, size, cornerRadius);
      ctx.fill();
    } else {
      ctx.fillRect(padding, padding, size, size);
    }

    // Draw grid content
    const offsetX = padding + (size - cols * cellSize) / 2;
    const offsetY = padding + (size - rows * cellSize) / 2;

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
  }, [backgroundColor, cornerRadius, gridSize, gridData]);

  return (
    <div className="w-[280px] bg-[#141416] border-l border-[#2a2a2e] flex flex-col">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h2 className="text-sm font-medium text-[#e4e4e7]">背景设置</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <canvas
            ref={previewRef}
            width={128}
            height={128}
            className="border border-[#2a2a2e] rounded"
          />
        </div>

        {/* Background Color */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717a]">背景色:</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-[#2a2a2e]"
          />
          <span className="text-xs text-[#e4e4e7] font-mono">{backgroundColor}</span>
        </div>

        {/* Corner Radius */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717a]">圆角:</span>
          <input
            type="range"
            min="0"
            max="32"
            value={cornerRadius}
            onChange={(e) => onCornerRadiusChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-[#e4e4e7] font-mono w-12 text-right">{cornerRadius}px</span>
        </div>
      </div>
    </div>
  );
}
