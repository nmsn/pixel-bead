import { useState } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface ColorPaletteProps {
  currentColorIndex: number | null;
  onColorSelect: (index: number | null) => void;
}

export function ColorPalette({ currentColorIndex, onColorSelect }: ColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColor = currentColorIndex === null ? '#ccc' : '#' + PALETTE.colors[currentColorIndex];

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Toggle */}
      <button
        className="w-full h-10 flex items-center justify-between px-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface)] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-[var(--color-text-secondary)]">Palette</span>
        <div className="flex items-center gap-2">
          {currentColorIndex === null ? (
            <div
              className="w-5 h-5 rounded border border-[var(--color-border)]"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(-45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                backgroundColor: 'white',
              }}
            />
          ) : (
            <div
              className="w-5 h-5 rounded border border-[var(--color-border)]"
              style={{ backgroundColor: '#' + PALETTE.colors[currentColorIndex] }}
            />
          )}
          <span className="text-xs text-[var(--color-text-secondary)]">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Palette grid */}
      {isOpen && (
        <div className="p-2 bg-[var(--color-surface)]">
          <div
            className="grid gap-px"
            style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
          >
            {/* Transparent swatch */}
            <button
              className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 ${
                currentColorIndex === null
                  ? 'ring-2 ring-[#6366f1] ring-offset-1 ring-offset-[var(--color-surface)]'
                  : ''
              }`}
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(-45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                backgroundColor: 'white',
              }}
              onClick={() => onColorSelect(null)}
              data-transparent="true"
              title="Transparent"
            />

            {/* Palette colors - index 0-255 maps to grid position 1-256 */}
            {PALETTE.colors.map((color, index) => (
              <button
                key={index}
                className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 ${
                  currentColorIndex === index
                    ? 'ring-2 ring-[#6366f1] ring-offset-1 ring-offset-[var(--color-surface)]'
                    : ''
                }`}
                style={{ backgroundColor: '#' + color }}
                onClick={() => onColorSelect(index)}
                title={`#${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}