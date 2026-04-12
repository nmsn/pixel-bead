# Pixel Icon Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pixel icon design tool with Leafer canvas, 256-color palette, image upload → pixelation, manual editing, and PNG/ICO/ICNS export.

**Architecture:** Pure frontend React app (Vite + React 19 + TailwindCSS v4 + shadcn). All pixelation happens in the browser. Backend (Hono) is scaffolded but unused in v1. Project state persisted to localStorage.

**Tech Stack:** Vite, React 19, TailwindCSS v4, shadcn/ui, Leafer (canvas), pnpm workspaces, Hono (server placeholder)

---

## File Structure

```
pixel-bead/
├── apps/
│   ├── web/                          # frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── canvas/
│   │   │   │   │   └── PixelCanvas.tsx       # Leafer canvas wrapper
│   │   │   │   ├── toolbar/
│   │   │   │   │   └── TopToolbar.tsx
│   │   │   │   ├── panels/
│   │   │   │   │   ├── ExportPanel.tsx
│   │   │   │   │   └── ColorPalette.tsx
│   │   │   │   └── ui/                      # shadcn components
│   │   │   │       └── button.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePixelCanvas.ts
│   │   │   │   ├── useHistory.ts
│   │   │   │   └── useExport.ts
│   │   │   ├── lib/
│   │   │   │   ├── pixelate.ts              # dominant color extraction
│   │   │   │   ├── palette-256.ts          # 256-color palette + nearest()
│   │   │   │   └── exporters/
│   │   │   │       ├── toPng.ts
│   │   │   │       ├── toIco.ts
│   │   │   │       └── toIcns.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── server/                      # placeholder, not built in v1
│       ├── src/
│       │   └── index.ts
│       └── package.json
├── packages/
│   └── shared/
│       └── src/
│           └── types.ts
├── pnpm-workspace.yaml
└── package.json
```

---

## Phase 1: Project Scaffolding

### Task 1: Initialize pnpm Workspace

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `apps/web/package.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/tsconfig.json`
- Create: `apps/server/package.json`
- Create: `packages/shared/package.json`

---

- [ ] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Run: `cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF`

---

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "pixel-bead",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build"
  }
}
```

Run: `cat > package.json << 'EOF'
{
  "name": "pixel-bead",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build"
  }
}
EOF`

---

- [ ] **Step 3: Create apps/web/package.json**

```json
{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@leafer-include/interface": "^10.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

Run: `mkdir -p apps/web && cat > apps/web/package.json << 'EOF'
{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@leafer-include/interface": "^10.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
EOF`

---

- [ ] **Step 4: Create apps/web/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

Run: `cat > apps/web/vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
EOF`

---

- [ ] **Step 5: Create apps/web/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pixel Icon Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Run: `cat > apps/web/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pixel Icon Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF`

---

- [ ] **Step 6: Create apps/web/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

Run: `cat > apps/web/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF`

---

- [ ] **Step 7: Create apps/server/package.json (placeholder)**

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts"
  },
  "dependencies": {
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

Run: `mkdir -p apps/server/src && cat > apps/server/package.json << 'EOF'
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts"
  },
  "dependencies": {
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
EOF`

---

- [ ] **Step 8: Create apps/server/src/index.ts (minimal placeholder)**

```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Pixel Icon Studio API (placeholder)'));

export default app;
```

Run: `cat > apps/server/src/index.ts << 'EOF'
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('Pixel Icon Studio API (placeholder)'));

export default app;
EOF`

---

- [ ] **Step 9: Create packages/shared/package.json**

```json
{
  "name": "shared",
  "private": true,
  "type": "module"
}
```

Run: `mkdir -p packages/shared/src && cat > packages/shared/package.json << 'EOF'
{
  "name": "shared",
  "private": true,
  "type": "module"
}
EOF`

---

- [ ] **Step 10: Create packages/shared/src/types.ts**

```typescript
export interface ProjectData {
  version: 1;
  gridData: number[][];    // -1 = transparent, 0-255 = palette index
  gridSize: [number, number];
  lastModified: number;
}

export type Tool = 'select' | 'pen' | 'bucket' | 'eraser';

export interface ExportFormat {
  type: 'png' | 'ico' | 'icns';
  size?: number;           // for PNG, e.g. 32
}
```

Run: `cat > packages/shared/src/types.ts << 'EOF'
export interface ProjectData {
  version: 1;
  gridData: number[][];    // -1 = transparent, 0-255 = palette index
  gridSize: [number, number];
  lastModified: number;
}

export type Tool = 'select' | 'pen' | 'bucket' | 'eraser';

export interface ExportFormat {
  type: 'png' | 'ico' | 'icns';
  size?: number;           // for PNG, e.g. 32
}
EOF`

---

- [ ] **Step 11: Install dependencies**

Run: `cd /Users/nmsn/Studio/pixel-bead && pnpm install`

Expected: dependencies install, no errors

---

- [ ] **Step 12: Commit**

```bash
git add pnpm-workspace.yaml package.json apps/web/package.json apps/web/vite.config.ts apps/web/index.html apps/web/tsconfig.json apps/server/package.json apps/server/src/index.ts packages/shared/package.json packages/shared/src/types.ts
git commit -m "feat: scaffold pnpm workspace with web and server apps

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 2: Core React App Shell

### Task 2: React App Entry Points

**Files:**
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/index.css`

---

- [ ] **Step 1: Create apps/web/src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Run: `mkdir -p apps/web/src && cat > apps/web/src/main.tsx << 'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
EOF`

---

- [ ] **Step 2: Create apps/web/src/App.tsx**

```tsx
export function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7]">
      <h1 className="text-2xl font-bold p-4">Pixel Icon Studio</h1>
    </div>
  );
}
```

Run: `cat > apps/web/src/App.tsx << 'EOF'
export function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7]">
      <h1 className="text-2xl font-bold p-4">Pixel Icon Studio</h1>
    </div>
  );
}
EOF`

---

- [ ] **Step 3: Create apps/web/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0a0b;
  --surface: #141416;
  --border: #2a2a2e;
  --text-primary: #e4e4e7;
  --text-secondary: #71717a;
  --accent: #6366f1;
}
```

Run: `cat > apps/web/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0a0b;
  --surface: #141416;
  --border: #2a2a2e;
  --text-primary: #e4e4e7;
  --text-secondary: #71717a;
  --accent: #6366f1;
}
EOF`

---

- [ ] **Step 4: Verify dev server starts**

Run: `cd apps/web && pnpm dev`
Expected: Vite dev server starts on port 5173 without errors

Stop the server with Ctrl+C after verification.

---

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/main.tsx apps/web/src/App.tsx apps/web/src/index.css
git commit -m "feat: add React app shell with basic CSS variables

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 3: 256-Color Palette

### Task 3: Build 256-Color Programmer's Palette

**Files:**
- Create: `apps/web/src/lib/palette-256.ts`

---

- [ ] **Step 1: Write tests for palette-256.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { PALETTE, nearestColor } from '../lib/palette-256';

describe('PALETTE', () => {
  it('has exactly 256 colors', () => {
    expect(PALETTE.colors.length).toBe(256);
  });

  it('all colors are valid hex strings', () => {
    const hex = /^[0-9a-f]{6}$/i;
    PALETTE.colors.forEach((c) => {
      expect(c).toMatch(hex);
    });
  });

  it('nearestColor returns a palette color', () => {
    const result = nearestColor(255, 0, 0);
    expect(PALETTE.colors).toContain(result);
  });

  it('nearestColor(0,0,0) returns black', () => {
    const result = nearestColor(0, 0, 0);
    expect(result).toBe('000000');
  });

  it('nearestColor(255,255,255) returns white', () => {
    const result = nearestColor(255, 255, 255);
    expect(result).toBe('ffffff');
  });
});
```

Run: `cat > apps/web/src/lib/palette-256.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';
import { PALETTE, nearestColor } from '../lib/palette-256';

describe('PALETTE', () => {
  it('has exactly 256 colors', () => {
    expect(PALETTE.colors.length).toBe(256);
  });

  it('all colors are valid hex strings', () => {
    const hex = /^[0-9a-f]{6}$/i;
    PALETTE.colors.forEach((c) => {
      expect(c).toMatch(hex);
    });
  });

  it('nearestColor returns a palette color', () => {
    const result = nearestColor(255, 0, 0);
    expect(PALETTE.colors).toContain(result);
  });

  it('nearestColor(0,0,0) returns black', () => {
    const result = nearestColor(0, 0, 0);
    expect(result).toBe('000000');
  });

  it('nearestColor(255,255,255) returns white', () => {
    const result = nearestColor(255, 255, 255);
    expect(result).toBe('ffffff');
  });
});
EOF`

---

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/lib/palette-256.test.ts`
Expected: FAIL — "nearestColor not defined"

---

- [ ] **Step 3: Write minimal implementation**

The 256-color palette is structured as:
- 16 grays (black → white)
- 16 reds (dark → bright)
- 16 greens
- 16 blues
- 16 cyans
- 16 magentas
- 16 yellows
- 16 oranges
- 16 browns
- 16 pinks
- 16 purples
- 16 lime/teal
- Plus 16 "skin tones" and 16 "earth tones"

```typescript
function euclidean(a: number, b: number, c: number, hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b2 = parseInt(hex.slice(4, 6), 16);
  return Math.sqrt(
    (a - r) * (a - r) + (b - g) * (b - g) + (c - b2) * (c - b2)
  );
}

