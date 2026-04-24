import { useState } from 'react';
import { KonvaPreview } from '../preview/KonvaPreview';

interface ExportPanelProps {
  gridData: number[][];
  gridSize: [number, number];
  backgroundType?: 'solid' | 'gradient';
  backgroundColor?: string;
  gradientAngle?: number;
  gradientColors?: string[];
  glossEnabled?: boolean;
  glossIntensity?: number;
  cornerRadius?: number;
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
  gridData,
  gridSize,
  backgroundType = 'solid',
  backgroundColor = '#ffffff',
  gradientAngle = 135,
  gradientColors = ['#667eea', '#764ba2'],
  glossEnabled = false,
  glossIntensity = 0,
  cornerRadius = 0,
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
    <div className="flex flex-row h-full w-full">
      {/* Left side - format selection (1/3 width) */}
      <div className="w-1/3 min-w-[200px] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col p-4">
        <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Format</h2>

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
            <h3 className="text-xs text-[var(--color-text-secondary)] uppercase mb-2">Sizes</h3>
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
          Download {selectedFormat.toUpperCase()}
        </button>
      </div>

      {/* Right side - preview (2/3 width) */}
      <div className="flex-1 bg-[var(--color-bg)] flex flex-col items-center justify-center p-6">
        {/* Preview canvas 180x180 */}
        <div className="w-[180px] h-[180px] bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] flex items-center justify-center mb-4 overflow-hidden">
          <KonvaPreview
            gridData={gridData}
            gridSize={gridSize}
            backgroundType={backgroundType}
            backgroundColor={backgroundColor}
            gradientColors={gradientColors}
            gradientAngle={gradientAngle}
            glossEnabled={glossEnabled}
            glossIntensity={glossIntensity}
            cornerRadius={cornerRadius}
            width={180}
            height={180}
          />
        </div>

        {/* Config tags */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 bg-[var(--color-surface)] rounded text-xs text-[var(--color-text-secondary)]">
            Gradient {gradientAngle}
          </span>
          <span className="px-2 py-1 bg-[var(--color-surface)] rounded text-xs text-[var(--color-text-secondary)]">
            Gloss {glossIntensity}
          </span>
          <span className="px-2 py-1 bg-[var(--color-surface)] rounded text-xs text-[var(--color-text-secondary)]">
            Radius {cornerRadius}
          </span>
        </div>
      </div>
    </div>
  );
}