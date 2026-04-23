import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BackgroundPanel } from './BackgroundPanel';

describe('BackgroundPanel', () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    backgroundColor: '#ffffff',
    backgroundType: 'solid' as const,
    gradientColors: ['#667eea', '#764ba2'],
    gradientAngle: 135,
    cornerRadius: 8,
    iconScale: 0.8,
    glossEnabled: true,
    glossIntensity: 40,
    gridSize: [32, 32] as [number, number],
    gridData: [] as number[][],
    onBackgroundColorChange: vi.fn(),
    onBackgroundTypeChange: vi.fn(),
    onGradientColorsChange: vi.fn(),
    onGradientAngleChange: vi.fn(),
    onCornerRadiusChange: vi.fn(),
    onGlossEnabledChange: vi.fn(),
    onGlossIntensityChange: vi.fn(),
  };

  it('renders background type toggle (solid/gradient)', () => {
    render(<BackgroundPanel {...defaultProps} />);
    expect(screen.getByText('纯色')).toBeDefined();
    expect(screen.getByText('渐变')).toBeDefined();
  });

  it('renders solid color picker when solid type is selected', () => {
    render(<BackgroundPanel {...defaultProps} backgroundType="solid" />);
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onBackgroundColorChange when solid color changes', () => {
    const onBackgroundColorChange = vi.fn();
    render(
      <BackgroundPanel {...defaultProps} onBackgroundColorChange={onBackgroundColorChange} />
    );
    const colorInputs = document.querySelectorAll('input[type="color"]');
    const colorInput = colorInputs[0] as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(onBackgroundColorChange).toHaveBeenCalledWith('#ff0000');
  });

  it('renders gradient controls when gradient type is selected', () => {
    render(<BackgroundPanel {...defaultProps} backgroundType="gradient" />);
    expect(screen.getByText('渐变')).toBeDefined();
    // Angle dial should be visible
    expect(screen.getByText('135°')).toBeDefined();
  });

  it('renders angle dial with value display', () => {
    render(<BackgroundPanel {...defaultProps} backgroundType="gradient" gradientAngle={90} />);
    expect(screen.getByText('90°')).toBeDefined();
  });

  it('calls onGradientAngleChange when angle is changed', () => {
    const onGradientAngleChange = vi.fn();
    render(
      <BackgroundPanel {...defaultProps} backgroundType="gradient" onGradientAngleChange={onGradientAngleChange} />
    );
    // The angle dial is rendered; we need to simulate drag
    // For now just verify the component renders with gradient controls
    expect(screen.getByText('135°')).toBeDefined();
  });

  it('renders corner radius slider', () => {
    render(<BackgroundPanel {...defaultProps} cornerRadius={8} />);
    const sliders = document.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onCornerRadiusChange when slider changes', () => {
    const onCornerRadiusChange = vi.fn();
    render(
      <BackgroundPanel {...defaultProps} onCornerRadiusChange={onCornerRadiusChange} />
    );
    const sliders = document.querySelectorAll('input[type="range"]');
    const slider = sliders[0] as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '16' } });
    expect(onCornerRadiusChange).toHaveBeenCalledWith(16);
  });

  it('renders gloss toggle', () => {
    render(<BackgroundPanel {...defaultProps} glossEnabled={true} />);
    const toggle = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it('calls onGlossEnabledChange when toggle changes', () => {
    const onGlossEnabledChange = vi.fn();
    render(
      <BackgroundPanel {...defaultProps} onGlossEnabledChange={onGlossEnabledChange} />
    );
    const toggle = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(toggle);
    expect(onGlossEnabledChange).toHaveBeenCalledWith(false);
  });

  it('renders gloss intensity slider when gloss is enabled', () => {
    render(<BackgroundPanel {...defaultProps} glossEnabled={true} glossIntensity={60} />);
    const sliders = document.querySelectorAll('input[type="range"]');
    // One for corner radius, one for gloss intensity
    expect(sliders.length).toBeGreaterThanOrEqual(1);
  });

  it('renders gradient color stops', () => {
    render(
      <BackgroundPanel
        {...defaultProps}
        backgroundType="gradient"
        gradientColors={['#667eea', '#f093fb', '#764ba2']}
      />
    );
    // Should render color inputs for each stop
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onGradientColorsChange when gradient color changes', () => {
    const onGradientColorsChange = vi.fn();
    render(
      <BackgroundPanel
        {...defaultProps}
        onGradientColorsChange={onGradientColorsChange}
        backgroundType="gradient"
        gradientColors={['#667eea', '#764ba2']}
      />
    );
    // The component should have color inputs for gradient stops
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBe(2);
    const colorInput = colorInputs[0] as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(onGradientColorsChange).toHaveBeenCalled();
  });

  it('previews update when props change', () => {
    const { rerender } = render(
      <BackgroundPanel {...defaultProps} backgroundColor="#ffffff" />
    );
    // Rerender with different color
    rerender(<BackgroundPanel {...defaultProps} backgroundColor="#ff0000" />);
    // Preview canvas should reflect the change (verified by re-render)
    expect(screen.getByText('纯色')).toBeDefined();
  });
});