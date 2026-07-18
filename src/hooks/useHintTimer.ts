import { useState, useEffect, useRef, useCallback } from "react";

export type HintLevel = "none" | "subtle" | "strong";

interface UseHintTimerOptions {
  enabled?: boolean;
  subtleDelayMs?: number;
  strongDelayMs?: number;
  onSubtleHint?: () => void;
  onStrongHint?: () => void;
}

interface UseHintTimerReturn {
  hintLevel: HintLevel;
  resetHints: () => void;
  cancelHints: () => void;
}

export function useHintTimer({
  enabled = true,
  subtleDelayMs = 4000,
  strongDelayMs = 6000,
  onSubtleHint,
  onStrongHint,
}: UseHintTimerOptions = {}): UseHintTimerReturn {
  const [hintLevel, setHintLevel] = useState<HintLevel>("none");
  const subtleRef = useRef<number | null>(null);
  const strongRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (subtleRef.current) {
      clearTimeout(subtleRef.current);
      subtleRef.current = null;
    }
    if (strongRef.current) {
      clearTimeout(strongRef.current);
      strongRef.current = null;
    }
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    if (!enabled) return;

    subtleRef.current = window.setTimeout(() => {
      setHintLevel("subtle");
      onSubtleHint?.();
    }, subtleDelayMs);

    strongRef.current = window.setTimeout(() => {
      setHintLevel("strong");
      onStrongHint?.();
    }, strongDelayMs);
  }, [enabled, subtleDelayMs, strongDelayMs, onSubtleHint, onStrongHint, clearTimers]);

  const resetHints = useCallback(() => {
    setHintLevel("none");
    startTimers();
  }, [startTimers]);

  const cancelHints = useCallback(() => {
    setHintLevel("none");
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    startTimers();
    return clearTimers;
  }, [startTimers, clearTimers]);

  return { hintLevel, resetHints, cancelHints };
}
