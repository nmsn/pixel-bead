# Cell Selection & Multi-Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cell selection (click to select/toggle, multi-select, select-all-by-color, batch color change) with three configurable highlight styles, via the existing `select` tool.

**Architecture:** Extend `usePixelCanvas` with `selectedCells` + `selectionStyle` state. Render highlight overlay in Leafer via a dedicated `Group` above cells. Add `SelectionPanel` to right panel column. Persist `selectionStyle` to localStorage.

**Tech Stack:** React, Leafer UI, TailwindCSS v4, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-12-cell-selection-design.md`

---

## File Structure

```
apps/web/src/
├── components/
│   ├── panels/
│   │   └── SelectionPanel.tsx         # NEW — selection panel (above ExportPanel)
│   └── canvas/
│       └── PixelCanvas.tsx             # MOD — add selectedCells + selectionStyle props + highlight group
├── hooks/
│   └── usePixelCanvas.ts              # MOD — add selectedCells state + selection functions
└── App.tsx                            # MOD — wire SelectionPanel, pass props
```

---

## Task 1: Add selection state & functions to usePixelCanvas

**Files:**
- Modify: `apps/web/src/hooks/usePixelCanvas.ts`

- [ ] **Step 1: Add state**

Add to `PixelCanvasState` interface:
```ts
selectedCells: Set<string>;    // key: "row,col"
selectionStyle: 'outline' | 'overlay' | 'inset';
```

Add to initial state:
```ts
selectedCells: new Set<string>(),
selectionStyle: 'outline',
```

- [ ] **Step 2: Add function signatures**

```ts
const toggleCellSelection = useCallback((row: number, col: number) => {
  setState((s) => {
    const key = `${row},${col}`;
    const next = new Set(s.selectedCells);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return { ...s, selectedCells: next };
  });
}, []);

const addToSelection = useCallback((row: number, col: number) => {
  setState((s) => {
    const next = new Set(s.selectedCells);
    next.add(`${row},${col}`);
    return { ...s, selectedCells: next };
  });
}, []);

const selectAllByColor = useCallback((colorIndex: number) => {
  setState((s) => {
    const next = new Set<string>();
    s.gridData.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell === colorIndex) next.add(`${r},${c}`);
      })
    );
    return { ...s, selectedCells: next };
  });
}, []);

const clearSelection = useCallback(() => {
  setState((s) => ({ ...s, selectedCells: new Set() }));
}, []);

const applyColorToSelection = useCallback((colorIndex: number) => {
  setState((s) => {
    const newData = s.gridData.map((r) => [...r]);
    s.selectedCells.forEach((key) => {
      const [r, c] = key.split(',').map(Number);
      newData[r][c] = colorIndex;
    });
    return { ...s, gridData: newData, selectedCells: new Set() };
  });
}, []);

