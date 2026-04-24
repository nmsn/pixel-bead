import React from 'react';
import { Check } from 'lucide-react';
import type { Step } from '../hooks/useStepNavigation';

interface StepNavProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  completedSteps: Set<Step>;
}

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: '上传' },
  { step: 2, label: '编辑' },
  { step: 3, label: '背景' },
  { step: 4, label: '导出' },
];

export function StepNav({ currentStep, onStepChange, completedSteps }: StepNavProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      {STEPS.map((s, i) => {
        const isActive = currentStep === s.step;
        const isCompleted = completedSteps.has(s.step);
        const isClickable = !isActive;

        return (
          <React.Fragment key={s.step}>
            <button
              onClick={() => isClickable && onStepChange(s.step)}
              disabled={!isClickable}
              className={`
                w-8 h-8 rounded-full border-2 text-sm font-medium
                flex items-center justify-center
                transition-all duration-200
                ${isActive
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-sm'
                  : isCompleted
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                }
                ${!isClickable ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {isCompleted && !isActive ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                s.step
              )}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 rounded ${
                completedSteps.has(s.step) ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
