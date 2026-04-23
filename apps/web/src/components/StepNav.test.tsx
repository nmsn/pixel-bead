import { describe, it, expect } from 'vitest';
import { StepNav } from './StepNav';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Step } from '../hooks/useStepNavigation';

describe('StepNav', () => {
  const mockOnStepChange = () => {};

  it('renders all 4 steps', () => {
    render(
      <StepNav
        currentStep={2}
        onStepChange={mockOnStepChange}
        completedSteps={new Set([1])}
      />
    );

    // Step 1 shows checkmark since it's completed, steps 2/3/4 show numbers
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders 4 buttons', () => {
    const { container } = render(
      <StepNav
        currentStep={2}
        onStepChange={mockOnStepChange}
        completedSteps={new Set([1])}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(4);
  });

  it('shows current step highlighted with indigo color', () => {
    const { container } = render(
      <StepNav
        currentStep={2}
        onStepChange={mockOnStepChange}
        completedSteps={new Set([1])}
      />
    );

    const buttons = container.querySelectorAll('button');
    const currentStepButton = buttons[1]; // step 2 is index 1
    expect(currentStepButton.className).toContain('bg-[#6366f1]');
  });

  it('shows completed steps with green background and checkmark', () => {
    const { container } = render(
      <StepNav
        currentStep={2}
        onStepChange={mockOnStepChange}
        completedSteps={new Set([1, 3])}
      />
    );

    const buttons = container.querySelectorAll('button');
    // Step 1 (index 0) is completed
    const completedButton = buttons[0];
    expect(completedButton.className).toContain('bg-[#48bb78]');
    expect(completedButton.textContent).toBe('✓');
  });

  it('calls onStepChange when button is clicked', () => {
    let selectedStep: Step | null = null;
    const handleStepChange = (step: Step) => {
      selectedStep = step;
    };

    const { container } = render(
      <StepNav
        currentStep={2}
        onStepChange={handleStepChange}
        completedSteps={new Set([1])}
      />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2]); // Click step 3

    expect(selectedStep).toBe(3);
  });

  it('does not show checkmark for current step even if completed', () => {
    const { container } = render(
      <StepNav
        currentStep={1}
        onStepChange={mockOnStepChange}
        completedSteps={new Set([1])}
      />
    );

    const buttons = container.querySelectorAll('button');
    const currentButton = buttons[0]; // step 1
    // Current step should show the step number, not checkmark
    expect(currentButton.textContent).toBe('1');
    expect(currentButton.className).toContain('bg-[#6366f1]');
  });

  it('renders connector lines between steps', () => {
    const { container } = render(
      <StepNav
        currentStep={2}
        onStepChange={mockOnStepChange}
        completedSteps={new Set([1])}
      />
    );

    // Should have 3 connector divs (between 4 steps)
    const connectors = container.querySelectorAll('.w-8');
    expect(connectors).toHaveLength(3);
  });
});