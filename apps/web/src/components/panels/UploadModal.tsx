import { useState, useRef, useCallback } from 'react';
import { imageFileToImageData, pixelateImage } from '../../lib/pixelate';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (gridData: number[][], gridSize: [number, number]) => void;
}

const GRID_SIZES: [number, number][] = [
  [16, 16], [32, 32], [64, 64], [128, 128], [256, 256],
];

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [selectedSize, setSelectedSize] = useState<[number, number]>([64, 64]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDataRef, setImageDataRef] = useState<ImageData | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const dataUrl = URL.createObjectURL(file);
    setPreview(dataUrl);

    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = dataUrl;

    const imageData = await imageFileToImageData(file);
    setImageDataRef(imageData);
  }, []);

  const handleConvert = useCallback(() => {
    if (!imageDataRef) return;
    const gridData = pixelateImage(imageDataRef, selectedSize);
    onUpload(gridData, selectedSize);
    onClose();
  }, [imageDataRef, selectedSize, onUpload, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-surface)] rounded-xl w-[480px] max-w-[90vw] shadow-xl">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">上传图片</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">×</button>
        </div>
        <div className="p-4">
          {/* Upload zone */}
          <div
            className={`border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#6366f1] bg-[#6366f1]/10'
                : 'hover:border-[#6366f1] hover:bg-[#6366f1]/5'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                handleFileSelect(file);
              }
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-w-full max-h-[180px] rounded-lg border border-[var(--color-border)]" />
            ) : (
              <>
                <div className="text-4xl mb-3">🖼️</div>
                <div className="text-[var(--color-text-secondary)] text-sm">
                  拖拽图片到此处，或 <span className="text-[#6366f1]">点击选择文件</span>
                </div>
              </>
            )}
            {imageSize && (
              <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {imageSize.width} × {imageSize.height}
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {/* Grid size selection */}
          <div className="mt-4">
            <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">网格数量</div>
            <div className="grid grid-cols-3 gap-2">
              {GRID_SIZES.map(([w, h]) => (
                <button
                  key={`${w}x${h}`}
                  className={`py-2 border-2 rounded-md text-sm ${
                    selectedSize[0] === w
                      ? 'border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]'
                      : 'border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[#6366f1]'
                  }`}
                  onClick={() => setSelectedSize([w, h])}
                >
                  {w} × {h}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-hover)]">取消</button>
          <button
            onClick={handleConvert}
            disabled={!imageDataRef}
            className="px-4 py-2 rounded bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] disabled:bg-[var(--color-text-secondary)] disabled:cursor-not-allowed"
          >
            转换为像素画布
          </button>
        </div>
      </div>
    </div>
  );
}