function buildPalette(): string[] {
  const colors: string[] = [];

  // Helper: make a color
  const rgb = (r: number, g: number, b: number) =>
    [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

  // 16 grays
  for (let i = 0; i < 16; i++) {
    const v = Math.round(i * 17);
    colors.push(rgb(v, v, v));
  }

  // 16 reds
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(170 + i * 5.67), Math.round(i * 17), Math.round(i * 17)));
  }

  // 16 greens
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(i * 17), Math.round(170 + i * 5.67), Math.round(i * 17)));
  }

  // 16 blues
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(i * 17), Math.round(i * 17), Math.round(170 + i * 5.67)));
  }

  // 16 cyans
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(i * 17), Math.round(170 + i * 5.67), Math.round(170 + i * 5.67)));
  }

  // 16 magentas
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(170 + i * 5.67), Math.round(i * 17), Math.round(170 + i * 5.67)));
  }

  // 16 yellows
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(170 + i * 5.67), Math.round(170 + i * 5.67), Math.round(i * 17)));
  }

  // 16 oranges
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(200 + i * 3.67), Math.round(100 + i * 5), Math.round(i * 17)));
  }

  // 16 browns
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 4), Math.round(60 + i * 3), Math.round(i * 17)));
  }

  // 16 pinks
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(255), Math.round(100 + i * 10), Math.round(170 + i * 5)));
  }

  // 16 purples
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 10), Math.round(i * 17), Math.round(170 + i * 5.67)));
  }

  // 16 limes/teals
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 10), Math.round(170 + i * 5.67), Math.round(i * 17)));
  }

  // 16 skin tones
  const skin = [240, 220, 200, 185, 165, 145, 125, 105];
  for (let i = 0; i < 16; i++) {
    const s = skin[i % skin.length] + (i >= 8 ? 10 : 0);
    colors.push(rgb(s + 40, s + 20, s));
  }

  // 16 earth tones
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 8), Math.round(80 + i * 6), Math.round(40 + i * 3)));
  }

  // Ensure exactly 256
  return colors.slice(0, 256);
}

const _palette: string[] = buildPalette();

export const PALETTE = {
  colors: _palette,
};

export function nearestColor(r: number, g: number, b: number): string {
  let best = _palette[0];
  let bestDist = euclidean(r, g, b, best);
  for (const hex of _palette) {
    const d = euclidean(r, g, b, hex);
    if (d < bestDist) {
      bestDist = d;
      best = hex;
    }
  }
  return best;
}

export function paletteIndex(hex: string): number {
  return _palette.indexOf(hex.toLowerCase());
}
```

Run: `cat > apps/web/src/lib/palette-256.ts << 'EOFPALETTE'
function euclidean(a: number, b: number, c: number, hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b2 = parseInt(hex.slice(4, 6), 16);
  return Math.sqrt(
    (a - r) * (a - r) + (b - g) * (b - g) + (c - b2) * (c - b2)
  );
}

function buildPalette(): string[] {
  const colors: string[] = [];

  const rgb = (r: number, g: number, b: number) =>
    [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

  // 16 grays
  for (let i = 0; i < 16; i++) {
    const v = Math.round(i * 17);
    colors.push(rgb(v, v, v));
  }

  // 16 reds
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(170 + i * 5.67), Math.round(i * 17), Math.round(i * 17)));
  }

  // 16 greens
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(i * 17), Math.round(170 + i * 5.67), Math.round(i * 17)));
  }

  // 16 blues
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(i * 17), Math.round(i * 17), Math.round(170 + i * 5.67)));
  }

  // 16 cyans
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(i * 17), Math.round(170 + i * 5.67), Math.round(170 + i * 5.67)));
  }

  // 16 magentas
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(170 + i * 5.67), Math.round(i * 17), Math.round(170 + i * 5.67)));
  }

  // 16 yellows
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(170 + i * 5.67), Math.round(170 + i * 5.67), Math.round(i * 17)));
  }

  // 16 oranges
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(200 + i * 3.67), Math.round(100 + i * 5), Math.round(i * 17)));
  }

  // 16 browns
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 4), Math.round(60 + i * 3), Math.round(i * 17)));
  }

  // 16 pinks
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(255), Math.round(100 + i * 10), Math.round(170 + i * 5)));
  }

  // 16 purples
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 10), Math.round(i * 17), Math.round(170 + i * 5.67)));
  }

  // 16 limes/teals
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 10), Math.round(170 + i * 5.67), Math.round(i * 17)));
  }

  // 16 skin tones
  const skin = [240, 220, 200, 185, 165, 145, 125, 105];
  for (let i = 0; i < 16; i++) {
    const s = skin[i % skin.length] + (i >= 8 ? 10 : 0);
    colors.push(rgb(s + 40, s + 20, s));
  }

  // 16 earth tones
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 8), Math.round(80 + i * 6), Math.round(40 + i * 3)));
  }

  return colors.slice(0, 256);
}

const _palette: string[] = buildPalette();

export const PALETTE = {
  colors: _palette,
};

export function nearestColor(r: number, g: number, b: number): string {
  let best = _palette[0];
  let bestDist = euclidean(r, g, b, best);
  for (const hex of _palette) {
    const d = euclidean(r, g, b, hex);
    if (d < bestDist) {
      bestDist = d;
      best = hex;
    }
  }
  return best;
}

export function paletteIndex(hex: string): number {
  return _palette.indexOf(hex.toLowerCase());
}
EOFPALETTE`

---

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm vitest run src/lib/palette-256.test.ts`
Expected: PASS (all 5 tests)

---

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/palette-256.ts apps/web/src/lib/palette-256.test.ts
git commit -m "feat: implement 256-color programmer's palette with nearestColor

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 4: Pixelation Algorithm

### Task 4: Image Upload + Pixelation

**Files:**
- Create: `apps/web/src/lib/pixelate.ts`

---

- [ ] **Step 1: Write tests for pixelate.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { pixelateImage, dominantColor } from '../lib/pixelate';

describe('dominantColor', () => {
  it('returns dominant color from a small region', () => {
    // 2x2 pixels: red, red, blue, blue — mode is red
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,   255, 0, 0, 255,
      0, 0, 255, 255,   0, 0, 255, 255,
    ]);
    const result = dominantColor(data, 2, 2, 0, 0, 2, 2);
    expect(result).toEqual({ r: 127, g: 0, b: 127 }); // mid point between red and blue
  });
});

describe('pixelateImage', () => {
  it('returns 2D array matching grid size', () => {
    // Create a 4x4 canvas with all red pixels
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 4, 4);
    const imageData = ctx.getImageData(0, 0, 4, 4);

    const result = pixelateImage(imageData, [2, 2]);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
  });

  it('fills transparent regions with -1', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 4, 4); // all transparent
    const imageData = ctx.getImageData(0, 0, 4, 4);

    const result = pixelateImage(imageData, [2, 2]);
    // Transparent should be -1
    const hasTransparent = result.flat().includes(-1);
    expect(hasTransparent).toBe(true);
  });
});
```

Run: `cat > apps/web/src/lib/pixelate.test.ts << 'EOFTEST'
import { describe, it, expect } from 'vitest';
import { dominantColor, pixelateImage } from '../lib/pixelate';

describe('dominantColor', () => {
  it('returns dominant color from a small region', () => {
    // 2x2 pixels: red, red, blue, blue — mode is red
    const data = new Uint8ClampedArray([
      255, 0, 0, 255,   255, 0, 0, 255,
      0, 0, 255, 255,   0, 0, 255, 255,
    ]);
    const result = dominantColor(data, 2, 2, 0, 0, 2, 2);
    // R: 255+255+0+0=510/4=127, G: 0, B: 0+0+255+255=510/4=127
    expect(result).toEqual({ r: 127, g: 0, b: 127 });
  });
});

describe('pixelateImage', () => {
  it('returns 2D array matching grid size', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 4, 4);
    const imageData = ctx.getImageData(0, 0, 4, 4);

    const result = pixelateImage(imageData, [2, 2]);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
  });

  it('fills transparent regions with -1', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 4, 4);
    const imageData = ctx.getImageData(0, 0, 4, 4);

    const result = pixelateImage(imageData, [2, 2]);
    const hasTransparent = result.flat().includes(-1);
    expect(hasTransparent).toBe(true);
  });
});
EOFTEST`

---

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/lib/pixelate.test.ts`
Expected: FAIL — "dominantColor not defined"

---

- [ ] **Step 3: Write implementation**

```typescript
import { nearestColor, PALETTE, paletteIndex } from './palette-256';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Get dominant (mode) color in a rectangular region.
 * Ignores fully transparent pixels (alpha === 0).
 */
export function dominantColor(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): RGB {
  const colorBuckets = new Map<string, number>();

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const idx = (row * imgWidth + col) * 4;
      const alpha = data[idx + 3];
      if (alpha === 0) continue; // skip transparent

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const key = `${r},${g},${b}`;
      colorBuckets.set(key, (colorBuckets.get(key) ?? 0) + 1);
    }
  }

  if (colorBuckets.size === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let modeKey = '';
  let maxCount = 0;
  for (const [key, count] of colorBuckets) {
    if (count > maxCount) {
      maxCount = count;
      modeKey = key;
    }
  }

  const [r, g, b] = modeKey.split(',').map(Number);
  return { r, g, b };
}

/**
 * Pixelate an ImageData to a given grid size.
 * Returns a 2D array of palette indices (-1 for transparent).
 */
export function pixelateImage(
  imageData: ImageData,
  gridSize: [number, number]
): number[][] {
  const { width: imgWidth, height: imgHeight, data } = imageData;
  const [cols, rows] = gridSize;

  const cellW = Math.floor(imgWidth / cols);
  const cellH = Math.floor(imgHeight / rows);

  const result: number[][] = [];

  for (let gridRow = 0; gridRow < rows; gridRow++) {
    const row: number[] = [];
    for (let gridCol = 0; gridCol < cols; gridCol++) {
      // Source region in original image
      const startCol = gridCol * cellW;
      const startRow = gridRow * cellH;
      const endCol = Math.min(startCol + cellW, imgWidth);
      const endRow = Math.min(startRow + cellH, imgHeight);

      const rgb = dominantColor(data, imgWidth, imgHeight, startCol, startRow, endCol, endRow);

      // Check if fully transparent (no opaque pixels found)
      let isTransparent = true;
      for (let r = startRow; r < endRow && isTransparent; r++) {
        for (let c = startCol; c < endCol && isTransparent; c++) {
          if (data[(r * imgWidth + c) * 4 + 3] !== 0) {
            isTransparent = false;
          }
        }
      }

      if (isTransparent) {
        row.push(-1);
      } else {
        const hex = nearestColor(rgb.r, rgb.g, rgb.b);
        const idx = paletteIndex(hex);
        row.push(idx);
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Load an image file and return ImageData.
 */
export async function imageFileToImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}
```

