# Transparent Color Feature Design

**Date:** 2026-04-22
**Status:** Approved

## 1. Overview

Add transparent as a selectable color in the palette, allowing users to paint pixels with transparency or erase to transparency using any tool with the transparent color selected.

## 2. State Change

### currentColorIndex Type
```typescript
// Before
currentColorIndex: number; // 0-255

// After
currentColorIndex: number | null; // null = transparent
```

**Affected files:**
- `apps/web/src/hooks/usePixelCanvas.ts` - type definition and default value

## 3. Palette UI Change

### Location
Transparent color occupies the top-left cell (index 0) of the 16x16 color grid, replacing what was previously the first gray color.

### Visual Representation
Checkerboard pattern (black and white grid) icon represents transparency.

### Behavior
- Clicking the transparent cell sets `currentColorIndex` to `null`
- Selected transparent cell shows ring highlight (`ring-2 ring-[#6366f1]`)
- Current color preview area shows checkerboard pattern when transparent is selected

**Affected files:**
- `apps/web/src/components/panels/ColorPalette.tsx`

## 4. Drawing Behavior

### Tool Mapping

| Tool | Current Color = Transparent | Notes |
|------|---------------------------|-------|
| pen | Sets cell to `-1` | Same as eraser |
| bucket | Fills color over transparent | Covers transparent cells |
| eraser | Sets cell to `-1` | Unchanged |
| eyedropper | Picks color index | Unchanged (returns 0-255) |

**Note:** When transparent is selected, pen behaves identically to eraser.

**Affected files:**
- `apps/web/src/App.tsx` - tool application logic

## 5. Export Behavior

When exporting to PNG/ICO:
- Transparent pixels (`-1` in gridData) are rendered as transparent pixels (alpha = 0)
- No background color applied during export (background feature planned for later)

**Affected files:**
- `apps/web/src/lib/exporters/toIco.ts`
- Any other exporters (PNG, etc.)

## 6. Edge Cases

| Case | Behavior |
|------|----------|
| Copy with transparent cells | Transparent cells copied along with color data |
| Paste with transparent cells | Transparent cells pasted as `-1` |
| Fill on transparent cell | Fill color overwrites transparent (`-1` → palette index) |
| Eyedropper on transparent cell | Returns `null` (transparent) |
| Palette index 0 | Now represents transparent, not the previous first gray |

## 7. Files to Modify

1. `apps/web/src/hooks/usePixelCanvas.ts` - Change `currentColorIndex` type to `number | null`
2. `apps/web/src/components/panels/ColorPalette.tsx` - Add transparent swatch at position 0
3. `apps/web/src/App.tsx` - Handle transparent painting (pen with transparent = sets `-1`)
4. `apps/web/src/lib/exporters/toIco.ts` - Ensure transparent renders correctly

## 8. Test Cases

1. Selecting transparent color shows checkerboard in preview
2. Painting with transparent color sets cell to `-1`
3. Eraser still sets cells to `-1`
4. Export preserves transparency as alpha channel
5. Bucket fill overwrites transparent cells with selected color