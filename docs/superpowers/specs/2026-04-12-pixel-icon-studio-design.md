# Pixel Icon Studio — Design Specification

**Version**: 1.0
**Date**: 2026-04-12
**Status**: Draft — awaiting implementation plan

---

## 1. Concept & Vision

Pixel Icon Studio is a developer-focused pixel icon design tool that transforms uploaded images into pixel grids, enables manual editing, and exports to multi-format icon files (ICO, ICNS, PNG). The experience is deliberately minimal — the canvas is the product. Think of it as a "dev tool" equivalent to how Raycast/Linear feel for productivity: fast, keyboard-driven, zero friction.

**Personality**: No-nonsense, grid-first, minimal chrome. Every pixel matters.

---

## 2. Design Language

### Aesthetic Direction

Pixelarticons-style minimalism — clean, grid-forward, dark-theme by default. The UI should feel like a professional developer tool, not a creative art app. Interface chrome is nearly invisible so the pixel canvas is always the hero.

### Color Palette

| Role | Value |
|------|-------|
| Background | `#0a0a0b` (near-black) |
| Surface | `#141416` (panels) |
| Border | `#2a2a2e` |
| Text Primary | `#e4e4e7` |
| Text Secondary | `#71717a` |
| Accent | `#6366f1` (indigo-500) |
| Canvas BG | `#18181b` (checkered for transparency) |

### Typography

- **UI Font**: Inter (system-ui fallback)
- **Monospace**: JetBrains Mono (grid coordinates, hex values)
- Scale: 12px secondary / 14px primary / 16px headings

### Spatial System

- Base unit: 4px
- Panel padding: 16px
- Tool button size: 32px × 32px
- Icon size: 16px (toolbar), 12px (inline)
- Border radius: 6px (panels), 4px (buttons)

### Motion Philosophy

- Instant feedback on canvas interactions (no animation delay on pixel edits)
- Subtle 150ms ease-out for panel transitions (drawer open/close, hover states)
- No decorative animation — every motion is functional

---

## 3. Layout & Structure

### Page Architecture

```
┌─────────────────────────────────────────────────────┐
│  TopToolbar (48px fixed height)                      │
│  [←][→] | [✏️][🪣][🧽] | Grid: [32×32 ▼] | [Export] │
├────────────────────────────────────┬────────────────┤
│                                    │                │
│                                    │  ExportPanel   │
│         PixelCanvas                │  (280px wide)  │
│         (flex-grow, centered)      │                │
│                                    │  ─────────     │
│                                    │  ColorPalette  │
│                                    │  (collapsible) │
└────────────────────────────────────┴────────────────┘
```

### Initial State (No Image Loaded)

Canvas area shows a dashed-border drop zone with centered prompt: "Drop image or click to upload". Upload button is also present in TopToolbar as a minimal icon.

### Responsive Strategy

- **Desktop (>1024px)**: Full layout as shown above
- **Tablet (768–1024px)**: ExportPanel collapses to a bottom drawer, canvas takes full width
- **Mobile (<768px)**: Not a primary target; show read-only canvas with minimal editing

---

## 4. Features & Interactions

### 4.1 Image Upload & Pixelation

**Input**: JPG, PNG, WebP, SVG (max 4096×4096)

**Flow**:
1. User drops image onto canvas area or clicks upload icon
2. Image is scaled to target grid size using nearest-neighbor interpolation (no anti-aliasing)
3. For each grid cell, dominant color (mode RGB, not mean) is extracted from the source region
4. Dominant color is quantized to nearest color in 256-color palette using Euclidean distance in RGB space
5. Result is rendered to Leafer canvas as editable pixel grid

**Grid Size Options**: 8×8, 16×16, 32×32, 48×48, 64×64, 128×128

### 4.2 Pixel Canvas (Leafer-based)

**Rendering**: Leafer renders each pixel cell as a `Rect` object. Grid overlay drawn as semi-transparent lines.

**Interactions**:
- **Click cell**: Apply current tool to cell
- **Drag**: Apply tool continuously (paint bucket skips mid-drag)
- **Scroll/Pinch**: Zoom canvas (50% – 800%)
- **Middle-click drag / Space+drag**: Pan canvas

**Zoom levels**: 50%, 75%, 100%, 150%, 200%, 400%, 800%

### 4.3 Editing Tools

