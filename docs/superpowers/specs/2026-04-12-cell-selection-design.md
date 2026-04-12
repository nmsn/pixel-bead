# Cell Selection & Multi-Edit Design

**Date:** 2026-04-12
**Status:** Approved

## Overview

Add a cell selection system to the pixel canvas. Users can click to select individual cells (with toggle), select all cells of a given color, and batch-change the color of selected cells. This is implemented as an extension of the existing `select` tool.

---

## Data Model

### New State (`usePixelCanvas`)

```ts
interface SelectionState {
  selectedCells: Set<string>;      // key format: "row,col"
  selectionStyle: 'outline' | 'overlay' | 'inset';  // highlight style
}
```

Key format `"row,col"` (e.g. `"3,14"`).

### New Hook Functions

| Function | Signature | Description |
|---|---|---|
| `toggleCellSelection` | `(row: number, col: number) => void` | Toggle a single cell in/out of selection |
| `addToSelection` | `(row: number, col: number) => void` | Add without toggling (for drag) |
| `selectAllByColor` | `(colorIndex: number) => void` | Clears existing selection first, then selects all cells with matching color |
| `clearSelection` | `() => void` | Clear all selected cells |
| `applyColorToSelection` | `(colorIndex: number) => void` | Apply color to all selected, then clear |

### Persistence

- `selectionStyle` saved to `localStorage` under `pixel-bead-project` key, default `'outline'`
- `selectedCells` is **not** persisted — cleared on reload

### Auto-Clear Triggers

`selectedCells` is cleared (set to empty `Set`) when:
- User switches to a non-select tool (`pen`, `eraser`, `bucket`)
- `handleReset` is called
- `handleFileDrop` is called (new image upload)
- `setGridSize` is called

---

## Interaction

### Select Tool Behavior

| Action | Result |
|---|---|
| Click cell | Toggle cell selection |
| Drag on cells | Add cells to selection (no toggle) — selection persists after mouse release |
| Click already-selected cell | Remove from selection |
| Click empty/transparent cell | Toggle its selection (transparent is `-1` color) |

### Cross-Tool Behavior

When switching from `select` to any other tool, selection is cleared before the new tool takes effect.

---

## Canvas Rendering

### `PixelCanvas` Props (updated)

```ts
interface PixelCanvasProps {
  // ... existing props
  selectedCells?: Set<string>;
  selectionStyle?: 'outline' | 'overlay' | 'inset';
}
```

### Highlight Overlay

A dedicated `Group` (`highlightGroup`) is added **above** `cellsGroup` but **below** `gridGroup`, with `hitChildren = false` so it does not intercept pointer events.

#### Style Rendering

| Style | Implementation |
|---|---|
| `'outline'` | `Rect.stroke = '#a5b4fc'`, `strokeWidth = 2.5`, `shadow` for glow effect |
| `'overlay'` | `Rect.fill = 'rgba(99,102,241,0.5)'` — original color visible through overlay |
| `'inset'` | `Rect.stroke = '#ffffff'`, `strokeWidth = 2`, `strokeAlign = 'inside'` |

Each `Rect` is created fresh per `selectedCells` change, not updated in place (simpler, low cell count).

---

## Right Panel — `SelectionPanel`

### Visibility

Shown only when `selectedCells.size > 0`.

### Layout

```
┌─────────────────────────┐
│  已选中: {n} 格          │
│  样式: [A] [B] [C]       │
│  [ 改色 ] [ 全选同色 ]   │
│  [ 清除选区 ]           │
└─────────────────────────┘
```

- **改色**: Opens inline color picker (reuse `ColorPalette` in single-select mode). Clicking a color triggers `applyColorToSelection(colorIndex)`.
- **全选同色**: Reads the color of the first cell in `selectedCells` from `gridData`, calls `selectAllByColor(colorIndex)` — this **replaces** the current selection with all matching-color cells.
- **清除选区**: Calls `clearSelection()`.
- **[A] [B] [C]**: Three style buttons — clicking sets `selectionStyle` and saves to localStorage.

### Position

Renders inside the existing right panel column, above `ExportPanel` when visible.

---

## Component Changes

| File | Change |
|---|---|
| `usePixelCanvas.ts` | Add `selectedCells`, `selectionStyle` state; add/remove selection functions |
| `PixelCanvas.tsx` | Add `selectedCells` + `selectionStyle` props; render highlight overlay Group |
| `TopToolbar.tsx` | No changes (select tool already exists) |
| `App.tsx` | Pass `selectedCells`/`selectionStyle` down; wire "改色" → `applyColorToSelection`; wire "全选同色" |
| `SelectionPanel.tsx` | New component — selection info + style toggle + action buttons |

---

## Tool Type

No change to `Tool` type — `'select'` already exists. Selection is activated when `tool === 'select'`.

```ts
export type Tool = 'select' | 'pen' | 'bucket' | 'eraser';
```

---

## LocalStorage Schema (updated)

```json
{
  "version": 1,
  "gridData": [[...]],
  "gridSize": [32, 32],
  "lastModified": 1712000000000,
  "selectionStyle": "outline"
}
```
