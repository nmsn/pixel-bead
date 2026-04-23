import { useEffect, useRef, useState, useCallback } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface BackgroundPanelProps {
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient';
  gradientColors: string[];
  gradientAngle: number;
  cornerRadius: number;
  iconScale: number;
  glossEnabled: boolean;
  glossIntensity: number;
  gridSize: [number, number];
  gridData: number[][];
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: 'solid' | 'gradient') => void;
  onGradientColorsChange: (colors: string[]) => void;
  onGradientAngleChange: (angle: number) => void;
  onCornerRadiusChange: (radius: number) => void;
  onGlossEnabledChange: (enabled: boolean) => void;
  onGlossIntensityChange: (intensity: number) => void;
}

export function BackgroundPanel({
  backgroundColor,
  backgroundType,
  gradientColors,
  gradientAngle,
  cornerRadius,
  iconScale,
  glossEnabled,
  glossIntensity,
  gridSize,
  gridData,
  onBackgroundColorChange,
  onBackgroundTypeChange,
  onGradientColorsChange,
  onGradientAngleChange,
  onCornerRadiusChange,
  onGlossEnabledChange,
  onGlossIntensityChange,
}: BackgroundPanelProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate angle from center given mouse position
  const getAngleFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!dialRef.current) return gradientAngle;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    // Convert to degrees, with 0 at top
    let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.round(angle);
  }, [gradientAngle]);

  const handleDialMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    onGradientAngleChange(getAngleFromEvent(e));
  }, [getAngleFromEvent, onGradientAngleChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      onGradientAngleChange(getAngleFromEvent(e));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getAngleFromEvent, onGradientAngleChange]);

  // Render preview
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

    // Draw background (solid or gradient)
    if (backgroundType === 'gradient' && gradientColors.length >= 2) {
      const angleRad = (gradientAngle - 90) * (Math.PI / 180);
      const x1 = padding + bgSize / 2 - Math.cos(angleRad) * bgSize / 2;
      const y1 = padding + bgSize / 2 - Math.sin(angleRad) * bgSize / 2;
      const x2 = padding + bgSize / 2 + Math.cos(angleRad) * bgSize / 2;
      const y2 = padding + bgSize / 2 + Math.sin(angleRad) * bgSize / 2;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradientColors.forEach((color, i) => {
        gradient.addColorStop(i / (gradientColors.length - 1), color);
      });

      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = backgroundColor;
    }

    if (cornerRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(padding, padding, bgSize, bgSize, cornerRadius);
      ctx.fill();
    } else {
      ctx.fillRect(padding, padding, bgSize, bgSize);
    }

    // Draw gloss overlay
    if (glossEnabled) {
      const glossGradient = ctx.createLinearGradient(padding, padding, padding, padding + bgSize / 2);
      glossGradient.addColorStop(0, `rgba(255, 255, 255, ${glossIntensity / 200})`);
      glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = glossGradient;
      if (cornerRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(padding, padding, bgSize, bgSize / 2, [cornerRadius, cornerRadius, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(padding, padding, bgSize, bgSize / 2);
      }
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
  }, [backgroundColor, backgroundType, gradientColors, gradientAngle, cornerRadius, iconScale, glossEnabled, glossIntensity, gridSize, gridData]);

  const handleAddColorStop = () => {
    // Add a new color stop between the last two colors
    const lastColor = gradientColors[gradientColors.length - 1];
    const newColors = [...gradientColors, lastColor];
    onGradientColorsChange(newColors);
  };

  const handleRemoveColorStop = (index: number) => {
    if (gradientColors.length <= 2) return;
    const newColors = gradientColors.filter((_, i) => i !== index);
    onGradientColorsChange(newColors);
  };

  const handleColorStopChange = (index: number, color: string) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    onGradientColorsChange(newColors);
  };

  return (
    <div className="w-[280px] bg-surface border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-primary">背景效果</h2>
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

          {/* Background Type Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBackgroundTypeChange('solid')}
              className={`flex-1 py-1.5 px-3 text-xs rounded border transition-colors ${
                backgroundType === 'solid'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-secondary border-border hover:border-primary'
              }`}
            >
              纯色
            </button>
            <button
              onClick={() => onBackgroundTypeChange('gradient')}
              className={`flex-1 py-1.5 px-3 text-xs rounded border transition-colors ${
                backgroundType === 'gradient'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-secondary border-border hover:border-primary'
              }`}
            >
              渐变
            </button>
          </div>

          {/* Solid Color */}
          {backgroundType === 'solid' && (
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
          )}

          {/* Gradient Settings */}
          {backgroundType === 'gradient' && (
            <>
              {/* Gradient Preview Bar */}
              <div
                className="h-6 rounded border border-border"
                style={{
                  background: gradientColors.length >= 2
                    ? `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})`
                    : gradientColors[0] || '#667eea'
                }}
              />

              {/* Color Stops */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">颜色节点:</span>
                  <button
                    onClick={handleAddColorStop}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    + 添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gradientColors.map((color, index) => (
                    <div key={index} className="relative group">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorStopChange(index, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-border"
                      />
                      {gradientColors.length > 2 && (
                        <button
                          onClick={() => handleRemoveColorStop(index)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Angle Dial */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-secondary">角度:</span>
                <div className="relative">
                  <div
                    ref={dialRef}
                    className="w-[72px] h-[72px] rounded-full border-2 border-border cursor-pointer relative"
                    onMouseDown={handleDialMouseDown}
                  >
                    {/* Dial background */}
                    <div className="absolute inset-0 rounded-full bg-surface" />

                    {/* Pointer line */}
                    <div
                      className="absolute w-[28px] h-0.5 bg-primary"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) rotate(${gradientAngle}deg)`
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-text-primary font-mono absolute ml-[88px] mt-[52px]">
                  {gradientAngle}°
                </span>
              </div>
            </>
          )}

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
              role="slider"
            />
            <span className="text-xs text-text-primary font-mono w-12 text-right">{cornerRadius}px</span>
          </div>

          {/* Gloss Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={glossEnabled}
              onChange={(e) => onGlossEnabledChange(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
              role="checkbox"
            />
            <span className="text-xs text-text-secondary">光泽效果</span>
          </div>

          {/* Gloss Intensity */}
          {glossEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">光泽强度:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={glossIntensity}
                onChange={(e) => onGlossIntensityChange(Number(e.target.value))}
                className="flex-1"
                role="slider"
              />
              <span className="text-xs text-text-primary font-mono w-12 text-right">{glossIntensity}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}