| Tool | Key | Cursor | Behavior |
|------|-----|--------|----------|
| Select | `V` | default | Click to inspect cell color |
| Pen | `B` | crosshair | Fill single cell with current color |
| Paint Bucket | `G` | crosshair | BFS flood-fill connected same-color region |
| Eraser | `E` | crosshair | Set cell to transparent (alpha=0) |

**Undo/Redo**:
- `Ctrl+Z` / `Ctrl+Shift+Z` (or `Ctrl+Y`)
- History stack: max 50 steps, stored as sparse diffs
- History persists in session; cleared on page reload

### 4.4 Color Palette (256-color "Programmer's Palette")

A curated 256-color palette inspired by classic pixel art. Structure:

```typescript
interface Palette {
  colors: string[];          // 256 hex strings
  nearest: (r: number, g: number, b: number) => string;
}
```

**Palette Drawer**: Collapsible panel on the right side. Shows all 256 colors in a 16×16 grid. Click to select current color. Current color shown as a chip in the TopToolbar.

### 4.5 Export

**Supported Formats (v1)**:

| Format | Description | File Extension |
|--------|-------------|----------------|
| PNG | Single-size raster | `.png` |
| ICO | Windows icon (16/32/48/256) | `.ico` |
| ICNS | macOS icon (16/32/64/128/256/512/1024) | `.icns` |

**Export Flow**:
1. User clicks Export button → ExportPanel expands/highlights
2. User selects target format(s) via toggle buttons
3. Preview thumbnail shown with file size estimate
4. User clicks "Download" → browser save dialog

**PNG Sizes**: Available in 8/16/32/48/64/128/256/512 by scaling pixel grid to target resolution with nearest-neighbor.

### 4.6 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `B` | Pen tool |
| `G` | Paint bucket |
| `E` | Eraser |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `1`–`7` | Zoom presets |
| `Ctrl+S` | Download (export) |
| `Delete` | Clear cell to transparent |

---

## 5. Component Inventory

### 5.1 PixelCanvas

The core Leafer-powered canvas.

**States**: empty (drop zone), loading (spinner), editing (pixel grid)

**Props**: `gridSize`, `zoom`, `panOffset`, `selectedTool`, `currentColor`, `onCellChange`

### 5.2 TopToolbar

Horizontal toolbar, 48px height, full width.

**Sections**: History nav (left) | Tools (center-left) | Grid size select (center-right) | Export button (right)

**States**: always visible; tool buttons show active state (accent background)

### 5.3 ToolButton

Icon button for toolbar tools.

**States**: default (transparent), hover (surface-2), active (accent bg + white icon), disabled (50% opacity)

### 5.4 GridSizeSelect

Shadcn Select dropdown with grid size options.

**States**: closed, open, selected

### 5.5 ExportPanel

Right sidebar panel, 280px wide.

**Sections**:
- Format toggles (ICO, ICNS, PNG size checkboxes)
- Preview thumbnail
- File size estimate
- Download button

**States**: collapsed (icon only), expanded (full panel)

### 5.6 ColorPaletteDrawer

Collapsible drawer from right side.

**Display**: 16×16 grid of all 256 palette colors. Current color highlighted with accent border.

**States**: open, closed, color-hover (show hex tooltip)

### 5.7 ColorSwatch

Individual color cell in palette.

**States**: default, hover (scale 1.1 + tooltip), selected (accent border ring)

### 5.8 UploadZone

Drop target overlay when canvas is empty.

**States**: idle (dashed border), drag-over (accent border + bg tint), uploading (spinner)

### 5.9 ExportPreview

Thumbnail preview of current canvas state.

**States**: generating (skeleton), ready (thumbnail), error (red border + message)

---

## 6. Technical Architecture

### Project Structure

