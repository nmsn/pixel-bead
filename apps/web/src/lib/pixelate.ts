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
): RGB | null {
  const colorCount = new Map<string, number>();

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const idx = (row * imgWidth + col) * 4;
      const alpha = data[idx + 3];
      if (alpha === 0) continue;
      const key = `${data[idx]},${data[idx + 1]},${data[idx + 2]}`;
      colorCount.set(key, (colorCount.get(key) || 0) + 1);
    }
  }

  let maxCount = 0;
  let dominant: RGB | null = null;
  for (const [key, count] of colorCount) {
    if (count > maxCount) {
      maxCount = count;
      const [r, g, b] = key.split(',').map(Number);
      dominant = { r, g, b };
    }
  }

  return dominant;
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
      } else if (rgb === null) {
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
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}