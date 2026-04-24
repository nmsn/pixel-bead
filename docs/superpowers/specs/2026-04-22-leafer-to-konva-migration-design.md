# Leafer → react-konva Migration Design

**Date:** 2026-04-22
**Status:** Approved

## 1. Overview

Replace `leafer-ui` with `react-konva` in the PixelCanvas component to reduce dependency risk and improve maintainability. Functionality must remain identical.

## 2. Architecture Mapping

| Leafer | react-konva |
|--------|-------------|
| `new Leafer({ view })` | `<Stage container={ref}>` |
| `new Group()` | `<Layer>` (JSX) |
| `app.add(group)` | Nested JSX |
| `rect.on(PointerEvent.DOWN, fn)` | `<Rect onMouseDown={fn}>` |
| `app.fill = color` | `<Stage fill={color}>` |
| `group.clear()` | Declarative re-render with key |

## 3. Component Structure

```tsx
<Stage container={containerRef}>
  <Layer>  {/* cellsGroup - bottom */}
    {cells}
  </Layer>
  <Layer>  {/* highlightGroup - middle */}
    {selections}
  </Layer>
  <Layer>  {/* gridGroup - top, pointer-events: none */}
    {gridLines}
  </Layer>
  <Layer>  {/* labelsGroup */}
    {labels}
  </Layer>
</Stage>
```

## 4. Event Mapping

| Leafer | react-konva |
|--------|-------------|
| `PointerEvent.DOWN` | `onMouseDown` |
| `PointerEvent.UP` | `onMouseUp` |
| `PointerEvent.MOVE` | `onMouseMove` |

## 5. State Management

- `useRef` for Konva node handles (cellsGroupRef, etc.)
- `useRef` for imperative data (cellRects Map, dragging state)
- Refs kept in sync via `useEffect` for callbacks

## 6. Middle-click Panning

- Native DOM events (`mousedown` on container, `mousemove`/`mouseup` on window)
- Same logic, no Konva involvement

## 7. Changes Summary

### Files to Modify
- `apps/web/src/components/canvas/PixelCanvas.tsx` - main replacement
- `apps/web/package.json` - replace `leafer` with `react-konva` and `konva`

### No Changes Required
- Props interface unchanged
- Parent component usage unchanged
- Hook callbacks unchanged

## 8. Success Criteria

- All canvas interactions work identically
- No console errors
- All existing tests pass
- Build succeeds