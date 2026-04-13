import { useState } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface ColorPaletteProps {
  currentColorIndex: number;
  onColorSelect: (index: number) => void;
}

export function ColorPalette({ currentColorIndex, onColorSelect }: ColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[#2a2a2e]">
      {/* Toggle */}
      <button
        className="w-full h-10 flex items-center justify-between px-4 bg-[#141416] hover:bg-[#1c1c1e] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-[#71717a]">Palette</span>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded border border-[#2a2a2e]"
            style={{ backgroundColor: '#' + PALETTE.colors[currentColorIndex] }}
          />
          <span className="text-xs text-[#71717a]">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Palette grid */}
      {isOpen && (
        <div className="p-2 bg-[#141416]">
          <div
            className="grid gap-px"
            style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
          >
            {PALETTE.colors.map((color, index) => (
              <button
                key={index}
                className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 ${
                  index === currentColorIndex
                    ? 'ring-2 ring-[#6366f1] ring-offset-1 ring-offset-[#141416]'
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