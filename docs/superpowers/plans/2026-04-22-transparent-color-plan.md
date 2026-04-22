# Transparent Color Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add transparent as a selectable color in the palette, allowing users to paint pixels with transparency or erase to transparency using any tool.

**Architecture:** Change `currentColorIndex` type from `number` to `number | null`, add transparent swatch to palette UI, update drawing logic to handle transparent as a painting color, ensure export preserves transparency.

**Tech Stack:** React, TypeScript, react-konva

---

## File Structure

```
apps/web/src/
├── hooks/
│   └── usePixelCanvas.ts           # currentColorIndex type change
├── components/panels/
│   └── ColorPalette.tsx            # Add transparent swatch UI
├── App.tsx                         # Pen tool with transparent → sets -1
└── lib/exporters/
    └── toIco.ts                   # Transparent pixel export
```

---

## Tasks

### Task 1: Update usePixelCanvas state type

**Files:**
- Modify: `apps/web/src/hooks/usePixelCanvas.ts`

- [ ] **Step 1: Find currentColorIndex type definition**

Read the file and locate where `currentColorIndex` is defined in the `PixelCanvasState` interface.

- [ ] **Step 2: Write failing test for null color index**

```typescript
// In a test file or inline test
it('allows null as currentColorIndex for transparent', () => {
  // This test verifies the state type accepts null
  const state: PixelCanvasState = {
    currentColorIndex: null, // null = transparent
    // ... other required fields
  };
  expect(state.currentColorIndex).toBeNull();
});
```

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && npx vitest run --config ./vitest.config.ts --testNamePattern "transparent"`
Expected: FAIL (TypeScript error - null not assignable to number)

- [ ] **Step 3: Update PixelCanvasState interface**

Find and modify the interface:
```typescript
export interface PixelCanvasState {
  // ... other fields
  currentColorIndex: number | null; // null = transparent, 0-255 = palette index
}
```

- [ ] **Step 4: Update default value**

Find where `currentColorIndex` is initialized and change to `null`:
```typescript
currentColorIndex: null, // Start with transparent selected
```

- [ ] **Step 5: Run tests to verify**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No errors related to currentColorIndex

- [ ] **Step 6: Commit**

```bash
git add src/hooks/usePixelCanvas.ts
git commit -m "feat: allow null currentColorIndex for transparent color"
```

---

### Task 2: Add transparent swatch to ColorPalette UI

**Files:**
- Modify: `apps/web/src/components/panels/ColorPalette.tsx`

- [ ] **Step 1: Read ColorPalette component**

Read the file to understand how colors are rendered and selected.

- [ ] **Step 2: Write failing test for transparent swatch**

```typescript
it('renders transparent swatch at position 0', () => {
  render(<ColorPalette onColorSelect={vi.fn()} selectedIndex={0} />);
  // The first swatch should have a checkerboard pattern
  const swatches = screen.getAllByRole('button');
  expect(swatches[0]).toHaveAttribute('data-transparent', 'true');
});
```

Run: `npx vitest run --config ./vitest.config.ts --testNamePattern "transparent swatch"`
Expected: FAIL (data-transparent attribute not found)

- [ ] **Step 3: Add checkerboard pattern CSS**

Add this CSS class to the component or its styles:
```css
.checkerboard {
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  background-color: white;
}
```

- [ ] **Step 4: Add transparent swatch at position 0**

Modify the color grid rendering to insert transparent at index 0:
```tsx
{/* Transparent swatch at position 0 */}
<button
  className={`w-4 h-4 ${styles.swatch} ${selectedIndex === null ? styles.selected : ''}`}
  style={{ backgroundImage: 'linear-gradient(...)' }} // checkerboard
  onClick={() => onColorSelect(null)}
  data-transparent="true"
  title="Transparent"
/>
```

- [ ] **Step 5: Handle null selection in onColorSelect**

The onColorSelect prop type should accept `number | null`:
```typescript
onColorSelect: (index: number | null) => void;
```

- [ ] **Step 6: Run tests to verify**

Run: `npx vitest run --config ./vitest.config.ts src/components/panels/ColorPalette.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/panels/ColorPalette.tsx
git commit -m "feat: add transparent swatch to color palette"
```

---

### Task 3: Update pen tool to paint with transparent

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Read App.tsx to find pen tool implementation**

Locate where pen tool applies color to cells.

- [ ] **Step 2: Write failing test for pen with transparent**

```typescript
it('pen tool with transparent color sets cell to -1', () => {
  const result = applyTool({
    tool: 'pen',
    row: 0, col: 0,
    currentColorIndex: null, // transparent
    gridData: [[0]], // cell has color index 0
  });
  expect(result.gridData[0][0]).toBe(-1); // -1 = transparent
});
```

Run: Test should fail because current pen logic only handles numeric color indices.

- [ ] **Step 3: Update pen case in tool handling**

Find the pen case and modify:
```typescript
case 'pen':
  if (currentColorIndex === null) {
    // Transparent - set to -1
    if (newData[row][col] !== -1) {
      newData[row][col] = -1;
      changed = true;
    }
  } else if (newData[row][col] !== currentColorIndex) {
    newData[row][col] = currentColorIndex;
    changed = true;
  }
  break;
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run --config ./vitest.config.ts --testNamePattern "pen tool"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: allow pen tool to paint with transparent color"
```

---

### Task 4: Verify export preserves transparency

**Files:**
- Modify: `apps/web/src/lib/exporters/toIco.ts` (if needed)

- [ ] **Step 1: Read toIco.ts to check current transparent handling**

Read the file and check how `-1` (transparent) is handled in export.

- [ ] **Step 2: Write failing test for transparent export**

```typescript
it('exports transparent pixels as alpha channel', () => {
  const gridData = [[-1, 0]]; // -1 = transparent, 0 = first palette color
  const pngBuffer = exportToPng(gridData);
  // Check that first pixel has alpha = 0
  const firstPixelAlpha = getPixelAlpha(pngBuffer, 0, 0);
  expect(firstPixelAlpha).toBe(0);
});
```

Run: Test should fail or pass depending on current implementation.

- [ ] **Step 3: Verify or fix transparent pixel handling**

Check if existing code already handles `-1` as transparent:
```typescript
if (colorIndex === -1 || colorIndex === undefined) {
  // Skip or set transparent
} else {
  ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
  ctx.fillRect(...);
}
```

If not handling alpha channel, fix to set `ctx.globalAlpha = 0` before transparent pixels.

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run --config ./vitest.config.ts --testNamePattern "transparent.*export"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/exporters/toIco.ts
git commit -m "feat: ensure transparent pixels export with alpha channel"
```

---

## Self-Review Checklist

- [ ] Spec coverage: All features from spec have corresponding tasks
- [ ] No placeholders (TBD, TODO, "implement later")
- [ ] Type consistency: `currentColorIndex: number | null` used consistently
- [ ] TDD: Each task has test → fail → implement → pass → commit

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-22-transparent-color-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**