Run: `cat > apps/web/src/lib/pixelate.ts << 'EOFPIX'
import { nearestColor, PALETTE, paletteIndex } from './palette-256';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Get dominant (mode) color in a rectangular region.
 * Ignores fully transparent pixels (alpha === 0).
 */
export function dominantColor(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number
): RGB {
  const colorBuckets = new Map<string, number>();

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const idx = (row * imgWidth + col) * 4;
      const alpha = data[idx + 3];
      if (alpha === 0) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const key = `${r},${g},${b}`;
      colorBuckets.set(key, (colorBuckets.get(key) ?? 0) + 1);
    }
  }

  if (colorBuckets.size === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let modeKey = '';
  let maxCount = 0;
  for (const [key, count] of colorBuckets) {
    if (count > maxCount) {
      maxCount = count;
      modeKey = key;
    }
  }

  const [r, g, b] = modeKey.split(',').map(Number);
  return { r, g, b };
}

/**
 * Pixelate an ImageData to a given grid size.
 * Returns a 2D array of palette indices (-1 for transparent).
 */
export function pixelateImage(
  imageData: ImageData,
  gridSize: [number, number]
): number[][] {
  const { width: imgWidth, height: imgHeight, data } = imageData;
  const [cols, rows] = gridSize;

  const cellW = Math.floor(imgWidth / cols);
  const cellH = Math.floor(imgHeight / rows);

  const result: number[][] = [];

  for (let gridRow = 0; gridRow < rows; gridRow++) {
    const row: number[] = [];
    for (let gridCol = 0; gridCol < cols; gridCol++) {
      const startCol = gridCol * cellW;
      const startRow = gridRow * cellH;
      const endCol = Math.min(startCol + cellW, imgWidth);
      const endRow = Math.min(startRow + cellH, imgHeight);

      const rgb = dominantColor(data, imgWidth, imgHeight, startCol, startRow, endCol, endRow);

      let isTransparent = true;
      for (let r = startRow; r < endRow && isTransparent; r++) {
        for (let c = startCol; c < endCol && isTransparent; c++) {
          if (data[(r * imgWidth + c) * 4 + 3] !== 0) {
            isTransparent = false;
          }
        }
      }

      if (isTransparent) {
        row.push(-1);
      } else {
        const hex = nearestColor(rgb.r, rgb.g, rgb.b);
        const idx = paletteIndex(hex);
        row.push(idx);
      }
    }
    result.push(row);
  }

  return result;
}

/**
 * Load an image file and return ImageData.
 */
export async function imageFileToImageData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}
EOFPIX`

---

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm vitest run src/lib/pixelate.test.ts`
Expected: PASS

---

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/pixelate.ts apps/web/src/lib/pixelate.test.ts
git commit -m "feat: implement pixelation algorithm with dominant color extraction

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 5: Leafer Canvas

### Task 5: Leafer Pixel Canvas Component

**Files:**
- Create: `apps/web/src/components/canvas/PixelCanvas.tsx`
- Create: `apps/web/src/hooks/usePixelCanvas.ts`
- Create: `apps/web/src/hooks/useHistory.ts`

---

- [ ] **Step 1: Create usePixelCanvas.ts**

```typescript
import { useState, useCallback, useRef } from 'react';
import { Tool } from 'shared/src/types';

export interface PixelCanvasState {
  gridData: number[][];
  gridSize: [number, number];
  tool: Tool;
  currentColorIndex: number;
  zoom: number;
}

export function usePixelCanvas() {
  const [state, setState] = useState<PixelCanvasState>({
    gridData: [],
    gridSize: [32, 32],
    tool: 'pen',
    currentColorIndex: 0,
    zoom: 1,
  });

  const setGridData = useCallback((data: number[][]) => {
    setState((s) => ({ ...s, gridData: data }));
  }, []);

  const setGridSize = useCallback((size: [number, number]) => {
    setState((s) => ({ ...s, gridSize: size }));
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setState((s) => ({ ...s, tool }));
  }, []);

  const setCurrentColorIndex = useCallback((idx: number) => {
    setState((s) => ({ ...s, currentColorIndex: idx }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((s) => ({ ...s, zoom }));
  }, []);

  const updateCell = useCallback((row: number, col: number, value: number) => {
    setState((s) => {
      const newData = s.gridData.map((r) => [...r]);
      newData[row][col] = value;
      return { ...s, gridData: newData };
    });
  }, []);

  const floodFill = useCallback((row: number, col: number, newColor: number) => {
    setState((s) => {
      const data = s.gridData.map((r) => [...r]);
      const targetColor = data[row][col];
      if (targetColor === newColor) return s;

      const queue: [number, number][] = [[row, col]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        if (r < 0 || r >= data.length || c < 0 || c >= data[0].length) continue;
        if (data[r][c] !== targetColor) continue;

        visited.add(key);
        data[r][c] = newColor;

        queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
      }

      return { ...s, gridData: data };
    });
  }, []);

  return {
    state,
    setGridData,
    setGridSize,
    setTool,
    setCurrentColorIndex,
    setZoom,
    updateCell,
    floodFill,
  };
}
```

Run: `cat > apps/web/src/hooks/usePixelCanvas.ts << 'EOFHOOK'
import { useState, useCallback } from 'react';
import { Tool } from 'shared/src/types';

export interface PixelCanvasState {
  gridData: number[][];
  gridSize: [number, number];
  tool: Tool;
  currentColorIndex: number;
  zoom: number;
}

export function usePixelCanvas() {
  const [state, setState] = useState<PixelCanvasState>({
    gridData: [],
    gridSize: [32, 32],
    tool: 'pen',
    currentColorIndex: 0,
    zoom: 1,
  });

  const setGridData = useCallback((data: number[][]) => {
    setState((s) => ({ ...s, gridData: data }));
  }, []);

  const setGridSize = useCallback((size: [number, number]) => {
    setState((s) => ({ ...s, gridSize: size }));
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setState((s) => ({ ...s, tool }));
  }, []);

  const setCurrentColorIndex = useCallback((idx: number) => {
    setState((s) => ({ ...s, currentColorIndex: idx }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((s) => ({ ...s, zoom }));
  }, []);

  const updateCell = useCallback((row: number, col: number, value: number) => {
    setState((s) => {
      const newData = s.gridData.map((r) => [...r]);
      newData[row][col] = value;
      return { ...s, gridData: newData };
    });
  }, []);

  const floodFill = useCallback((row: number, col: number, newColor: number) => {
    setState((s) => {
      const data = s.gridData.map((r) => [...r]);
      const targetColor = data[row][col];
      if (targetColor === newColor) return s;

      const queue: [number, number][] = [[row, col]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        if (r < 0 || r >= data.length || c < 0 || c >= data[0].length) continue;
        if (data[r][c] !== targetColor) continue;

        visited.add(key);
        data[r][c] = newColor;

        queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
      }

      return { ...s, gridData: data };
    });
  }, []);

  return {
    state,
    setGridData,
    setGridSize,
    setTool,
    setCurrentColorIndex,
    setZoom,
    updateCell,
    floodFill,
  };
}
EOFHOOK`

---

- [ ] **Step 2: Create useHistory.ts**

```typescript
import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial]);
  const [pointer, setPointer] = useState(0);
  const lastPointerRef = useRef(0);

  const push = useCallback((state: T, force = false) => {
    const serialized = JSON.stringify(state);
    const currentSerialized = JSON.stringify(history[pointer]);
    if (!force && serialized === currentSerialized) return;

    setHistory((prev) => {
      const truncated = prev.slice(0, lastPointerRef.current + 1);
      const next = [...truncated, state].slice(-MAX_HISTORY);
      lastPointerRef.current = next.length - 1;
      setPointer(next.length - 1);
      return next;
    });
  }, [history, pointer]);

  const undo = useCallback((): T | null => {
    if (pointer <= 0) return null;
    const newPointer = pointer - 1;
    setPointer(newPointer);
    lastPointerRef.current = newPointer;
    return history[newPointer];
  }, [pointer, history]);

  const redo = useCallback((): T | null => {
    if (pointer >= history.length - 1) return null;
    const newPointer = pointer + 1;
    setPointer(newPointer);
    lastPointerRef.current = newPointer;
    return history[newPointer];
  }, [pointer, history]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return { push, undo, redo, canUndo, canRedo };
}
```

Run: `cat > apps/web/src/hooks/useHistory.ts << 'EOFHIST'
import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial]);
  const [pointer, setPointer] = useState(0);
  const lastPointerRef = useRef(0);

  const push = useCallback((state: T, force = false) => {
    const serialized = JSON.stringify(state);
    const currentSerialized = JSON.stringify(history[pointer]);
    if (!force && serialized === currentSerialized) return;

    setHistory((prev) => {
      const truncated = prev.slice(0, lastPointerRef.current + 1);
      const next = [...truncated, state].slice(-MAX_HISTORY);
      lastPointerRef.current = next.length - 1;
      setPointer(next.length - 1);
      return next;
    });
  }, [history, pointer]);

  const undo = useCallback((): T | null => {
    if (pointer <= 0) return null;
    const newPointer = pointer - 1;
    setPointer(newPointer);
    lastPointerRef.current = newPointer;
    return history[newPointer];
  }, [pointer, history]);

  const redo = useCallback((): T | null => {
    if (pointer >= history.length - 1) return null;
    const newPointer = pointer + 1;
    setPointer(newPointer);
    lastPointerRef.current = newPointer;
    return history[newPointer];
  }, [pointer, history]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return { push, undo, redo, canUndo, canRedo };
}
EOFHIST`

---

- [ ] **Step 3: Create PixelCanvas.tsx**

This component wraps a Leafer canvas and renders pixel cells as Rect objects.

```tsx
import { useEffect, useRef } from 'react';
import { App, Rect, Group, Line } from '@leafer-include/interface';
import { PALETTE } from '../../lib/palette-256';

