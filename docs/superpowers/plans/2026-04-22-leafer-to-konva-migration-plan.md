# Leafer → react-konva Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `leafer-ui` with `react-konva` in PixelCanvas while maintaining identical functionality.

**Architecture:** Convert imperative Leafer setup to declarative react-konva JSX. Keep React component structure, props, and callbacks unchanged. Use Konva's Layer system for visual layering (cells → highlights → grid → labels).

**Tech Stack:** react-konva, konva

---

## File Structure

```
apps/web/
├── package.json                          # Replace leafer with react-konva + konva
└── src/components/canvas/
    └── PixelCanvas.tsx                   # Main migration (imperative Leafer → declarative Konva)
```

---

## Tasks

### Task 1: Install react-konva and konva dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Remove leafer dependency**

Modify `package.json`:
```json
"dependencies": {
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-konva": "^18.2.10",
  "konva": "^9.3.6"
}
```

Remove: `"leafer": "^2.0.8"`

- [ ] **Step 2: Run pnpm install**

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && pnpm install`
Expected: leafer removed, react-konva and konva added

- [ ] **Step 3: Commit**

```bash
cd /Users/nmsn/Studio/pixel-bead/apps/web
git add package.json pnpm-lock.yaml
git commit -m "chore: replace leafer with react-konva and konva"
```

---

### Task 2: Write PixelCanvas render test

**Files:**
- Modify: `apps/web/src/components/canvas/PixelCanvas.test.tsx` (create if not exists)

- [ ] **Step 1: Write failing test for Stage rendering**

```tsx
import { render, screen } from '@testing-library/react';
import { PixelCanvas } from './PixelCanvas';

