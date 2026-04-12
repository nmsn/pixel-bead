import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial]);
  const [pointer, setPointer] = useState(0);
  const lastPointerRef = useRef(0);

  const push = useCallback((state: T, force = false) => {
    const serialized = JSON.stringify(state);
    const currentSerialized = JSON.stringify(history[pointer]);
    if (!force && serialized === currentSerialized) return;

    setHistory((prev) => {
      const truncated = prev.slice(0, lastPointerRef.current + 1);
      const next = [...truncated, state].slice(-MAX_HISTORY);
      lastPointerRef.current = next.length - 1;
      setPointer(next.length - 1);
      return next;
    });
  }, [history, pointer]);

  const undo = useCallback((): T | null => {
    if (pointer <= 0) return null;
    const newPointer = pointer - 1;
    setPointer(newPointer);
    lastPointerRef.current = newPointer;
    return history[newPointer];
  }, [pointer, history]);

  const redo = useCallback((): T | null => {
    if (pointer >= history.length - 1) return null;
    const newPointer = pointer + 1;
    setPointer(newPointer);
    lastPointerRef.current = newPointer;
    return history[newPointer];
  }, [pointer, history]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  return { push, undo, redo, canUndo, canRedo };
}