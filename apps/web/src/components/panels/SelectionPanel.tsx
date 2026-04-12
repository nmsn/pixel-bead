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
    <div className="bg-[#141416] border-b border-[#2a2a2e] p-3 space-y-2">
      <div className="text-xs text-[#71717a]">
        已选中: <span className="text-[#e4e4e7] font-medium">{selectedCells.size} 格</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs text-[#71717a] mr-1">样式:</span>
        {(['outline', 'overlay', 'inset'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStyleChange(s)}
            className={`w-7 h-7 rounded text-xs font-medium border transition-colors ${
              selectionStyle === s
                ? 'bg-[#6366f1] text-white border-[#6366f1]'
                : 'bg-[#27272a] text-[#71717a] border-[#3f3f5a] hover:border-[#6366f1]'
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
          className="flex-1 h-8 rounded bg-[#27272a] text-[#e4e4e7] border border-[#3f3f5a] text-sm hover:border-[#6366f1] transition-colors"
        >
          全选同色
        </button>
      </div>

      <button
        onClick={onClearSelection}
        className="w-full h-7 rounded text-[#71717a] text-xs hover:text-[#f87171] hover:bg-[#27272a] transition-colors"
      >
        清除选区
      </button>
    </div>
  );
}