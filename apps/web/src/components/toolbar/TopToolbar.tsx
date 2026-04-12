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
  onExport: () => void;
  onReset: () => void;
}

const GRID_SIZES: [number, number][] = [
  [8, 8], [16, 16], [32, 32], [48, 48], [64, 64], [128, 128],
];

const TOOLS: { id: Tool; label: string; icon: string; key: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', key: 'V' },
  { id: 'pen', label: 'Pen', icon: '✏', key: 'B' },
  { id: 'bucket', label: 'Fill', icon: '🪣', key: 'G' },
  { id: 'eraser', label: 'Eraser', icon: '🧽', key: 'E' },
];

export function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  tool,
  onToolChange,
  gridSize,
  onGridSizeChange,
  onExport,
  onReset,
}: TopToolbarProps) {
  return (
    <div className="h-12 bg-[#141416] border-b border-[#2a2a2e] flex items-center px-4 gap-2">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-4">
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[#e4e4e7] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ←
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[#e4e4e7] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          →
        </button>
      </div>

      <div className="w-px h-6 bg-[#2a2a2e]" />

      {/* Tools */}
      <div className="flex items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`w-8 h-8 flex items-center justify-center rounded text-lg ${
              tool === t.id
                ? 'bg-[#6366f1] text-white'
                : 'text-[#e4e4e7] hover:bg-[#2a2a2e]'
            }`}
            onClick={() => onToolChange(t.id)}
            title={`${t.label} (${t.key})`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#2a2a2e]" />

      {/* Grid size */}
      <select
        className="h-8 px-2 rounded bg-[#141416] border border-[#2a2a2e] text-[#e4e4e7] text-sm"
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset */}
      <button
        className="h-8 px-3 rounded text-text-secondary text-sm hover:bg-border hover:text-[#f87171] transition-colors"
        onClick={onReset}
        title="Reset canvas"
      >
        ↺
      </button>

      {/* Export */}
      <button
        className="h-8 px-4 rounded bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] transition-colors"
        onClick={onExport}
      >
        Export
      </button>
    </div>
  );
}