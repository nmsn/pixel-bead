import { render } from '@testing-library/react';
import { PixelCanvas } from './PixelCanvas';

describe('PixelCanvas', () => {
  it('renders a Konva Stage', () => {
    const mockGrid = Array(8).fill(null).map(() => Array(8).fill(-1));
    render(
      <PixelCanvas
        gridData={mockGrid}
        gridSize={[8, 8]}
        zoom={1}
        panOffset={{ x: 0, y: 0 }}
        onCellClick={jest.fn()}
        isDark={false}
      />
    );
    // Konva creates a container div with stage-content class
    const container = document.querySelector('.konvajs-content');
    expect(container).toBeInTheDocument();
  });
});