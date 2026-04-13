interface SelectionPanelProps {
  selectedCells: Set<string>;
  selectionStyle: 'outline' | 'overlay' | 'inset';
  onStyleChange: (style: 'outline' | 'overlay' | 'inset') => void;
  onColorChange: () => void;
  onSelectAllByColor: () => void;
  onClearSelection: () => void;
}

const STYLE_LABELS = { outline: 'A', overlay: 'B', inset: 'C' } as const;

export function SelectionPanel({
  selectedCells,
  selectionStyle,
  onStyleChange,
  onColorChange,
  onSelectAllByColor,
  onClearSelection,
}: SelectionPanelProps) {
  if (selectedCells.size === 0) return null;

  return (
    <div className="bg-surface border-b border-border p-3 space-y-2">
      <div className="text-xs text-text-secondary">
        已选中: <span className="text-text-primary font-medium">{selectedCells.size} 格</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-text-secondary mr-1">样式:</span>
        {(['outline', 'overlay', 'inset'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStyleChange(s)}
            className={`w-7 h-7 rounded text-xs font-medium border transition-colors ${
              selectionStyle === s
                ? 'bg-[#6366f1] text-white border-[#6366f1]'
                : 'bg-hover text-text-secondary border-hover-border hover:border-accent'
            }`}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onColorChange}
          className="flex-1 h-8 rounded bg-[#6366f1] text-white text-sm hover:bg-[#4f46e5] transition-colors"
        >
          改色
        </button>
        <button
          onClick={onSelectAllByColor}
          className="flex-1 h-8 rounded bg-hover text-text-primary border border-hover-border text-sm hover:border-accent transition-colors"
        >
          全选同色
        </button>
      </div>

      <button
        onClick={onClearSelection}
        className="w-full h-7 rounded text-text-secondary text-xs hover:text-[#f87171] hover:bg-hover transition-colors"
      >
        清除选区
      </button>
    </div>
  );
}