import { useState } from 'react';

interface ExportPanelProps {
  gridData: number[][];
  gridSize: [number, number];
  onExportPng: (size: number) => void;
  onExportIco: () => void;
  onExportIcns: () => void;
}

const PNG_SIZES = [8, 16, 32, 48, 64, 128, 256, 512];

export function ExportPanel({
  gridData,
  gridSize,
  onExportPng,
  onExportIco,
  onExportIcns,
}: ExportPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPngSizes, setSelectedPngSizes] = useState<number[]>([32, 64]);

  const togglePngSize = (size: number) => {
    setSelectedPngSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  return (
    <div className="w-[280px] bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Export</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* ICO */}
          <div>
            <h3 className="text-xs text-[var(--color-text-secondary)] uppercase mb-2">Windows Icon</h3>
            <button
              className="w-full h-10 rounded bg-[var(--color-border)] text-[var(--color-text-primary)] text-sm hover:bg-[var(--color-hover)] transition-colors"
              onClick={onExportIco}
            >
              Download .ico
            </button>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Includes 16/32/48/256</p>
          </div>

          {/* ICNS */}
          <div>
            <h3 className="text-xs text-[var(--color-text-secondary)] uppercase mb-2">macOS Icon</h3>
            <button
              className="w-full h-10 rounded bg-[var(--color-border)] text-[var(--color-text-primary)] text-sm hover:bg-[var(--color-hover)] transition-colors"
              onClick={onExportIcns}
            >
              Download .icns
            </button>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Includes 16/32/64/128/256/512/1024</p>
          </div>

          {/* PNG */}
          <div>
            <h3 className="text-xs text-[var(--color-text-secondary)] uppercase mb-2">PNG</h3>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {PNG_SIZES.map((size) => (
                <button
                  key={size}
                  className={`h-8 rounded text-xs transition-colors ${
                    selectedPngSizes.includes(size)
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`}
                  onClick={() => togglePngSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="w-full h-10 rounded bg-[var(--color-border)] text-[var(--color-text-primary)] text-sm hover:bg-[var(--color-hover)] transition-colors"
              onClick={() => selectedPngSizes.forEach((s) => onExportPng(s))}
              disabled={selectedPngSizes.length === 0}
            >
              Download PNG {selectedPngSizes.length > 0 ? `(${selectedPngSizes.join(', ')})` : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}