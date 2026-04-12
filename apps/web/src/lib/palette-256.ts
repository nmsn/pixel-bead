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
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const rgb = (r: number, g: number, b: number) =>
    [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('');

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
  // 16 teals
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
  // 16 olive tones
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(100 + i * 8), Math.round(120 + i * 6), Math.round(40 + i * 2)));
  }
  // 16 slate tones
  for (let i = 0; i < 16; i++) {
    colors.push(rgb(Math.round(80 + i * 10), Math.round(90 + i * 8), Math.round(110 + i * 8)));
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