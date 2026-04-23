import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadModal } from './UploadModal';

// Mock the pixelate module
vi.mock('../../lib/pixelate', () => ({
  imageFileToImageData: vi.fn(),
  pixelateImage: vi.fn(),
}));

describe('UploadModal', () => {
  const mockOnClose = vi.fn();
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    cleanup();
    mockOnClose.mockClear();
    mockOnUpload.mockClear();
  });

  it('renders nothing when isOpen=false', () => {
    render(
      <UploadModal
        isOpen={false}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
      />
    );
    expect(screen.queryByText('上传图片')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen=true', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
      />
    );
    expect(screen.getByText('上传图片')).toBeInTheDocument();
  });

  it('shows upload zone initially with no preview', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
      />
    );
    // Should show upload prompt text
    expect(screen.getByText(/拖拽图片到此处/)).toBeInTheDocument();
    // Should not show any image preview
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows preview after file selection', async () => {
    const { imageFileToImageData } = await import('../../lib/pixelate');
    vi.mocked(imageFileToImageData).mockResolvedValue({
      width: 100,
      height: 100,
      data: new Uint8ClampedArray(100 * 100 * 4),
    } as ImageData);

    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
      />
    );

    // Get the hidden file input by type
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a mock file
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    // Trigger change on the hidden file input
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // The preview image should appear (after the async file processing)
    await vi.waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  it('grid size buttons render correctly', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
      />
    );

    // Check all grid size buttons exist
    expect(screen.getByText('16 × 16')).toBeInTheDocument();
    expect(screen.getByText('32 × 32')).toBeInTheDocument();
    expect(screen.getByText('64 × 64')).toBeInTheDocument();
    expect(screen.getByText('128 × 128')).toBeInTheDocument();
    expect(screen.getByText('256 × 256')).toBeInTheDocument();
  });

  it('convert button is disabled until image uploaded', () => {
    render(
      <UploadModal
        isOpen={true}
        onClose={mockOnClose}
        onUpload={mockOnUpload}
      />
    );

    const convertButton = screen.getByRole('button', { name: /转换为像素画布/ });
    expect(convertButton).toBeDisabled();
  });
});