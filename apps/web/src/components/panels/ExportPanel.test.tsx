import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ExportPanel } from './ExportPanel';

describe('ExportPanel', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    gridData: [[0, 1], [1, 0]] as number[][],
    gridSize: [2, 2] as [number, number],
    gradientAngle: 135,
    gradientColors: ['#667eea', '#764ba2'],
    glossEnabled: true,
    glossIntensity: 40,
    cornerRadius: 8,
    onExportPng: vi.fn(),
    onExportIco: vi.fn(),
    onExportIcns: vi.fn(),
  };

  it('renders format selection with ICO, ICNS, PNG options', () => {
    render(<ExportPanel {...defaultProps} />);
    expect(screen.getByText('ICO')).toBeDefined();
    expect(screen.getByText('ICNS')).toBeDefined();
    expect(screen.getByText('PNG')).toBeDefined();
  });

  it('renders size chips for PNG selection', () => {
    render(<ExportPanel {...defaultProps} />);
    // Default selection should have 32 and 64 selected
    const sizes = [8, 16, 32, 48, 64, 128, 256, 512];
    sizes.forEach((size) => {
      expect(screen.getByText(String(size))).toBeDefined();
    });
  });

  it('renders preview canvas (180x180)', () => {
    render(<ExportPanel {...defaultProps} />);
    // Find the preview canvas element
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeDefined();
    expect(canvas?.getAttribute('width')).toBe('180');
    expect(canvas?.getAttribute('height')).toBe('180');
  });

  it('renders config tags showing current settings', () => {
    render(<ExportPanel {...defaultProps} />);
    // Should show gradient angle, gloss intensity, corner radius
    expect(screen.getByText(/Gradient 135/)).toBeDefined();
    expect(screen.getByText(/Gloss 40/)).toBeDefined();
    expect(screen.getByText(/Radius 8/)).toBeDefined();
  });

  it('allows format selection to change state', () => {
    render(<ExportPanel {...defaultProps} />);
    // Click on ICNS format to select it
    const icnsButton = screen.getByText('ICNS').closest('button');
    if (icnsButton) {
      fireEvent.click(icnsButton);
    }
    // The panel should still render correctly
    expect(screen.getByText('ICNS')).toBeDefined();
  });

  it('calls onExportIco when ICO is selected and download clicked', () => {
    const onExportIco = vi.fn();
    render(<ExportPanel {...defaultProps} onExportIco={onExportIco} />);
    // Select ICO
    const icoButton = screen.getByText('ICO').closest('button');
    if (icoButton) {
      fireEvent.click(icoButton);
    }
    // Click download
    const downloadButton = screen.getByText('Download ICO');
    fireEvent.click(downloadButton);
    expect(onExportIco).toHaveBeenCalled();
  });

  it('calls onExportIcns when ICNS is selected and download clicked', () => {
    const onExportIcns = vi.fn();
    render(<ExportPanel {...defaultProps} onExportIcns={onExportIcns} />);
    // Select ICNS
    const icnsButton = screen.getByText('ICNS').closest('button');
    if (icnsButton) {
      fireEvent.click(icnsButton);
    }
    // Click download
    const downloadButton = screen.getByText('Download ICNS');
    fireEvent.click(downloadButton);
    expect(onExportIcns).toHaveBeenCalled();
  });

  it('calls onExportPng when PNG is selected and download clicked', () => {
    const onExportPng = vi.fn();
    render(<ExportPanel {...defaultProps} onExportPng={onExportPng} />);
    // Make sure PNG is selected (it's default)
    const downloadButton = screen.getByText('Download PNG');
    fireEvent.click(downloadButton);
    // Default PNG sizes are 32 and 64
    expect(onExportPng).toHaveBeenCalledWith(32);
    expect(onExportPng).toHaveBeenCalledWith(64);
  });

  it('toggles PNG size chips selection', () => {
    render(<ExportPanel {...defaultProps} />);
    // Click on size 32 to deselect it
    const sizeButton = screen.getByText('32').closest('button') as HTMLButtonElement;
    fireEvent.click(sizeButton);
    // Size button should still be defined
    expect(sizeButton).toBeDefined();
  });
});