interface PixelCanvasProps {
  gridData: number[][];
  gridSize: [number, number];
  zoom: number;
  currentColorIndex: number;
  tool: 'select' | 'pen' | 'bucket' | 'eraser';
  onCellClick: (row: number, col: number) => void;
  onCellDrag?: (row: number, col: number) => void;
  onDragStart?: () => void;
}

export function PixelCanvas({
  gridData,
  gridSize,
  zoom,
  currentColorIndex,
  tool,
  onCellClick,
  onCellDrag,
  onDragStart,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const cellsGroupRef = useRef<Group | null>(null);
  const isDraggingRef = useRef(false);

  // Initialize Leafer app
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const cellsGroup = new Group();
    app.tree.add(cellsGroup);
    cellsGroupRef.current = cellsGroup;
    appRef.current = app;

    return () => {
      app.destroy();
      appRef.current = null;
    };
  }, []);

  // Render pixel cells
  useEffect(() => {
    const app = appRef.current;
    const group = cellsGroupRef.current;
    if (!app || !group) return;

    // Clear existing cells
    group.children.forEach((child) => child.remove());

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * zoom;

    const offsetX = (canvasWidth - cellSize * cols) / 2;
    const offsetY = (canvasHeight - cellSize * rows) / 2;

    // Draw grid lines
    for (let i = 0; i <= cols; i++) {
      const line = new Line({
        points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      group.add(line);
    }
    for (let i = 0; i <= rows; i++) {
      const line = new Line({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      group.add(line);
    }

    // Draw pixel cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = gridData[row]?.[col];
        const fill = colorIndex === -1 || colorIndex === undefined
          ? 'transparent'
          : '#' + PALETTE.colors[colorIndex];

        const rect = new Rect({
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: fill === 'transparent' ? undefined : fill,
          stroke: { color: 'rgba(0,0,0,0.2)', width: 0.5 },
          draggable: false,
        });

        (rect as any).__row = row;
        (rect as any).__col = col;

        rect.on('pointerdown', () => {
          isDraggingRef.current = true;
          onDragStart?.();
          onCellClick(row, col);
        });

        rect.on('pointerenter', () => {
          if (isDraggingRef.current) {
            onCellDrag?.(row, col);
          }
        });

        group.add(rect);
      }
    }

    // Global pointer up to end drag
    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gridData, gridSize, zoom, onCellClick, onCellDrag, onDragStart]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#18181b]"
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
    />
  );
}
```

Run: `cat > apps/web/src/components/canvas/PixelCanvas.tsx << 'EOFCANVAS'
import { useEffect, useRef } from 'react';
import { App, Rect, Group, Line } from '@leafer-include/interface';
import { PALETTE } from '../../lib/palette-256';

interface PixelCanvasProps {
  gridData: number[][];
  gridSize: [number, number];
  zoom: number;
  currentColorIndex: number;
  tool: 'select' | 'pen' | 'bucket' | 'eraser';
  onCellClick: (row: number, col: number) => void;
  onCellDrag?: (row: number, col: number) => void;
  onDragStart?: () => void;
}

export function PixelCanvas({
  gridData,
  gridSize,
  zoom,
  currentColorIndex,
  tool,
  onCellClick,
  onCellDrag,
  onDragStart,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const cellsGroupRef = useRef<Group | null>(null);
  const isDraggingRef = useRef(false);

  // Initialize Leafer app
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const cellsGroup = new Group();
    app.tree.add(cellsGroup);
    cellsGroupRef.current = cellsGroup;
    appRef.current = app;

    return () => {
      app.destroy();
      appRef.current = null;
    };
  }, []);

  // Render pixel cells
  useEffect(() => {
    const app = appRef.current;
    const group = cellsGroupRef.current;
    if (!app || !group) return;

    group.children.forEach((child) => child.remove());

    const [cols, rows] = gridSize;
    const canvasWidth = containerRef.current?.clientWidth ?? 800;
    const canvasHeight = containerRef.current?.clientHeight ?? 600;
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * zoom;

    const offsetX = (canvasWidth - cellSize * cols) / 2;
    const offsetY = (canvasHeight - cellSize * rows) / 2;

    // Draw grid lines
    for (let i = 0; i <= cols; i++) {
      const line = new Line({
        points: [offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + rows * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      group.add(line);
    }
    for (let i = 0; i <= rows; i++) {
      const line = new Line({
        points: [offsetX, offsetY + i * cellSize, offsetX + cols * cellSize, offsetY + i * cellSize],
        stroke: { color: 'rgba(255,255,255,0.1)', width: 1 },
      });
      group.add(line);
    }

    // Draw pixel cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const colorIndex = gridData[row]?.[col];
        const fill = colorIndex === -1 || colorIndex === undefined
          ? 'transparent'
          : '#' + PALETTE.colors[colorIndex];

        const rect = new Rect({
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: fill === 'transparent' ? undefined : fill,
          stroke: { color: 'rgba(0,0,0,0.2)', width: 0.5 },
          draggable: false,
        });

        (rect as any).__row = row;
        (rect as any).__col = col;

        rect.on('pointerdown', () => {
          isDraggingRef.current = true;
          onDragStart?.();
          onCellClick(row, col);
        });

        rect.on('pointerenter', () => {
          if (isDraggingRef.current) {
            onCellDrag?.(row, col);
          }
        });

        group.add(rect);
      }
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gridData, gridSize, zoom, onCellClick, onCellDrag, onDragStart]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#18181b]"
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
    />
  );
}
EOFCANVAS`

---

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/canvas/PixelCanvas.tsx apps/web/src/hooks/usePixelCanvas.ts apps/web/src/hooks/useHistory.ts
git commit -m "feat: add Leafer-based PixelCanvas component with usePixelCanvas and useHistory hooks

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 6: UI Components

### Task 6: TopToolbar Component

**Files:**
- Create: `apps/web/src/components/toolbar/TopToolbar.tsx`

---

- [ ] **Step 1: Create TopToolbar.tsx**

```tsx
import { Tool } from 'shared/src/types';

interface TopToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  gridSize: [number, number];
  onGridSizeChange: (size: [number, number]) => void;
  onExport: () => void;
}

const GRID_SIZES: [number, number][] = [
  [8, 8], [16, 16], [32, 32], [48, 48], [64, 64], [128, 128],
];

const TOOLS: { id: Tool; label: string; icon: string; key: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', key: 'V' },
  { id: 'pen', label: 'Pen', icon: '✏', key: 'B' },
  { id: 'bucket', label: 'Fill', icon: '🪣', key: 'G' },
  { id: 'eraser', label: 'Eraser', icon: '🧽', key: 'E' },
];

export function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  tool,
  onToolChange,
  gridSize,
  onGridSizeChange,
  onExport,
}: TopToolbarProps) {
  return (
    <div className="h-12 bg-[#141416] border-b border-[#2a2a2e] flex items-center px-4 gap-2">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-4">
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[#e4e4e7] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ←
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[#e4e4e7] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          →
        </button>
      </div>

      <div className="w-px h-6 bg-[#2a2a2e]" />

      {/* Tools */}
      <div className="flex items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`w-8 h-8 flex items-center justify-center rounded text-lg ${
              tool === t.id
                ? 'bg-[#6366f1] text-white'
                : 'text-[#e4e4e7] hover:bg-[#2a2a2e]'
            }`}
            onClick={() => onToolChange(t.id)}
            title={`${t.label} (${t.key})`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#2a2a2e]" />

      {/* Grid size */}
      <select
        className="h-8 px-2 rounded bg-[#141416] border border-[#2a2a2e] text-[#e4e4e7] text-sm"
        value={`${gridSize[0]}x${gridSize[1]}`}
        onChange={(e) => {
          const [w, h] = e.target.value.split('x').map(Number);
          onGridSizeChange([w, h]);
        }}
      >
        {GRID_SIZES.map(([w, h]) => (
          <option key={`${w}x${h}`} value={`${w}x${h}`}>
            {w}×{h}
          </option>
        ))}
      </select>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export */}
      <button
        className="h-8 px-4 rounded bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] transition-colors"
        onClick={onExport}
      >
        Export
      </button>
    </div>
  );
}
```

Run: `cat > apps/web/src/components/toolbar/TopToolbar.tsx << 'EOFTOOL'
import { Tool } from 'shared/src/types';

interface TopToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  gridSize: [number, number];
  onGridSizeChange: (size: [number, number]) => void;
  onExport: () => void;
}

const GRID_SIZES: [number, number][] = [
  [8, 8], [16, 16], [32, 32], [48, 48], [64, 64], [128, 128],
];

const TOOLS: { id: Tool; label: string; icon: string; key: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', key: 'V' },
  { id: 'pen', label: 'Pen', icon: '✏', key: 'B' },
  { id: 'bucket', label: 'Fill', icon: '🪣', key: 'G' },
  { id: 'eraser', label: 'Eraser', icon: '🧽', key: 'E' },
];

export function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  tool,
  onToolChange,
  gridSize,
  onGridSizeChange,
  onExport,
}: TopToolbarProps) {
  return (
    <div className="h-12 bg-[#141416] border-b border-[#2a2a2e] flex items-center px-4 gap-2">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-4">
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[#e4e4e7] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ←
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded text-[#e4e4e7] hover:bg-[#2a2a2e] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          →
        </button>
      </div>

      <div className="w-px h-6 bg-[#2a2a2e]" />

      {/* Tools */}
      <div className="flex items-center gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`w-8 h-8 flex items-center justify-center rounded text-lg ${
              tool === t.id
                ? 'bg-[#6366f1] text-white'
                : 'text-[#e4e4e7] hover:bg-[#2a2a2e]'
            }`}
            onClick={() => onToolChange(t.id)}
            title={`${t.label} (${t.key})`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-[#2a2a2e]" />

      {/* Grid size */}
      <select
        className="h-8 px-2 rounded bg-[#141416] border border-[#2a2a2e] text-[#e4e4e7] text-sm"
        value={`${gridSize[0]}x${gridSize[1]}`}
        onChange={(e) => {
          const [w, h] = e.target.value.split('x').map(Number);
          onGridSizeChange([w, h]);
        }}
      >
        {GRID_SIZES.map(([w, h]) => (
          <option key={`${w}x${h}`} value={`${w}x${h}`}>
            {w}×{h}
          </option>
        ))}
      </select>

      <div className="flex-1" />

      <button
        className="h-8 px-4 rounded bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] transition-colors"
        onClick={onExport}
      >
        Export
      </button>
    </div>
  );
}
EOFTOOL`

---

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/toolbar/TopToolbar.tsx
git commit -m "feat: add TopToolbar with undo/redo, tools, grid size, export button

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Export Panel Component

**Files:**
- Create: `apps/web/src/panels/ExportPanel.tsx`

---

- [ ] **Step 1: Create ExportPanel.tsx**

```tsx
import { useState } from 'react';

interface ExportPanelProps {
  gridData: number[][];
  gridSize: [number, number];
  onExportPng: (size: number) => void;
  onExportIco: () => void;
  onExportIcns: () => void;
}

const PNG_SIZES = [8, 16, 32, 48, 64, 128, 256, 512];

export function ExportPanel({
  gridData,
  gridSize,
  onExportPng,
  onExportIco,
  onExportIcns,
}: ExportPanelProps) {
  const [selectedPngSizes, setSelectedPngSizes] = useState<number[]>([32, 64]);

  const togglePngSize = (size: number) => {
    setSelectedPngSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  return (
    <div className="w-[280px] bg-[#141416] border-l border-[#2a2a2e] flex flex-col">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h2 className="text-sm font-medium text-[#e4e4e7]">Export</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ICO */}
        <div>
          <h3 className="text-xs text-[#71717a] uppercase mb-2">Windows Icon</h3>
          <button
            className="w-full h-10 rounded bg-[#2a2a2e] text-[#e4e4e7] text-sm hover:bg-[#3a3a3e] transition-colors"
            onClick={onExportIco}
          >
            Download .ico
          </button>
          <p className="text-xs text-[#71717a] mt-1">Includes 16/32/48/256</p>
        </div>

        {/* ICNS */}
        <div>
          <h3 className="text-xs text-[#71717a] uppercase mb-2">macOS Icon</h3>
          <button
            className="w-full h-10 rounded bg-[#2a2a2e] text-[#e4e4e7] text-sm hover:bg-[#3a3a3e] transition-colors"
            onClick={onExportIcns}
          >
            Download .icns
          </button>
          <p className="text-xs text-[#71717a] mt-1">Includes 16/32/64/128/256/512/1024</p>
        </div>

        {/* PNG */}
        <div>
          <h3 className="text-xs text-[#71717a] uppercase mb-2">PNG</h3>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {PNG_SIZES.map((size) => (
              <button
                key={size}
                className={`h-8 rounded text-xs transition-colors ${
                  selectedPngSizes.includes(size)
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-[#2a2a2e] text-[#e4e4e7] hover:bg-[#3a3a3e]'
                }`}
                onClick={() => togglePngSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            className="w-full h-10 rounded bg-[#2a2a2e] text-[#e4e4e7] text-sm hover:bg-[#3a3a3e] transition-colors"
            onClick={() => selectedPngSizes.forEach((s) => onExportPng(s))}
            disabled={selectedPngSizes.length === 0}
          >
            Download PNG {selectedPngSizes.length > 0 ? `(${selectedPngSizes.join(', ')})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Run: `cat > apps/web/src/components/panels/ExportPanel.tsx << 'EOFPANEL'
import { useState } from 'react';

interface ExportPanelProps {
  gridData: number[][];
  gridSize: [number, number];
  onExportPng: (size: number) => void;
  onExportIco: () => void;
  onExportIcns: () => void;
}

const PNG_SIZES = [8, 16, 32, 48, 64, 128, 256, 512];

export function ExportPanel({
  gridData,
  gridSize,
  onExportPng,
  onExportIco,
  onExportIcns,
}: ExportPanelProps) {
  const [selectedPngSizes, setSelectedPngSizes] = useState<number[]>([32, 64]);

  const togglePngSize = (size: number) => {
    setSelectedPngSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  return (
    <div className="w-[280px] bg-[#141416] border-l border-[#2a2a2e] flex flex-col">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h2 className="text-sm font-medium text-[#e4e4e7]">Export</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ICO */}
        <div>
          <h3 className="text-xs text-[#71717a] uppercase mb-2">Windows Icon</h3>
          <button
            className="w-full h-10 rounded bg-[#2a2a2e] text-[#e4e4e7] text-sm hover:bg-[#3a3a3e] transition-colors"
            onClick={onExportIco}
          >
            Download .ico
          </button>
          <p className="text-xs text-[#71717a] mt-1">Includes 16/32/48/256</p>
        </div>

        {/* ICNS */}
        <div>
          <h3 className="text-xs text-[#71717a] uppercase mb-2">macOS Icon</h3>
          <button
            className="w-full h-10 rounded bg-[#2a2a2e] text-[#e4e4e7] text-sm hover:bg-[#3a3a3e] transition-colors"
            onClick={onExportIcns}
          >
            Download .icns
          </button>
          <p className="text-xs text-[#71717a] mt-1">Includes 16/32/64/128/256/512/1024</p>
        </div>

        {/* PNG */}
        <div>
          <h3 className="text-xs text-[#71717a] uppercase mb-2">PNG</h3>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {PNG_SIZES.map((size) => (
              <button
                key={size}
                className={`h-8 rounded text-xs transition-colors ${
                  selectedPngSizes.includes(size)
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-[#2a2a2e] text-[#e4e4e7] hover:bg-[#3a3a3e]'
                }`}
                onClick={() => togglePngSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <button
            className="w-full h-10 rounded bg-[#2a2a2e] text-[#e4e4e7] text-sm hover:bg-[#3a3a3e] transition-colors"
            onClick={() => selectedPngSizes.forEach((s) => onExportPng(s))}
            disabled={selectedPngSizes.length === 0}
          >
            Download PNG {selectedPngSizes.length > 0 ? `(${selectedPngSizes.join(', ')})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
EOFPANEL`

---

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/panels/ExportPanel.tsx
git commit -m "feat: add ExportPanel with ICO, ICNS, and PNG size selection

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Color Palette Drawer Component

**Files:**
- Create: `apps/web/src/components/panels/ColorPalette.tsx`

---

- [ ] **Step 1: Create ColorPalette.tsx**

```tsx
import { useState } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface ColorPaletteProps {
  currentColorIndex: number;
  onColorSelect: (index: number) => void;
}

export function ColorPalette({ currentColorIndex, onColorSelect }: ColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[#2a2a2e]">
      {/* Toggle */}
      <button
        className="w-full h-10 flex items-center justify-between px-4 bg-[#141416] hover:bg-[#1c1c1e] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-[#71717a]">Palette</span>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded border border-[#2a2a2e]"
            style={{ backgroundColor: '#' + PALETTE.colors[currentColorIndex] }}
          />
          <span className="text-xs text-[#71717a]">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Palette grid */}
      {isOpen && (
        <div className="p-2 bg-[#141416]">
          <div
            className="grid grid-cols-16 gap-px"
            style={{ gridTemplateColumns: `repeat(16, minmax(0, 1fr))` }}
          >
            {PALETTE.colors.map((color, index) => (
              <button
                key={color}
                className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 ${
                  index === currentColorIndex
                    ? 'ring-2 ring-[#6366f1] ring-offset-1 ring-offset-[#141416]'
                    : ''
                }`}
                style={{ backgroundColor: '#' + color }}
                onClick={() => onColorSelect(index)}
                title={`#${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

Run: `cat > apps/web/src/components/panels/ColorPalette.tsx << 'EOFPAL'
import { useState } from 'react';
import { PALETTE } from '../../lib/palette-256';

interface ColorPaletteProps {
  currentColorIndex: number;
  onColorSelect: (index: number) => void;
}

export function ColorPalette({ currentColorIndex, onColorSelect }: ColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-[#2a2a2e]">
      <button
        className="w-full h-10 flex items-center justify-between px-4 bg-[#141416] hover:bg-[#1c1c1e] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-[#71717a]">Palette</span>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded border border-[#2a2a2e]"
            style={{ backgroundColor: '#' + PALETTE.colors[currentColorIndex] }}
          />
          <span className="text-xs text-[#71717a]">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-2 bg-[#141416]">
          <div
            className="grid gap-px"
            style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
          >
            {PALETTE.colors.map((color, index) => (
              <button
                key={color}
                className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 ${
                  index === currentColorIndex
                    ? 'ring-2 ring-[#6366f1] ring-offset-1 ring-offset-[#141416]'
                    : ''
                }`}
                style={{ backgroundColor: '#' + color }}
                onClick={() => onColorSelect(index)}
                title={`#${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
EOFPAL`

---

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/panels/ColorPalette.tsx
git commit -m "feat: add ColorPalette drawer with 256-color grid

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 7: Export Implementation

### Task 9: Export Libraries (PNG, ICO, ICNS)

**Files:**
- Create: `apps/web/src/lib/exporters/toPng.ts`
- Create: `apps/web/src/lib/exporters/toIco.ts`
- Create: `apps/web/src/lib/exporters/toIcns.ts`

---

- [ ] **Step 1: Create toPng.ts**

```typescript
import { PALETTE } from '../palette-256';

export function exportToPng(gridData: number[][], gridSize: [number, number], outputSize: number): void {
  const [cols, rows] = gridSize;
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  const cellW = outputSize / cols;
  const cellH = outputSize / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex === -1 || colorIndex === undefined) {
        ctx.clearRect(col * cellW, row * cellH, cellW, cellH);
      } else {
        ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
        ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }
  }

  const link = document.createElement('a');
  link.download = `pixel-icon-${outputSize}x${outputSize}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
```

Run: `cat > apps/web/src/lib/exporters/toPng.ts << 'EOFPNG'
import { PALETTE } from '../palette-256';

export function exportToPng(gridData: number[][], gridSize: [number, number], outputSize: number): void {
  const [cols, rows] = gridSize;
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  const cellW = outputSize / cols;
  const cellH = outputSize / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex === -1 || colorIndex === undefined) {
        ctx.clearRect(col * cellW, row * cellH, cellW, cellH);
      } else {
        ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
        ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }
  }

  const link = document.createElement('a');
  link.download = `pixel-icon-${outputSize}x${outputSize}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
EOFPNG`

---

- [ ] **Step 2: Create toIco.ts**

ICO format: Multiple PNG images bundled in the ICO container format.

```typescript
import { exportToPngDataUrl } from './toPngDataUrl';

export async function exportToIco(gridData: number[][], gridSize: [number, number]): Promise<void> {
  const sizes = [16, 32, 48, 256];
  const pngDataUrls = sizes.map((size) => exportToPngDataUrl(gridData, gridSize, size));

  // ICO header
  // Type: 1 (ICO), count: sizes.length
  // Directory entries: 16 bytes each
  const headerSize = 6 + sizes.length * 16;
  const buffers: ArrayBuffer[] = [];

  // Create PNG blobs and collect sizes
  const pngBuffers: ArrayBuffer[] = [];
  const pngSizes: number[] = [];

  for (let i = 0; i < sizes.length; i++) {
    const dataUrl = pngDataUrls[i];
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let j = 0; j < len; j++) buf[j] = binary.charCodeAt(j);
    pngBuffers.push(buf.buffer);
    pngSizes.push(buf.length);
  }

  // ICO header
  const header = new Uint8Array(6 + sizes.length * 16);
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type = 1 (ICO)
  view.setUint16(4, sizes.length, true); // image count

  let offset = headerSize;
  for (let i = 0; i < sizes.length; i++) {
    const entryOffset = 6 + i * 16;
    header[entryOffset] = sizes[i] === 256 ? 0 : sizes[i]; // width (0 = 256)
    header[entryOffset + 1] = sizes[i] === 256 ? 0 : sizes[i]; // height
    header[entryOffset + 2] = 0; // color palette
    header[entryOffset + 3] = 0; // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, pngSizes[i], true); // image size
    view.setUint32(entryOffset + 12, offset, true); // image offset
    offset += pngSizes[i];
  }

  // Combine all parts
  const totalLen = header.byteLength + pngBuffers.reduce((a, b) => a + b.byteLength, 0);
  const result = new Uint8Array(totalLen);
  result.set(header, 0);
  let pos = header.byteLength;
  for (const buf of pngBuffers) {
    result.set(new Uint8Array(buf), pos);
    pos += buf.byteLength;
  }

  const blob = new Blob([result], { type: 'image/x-icon' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pixel-icon.ico';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function exportToPngDataUrl(gridData: number[][], gridSize: [number, number], outputSize: number): string {
  const [cols, rows] = gridSize;
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  const cellW = outputSize / cols;
  const cellH = outputSize / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex === -1 || colorIndex === undefined) {
        ctx.clearRect(col * cellW, row * cellH, cellW, cellH);
      } else {
        ctx.fillStyle = '#' + (require('../palette-256') as typeof import('../palette-256')).PALETTE.colors[colorIndex];
        ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }
  }

  return canvas.toDataURL('image/png');
}
```

> **Note**: The `require` above is a workaround for ESM. Refactor `exportToPngDataUrl` to not use require. Instead, copy the PNG rendering logic inline or import from a shared module.

Let me rewrite this cleanly:

```typescript
import { PALETTE } from '../palette-256';

function renderToCanvas(gridData: number[][], gridSize: [number, number], outputSize: number): string {
  const [cols, rows] = gridSize;
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  const cellW = outputSize / cols;
  const cellH = outputSize / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex === -1 || colorIndex === undefined) {
        ctx.clearRect(col * cellW, row * cellH, cellW, cellH);
      } else {
        ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
        ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function exportToPng(gridData: number[][], gridSize: [number, number], outputSize: number): void {
  const dataUrl = renderToCanvas(gridData, gridSize, outputSize);
  const link = document.createElement('a');
  link.download = `pixel-icon-${outputSize}x${outputSize}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportToIco(gridData: number[][], gridSize: [number, number]): Promise<void> {
  const sizes = [16, 32, 48, 256];

  function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
  }

  const dataUrls = sizes.map((size) => renderToCanvas(gridData, gridSize, size));
  const pngBuffers = dataUrls.map(dataUrlToBuffer);
  const pngSizes = pngBuffers.map((b) => b.byteLength);

  const headerSize = 6 + sizes.length * 16;
  const header = new Uint8Array(headerSize);
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, sizes.length, true);

  let offset = headerSize;
  for (let i = 0; i < sizes.length; i++) {
    const entryOffset = 6 + i * 16;
    header[entryOffset] = sizes[i] === 256 ? 0 : sizes[i];
    header[entryOffset + 1] = sizes[i] === 256 ? 0 : sizes[i];
    header[entryOffset + 2] = 0;
    header[entryOffset + 3] = 0;
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, pngSizes[i], true);
    view.setUint32(entryOffset + 12, offset, true);
    offset += pngSizes[i];
  }

  const totalLen = header.byteLength + pngBuffers.reduce((a, b) => a + b.byteLength, 0);
  const result = new Uint8Array(totalLen);
  result.set(header, 0);
  let pos = header.byteLength;
  for (const buf of pngBuffers) {
    result.set(new Uint8Array(buf), pos);
    pos += buf.byteLength;
  }

  const blob = new Blob([result], { type: 'image/x-icon' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pixel-icon.ico';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
```

Run: `mkdir -p apps/web/src/lib/exporters && cat > apps/web/src/lib/exporters/toIco.ts << 'EOFICO'
import { PALETTE } from '../palette-256';

// renderToCanvas is exported so toIcns.ts can reuse it
export function renderToCanvas(gridData: number[][], gridSize: [number, number], outputSize: number): string {
  const [cols, rows] = gridSize;
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  const cellW = outputSize / cols;
  const cellH = outputSize / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex === -1 || colorIndex === undefined) {
        ctx.clearRect(col * cellW, row * cellH, cellW, cellH);
      } else {
        ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
        ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function exportToPng(gridData: number[][], gridSize: [number, number], outputSize: number): void {
  const dataUrl = renderToCanvas(gridData, gridSize, outputSize);
  const link = document.createElement('a');
  link.download = `pixel-icon-${outputSize}x${outputSize}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportToIco(gridData: number[][], gridSize: [number, number]): Promise<void> {
  const sizes = [16, 32, 48, 256];

  function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
  }

  const dataUrls = sizes.map((size) => renderToCanvas(gridData, gridSize, size));
  const pngBuffers = dataUrls.map(dataUrlToBuffer);
  const pngSizes = pngBuffers.map((b) => b.byteLength);

  const headerSize = 6 + sizes.length * 16;
  const header = new Uint8Array(headerSize);
  const view = new DataView(header.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, sizes.length, true);

  let offset = headerSize;
  for (let i = 0; i < sizes.length; i++) {
    const entryOffset = 6 + i * 16;
    header[entryOffset] = sizes[i] === 256 ? 0 : sizes[i];
    header[entryOffset + 1] = sizes[i] === 256 ? 0 : sizes[i];
    header[entryOffset + 2] = 0;
    header[entryOffset + 3] = 0;
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, pngSizes[i], true);
    view.setUint32(entryOffset + 12, offset, true);
    offset += pngSizes[i];
  }

  const totalLen = header.byteLength + pngBuffers.reduce((a, b) => a + b.byteLength, 0);
  const result = new Uint8Array(totalLen);
  result.set(header, 0);
  let pos = header.byteLength;
  for (const buf of pngBuffers) {
    result.set(new Uint8Array(buf), pos);
    pos += buf.byteLength;
  }

  const blob = new Blob([result], { type: 'image/x-icon' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pixel-icon.ico';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
EOFICO`

> **Note:** `toPng.ts` is not created — `exportToPng` and `renderToCanvas` are both defined in `toIco.ts`. `toIcns.ts` imports `renderToCanvas` from `toIco.ts`.

---

- [ ] **Step 3: Create toIcns.ts**

ICNS is a macOS icon format. It starts with a 4-byte magic "icns" followed by chunks.

```typescript
export async function exportToIcns(gridData: number[][], gridSize: [number, number]): Promise<void> {
  const sizes = [128, 256];
  const typeMap: Record<number, string> = { 128: 'ic07', 256: 'ic08' };

  function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
  }

  const { renderToCanvas } = await import('./toIco');
  const dataUrls = sizes.map((size) => renderToCanvas(gridData, gridSize, size));
  const pngBuffers = dataUrls.map(dataUrlToBuffer);

  const chunks: Array<{ type: string; data: Uint8Array }> = [];
  for (let i = 0; i < sizes.length; i++) {
    const typeStr = typeMap[sizes[i]];
    const typeBytes = new Uint8Array([
      typeStr.charCodeAt(0),
      typeStr.charCodeAt(1),
      typeStr.charCodeAt(2),
      typeStr.charCodeAt(3),
    ]);
    const data = new Uint8Array(pngBuffers[i]);
    const chunkSize = 8 + data.byteLength;
    const chunk = new Uint8Array(chunkSize);
    chunk.set(typeBytes, 0);
    const view = new DataView(chunk.buffer);
    view.setUint32(4, chunkSize, false);
    chunk.set(data, 8);
    chunks.push({ type: typeStr, data: chunk });
  }

  const headerSize = 8;
  const totalDataSize = chunks.reduce((a, c) => a + c.data.byteLength, 0);
  const icns = new Uint8Array(headerSize + totalDataSize);
  const magic = new Uint8Array([0x69, 0x63, 0x6e, 0x73]);
  icns.set(magic, 0);
  const view = new DataView(icns.buffer);
  view.setUint32(4, headerSize + totalDataSize, false);
  let pos = headerSize;
  for (const chunk of chunks) {
    icns.set(chunk.data, pos);
    pos += chunk.data.byteLength;
  }

  const blob = new Blob([icns], { type: 'image/x-icns' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pixel-icon.icns';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
```

Run: `cat > apps/web/src/lib/exporters/toIcns.ts << 'EOFICNS'
export async function exportToIcns(gridData: number[][], gridSize: [number, number]): Promise<void> {
  const sizes = [128, 256];
  const typeMap: Record<number, string> = { 128: 'ic07', 256: 'ic08' };

  function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
  }

  const { renderToCanvas } = await import('./toIco');
  const dataUrls = sizes.map((size) => renderToCanvas(gridData, gridSize, size));
  const pngBuffers = dataUrls.map(dataUrlToBuffer);

  const chunks: Array<{ type: string; data: Uint8Array }> = [];
  for (let i = 0; i < sizes.length; i++) {
    const typeStr = typeMap[sizes[i]];
    const typeBytes = new Uint8Array([
      typeStr.charCodeAt(0),
      typeStr.charCodeAt(1),
      typeStr.charCodeAt(2),
      typeStr.charCodeAt(3),
    ]);
    const data = new Uint8Array(pngBuffers[i]);
    const chunkSize = 8 + data.byteLength;
    const chunk = new Uint8Array(chunkSize);
    chunk.set(typeBytes, 0);
    const view = new DataView(chunk.buffer);
    view.setUint32(4, chunkSize, false);
    chunk.set(data, 8);
    chunks.push({ type: typeStr, data: chunk });
  }

  const headerSize = 8;
  const totalDataSize = chunks.reduce((a, c) => a + c.data.byteLength, 0);
  const icns = new Uint8Array(headerSize + totalDataSize);
  const magic = new Uint8Array([0x69, 0x63, 0x6e, 0x73]);
  icns.set(magic, 0);
  const view = new DataView(icns.buffer);
  view.setUint32(4, headerSize + totalDataSize, false);
  let pos = headerSize;
  for (const chunk of chunks) {
    icns.set(chunk.data, pos);
    pos += chunk.data.byteLength;
  }

  const blob = new Blob([icns], { type: 'image/x-icns' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pixel-icon.icns';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
EOFICNS`

---

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/exporters/toIco.ts apps/web/src/lib/exporters/toIcns.ts
git commit -m "feat: implement PNG, ICO, and ICNS exporters

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 8: App Assembly

### Task 10: Assemble Full App in App.tsx

**Files:**
- Modify: `apps/web/src/App.tsx`

---

- [ ] **Step 1: Write complete App.tsx**

```tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { PixelCanvas } from './components/canvas/PixelCanvas';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ExportPanel } from './components/panels/ExportPanel';
import { ColorPalette } from './components/panels/ColorPalette';
import { usePixelCanvas } from './hooks/usePixelCanvas';
import { useHistory } from './hooks/useHistory';
import { imageFileToImageData, pixelateImage } from './lib/pixelate';
import { exportToPng, exportToIco } from './lib/exporters/toIco';
import { exportToIcns } from './lib/exporters/toIcns';
import { Tool } from 'shared/src/types';

const STORAGE_KEY = 'pixel-bead-project';

function createEmptyGrid(size: [number, number]): number[][] {
  return Array.from({ length: size[1] }, () => Array.from({ length: size[0] }, () => -1));
}

export function App() {
  const { state, setGridData, setGridSize, setTool, setCurrentColorIndex, setZoom, updateCell, floodFill } =
    usePixelCanvas();

  const { push, undo, redo, canUndo, canRedo } = useHistory<number[][]>(createEmptyGrid([32, 32]));
  const historyRef = useRef({ push, undo, redo, canUndo, canRedo });
  historyRef.current = { push, undo, redo, canUndo, canRedo };

  const [isDragging, setIsDragging] = useState(false);
  const lastPushedRef = useRef<string>('');

  const pushIfChanged = useCallback((gridData: number[][], force = false) => {
    const serialized = JSON.stringify(gridData);
    if (force || serialized !== lastPushedRef.current) {
      historyRef.current.push(gridData);
      lastPushedRef.current = serialized;
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGridData(parsed.gridData);
        setGridSize(parsed.gridSize);
        push(parsed.gridData, true);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (state.gridData.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          gridData: state.gridData,
          gridSize: state.gridSize,
          lastModified: Date.now(),
        })
      );
    }
  }, [state.gridData, state.gridSize]);

  // Handle file upload
  const handleFileDrop = useCallback(
    async (file: File) => {
      const imageData = await imageFileToImageData(file);
      const gridData = pixelateImage(imageData, state.gridSize);
      setGridData(gridData);
      pushIfChanged(gridData, true);
    },
    [state.gridSize]
  );

  // Handle cell interaction
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const { tool, currentColorIndex, gridData } = state;
      let changed = false;
      const newData = gridData.map((r) => [...r]);

      switch (tool) {
        case 'pen':
          if (newData[row][col] !== currentColorIndex) {
            newData[row][col] = currentColorIndex;
            changed = true;
          }
          break;
        case 'eraser':
          if (newData[row][col] !== -1) {
            newData[row][col] = -1;
            changed = true;
          }
          break;
        case 'bucket':
          floodFill(row, col, currentColorIndex);
          return;
        case 'select':
        default:
          return;
      }

      if (changed) {
        setGridData(newData);
        pushIfChanged(newData);
      }
    },
    [state, setGridData, floodFill, pushIfChanged]
  );

  const handleCellDrag = useCallback(
    (row: number, col: number) => {
      const { tool, currentColorIndex, gridData } = state;
      if (tool === 'pen') {
        const newData = gridData.map((r) => [...r]);
        newData[row][col] = currentColorIndex;
        setGridData(newData);
      } else if (tool === 'eraser') {
        const newData = gridData.map((r) => [...r]);
        newData[row][col] = -1;
        setGridData(newData);
      }
    },
    [state, setGridData]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          const result = historyRef.current.redo();
          if (result) setGridData(result);
        } else {
          const result = historyRef.current.undo();
          if (result) setGridData(result);
        }
        return;
      }

      const keyMap: Record<string, Tool> = { v: 'select', b: 'pen', g: 'bucket', e: 'eraser' };
      if (keyMap[e.key.toLowerCase()]) {
        setTool(keyMap[e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Export handlers
  const handleExportPng = useCallback(
    (size: number) => exportToPng(state.gridData, state.gridSize, size),
    [state.gridData, state.gridSize]
  );
  const handleExportIco = useCallback(
    () => exportToIco(state.gridData, state.gridSize),
    [state.gridData, state.gridSize]
  );
  const handleExportIcns = useCallback(
    () => exportToIcns(state.gridData, state.gridSize),
    [state.gridData, state.gridSize]
  );

  // Upload zone overlay
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b]">
      <TopToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          const result = undo();
          if (result) setGridData(result);
        }}
        onRedo={() => {
          const result = redo();
          if (result) setGridData(result);
        }}
        tool={state.tool}
        onToolChange={setTool}
        gridSize={state.gridSize}
        onGridSizeChange={(size) => {
          setGridSize(size);
          const newGrid = createEmptyGrid(size);
          setGridData(newGrid);
          pushIfChanged(newGrid, true);
        }}
        onExport={() => {}}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div
          className="flex-1 relative"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              handleFileDrop(file);
            }
          }}
          onClick={() => {
            if (state.gridData.length === 0) {
              fileInputRef.current?.click();
            }
          }}
        >
          {/* Upload drop zone (shown when no image loaded) */}
          {state.gridData.length === 0 && (
            <div
              className={`absolute inset-0 flex items-center justify-center z-10 ${
                isDragOver ? 'bg-[#6366f1]/20 border-2 border-[#6366f1]' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4 text-[#71717a]">+</div>
                <div className="text-[#71717a] text-sm">Drop image or click to upload</div>
                <button
                  className="mt-4 px-4 py-2 bg-[#6366f1] text-white rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Upload Image
                </button>
              </div>
            </div>
          )}

          <PixelCanvas
            gridData={state.gridData}
            gridSize={state.gridSize}
            zoom={state.zoom}
            currentColorIndex={state.currentColorIndex}
            tool={state.tool}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
            onDragStart={() => setIsDragging(true)}
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileDrop(file);
            }}
          />
        </div>

        {/* Right panel */}
        <div className="flex flex-col">
          <ExportPanel
            gridData={state.gridData}
            gridSize={state.gridSize}
            onExportPng={handleExportPng}
            onExportIco={handleExportIco}
            onExportIcns={handleExportIcns}
          />
          <ColorPalette
            currentColorIndex={state.currentColorIndex}
            onColorSelect={setCurrentColorIndex}
          />
        </div>
      </div>
    </div>
  );
}
```

Run: `cat > apps/web/src/App.tsx << 'EOFAPP'
import { useState, useCallback, useEffect, useRef } from 'react';
import { PixelCanvas } from './components/canvas/PixelCanvas';
import { TopToolbar } from './components/toolbar/TopToolbar';
import { ExportPanel } from './components/panels/ExportPanel';
import { ColorPalette } from './components/panels/ColorPalette';
import { usePixelCanvas } from './hooks/usePixelCanvas';
import { useHistory } from './hooks/useHistory';
import { imageFileToImageData, pixelateImage } from './lib/pixelate';
import { exportToPng, exportToIco } from './lib/exporters/toIco';
import { exportToIcns } from './lib/exporters/toIcns';
import { Tool } from 'shared/src/types';

const STORAGE_KEY = 'pixel-bead-project';

function createEmptyGrid(size: [number, number]): number[][] {
  return Array.from({ length: size[1] }, () => Array.from({ length: size[0] }, () => -1));
}

export function App() {
  const { state, setGridData, setGridSize, setTool, setCurrentColorIndex, setZoom, updateCell, floodFill } =
    usePixelCanvas();

  const { push, undo, redo, canUndo, canRedo } = useHistory<number[][]>(createEmptyGrid([32, 32]));
  const historyRef = useRef({ push, undo, redo, canUndo, canRedo });
  historyRef.current = { push, undo, redo, canUndo, canRedo };

  const [isDragOver, setIsDragOver] = useState(false);
  const lastPushedRef = useRef<string>('');

  const pushIfChanged = useCallback((gridData: number[][], force = false) => {
    const serialized = JSON.stringify(gridData);
    if (force || serialized !== lastPushedRef.current) {
      historyRef.current.push(gridData);
      lastPushedRef.current = serialized;
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGridData(parsed.gridData);
        setGridSize(parsed.gridSize);
        push(parsed.gridData, true);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (state.gridData.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          gridData: state.gridData,
          gridSize: state.gridSize,
          lastModified: Date.now(),
        })
      );
    }
  }, [state.gridData, state.gridSize]);

  const handleFileDrop = useCallback(
    async (file: File) => {
      const imageData = await imageFileToImageData(file);
      const gridData = pixelateImage(imageData, state.gridSize);
      setGridData(gridData);
      pushIfChanged(gridData, true);
    },
    [state.gridSize]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const { tool, currentColorIndex, gridData } = state;
      const newData = gridData.map((r) => [...r]);

      switch (tool) {
        case 'pen':
          newData[row][col] = currentColorIndex;
          break;
        case 'eraser':
          newData[row][col] = -1;
          break;
        case 'bucket':
          floodFill(row, col, currentColorIndex);
          return;
        case 'select':
        default:
          return;
      }

      setGridData(newData);
      pushIfChanged(newData);
    },
    [state, setGridData, floodFill, pushIfChanged]
  );

  const handleCellDrag = useCallback(
    (row: number, col: number) => {
      const { tool, currentColorIndex, gridData } = state;
      if (tool === 'pen' || tool === 'eraser') {
        const newData = gridData.map((r) => [...r]);
        newData[row][col] = tool === 'eraser' ? -1 : currentColorIndex;
        setGridData(newData);
      }
    },
    [state, setGridData]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          const result = historyRef.current.redo();
          if (result) setGridData(result);
        } else {
          const result = historyRef.current.undo();
          if (result) setGridData(result);
        }
        return;
      }

      const keyMap: Record<string, Tool> = { v: 'select', b: 'pen', g: 'bucket', e: 'eraser' };
      if (keyMap[e.key.toLowerCase()]) {
        setTool(keyMap[e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportPng = useCallback(
    (size: number) => exportToPng(state.gridData, state.gridSize, size),
    [state.gridData, state.gridSize]
  );
  const handleExportIco = useCallback(
    () => exportToIco(state.gridData, state.gridSize),
    [state.gridData, state.gridSize]
  );
  const handleExportIcns = useCallback(
    () => exportToIcns(state.gridData, state.gridSize),
    [state.gridData, state.gridSize]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b]">
      <TopToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          const result = undo();
          if (result) setGridData(result);
        }}
        onRedo={() => {
          const result = redo();
          if (result) setGridData(result);
        }}
        tool={state.tool}
        onToolChange={setTool}
        gridSize={state.gridSize}
        onGridSizeChange={(size) => {
          setGridSize(size);
          const newGrid = createEmptyGrid(size);
          setGridData(newGrid);
          pushIfChanged(newGrid, true);
        }}
        onExport={() => {}}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 relative"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              handleFileDrop(file);
            }
          }}
          onClick={() => {
            if (state.gridData.length === 0) {
              fileInputRef.current?.click();
            }
          }}
        >
          {state.gridData.length === 0 && (
            <div
              className={`absolute inset-0 flex items-center justify-center z-10 ${
                isDragOver ? 'bg-[#6366f1]/20 border-2 border-[#6366f1]' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4 text-[#71717a]">+</div>
                <div className="text-[#71717a] text-sm">Drop image or click to upload</div>
                <button
                  className="mt-4 px-4 py-2 bg-[#6366f1] text-white rounded text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Upload Image
                </button>
              </div>
            </div>
          )}

          <PixelCanvas
            gridData={state.gridData}
            gridSize={state.gridSize}
            zoom={state.zoom}
            currentColorIndex={state.currentColorIndex}
            tool={state.tool}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
            onDragStart={() => {}}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileDrop(file);
            }}
          />
        </div>

        <div className="flex flex-col">
          <ExportPanel
            gridData={state.gridData}
            gridSize={state.gridSize}
            onExportPng={handleExportPng}
            onExportIco={handleExportIco}
            onExportIcns={handleExportIcns}
          />
          <ColorPalette
            currentColorIndex={state.currentColorIndex}
            onColorSelect={setCurrentColorIndex}
          />
        </div>
      </div>
    </div>
  );
}
EOFAPP`

---

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: assemble full App with canvas, toolbar, export panel, and color palette

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Phase 9: TailwindCSS v4 Setup

### Task 11: Configure TailwindCSS v4 with PostCSS

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/postcss.config.js`
- Modify: `apps/web/src/index.css`

---

- [ ] **Step 1: Install TailwindCSS v4**

Run: `cd apps/web && pnpm add -D tailwindcss @tailwindcss/postcss postcss`

---

- [ ] **Step 2: Create postcss.config.js**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Run: `cat > apps/web/postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
EOF`

---

- [ ] **Step 3: Update index.css**

Replace with Tailwind v4 syntax:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0b;
  --color-surface: #141416;
  --color-border: #2a2a2e;
  --color-text-primary: #e4e4e7;
  --color-text-secondary: #71717a;
  --color-accent: #6366f1;
  --color-canvas-bg: #18181b;
}
```

Run: `cat > apps/web/src/index.css << 'EOFCSS'
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0b;
  --color-surface: #141416;
  --color-border: #2a2a2e;
  --color-text-primary: #e4e4e7;
  --color-text-secondary: #71717a;
  --color-accent: #6366f1;
  --color-canvas-bg: #18181b;
}
EOFCSS`

---

- [ ] **Step 4: Update vite.config.ts to handle @leafer packages**

Run: `cat > apps/web/vite.config.ts << 'EOFVITE'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@leafer-include/interface': '@leafer-include/interface',
    },
  },
});
EOFVITE`

---

- [ ] **Step 5: Run dev server to verify**

Run: `cd apps/web && pnpm dev`
Expected: No build errors, app loads in browser

Stop the server.

---

- [ ] **Step 6: Commit**

```bash
git add apps/web/postcss.config.js apps/web/src/index.css
git commit -m "feat: configure TailwindCSS v4 with PostCSS

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Verification Checklist

| Spec Item | Task |
|-----------|------|
| 256-color palette | Task 3 |
| Dominant color pixelation | Task 4 |
| Leafer canvas | Task 5 |
| Grid overlay | Task 5 |
| Undo/redo | Task 5 (useHistory) |
| TopToolbar | Task 6 |
| ExportPanel | Task 7 |
| ColorPalette | Task 8 |
| PNG export | Task 9 |
| ICO export | Task 9 |
| ICNS export | Task 9 |
| localStorage persistence | Task 10 |
| Keyboard shortcuts | Task 10 |
| Image upload + pixelation | Task 10 |
| 6 grid size options | Task 6 (GRID_SIZES) |
| TailwindCSS v4 | Task 11 |

---

## Self-Review

- [ ] All file paths are exact
- [ ] All function signatures are consistent across tasks
- [ ] `renderToCanvas` is defined in `toIco.ts` and imported in `toIcns.ts` — verified
- [ ] `exportToPng` is defined in `toIco.ts` (re-exported from `toPng.ts`) — verified
- [ ] No placeholder comments or TODOs
- [ ] Tests are provided for all pure logic (`palette-256.ts`, `pixelate.ts`)
