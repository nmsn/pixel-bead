import { describe, it, expect } from 'vitest';
import { useStepNavigation } from './useStepNavigation';
import { renderHook, act } from '@testing-library/react';

describe('useStepNavigation', () => {
  it('has initial state with currentStep = 2 and completedSteps = {1}', () => {
    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.currentStep).toBe(2);
    expect(result.current.completedSteps).toEqual(new Set([1]));
  });

  it('goToStep changes currentStep', () => {
    const { result } = renderHook(() => useStepNavigation());

    act(() => {
      result.current.goToStep(3);
    });

    expect(result.current.currentStep).toBe(3);
  });

  it('goToStep can navigate to any step', () => {
    const { result } = renderHook(() => useStepNavigation());

    act(() => {
      result.current.goToStep(4);
    });
    expect(result.current.currentStep).toBe(4);

    act(() => {
      result.current.goToStep(1);
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('markStepCompleted adds step to completedSteps', () => {
    const { result } = renderHook(() => useStepNavigation());

    act(() => {
      result.current.markStepCompleted(2);
    });

    expect(result.current.completedSteps).toEqual(new Set([1, 2]));
  });

  it('markStepCompleted can add multiple steps', () => {
    const { result } = renderHook(() => useStepNavigation());

    act(() => {
      result.current.markStepCompleted(2);
    });
    act(() => {
      result.current.markStepCompleted(3);
    });

    expect(result.current.completedSteps).toEqual(new Set([1, 2, 3]));
  });

  it('completedSteps is a new Set instance after markStepCompleted', () => {
    const { result } = renderHook(() => useStepNavigation());
    const originalSet = result.current.completedSteps;

    act(() => {
      result.current.markStepCompleted(2);
    });

    expect(result.current.completedSteps).not.toBe(originalSet);
  });
});