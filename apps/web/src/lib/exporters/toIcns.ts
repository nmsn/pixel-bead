export async function exportToIcns(gridData: number[][], gridSize: [number, number]): Promise<void> {
  const sizes = [128, 256, 512, 1024];
  const typeMap: Record<number, string> = { 128: 'ic07', 256: 'ic08', 512: 'ic09', 1024: 'ic10' };

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

  const chunks: Uint8Array[] = [];
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
    view.setUint32(4, chunkSize, false); // big-endian
    chunk.set(data, 8);
    chunks.push(chunk);
  }

  const headerSize = 8;
  const totalDataSize = chunks.reduce((a, c) => a + c.byteLength, 0);
  const icns = new Uint8Array(headerSize + totalDataSize);
  const magic = new Uint8Array([0x69, 0x63, 0x6e, 0x73]); // "icns"
  icns.set(magic, 0);
  const view = new DataView(icns.buffer);
  view.setUint32(4, headerSize + totalDataSize, false); // big-endian file size
  let pos = headerSize;
  for (const chunk of chunks) {
    icns.set(chunk, pos);
    pos += chunk.byteLength;
  }

  const blob = new Blob([icns], { type: 'image/x-icns' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'pixel-icon.icns';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}