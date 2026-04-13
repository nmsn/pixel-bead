# Eyedropper Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add eyedropper tool - clicking a cell sets current color to cell's color.

**Architecture:** Extend existing tool system by adding 'eyedropper' to Tool type and handling it in the same tool switch/case pattern used by pen, eraser, bucket.

**Tech Stack:** React, TypeScript

---

## File Structure

| File | Change |
|---|---|
| `packages/shared/src/types.ts` | Add `'eyedropper'` to `Tool` union type |
| `apps/web/src/components/toolbar/TopToolbar.tsx` | Add eyedropper button to TOOLS array |
| `apps/web/src/App.tsx` | Add eyedropper case in `handleCellClick`, add `'i'` to keyMap |

---

## Task 1: Add 'eyedropper' to Tool type

**Files:**
- Modify: `packages/shared/src/types.ts:8`

- [ ] **Step 1: Edit types.ts**

Change line 8 from:
```ts
export type Tool = 'select' | 'pen' | 'bucket' | 'eraser';
```
To:
```ts
export type Tool = 'select' | 'pen' | 'bucket' | 'eraser' | 'eyedropper';
```

- [ ] **Step 2: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat: add eyedropper to Tool type"
```

---

## Task 2: Add eyedropper button to TopToolbar

**Files:**
- Modify: `apps/web/src/components/toolbar/TopToolbar.tsx:20-25`

- [ ] **Step 1: Edit TopToolbar.tsx**

Add to TOOLS array (after eraser):
```ts
{ id: 'eyedropper', label: 'Eyedropper', icon: '🎯', key: 'I' },
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/toolbar/TopToolbar.tsx
git commit -m "feat: add eyedropper button to TopToolbar"
```

---

## Task 3: Handle eyedropper in App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`
  - Add `'eyedropper'` case to `handleCellClick` (around line 125)
  - Add `'i': 'eyedropper'` to `keyMap` (around line 167)

- [ ] **Step 1: Add eyedropper case to handleCellClick**

In `handleCellClick`, add after the existing tool cases:
```ts
case 'eyedropper':
  setCurrentColorIndex(gridData[row][col]);
  return;
```

- [ ] **Step 2: Add keyboard shortcut**

In the keyMap object, add:
```ts
i: 'eyedropper',
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: handle eyedropper tool in handleCellClick"
```

---

## Verification

After implementing all tasks:
1. Start dev server: `pnpm --filter web dev`
2. Upload an image
3. Press `I` to switch to eyedropper tool
4. Click any colored cell - the current color in the palette should change to that cell's color
5. The eyedropper button (🎯) should appear in the toolbar and be selectable
