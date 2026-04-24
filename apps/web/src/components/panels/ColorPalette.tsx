import { PALETTE } from '../../lib/palette-256';

interface ColorPaletteProps {
  currentColorIndex: number | null;
  onColorSelect: (index: number | null) => void;
}

export function ColorPalette({ currentColorIndex, onColorSelect }: ColorPaletteProps) {
  return (
    <div className="w-full flex flex-col h-full bg-[var(--color-surface)] border-l border-[var(--color-border)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">调色板</h2>
        <div className="flex items-center gap-2">
          {currentColorIndex === null ? (
            <div
              className="w-6 h-6 rounded border border-[var(--color-border)]"
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
              className="w-6 h-6 rounded border border-[var(--color-border)] shadow-sm"
              style={{ backgroundColor: '#' + PALETTE.colors[currentColorIndex] }}
            />
          )}
        </div>
      </div>

      {/* Palette grid */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
        >
          {/* Transparent swatch */}
          <button
            className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 ${
              currentColorIndex === null
                ? 'ring-2 ring-[#6366f1] ring-offset-2 ring-offset-[var(--color-surface)] z-10'
                : 'border border-[var(--color-border)]'
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
                  ? 'ring-2 ring-[#6366f1] ring-offset-2 ring-offset-[var(--color-surface)] z-10'
                  : ''
              }`}
              style={{ backgroundColor: '#' + color }}
              onClick={() => onColorSelect(index)}
              title={`#${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}