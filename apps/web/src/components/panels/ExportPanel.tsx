import { useState } from 'react';
import { Download } from 'lucide-react';

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
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">导出格式</h2>
      </div>

      <div className="p-4 flex flex-col flex-1 overflow-y-auto">
        {/* Format cards */}
        <div className="flex flex-col gap-2 flex-1">
          {FORMAT_CARDS.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                selectedFormat === format.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-hover)]'
              }`}
            >
              <div className="font-medium text-sm">{format.label}</div>
              <div className="text-xs opacity-70">{format.desc}</div>
            </button>
          ))}
        </div>

        {/* PNG size chips */}
        {selectedFormat === 'png' && (
          <div className="mt-4">
            <h3 className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">尺寸</h3>
            <div className="flex flex-wrap gap-1.5">
              {PNG_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => togglePngSize(size)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedPngSizes.includes(size)
                      ? 'bg-[var(--color-accent)] text-white'
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
          className="w-full h-10 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors mt-auto flex items-center justify-center gap-2"
        >
          <Download size={16} />
          <span>下载 {selectedFormat.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
}