const setSelectionStyle = useCallback((style: 'outline' | 'overlay' | 'inset') => {
  setState((s) => ({ ...s, selectionStyle: style }));
}, []);
```

- [ ] **Step 3: Return new functions**

Add to return object: `toggleCellSelection`, `addToSelection`, `selectAllByColor`, `clearSelection`, `applyColorToSelection`, `setSelectionStyle`

---

## Task 2: Render highlight overlay in PixelCanvas

**Files:**
- Modify: `apps/web/src/components/canvas/PixelCanvas.tsx`

- [ ] **Step 1: Add new props**

```ts
selectedCells?: Set<string>;
selectionStyle?: 'outline' | 'overlay' | 'inset';
```

- [ ] **Step 2: Add highlightGroup ref**

```ts
const highlightGroupRef = useRef<Group | null>(null);
```

- [ ] **Step 3: Create highlightGroup in Leafer init (after cellsGroup)**

```ts
const highlightGroup = new Group();
highlightGroup.hitChildren = false;
app.add(highlightGroup);
highlightGroupRef.current = highlightGroup;
```

Place highlightGroup between cellsGroup and gridGroup in z-order (add to app in order: cells → highlight → grid).

- [ ] **Step 4: Add useEffect to rebuild highlight overlay on selectedCells or selectionStyle change**

```ts
useEffect(() => {
  const group = highlightGroupRef.current;
  if (!group) return;
  group.clear();

  const style = selectionStyle ?? 'outline';
  (selectedCells ?? new Set()).forEach((key) => {
    const [row, col] = key.split(',').map(Number);
    const rect = new Rect({
      x: offsetX + col * cellSize,
      y: offsetY + row * cellSize,
      width: cellSize,
      height: cellSize,
    });

    if (style === 'outline') {
      rect.stroke = '#a5b4fc';
      rect.strokeWidth = 2.5;
      (rect as any).shadow = { type: 'glow', color: 'rgba(165,180,252,0.5)', blur: 6 };
    } else if (style === 'overlay') {
      rect.fill = 'rgba(99,102,241,0.5)';
    } else {
      rect.stroke = '#ffffff';
      rect.strokeWidth = 2;
      (rect as any).strokeAlign = 'inner';
    }

    group.add(rect);
  });
}, [selectedCells, selectionStyle]);
```

**Note:** The offsetX/offsetY/cellSize variables used in the effect come from the existing zoom/pan useEffect. Ensure those values are accessible, or inline the calculation inside the new effect.

- [ ] **Step 5: Wire cell click to toggleCellSelection when select tool active**

In the existing `rect.on('pointerdown')` callback inside `rebuildCanvas`:
```ts
rect.on('pointerdown', () => {
  isDraggingRef.current = true;
  onDragStart?.();
  if (tool === 'select' && onToggleSelection) {
    onToggleSelection(row, col);
  } else {
    onCellClick(row, col);
  }
});
```

Add `onToggleSelection?: (row: number, col: number) => void` prop alongside existing `onCellClick`.

- [ ] **Step 6: Wire drag to addToSelection**

In the existing `rect.on('pointermove')` for drag:
```ts
if (onCellDrag) {
  rect.on('pointermove', () => {
    if (isDraggingRef.current) {
      if (tool === 'select' && onAddToSelection) {
        onAddToSelection(row, col);
      } else {
        onCellDrag(row, col);
      }
    }
  });
}
```

Add `onAddToSelection?: (row: number, col: number) => void` prop.

---

## Task 3: Create SelectionPanel component

**Files:**
- Create: `apps/web/src/components/panels/SelectionPanel.tsx`

- [ ] **Step 1: Write component**

```tsx
interface SelectionPanelProps {
  selectedCells: Set<string>;
  selectionStyle: 'outline' | 'overlay' | 'inset';
  currentColorIndex: number;
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
```

---

## Task 4: Wire everything in App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Destructure new functions from usePixelCanvas**

```tsx
const { state, setGridData, setGridSize, setTool, setCurrentColorIndex, setZoom, updateCell, floodFill,
  toggleCellSelection, addToSelection, selectAllByColor, clearSelection, applyColorToSelection, setSelectionStyle } =
  usePixelCanvas();
```

- [ ] **Step 2: Pass new props to PixelCanvas**

```tsx
<PixelCanvas
  // ... existing props
  selectedCells={state.selectedCells}
  selectionStyle={state.selectionStyle}
  onToggleSelection={toggleCellSelection}
  onAddToSelection={addToSelection}
/>
```

- [ ] **Step 3: Add SelectionPanel to right panel column**

```tsx
<div className="flex flex-col">
  {state.selectedCells.size > 0 && (
    <SelectionPanel
      selectedCells={state.selectedCells}
      selectionStyle={state.selectionStyle}
      currentColorIndex={state.currentColorIndex}
      onStyleChange={setSelectionStyle}
      onColorChange={(colorIndex) => {
        applyColorToSelection(colorIndex);
      }}
      onSelectAllByColor={() => {
        const first = [...state.selectedCells][0];
        if (!first) return;
        const [r, c] = first.split(',').map(Number);
        selectAllByColor(state.gridData[r][c]);
      }}
      onClearSelection={clearSelection}
    />
  )}
  <ExportPanel ... />
  <ColorPalette ... />
</div>
```

**Note:** `applyColorToSelection` takes a `colorIndex: number`. When the user clicks "改色", we need the color from `ColorPalette`. The simplest approach: temporarily switch the active tool to `pen` with `currentColorIndex` already set, or use a separate "apply" mode. The spec says `applyColorToSelection` applies the *current* color (from `ColorPalette`'s `currentColorIndex`). So wire it as:

```tsx
onColorChange={() => applyColorToSelection(state.currentColorIndex)}
```

- [ ] **Step 4: Clear selection on all four auto-clear triggers**

Wire `clearSelection()` to all four triggers listed in the spec:

**4a. Tool switch** — add `useEffect`:
```tsx
useEffect(() => {
  if (state.tool !== 'select') {
    clearSelection();
  }
}, [state.tool]);
```

**4b. `handleReset`** — `handleReset` already calls `setGridData([])`. Since `selectedCells` lives in `usePixelCanvas` state and `handleReset` reinitializes via `usePixelCanvas`, the selection auto-clears (new state object). No change needed if `handleReset` already triggers a re-render via `setGridData`. Verify `handleReset` in App.tsx calls `setGridData([])` which causes `usePixelCanvas` to re-initialize — if so, this is handled automatically.

**4c. `handleFileDrop`** — add to existing handler:
```tsx
const handleFileDrop = useCallback(
  async (file: File) => {
    clearSelection(); // ← add this line
    const imageData = await imageFileToImageData(file);
    sourceImageRef.current = imageData;
    // ...
  },
  [state.gridSize, clearSelection]
);
```

**4d. `setGridSize`** — add to `onGridSizeChange` in TopToolbar prop:
```tsx
onGridSizeChange={(size) => {
  clearSelection(); // ← add this line
  // ... rest of existing logic
}}
```

**Note on 4b:** If `handleReset` only calls `setGridData([])` and `setGridSize([32,32])` (not re-creating the `usePixelCanvas` state object), the `selectedCells` Set may persist. Add `clearSelection()` explicitly in `handleReset` to be safe:
```tsx
const handleReset = useCallback(() => {
  const emptyGrid = createEmptyGrid([32, 32]);
  sourceImageRef.current = null;
  clearSelection(); // ← add
  setGridSize([32, 32]);
  setGridData([]);
  // ...
}, [setGridData, setGridSize, reset, clearSelection]);
```

- [ ] **Step 5: Save selectionStyle to localStorage**

Add to the existing localStorage save effect:
```tsx
localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify({
    version: 1,
    gridData: state.gridData,
    gridSize: state.gridSize,
    lastModified: Date.now(),
    selectionStyle: state.selectionStyle,
  })
);
```

- [ ] **Step 6: Load selectionStyle from localStorage**

In the load effect:
```tsx
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    setGridData(parsed.gridData);
    setGridSize(parsed.gridSize);
    if (parsed.selectionStyle) {
      setSelectionStyle(parsed.selectionStyle);
    }
    push(parsed.gridData, true);
  } catch {
    // ignore
  }
}
```

---

## Task 5: Verify end-to-end

**Files:** (manual testing — no new test files needed)

- [ ] **Step 1: Start dev server**

```bash
cd /Users/nmsn/Studio/pixel-bead && pnpm --filter web dev
```

- [ ] **Step 2: Test select tool — click to toggle**

1. Select `V` to activate select tool
2. Click any colored cell — it should get an outline highlight
3. Click it again — highlight should disappear

- [ ] **Step 3: Test multi-select**

1. Click 3 different cells — all 3 should stay highlighted
2. SelectionPanel should appear with "已选中: 3 格"

- [ ] **Step 4: Test style switching**

1. Click [B] then [C] in the panel — highlight style should change immediately

- [ ] **Step 5: Test 全选同色**

1. With 3 blue cells selected, click "全选同色" — selection should expand to all blue cells

- [ ] **Step 6: Test 改色**

1. With some cells selected, pick a new color in ColorPalette
2. Click "改色" — all selected cells should change to the new color, selection should clear

- [ ] **Step 7: Test 清除选区**

1. Click "清除选区" — selection should clear, panel should disappear

- [ ] **Step 8: Test tool switch clears selection**

1. Select some cells
2. Press `B` to switch to pen tool — selection should clear, panel should disappear

- [ ] **Step 9: Test style persistence**

1. Set style to overlay
2. Refresh page — style should remain overlay after reload
