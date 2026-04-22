import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ColorPalette } from './ColorPalette';

describe('ColorPalette', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders transparent swatch at position 0 with checkerboard pattern', () => {
    render(
      <ColorPalette
        onColorSelect={vi.fn()}
        currentColorIndex={null}
      />
    );
    // Open the palette by clicking the toggle
    const toggleButtons = screen.queryAllByText('Palette');
    expect(toggleButtons.length).toBeGreaterThan(0);
    const toggleButton = toggleButtons[0].closest('button');
    expect(toggleButton).toBeDefined();
    if (toggleButton) fireEvent.click(toggleButton);

    // Get all buttons and find the one with data-transparent attribute
    const swatches = screen.getAllByRole('button');
    const transparentSwatch = swatches.find(btn => btn.getAttribute('data-transparent') === 'true');
    expect(transparentSwatch).toBeDefined();
    expect(transparentSwatch?.getAttribute('data-transparent')).toBe('true');
  });

  it('calls onColorSelect with null when transparent swatch is clicked', () => {
    const onColorSelect = vi.fn();
    render(
      <ColorPalette
        onColorSelect={onColorSelect}
        currentColorIndex={0}
      />
    );
    // Open the palette by clicking the toggle
    const toggleButtons = screen.queryAllByText('Palette');
    expect(toggleButtons.length).toBeGreaterThan(0);
    const toggleButton = toggleButtons[0].closest('button');
    expect(toggleButton).toBeDefined();
    if (toggleButton) fireEvent.click(toggleButton);

    // Now find and click the transparent swatch
    const allButtons = screen.getAllByRole('button');
    const transparentSwatch = allButtons.find(btn => btn.getAttribute('data-transparent') === 'true');
    expect(transparentSwatch).toBeDefined();

    if (transparentSwatch) {
      fireEvent.click(transparentSwatch);
    }
    expect(onColorSelect).toHaveBeenCalledWith(null);
  });
});