```
pixel-bead/
├── apps/
│   ├── web/                          # Vite + React 19 + TailwindCSS v4 + shadcn
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── canvas/
│   │   │   │   │   ├── PixelCanvas.tsx      # Leafer wrapper
│   │   │   │   │   └── GridOverlay.tsx
│   │   │   │   ├── toolbar/
│   │   │   │   │   └── TopToolbar.tsx
│   │   │   │   ├── panels/
│   │   │   │   │   ├── ExportPanel.tsx
│   │   │   │   │   └── ColorPalette.tsx
│   │   │   │   └── ui/                     # shadcn components
│   │   │   │       ├── button.tsx
│   │   │   │       ├── select.tsx
│   │   │   │       ├── drawer.tsx
│   │   │   │       └── dialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePixelCanvas.ts        # Leafer canvas logic
│   │   │   │   ├── useHistory.ts            # undo/redo
│   │   │   │   ├── useExport.ts             # export orchestration
│   │   │   │   └── useKeyboard.ts           # keyboard shortcuts
│   │   │   ├── lib/
│   │   │   │   ├── pixelate.ts              # dominant color extraction
│   │   │   │   ├── colorReduce.ts           # palette quantization
│   │   │   │   ├── palette-256.ts           # 256-color palette data
│   │   │   │   └── exporters/
│   │   │   │       ├── toPng.ts
│   │   │   │       ├── toIco.ts
│   │   │   │       └── toIcns.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   └── vite.config.ts
│   │
│   └── server/                          # Hono + Node + Drizzle + SQLite + Zod + Better Auth
│       ├── src/
│       │   │   ├── index.ts             # entry
│       │   │   ├── routes/
│       │   │   │   └── auth.ts          # placeholder (auth not in v1)
│       │   │   └── db/
│       │   │       ├── schema.ts        # drizzle schema (future)
│       │   │       └── migrations/
│       │   └── middleware/
│       └── drizzle.config.ts
│
├── packages/
│   └── shared/                          # shared types/constants
│       └── src/
│           ├── types.ts
│           └── constants.ts
│
├── pnpm-workspace.yaml
└── package.json
```

### Key Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `@leafer` | Canvas rendering engine | latest |
| `@leafer/plugin/interface` | Type definitions | latest |
| `react` | UI framework | 19 |
| `vite` | Build tool | 6 |
| `tailwindcss` | Styling | v4 |
| `hono` | Server framework | latest |
| `drizzle-orm` | ORM | latest |
| `better-auth` | Auth (placeholder) | latest |
| `zod` | Schema validation | latest |

### Data Model (localStorage v1)

```typescript
interface ProjectData {
  version: 1;
  gridData: number[][];    // 2D array, each cell = palette index (0-255), -1 = transparent
  gridSize: [number, number];
  lastModified: number;    // timestamp
}
```

**Storage key**: `pixel-bead-project`

### Canvas Implementation (Leafer)

Each pixel cell is a `Rect` in a Leafer `Group`:

```typescript
// Pseudo-structure
const cell = new Rect({
  width: cellSize,
  height: cellSize,
  x: col * cellSize,
  y: row * cellSize,
  fill: palette[currentIndex],
});
```

- On zoom, only the `cellSize` and canvas transform changes — no re-render of cells
- Grid overlay is a separate `Leafer` canvas layered on top using CSS `pointer-events: none`
- Flood-fill uses BFS on the `gridData` 2D array (not on Leafer objects — faster)

### Export Implementation

| Format | Library | Notes |
|--------|---------|-------|
| PNG | Native Canvas API via Leafer `export()` | Nearest-neighbor scaling |
| ICO | `png-to-ico` or custom | Multi-size bundled |
| ICNS | `icns` npm package | Multi-size bundled |

---

## 7. Scope Boundaries

### In Scope (v1)

- Single image upload and pixelation
- 256-color palette quantization
- Manual pixel editing (pen, bucket, eraser, undo/redo)
- Export to PNG, ICO, ICNS
- localStorage persistence
- Keyboard shortcuts
- Dark theme

### Out of Scope (v1)

- Account / auth system
- Cloud sync
- Multiple canvas tabs
- Layers
- Custom palette upload
- AI-based image processing
- Mobile-optimized editing
- SVG export

---

## 8. Open Questions

None — all decisions resolved during design session.

---

## 9. Verification Checklist

- [x] Developer audience (Option B)
- [x] Fixed grid sizes (Option A) — 8/16/32/48/64/128
- [x] Basic editing only (Option A) — pen, bucket, undo/redo
- [x] Local-first + cloud-optional (Option B)
- [x] PNG + ICO + ICNS export (Option B)
- [x] Pixelarticons aesthetic (minimal, clean)
- [x] 256-color palette (Option B)
- [x] Pure frontend computation (Option A)
- [x] DevTool Mode layout (Option B) — single canvas + toolbar + export panel
- [x] Leafer for canvas (confirmed by user)
