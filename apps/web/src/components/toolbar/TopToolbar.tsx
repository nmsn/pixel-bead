import {
  MousePointer2,
  Pencil,
  PaintBucket,
  Eraser,
  Pipette,
  Undo2,
  Redo2,
  RotateCcw,
  Sun,
  Moon,
  Upload,
  Download,
} from 'lucide-react';
import { Tool } from 'shared/src/types';

interface TopToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  gridSize: [number, number];
  onGridSizeChange: (size: [number, number]) => void;
  onUpload: () => void;
  onExport: () => void;
  onReset: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  showDrawingTools: boolean;
}

const GRID_SIZES: [number, number][] = [
  [8, 8],
  [16, 16],
  [32, 32],
  [48, 48],
  [64, 64],
  [128, 128],
];

const TOOLS: { id: Tool; label: string; icon: React.ComponentType<{ size: number }>; key: string }[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, key: 'V' },
  { id: 'pen', label: 'Pen', icon: Pencil, key: 'B' },
  { id: 'bucket', label: 'Fill', icon: PaintBucket, key: 'G' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, key: 'E' },
  { id: 'eyedropper', label: 'Eyedropper', icon: Pipette, key: 'I' },
];

const ICON_SIZE = 16;
const BUTTON_SIZE = 32;

export function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  tool,
  onToolChange,
  gridSize,
  onGridSizeChange,
  onUpload,
  onExport,
  onReset,
  isDark,
  onThemeToggle,
  showDrawingTools,
}: TopToolbarProps) {
  return (
    <div className="h-12 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center px-4 gap-3">
      {showDrawingTools && (
        <>
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={ICON_SIZE} />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={ICON_SIZE} />
            </button>
          </div>

          <div className="w-px h-5 bg-[var(--color-border)]" />

          {/* Tools */}
          <div className="flex items-center gap-0.5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const isActive = tool === t.id;
              return (
                <button
                  key={t.id}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                  onClick={() => onToolChange(t.id)}
                  title={`${t.label} (${t.key})`}
                >
                  <Icon size={ICON_SIZE} />
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-[var(--color-border)]" />

          {/* Grid size */}
          <select
            className="h-8 px-3 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
            value={`${gridSize[0]}x${gridSize[1]}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number);
              onGridSizeChange([w, h]);
            }}
          >
            {GRID_SIZES.map(([w, h]) => (
              <option key={`${w}x${h}`} value={`${w}x${h}`}>
                {w}×{h}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          onClick={onThemeToggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={ICON_SIZE} /> : <Moon size={ICON_SIZE} />}
        </button>

        {/* Reset */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[#f97316] transition-colors"
          onClick={onReset}
          title="Reset canvas"
        >
          <RotateCcw size={ICON_SIZE} />
        </button>

        {/* Upload */}
        <button
          className="h-8 px-4 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-2"
          onClick={onUpload}
        >
          <Upload size={14} />
          <span>上传图片</span>
        </button>

        {/* Export */}
        <button
          className="h-8 px-4 rounded-md bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors flex items-center gap-2"
          onClick={onExport}
        >
          <Download size={14} />
          <span>导出</span>
        </button>
      </div>
    </div>
  );
}
