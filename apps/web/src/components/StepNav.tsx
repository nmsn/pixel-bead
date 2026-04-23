import React from 'react';
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
    <div className="flex items-center justify-center gap-2 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.step}>
          <button
            onClick={() => onStepChange(s.step)}
            className={`w-7 h-7 rounded-full border-2 text-sm font-semibold transition-colors ${
              currentStep === s.step
                ? 'border-[#6366f1] bg-[#6366f1] text-white'
                : completedSteps.has(s.step)
                ? 'border-[#48bb78] bg-[#48bb78] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#6366f1]'
            }`}
          >
            {completedSteps.has(s.step) && s.step !== currentStep ? '✓' : s.step}
          </button>
          {i < STEPS.length - 1 && (
            <div className="w-8 h-0.5 bg-[var(--color-border)]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}