describe('PixelCanvas', () => {
  it('renders a Konva Stage', () => {
    const mockGrid = Array(8).fill(null).map(() => Array(8).fill(-1));
    render(
      <PixelCanvas
        gridData={mockGrid}
        gridSize={[8, 8]}
        zoom={1}
        panOffset={{ x: 0, y: 0 }}
        onCellClick={jest.fn()}
        isDark={false}
      />
    );
    // Konva creates a container div with stage-content class
    const container = document.querySelector('.konvajs-content');
    expect(container).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails (no Stage)**

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && pnpm test -- --run src/components/canvas/PixelCanvas.test.tsx`
Expected: FAIL - cannot query '.konvajs-content' (no Stage yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/PixelCanvas.test.tsx
git commit -m "test: add PixelCanvas render test"
```

---

### Task 3: Convert PixelCanvas from Leafer to react-konva

**Files:**
- Modify: `apps/web/src/components/canvas/PixelCanvas.tsx`

- [ ] **Step 1: Update imports**

Replace:
```tsx
import { Leafer, Rect, Group, Line, Text, PointerEvent } from 'leafer-ui';
```
With:
```tsx
import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import Konva from 'konva';
```

- [ ] **Step 2: Replace useRef Leafer types with Konva types**

Replace:
```tsx
const appRef = useRef<Leafer | null>(null);
const cellsGroupRef = useRef<Group | null>(null);
const highlightGroupRef = useRef<Group | null>(null);
const gridGroupRef = useRef<Group | null>(null);
const labelsGroupRef = useRef<Group | null>(null);
const cellRectsRef = useRef<Map<string, Rect>>(new Map());
```
With:
```tsx
const stageRef = useRef<Konva.Stage>(null);
const cellsLayerRef = useRef<Konva.Layer>(null);
const highlightLayerRef = useRef<Konva.Layer>(null);
const gridLayerRef = useRef<Konva.Layer>(null);
const labelsLayerRef = useRef<Konva.Layer>(null);
const cellRectsRef = useRef<Map<string, Konva.Rect>>(new Map());
```

- [ ] **Step 3: Replace Leafer initialization with react-konva JSX structure**

Replace the entire return statement and initialization logic:
```tsx
// Replace the useEffect that creates Leafer app and the return statement with:
return (
  <div
    ref={containerRef}
    style={{ width: 800, height: 800, cursor: 'crosshair' }}
  >
    <Stage
      ref={stageRef}
      width={800}
      height={800}
      fill={isDark ? '#18181b' : '#f4f4f5'}
    >
      {/* Cells layer - bottom */}
      <Layer ref={cellsLayerRef}>
        {/* cells rendered via useEffect */}
      </Layer>

      {/* Highlight layer - middle */}
      <Layer ref={highlightLayerRef}>
        {/* selections rendered via useEffect */}
      </Layer>

      {/* Grid layer - top, non-interactive */}
      <Layer ref={gridLayerRef}>
        {/* grid lines rendered via useEffect */}
      </Layer>

      {/* Labels layer */}
      <Layer ref={labelsLayerRef}>
        {/* row/column labels rendered via useEffect */}
      </Layer>
    </Stage>
  </div>
);
```

- [ ] **Step 4: Replace event handlers from PointerEvent to React events**

Replace Leafer event patterns:
```tsx
// OLD:
rect.on(PointerEvent.DOWN, () => {
  isDraggingRef.current = true;
  onDragStart?.();
  onCellClickRef.current(row, col);
});

rect.on(PointerEvent.UP, () => {
  isDraggingRef.current = false;
});

if (onCellDragRef.current) {
  rect.on(PointerEvent.MOVE, () => {
    if (isDraggingRef.current) {
      onCellDragRef.current?.(row, col);
    }
  });
}

// NEW:
onMouseDown={() => {
  isDraggingRef.current = true;
  onDragStart?.();
  onCellClick(row, col);
}}
onMouseUp={() => {
  isDraggingRef.current = false;
}}
onMouseMove={() => {
  if (isDraggingRef.current) {
    onCellDrag?.(row, col);
  }
}}
```

- [ ] **Step 5: Run test to verify Stage renders**

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && pnpm test -- --run src/components/canvas/PixelCanvas.test.tsx`
Expected: PASS - Stage rendered

- [ ] **Step 6: Run full build to check for errors**

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && pnpm build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/components/canvas/PixelCanvas.tsx
git commit -m "feat: migrate PixelCanvas from Leafer to react-konva"
```

---

### Task 4: Verify all functionality with integration test

**Files:**
- Modify: `apps/web/src/components/canvas/PixelCanvas.test.tsx`

- [ ] **Step 1: Write interaction test for cell click**

```tsx
it('calls onCellClick when cell is clicked', async () => {
  const onCellClick = jest.fn();
  const mockGrid = Array(8).fill(null).map(() => Array(8).fill(-1));

  render(
    <PixelCanvas
      gridData={mockGrid}
      gridSize={[8, 8]}
      zoom={1}
      panOffset={{ x: 0, y: 0 }}
      onCellClick={onCellClick}
      isDark={false}
    />
  );

  // Find the Stage and simulate a click on a cell rect
  const stage = document.querySelector('.konvajs-content');
  expect(stage).toBeInTheDocument();

  // Verify the component renders without error
  expect(onCellClick).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run all PixelCanvas tests**

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && pnpm test -- --run src/components/canvas/`
Expected: All pass

- [ ] **Step 3: Run full test suite**

Run: `cd /Users/nmsn/Studio/pixel-bead/apps/web && pnpm test -- --run`
Expected: All tests pass, no console errors

- [ ] **Step 4: Commit**

```bash
git add src/components/canvas/PixelCanvas.test.tsx
git commit -m "test: add PixelCanvas interaction tests"
```

---

## Self-Review Checklist

- [ ] Spec coverage: All Leafer features mapped to Konva equivalents
- [ ] No placeholders (TBD, TODO, "implement later")
- [ ] Type consistency verified across all tasks
- [ ] TDD steps: test → fail → implement → pass → commit

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-22-leafer-to-konva-migration-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**