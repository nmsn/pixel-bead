# Eyedropper Tool Design

**Date:** 2026-04-13
**Status:** Approved

## Overview

Add an eyedropper tool that allows users to pick a color from any cell on the canvas.

## Data Model

### Tool Type Update

```ts
export type Tool = 'select' | 'pen' | 'bucket' | 'eraser' | 'eyedropper';
```

## Interaction

| Action | Result |
|---|---|
| Click cell with eyedropper | Set current color to cell's color |
| Switch away from eyedropper | No change |

## Components

### TopToolbar

Add eyedropper to TOOLS array:
```ts
{ id: 'eyedropper', label: 'Eyedropper', icon: '🎯', key: 'I' }
```

### App.tsx

Update `handleCellClick`:
```ts
case 'eyedropper':
  setCurrentColorIndex(gridData[row][col]);
  return;
```

Update keyboard shortcuts:
```ts
const keyMap = { v: 'select', b: 'pen', g: 'bucket', e: 'eraser', i: 'eyedropper' };
```

## Implementation

Straightforward addition to existing tool handling pattern. No persistence needed.
