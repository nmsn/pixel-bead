export interface ProjectData {
  version: 1;
  gridData: number[][];    // -1 = transparent, 0-255 = palette index
  gridSize: [number, number];
  lastModified: number;
}

export type Tool = 'select' | 'pen' | 'bucket' | 'eraser' | 'eyedropper';

export interface ExportFormat {
  type: 'png' | 'ico' | 'icns';
  size?: number;           // for PNG, e.g. 32
}
