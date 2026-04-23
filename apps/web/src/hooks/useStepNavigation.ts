import { useState, useCallback } from 'react';

export type Step = 1 | 2 | 3 | 4;

export function useStepNavigation() {
  const [currentStep, setCurrentStep] = useState<Step>(2); // 默认进入编辑画布
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set([1]));

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
  }, []);

  const markStepCompleted = useCallback((step: Step) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }, []);

  return {
    currentStep,
    completedSteps,
    goToStep,
    markStepCompleted,
  };
}