import { useState, useCallback } from 'react';
import { Tool } from 'shared/src/types';

export interface PixelCanvasState {
  gridData: number[][];
  gridSize: [number, number];
  tool: Tool;
  currentColorIndex: number | null; // null = transparent, 0-255 = palette index
  zoom: number;
  selectedCells: Set<string>;
  selectionStyle: 'outline' | 'overlay' | 'inset';
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient';
  gradientColors: string[];
  gradientAngle: number;
  cornerRadius: number;
  iconScale: number;
  isDark: boolean;
  glossEnabled: boolean;
  glossIntensity: number;
}

export function usePixelCanvas() {
  const [state, setState] = useState<PixelCanvasState>({
    gridData: [],
    gridSize: [32, 32],
    tool: 'pen',
    currentColorIndex: null,
    zoom: 1,
    selectedCells: new Set<string>(),
    selectionStyle: 'outline',
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    gradientColors: ['#667eea', '#764ba2'],
    gradientAngle: 135,
    cornerRadius: 0,
    iconScale: 1,
    isDark: true,
    glossEnabled: true,
    glossIntensity: 40,
  });

  const setGridData = useCallback((data: number[][]) => {
    setState((s) => ({ ...s, gridData: data }));
  }, []);

  const setGridSize = useCallback((size: [number, number]) => {
    setState((s) => {
      const [cols, rows] = size;
      // Extend or trim gridData to match new size, preserving existing cell data
      const newData: number[][] = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => s.gridData[row]?.[col] ?? -1)
      );
      return { ...s, gridSize: size, gridData: newData };
    });
  }, []);

  const setTool = useCallback((tool: Tool) => {
    setState((s) => ({ ...s, tool }));
  }, []);

  const setCurrentColorIndex = useCallback((idx: number | null) => {
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

  const floodFill = useCallback((row: number, col: number, newColor: number | null) => {
    setState((s) => {
      if (row < 0 || row >= s.gridData.length || col < 0 || col >= s.gridData[0]?.length) {
        return s;
      }
      const data = s.gridData.map((r) => [...r]);
      const fillColor = newColor === null ? -1 : newColor;
      const targetColor = data[row][col];
      if (targetColor === fillColor) return s;

      const queue: [number, number][] = [[row, col]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const key = `${r},${c}`;
        if (visited.has(key)) continue;
        if (r < 0 || r >= data.length || c < 0 || c >= data[0].length) continue;
        if (data[r][c] !== targetColor) continue;

        visited.add(key);
        data[r][c] = fillColor;

        queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
      }

      return { ...s, gridData: data };
    });
  }, []);

  const toggleCellSelection = useCallback((row: number, col: number) => {
    setState((s) => {
      const key = `${row},${col}`;
      const next = new Set(s.selectedCells);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...s, selectedCells: next };
    });
  }, []);

  const addToSelection = useCallback((row: number, col: number) => {
    setState((s) => {
      const next = new Set(s.selectedCells);
      next.add(`${row},${col}`);
      return { ...s, selectedCells: next };
    });
  }, []);

  const selectAllByColor = useCallback((colorIndex: number) => {
    setState((s) => {
      const next = new Set<string>();
      s.gridData.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell === colorIndex) next.add(`${r},${c}`);
        })
      );
      return { ...s, selectedCells: next };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((s) => ({ ...s, selectedCells: new Set() }));
  }, []);

  const applyColorToSelection = useCallback((colorIndex: number) => {
    setState((s) => {
      const newData = s.gridData.map((r) => [...r]);
      s.selectedCells.forEach((key) => {
        const [r, c] = key.split(',').map(Number);
        newData[r][c] = colorIndex;
      });
      return { ...s, gridData: newData, selectedCells: new Set() };
    });
  }, []);

  const setSelectionStyle = useCallback((style: 'outline' | 'overlay' | 'inset') => {
    setState((s) => ({ ...s, selectionStyle: style }));
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    setState((s) => ({ ...s, backgroundColor: color }));
  }, []);

  const setBackgroundType = useCallback((type: 'solid' | 'gradient') => {
    setState((s) => ({ ...s, backgroundType: type }));
  }, []);

  const setGradientColors = useCallback((colors: string[]) => {
    setState((s) => ({ ...s, gradientColors: colors }));
  }, []);

  const setGradientAngle = useCallback((angle: number) => {
    setState((s) => ({ ...s, gradientAngle: angle }));
  }, []);

  const setCornerRadius = useCallback((radius: number) => {
    setState((s) => ({ ...s, cornerRadius: radius }));
  }, []);

  const setIconScale = useCallback((scale: number) => {
    setState((s) => ({ ...s, iconScale: scale }));
  }, []);

  const setIsDark = useCallback((isDark: boolean) => {
    setState((s) => ({ ...s, isDark }));
  }, []);

  const setGlossEnabled = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, glossEnabled: enabled }));
  }, []);

  const setGlossIntensity = useCallback((intensity: number) => {
    setState((s) => ({ ...s, glossIntensity: intensity }));
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
    toggleCellSelection,
    addToSelection,
    selectAllByColor,
    clearSelection,
    applyColorToSelection,
    setSelectionStyle,
    backgroundColor: state.backgroundColor,
    backgroundType: state.backgroundType,
    gradientColors: state.gradientColors,
    gradientAngle: state.gradientAngle,
    cornerRadius: state.cornerRadius,
    iconScale: state.iconScale,
    isDark: state.isDark,
    glossEnabled: state.glossEnabled,
    glossIntensity: state.glossIntensity,
    setBackgroundColor,
    setBackgroundType,
    setGradientColors,
    setGradientAngle,
    setCornerRadius,
    setIconScale,
    setIsDark,
    setGlossEnabled,
    setGlossIntensity,
  };
}