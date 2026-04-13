# Frame & Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add background color and corner radius controls with real-time preview. Applies to all exports.

**Architecture:** Frame state managed in usePixelCanvas. New FramePanel component. Export functions modified to composite background.

**Tech Stack:** React, Canvas API, TypeScript

---

## File Structure

| File | Change |
|---|---|
| `apps/web/src/hooks/usePixelCanvas.ts` | Add `backgroundColor`, `cornerRadius` state + setters |
| `apps/web/src/components/panels/FramePanel.tsx` | New - frame controls + preview |
| `apps/web/src/App.tsx` | Wire FramePanel, pass props |
| `apps/web/src/lib/exporters/toIco.ts` | Modify to apply frame effects |
| `apps/web/src/lib/exporters/toIcns.ts` | Modify to apply frame effects |
| `apps/web/src/lib/exporters/toPng.ts` | Modify to accept frame options |

---

## Task 1: Add frame state to usePixelCanvas

**Files:**
- Modify: `apps/web/src/hooks/usePixelCanvas.ts`

- [ ] **Step 1: Add state interface fields**

Add to `PixelCanvasState`:
```ts
backgroundColor: string;
cornerRadius: number;
```

Add to initial state:
```ts
backgroundColor: '#ffffff',
cornerRadius: 0,
```

- [ ] **Step 2: Add setter functions**

```ts
const setBackgroundColor = useCallback((color: string) => {
  setState((s) => ({ ...s, backgroundColor: color }));
}, []);

const setCornerRadius = useCallback((radius: number) => {
  setState((s) => ({ ...s, cornerRadius: radius }));
}, []);
```

- [ ] **Step 3: Add to return object**

```ts
return {
  // ... existing
  backgroundColor: state.backgroundColor,
  cornerRadius: state.cornerRadius,
  setBackgroundColor,
  setCornerRadius,
};
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/hooks/usePixelCanvas.ts
git commit -m "feat: add frame state to usePixelCanvas"
```

---

## Task 2: Create FramePanel component

**Files:**
- Create: `apps/web/src/components/panels/FramePanel.tsx`

- [ ] **Step 1: Write component**

```tsx
import { useEffect, useRef } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface FramePanelProps {
  backgroundColor: string;
  cornerRadius: number;
  gridSize: [number, number];
  gridData: number[][];
  onBackgroundColorChange: (color: string) => void;
  onCornerRadiusChange: (radius: number) => void;
}

export function FramePanel({
  backgroundColor,
  cornerRadius,
  gridSize,
  gridData,
  onBackgroundColorChange,
  onCornerRadiusChange,
}: FramePanelProps) {
  const previewRef = useRef<HTMLCanvasElement>(null);

  // Render preview when state changes
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [cols, rows] = gridSize;
    const cellSize = canvas.width / Math.max(cols, rows);

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard for transparency
    const checkSize = 8;
    for (let y = 0; y < canvas.height; y += checkSize) {
      for (let x = 0; x < canvas.width; x += checkSize) {
        ctx.fillStyle = ((x + y) / checkSize) % 2 === 0 ? '#fff' : '#ddd';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Draw rounded rect background
    ctx.fillStyle = backgroundColor;
    const padding = 16;
    const size = canvas.width - padding * 2;
    if (cornerRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(padding, padding, size, size, cornerRadius);
      ctx.fill();
    } else {
      ctx.fillRect(padding, padding, size, size);
    }

    // Draw grid content
    const offsetX = padding + (size - cols * cellSize) / 2;
    const offsetY = padding + (size - rows * cellSize) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = gridData[row]?.[col];
        if (colorIndex !== -1 && colorIndex !== undefined) {
          ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
          ctx.fillRect(
            offsetX + col * cellSize,
            offsetY + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }, [backgroundColor, cornerRadius, gridSize, gridData]);

  return (
    <div className="w-[280px] bg-[#141416] border-l border-[#2a2a2e] flex flex-col">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h2 className="text-sm font-medium text-[#e4e4e7]">背景设置</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <canvas
            ref={previewRef}
            width={128}
            height={128}
            className="border border-[#2a2a2e] rounded"
          />
        </div>

        {/* Background Color */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717a]">背景色:</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-[#2a2a2e]"
          />
          <span className="text-xs text-[#e4e4e7] font-mono">{backgroundColor}</span>
        </div>

        {/* Corner Radius */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717a]">圆角:</span>
          <input
            type="range"
            min="0"
            max="32"
            value={cornerRadius}
            onChange={(e) => onCornerRadiusChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-[#e4e4e7] font-mono w-12 text-right">{cornerRadius}px</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/panels/FramePanel.tsx
git commit -m "feat: add FramePanel component with background controls"
```

---

## Task 3: Wire FramePanel in App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Destructure new state and functions**

```tsx
const { state, ..., backgroundColor, cornerRadius, setBackgroundColor, setCornerRadius } = usePixelCanvas();
```

- [ ] **Step 2: Add FramePanel to JSX**

```tsx
<FramePanel
  backgroundColor={backgroundColor}
  cornerRadius={cornerRadius}
  gridSize={state.gridSize}
  gridData={state.gridData}
  onBackgroundColorChange={setBackgroundColor}
  onCornerRadiusChange={setCornerRadius}
/>
```

Place it above the ExportPanel or in the right panel column.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: wire FramePanel in App"
```

---

## Task 4: Modify export functions

**Files:**
- Modify: `apps/web/src/lib/exporters/toPng.ts`
- Modify: `apps/web/src/lib/exporters/toIco.ts`
- Modify: `apps/web/src/lib/exporters/toIcns.ts`

For each export function, add background compositing:

```ts
// Example for PNG
export function exportToPng(
  gridData: number[][],
  gridSize: [number, number],
  size: number,
  options?: { backgroundColor?: string; cornerRadius?: number }
) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const { backgroundColor = '#ffffff', cornerRadius = 0 } = options || {};

  // Draw rounded background
  ctx.fillStyle = backgroundColor;
  if (cornerRadius > 0) {
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, cornerRadius);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }

  // Draw grid content centered
  const cellSize = size / Math.max(gridSize[0], gridSize[1]);
  const offsetX = (size - gridSize[0] * cellSize) / 2;
  const offsetY = (size - gridSize[1] * cellSize) / 2;

  for (let row = 0; row < gridSize[1]; row++) {
    for (let col = 0; col < gridSize[0]; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex !== -1 && colorIndex !== undefined) {
        ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
        ctx.fillRect(
          offsetX + col * cellSize,
          offsetY + row * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  return canvas.toDataURL('image/png');
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/exporters/toPng.ts apps/web/src/lib/exporters/toIco.ts apps/web/src/lib/exporters/toIcns.ts
git commit -m "feat: apply background effects to exports"
```

---

## Verification

1. Start dev server: `pnpm --filter web dev`
2. Open browser, upload image
3. Find new "背景设置" panel in right column
4. Change background color - preview should update
5. Adjust corner radius - preview should update
6. Export PNG/ICO/ICNS - verify background effects applied
