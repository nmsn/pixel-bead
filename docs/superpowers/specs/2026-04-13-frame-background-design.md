# Frame & Background Design

**Date:** 2026-04-13
**Status:** Approved

## Overview

Add a frame/background panel below the editor for configuring background effects on icons. The preview area shows the final composite effect in real-time. Both icon export and PNG export apply these effects.

---

## Data Model

### New State (`usePixelCanvas`)

```ts
interface FrameState {
  backgroundColor: string;   // hex color, default '#ffffff'
  cornerRadius: number;      // pixels, default 0
}
```

### Persistence

- `backgroundColor` and `cornerRadius` saved to localStorage
- Restored on page reload

---

## Components

### FramePanel

**Location:** `apps/web/src/components/panels/FramePanel.tsx`

**Layout:**
```
┌──────────────────────────────────────┐
│  背景设置                             │
│  ┌─────────┐  背景色: [■] #ffffff   │
│  │  预览   │  圆角: [────●──] 8px   │
│  │  64×64  │                         │
│  └─────────┘                         │
└──────────────────────────────────────┘
```

**Props:**
```ts
interface FramePanelProps {
  backgroundColor: string;
  cornerRadius: number;
  gridSize: [number, number];
  gridData: number[][];
  onBackgroundColorChange: (color: string) => void;
  onCornerRadiusChange: (radius: number) => void;
}
```

**Elements:**
- Preview area (left): 128×128 container showing scaled icon with effects
- Background color picker: click to open palette, shows current color swatch
- Corner radius slider: 0–32px range, shows current value

**Preview Rendering:**
- White/checker pattern background for transparency
- Canvas content centered
- Background color fill with corner radius applied
- Scaled to fit preview container

---

## State Management

### usePixelCanvas

Add to state interface:
```ts
backgroundColor: string;
cornerRadius: number;
```

Add to return:
```ts
setBackgroundColor: (color: string) => void;
setCornerRadius: (radius: number) => void;
```

---

## Export Modifications

### toIco.ts

When generating ICO/ICNS:
1. Create canvas with background color + corner radius
2. Draw grid content centered on background
3. Export composite image

### toIcns.ts

Same approach as ICO.

### PNG Export

Modify `exportToPng` to accept frame options:
```ts
exportToPng(gridData, gridSize, size, {
  backgroundColor,
  cornerRadius
})
```

---

## File Structure

```
apps/web/src/
├── components/
│   ├── panels/
│   │   └── FramePanel.tsx       # NEW
│   └── canvas/
│       └── PixelCanvas.tsx      # NO CHANGE
├── hooks/
│   └── usePixelCanvas.ts         # MOD - add frame state
├── lib/
│   └── exporters/
│       ├── toIco.ts              # MOD - apply frame effects
│       ├── toIcns.ts             # MOD - apply frame effects
│       └── toPng.ts              # MOD - apply frame effects
└── App.tsx                       # MOD - wire FramePanel
```

---

## Interaction

| Action | Result |
|---|---|
| Change background color | Preview updates, saved to localStorage |
| Adjust corner radius | Preview updates in real-time, saved to localStorage |
| Export ICO/ICNS/PNG | Applies background color + corner radius |

---

## Implementation Notes

- Use CanvasRenderingContext2D for preview and export compositing
- For ICO/ICNS, render to offscreen canvas first, then encode
- Corner radius via rounded rectangle path or clip()
- Transparency shown as checkerboard pattern in preview background
