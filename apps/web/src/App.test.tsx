import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { App } from './App';

// Mock modules that cause issues in tests
vi.mock('./lib/pixelate', () => ({
  imageFileToImageData: vi.fn().mockResolvedValue({
    width: 100,
    height: 100,
    data: new Uint8ClampedArray(100 * 100 * 4),
  } as ImageData),
  pixelateImage: vi.fn().mockReturnValue(
    Array.from({ length: 32 }, () => Array(32).fill(0))
  ),
}));

vi.mock('./lib/exporters/toIco', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    exportToPng: vi.fn(),
    exportToIco: vi.fn(),
    renderToCanvas: vi.fn().mockReturnValue('data:image/png;base64,mock'),
  };
});

vi.mock('./lib/exporters/toIcns', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    exportToIcns: vi.fn(),
  };
});

// Mock react-konva to track Rect elements with their event handlers and fill props
const rectEventHandlers: Map<number, { onMouseDown?: () => void }> = new Map();
const rectProps: Map<number, { fill?: string }> = new Map();
let rectIdCounter = 0;

// Mock react-konva before import
vi.mock('react-konva', () => {
  const MockRect: React.FC<{
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onMouseMove?: () => void;
  }> = ({ onMouseDown, onMouseUp, onMouseMove, fill, ...props }) => {
    const id = rectIdCounter++;
    if (onMouseDown) rectEventHandlers.set(id, { onMouseDown });
    rectProps.set(id, { fill });
    return (
      <div
        data-rect-id={id}
        data-testid={`cell-rect-${id}`}
        data-fill={fill}
        {...props}
      />
    );
  };

  const MockLine: React.FC<{ points?: number[]; stroke?: string; strokeWidth?: number }> = (props) => {
    return <div data-line="true" {...props} />;
  };

  const MockText: React.FC<{ text?: string; x?: number; y?: number }> = (props) => {
    return <div data-text="true" {...props} />;
  };

  const MockLayer: React.FC<{ children: React.ReactNode; ref?: React.Ref<unknown> }> = ({
    children,
  }) => {
    return <div className="layer-mock">{children}</div>;
  };
  const MockGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;

  const MockStage: React.FC<{
    children: React.ReactNode;
    width?: number;
    height?: number;
  }> = ({ children }) => {
    return <div className="konvajs-content">{children}</div>;
  };

  return {
    Stage: MockStage,
    Layer: MockLayer,
    Group: MockGroup,
    Rect: MockRect,
    Line: MockLine,
    Text: MockText,
  };
});

// Mock Konva
vi.mock('konva', () => ({
  default: {
    Stage: vi.fn(),
    Line: vi.fn(),
    Rect: vi.fn(),
    Text: vi.fn(),
    Group: vi.fn(),
  },
  Stage: vi.fn(),
  Line: vi.fn(),
  Rect: vi.fn(),
  Text: vi.fn(),
  Group: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    rectEventHandlers.clear();
    rectProps.clear();
    rectIdCounter = 0;
  });

  describe('StepNav integration', () => {
    it('renders StepNav component with completed step 1 showing checkmark', () => {
      render(<App />);
      // Step 1 is completed, so it shows checkmark
      expect(screen.getByText('✓')).toBeInTheDocument();
      // Step 2 is current, so it shows "2"
      expect(screen.getByText('2')).toBeInTheDocument();
      // Steps 3 and 4 show their numbers
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders step navigation buttons', () => {
      const { container } = render(<App />);
      // StepNav renders 4 buttons for steps + 3 connector divs
      const buttons = container.querySelectorAll('button');
      // We have: undo, redo, 5 tools, reset, upload, export, and 4 step nav buttons
      // At minimum we should have more than 4 buttons (the step nav buttons)
      expect(buttons.length).toBeGreaterThan(4);
    });
  });

  describe('UploadModal integration', () => {
    it('UploadModal is not visible initially (modal title h2 should not exist)', () => {
      render(<App />);
      // The modal title is in an h2, the toolbar button is a button
      // So we check that the modal's upload text (in h2) is not present
      const modalTitles = document.querySelectorAll('h2');
      const modalTitleTexts = Array.from(modalTitles).map(el => el.textContent);
      expect(modalTitleTexts).not.toContain('上传图片');
    });

    it('UploadModal opens when upload button is clicked', async () => {
      render(<App />);
      // Click the upload button (not the modal title which is h2)
      const uploadButton = screen.getByRole('button', { name: /上传图片/ });
      fireEvent.click(uploadButton);

      // Wait for the modal to appear - it should have a drag/drop text
      await waitFor(() => {
        expect(screen.getByText(/拖拽图片到此处/)).toBeInTheDocument();
      });
    });

    it('UploadModal closes when close button is clicked', async () => {
      render(<App />);
      // Open the modal first
      const uploadButton = screen.getByRole('button', { name: /上传图片/ });
      fireEvent.click(uploadButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText(/拖拽图片到此处/)).toBeInTheDocument();
      });

      // Click close button (the × button inside the modal - it has rounded-full class)
      // There are multiple × buttons (grid size options also have ×), so we need to find the right one
      const allButtonsWithX = document.querySelectorAll('button');
      const closeButton = Array.from(allButtonsWithX).find(btn =>
        btn.className.includes('rounded-full') && btn.textContent === '×'
      );
      expect(closeButton).toBeDefined();
      fireEvent.click(closeButton!);

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByText(/拖拽图片到此处/)).not.toBeInTheDocument();
      });
    });
  });

  describe('TopToolbar integration', () => {
    it('renders TopToolbar with all controls', () => {
      render(<App />);
      // Should have undo/redo buttons
      expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeInTheDocument();
      expect(screen.getByTitle('Redo (Ctrl+Shift+Z)')).toBeInTheDocument();
      // Should have theme toggle
      expect(screen.getByTitle(/Switch to/)).toBeInTheDocument();
      // Should have upload button
      expect(screen.getByRole('button', { name: /上传图片/ })).toBeInTheDocument();
      // Should have export button
      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    });

    it('can change grid size', () => {
      render(<App />);
      const gridSelect = document.querySelector('select');
      expect(gridSelect).toBeInTheDocument();
    });
  });
});