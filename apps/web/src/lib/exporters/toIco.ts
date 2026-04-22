import { PALETTE } from '../palette-256';

export interface FrameOptions {
  backgroundColor?: string;
  cornerRadius?: number;
  iconScale?: number;
}

// renderToCanvas is exported so toIcns.ts can reuse it
export function renderToCanvas(
  gridData: number[][],
  gridSize: [number, number],
  outputSize: number,
  options: FrameOptions = {}
): string {
  const [cols, rows] = gridSize;
  const { backgroundColor, cornerRadius = 0, iconScale = 1 } = options;

  if (cols <= 0 || rows <= 0 || outputSize <= 0) {
    // Return empty canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/png');
  }
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  // Draw rounded background only when explicitly provided (transparent by default)
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, outputSize, outputSize, cornerRadius);
    ctx.fill();
  }

  // Calculate icon size based on scale
  const iconSize = outputSize * iconScale;
  const cellSize = iconSize / Math.max(cols, rows);
  const offsetX = (outputSize - iconSize) / 2;
  const offsetY = (outputSize - iconSize) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = gridData[row]?.[col];
      if (colorIndex === -1 || colorIndex === undefined) {
        // Skip transparent pixels (show background)
      } else {
        ctx.fillStyle = '#' + PALETTE.colors[colorIndex];
        ctx.fillRect(offsetX + col * cellSize, offsetY + row * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function exportToPng(
  gridData: number[][],
  gridSize: [number, number],
  outputSize: number,
  options: FrameOptions = {}
): void {
  const dataUrl = renderToCanvas(gridData, gridSize, outputSize, options);
  const link = document.createElement('a');
  link.download = `pixel-icon-${outputSize}x${outputSize}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportToIco(
  gridData: number[][],
  gridSize: [number, number],
  options: FrameOptions = {}
): Promise<void> {
  const sizes = [16, 32, 48, 256];

  function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
  }

  const dataUrls = sizes.map((size) => renderToCanvas(gridData, gridSize, size, options));
  const pngBuffers = dataUrls.map(dataUrlToBuffer);
  const pngSizes = pngBuffers.map((b) => b.byteLength);

  const headerSize = 6 + sizes.length * 16;
  const header = new Uint8Array(headerSize);
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