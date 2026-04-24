import { useEffect, useRef, useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';

interface BackgroundPanelProps {
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient';
  gradientColors: string[];
  gradientAngle: number;
  cornerRadius: number;
  glossEnabled: boolean;
  glossIntensity: number;
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
  glossEnabled,
  glossIntensity,
  onBackgroundColorChange,
  onBackgroundTypeChange,
  onGradientColorsChange,
  onGradientAngleChange,
  onCornerRadiusChange,
  onGlossEnabledChange,
  onGlossIntensityChange,
}: BackgroundPanelProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getAngleFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!dialRef.current) return gradientAngle;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
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

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, getAngleFromEvent, onGradientAngleChange]);

  const handleAddColorStop = () => {
    const lastColor = gradientColors[gradientColors.length - 1];
    onGradientColorsChange([...gradientColors, lastColor]);
  };

  const handleRemoveColorStop = (index: number) => {
    if (gradientColors.length <= 2) return;
    onGradientColorsChange(gradientColors.filter((_, i) => i !== index));
  };

  const handleColorStopChange = (index: number, color: string) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    onGradientColorsChange(newColors);
  };

  return (
    <div className="w-full h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">背景效果</h2>
      </div>

      <div className="p-4 space-y-5 flex-1 overflow-y-auto">

        {/* Background Type Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBackgroundTypeChange('solid')}
            className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
              backgroundType === 'solid'
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
          >
            纯色
          </button>
          <button
            onClick={() => onBackgroundTypeChange('gradient')}
            className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
              backgroundType === 'gradient'
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
          >
            渐变
          </button>
        </div>

        {/* Solid Color */}
        {backgroundType === 'solid' && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-secondary)]">背景色</span>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-8 h-8 rounded-md cursor-pointer border border-[var(--color-border)]"
            />
            <span className="text-xs text-[var(--color-text-primary)] font-mono">{backgroundColor}</span>
          </div>
        )}

        {/* Gradient Settings */}
        {backgroundType === 'gradient' && (
          <>
            {/* Gradient Preview */}
            <div
              className="h-8 rounded-lg border border-[var(--color-border)]"
              style={{
                background: gradientColors.length >= 2
                  ? `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})`
                  : gradientColors[0] || '#667eea'
              }}
            />

            {/* Color Stops */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--color-text-secondary)]">颜色节点</span>
                <button
                  onClick={handleAddColorStop}
                  className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-0.5"
                >
                  <Plus size={12} />
                  <span>添加</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {gradientColors.map((color, index) => (
                  <div key={index} className="relative group">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorStopChange(index, e.target.value)}
                      className="w-8 h-8 rounded-md cursor-pointer border border-[var(--color-border)]"
                    />
                    {gradientColors.length > 2 && (
                      <button
                        onClick={() => handleRemoveColorStop(index)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Angle Dial */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--color-text-secondary)] w-8">角度</span>
              <div className="relative">
                <div
                  ref={dialRef}
                  className="w-16 h-16 rounded-full border-2 border-[var(--color-border)] cursor-pointer relative bg-[var(--color-surface)]"
                  onMouseDown={handleDialMouseDown}
                >
                  <div
                    className="absolute w-6 h-0.5 bg-[var(--color-accent)] origin-left left-1/2 top-1/2 -translate-y-1/2"
                    style={{ transform: `translate(-50%, -50%) rotate(${gradientAngle}deg)` }}
                  />
                </div>
              </div>
              <span className="text-sm text-[var(--color-text-primary)] font-mono">{gradientAngle}°</span>
            </div>
          </>
        )}

        {/* Corner Radius */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-secondary)]">圆角</span>
            <span className="text-xs text-[var(--color-text-primary)] font-mono">{cornerRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={cornerRadius}
            onChange={(e) => onCornerRadiusChange(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>

        {/* Gloss Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="gloss-toggle"
            checked={glossEnabled}
            onChange={(e) => onGlossEnabledChange(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-[var(--color-accent)]"
          />
          <label htmlFor="gloss-toggle" className="text-xs text-[var(--color-text-secondary)] cursor-pointer">
            光泽效果
          </label>
        </div>

        {/* Gloss Intensity */}
        {glossEnabled && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)]">光泽强度</span>
              <span className="text-xs text-[var(--color-text-primary)] font-mono">{glossIntensity}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={glossIntensity}
              onChange={(e) => onGlossIntensityChange(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
