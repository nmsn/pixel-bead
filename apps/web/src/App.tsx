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
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

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
            tool={state.tool}
            onCellClick={handleCellClick}
            onCellDrag={handleCellDrag}
            onDragStart={() => setIsDragging(true)}
            panOffset={panOffset}
            onPanChange={setPanOffset}
            onZoomChange={setZoom}
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
