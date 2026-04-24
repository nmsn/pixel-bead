import { useState } from 'react';

interface ExportPanelProps {
  onExportPng: (size: number) => void;
  onExportIco: () => void;
  onExportIcns: () => void;
}

const PNG_SIZES = [8, 16, 32, 48, 64, 128, 256, 512];
const FORMAT_CARDS = [
  { id: 'ico', label: 'ICO', desc: 'Windows Icon' },
  { id: 'icns', label: 'ICNS', desc: 'macOS Icon' },
  { id: 'png', label: 'PNG', desc: 'Portable' },
] as const;

export function ExportPanel({
  onExportPng,
  onExportIco,
  onExportIcns,
}: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [selectedPngSizes, setSelectedPngSizes] = useState<number[]>([32, 64]);

  const togglePngSize = (size: number) => {
    setSelectedPngSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  const handleDownload = () => {
    if (selectedFormat === 'ico') {
      onExportIco();
    } else if (selectedFormat === 'icns') {
      onExportIcns();
    } else {
      selectedPngSizes.forEach((s) => onExportPng(s));
    }
  };

  return (
    <div className="w-full h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col">
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">导出格式</h2>
      </div>

      <div className="p-4 flex-col flex flex-1 overflow-y-auto">
        {/* Format cards */}
        <div className="space-y-2 flex-1">
          {FORMAT_CARDS.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                selectedFormat === format.id
                  ? 'border-[#6366f1] bg-[#6366f1]/10 text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-hover)]'
              }`}
            >
              <div className="font-medium text-sm">{format.label}</div>
              <div className="text-xs opacity-70">{format.desc}</div>
            </button>
          ))}
        </div>

        {/* PNG size chips - only show when PNG is selected */}
        {selectedFormat === 'png' && (
          <div className="mt-4 mb-4">
            <h3 className="text-xs text-[var(--color-text-secondary)] uppercase mb-2">尺寸</h3>
            <div className="flex flex-wrap gap-1">
              {PNG_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => togglePngSize(size)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedPngSizes.includes(size)
                      ? 'bg-[#6366f1] text-white'
                      : 'bg-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="w-full h-10 rounded bg-[#6366f1] text-white text-sm font-medium hover:bg-[#6366f1]/90 transition-colors mt-auto"
        >
          下载 {selectedFormat.toUpperCase()}
        </button>
      </div>
    </div>
  );
}