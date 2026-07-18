import { useRef, useCallback, useMemo } from "react";
import { MetricsEngine } from "../lib/metrics";
import { DynamicDifficultyAdjuster, HintOverrides } from "../lib/dda";

let engineCache: Map<string, MetricsEngine> = new Map();

function getEngine(profileName: string): MetricsEngine {
  if (!engineCache.has(profileName)) {
    engineCache.set(profileName, new MetricsEngine(profileName));
  }
  return engineCache.get(profileName)!;
}

export function useGameMetrics(profileName: string) {
  const engine = getEngine(profileName);
  const dda = useMemo(() => new DynamicDifficultyAdjuster(engine), [engine]);
  const interactionStart = useRef<Map<string, number>>(new Map());

  const startInteraction = useCallback((wordId: string) => {
    interactionStart.current.set(wordId, Date.now());
  }, []);

  const recordResult = useCallback((wordId: string, correct: boolean, hintUsed: boolean) => {
    const startTime = interactionStart.current.get(wordId);
    const latencyMs = startTime ? Date.now() - startTime : 0;
    engine.recordResult(wordId, correct, latencyMs, hintUsed);
    interactionStart.current.delete(wordId);
  }, [engine]);

  const recordHint = useCallback((wordId: string) => {
    engine.recordHint(wordId);
  }, [engine]);

  const save = useCallback(() => {
    engine.save();
  }, [engine]);

  const getHintOverrides = useCallback((wordId: string): HintOverrides | null => {
    return dda.getHintOverrides(wordId);
  }, [dda]);

  return {
    startInteraction,
    recordResult,
    recordHint,
    save,
    getHintOverrides,
    engine,
    dda,
  };
}
