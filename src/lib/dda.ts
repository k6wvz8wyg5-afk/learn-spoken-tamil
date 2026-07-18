import { MetricsEngine, WordTier } from "./metrics";

export interface DDAConfig {
  dopamineSandwichEnabled: boolean;
  microScaffoldingEnabled: boolean;
  quarantineEnabled: boolean;
}

export interface HintOverrides {
  subtleDelayMs: number;
  strongDelayMs: number;
}

const DEFAULT_CONFIG: DDAConfig = {
  dopamineSandwichEnabled: true,
  microScaffoldingEnabled: true,
  quarantineEnabled: true,
};

export class DynamicDifficultyAdjuster {
  private engine: MetricsEngine;
  private config: DDAConfig;

  constructor(engine: MetricsEngine, config: Partial<DDAConfig> = {}) {
    this.engine = engine;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Dopamine Sandwich: When FAAR < 0.5, interleave mastered items
   * after every 2 new items to guarantee ~66% success rate.
   */
  applyDopamineSandwich<T extends { tamilWord?: string; id?: string }>(
    items: T[],
    masteredItems: T[]
  ): T[] {
    if (!this.config.dopamineSandwichEnabled || masteredItems.length === 0) {
      return items;
    }

    const overallFAAR = this.engine.getSummary().overallFAAR;
    if (overallFAAR >= 0.5) return items;

    const result: T[] = [];
    let masteredIdx = 0;

    for (let i = 0; i < items.length; i++) {
      result.push(items[i]);
      if ((i + 1) % 2 === 0 && masteredIdx < masteredItems.length) {
        result.push(masteredItems[masteredIdx % masteredItems.length]);
        masteredIdx++;
      }
    }

    return result;
  }

  /**
   * Micro-Scaffolding: After 3+ consecutive failures on a word,
   * halve the hint delays to provide support sooner.
   */
  getHintOverrides(wordId: string): HintOverrides | null {
    if (!this.config.microScaffoldingEnabled) return null;

    const failures = this.engine.getConsecutiveFailures(wordId);
    if (failures >= 3) {
      return {
        subtleDelayMs: 2000,
        strongDelayMs: 3000,
      };
    }
    return null;
  }

  /**
   * Lexical Quarantine: After 5+ consecutive failures across modalities,
   * mark a word as quarantined. It should be removed from the critical path.
   */
  shouldQuarantine(wordId: string): boolean {
    if (!this.config.quarantineEnabled) return false;
    return this.engine.isQuarantined(wordId);
  }

  /**
   * Filter quarantined words from a lesson's items.
   */
  filterQuarantined<T extends { tamilWord?: string; id?: string }>(items: T[]): T[] {
    if (!this.config.quarantineEnabled) return items;
    return items.filter((item) => {
      const wordId = item.tamilWord || item.id || "";
      return !this.engine.isQuarantined(wordId);
    });
  }

  /**
   * Get tier for a word to inform modality decisions.
   */
  getWordTier(wordId: string): WordTier {
    return this.engine.getTier(wordId);
  }

  /**
   * Suggest whether a word should pivot to a different modality.
   * After 3+ consecutive speaking failures, suggest listening/dragdrop.
   */
  shouldPivotModality(wordId: string, currentModality: string): string | null {
    const failures = this.engine.getConsecutiveFailures(wordId);
    if (failures < 3) return null;

    if (currentModality === "speaking") return "listening";
    if (currentModality === "dragdrop") return "listening";
    if (currentModality === "sorting") return "matching";
    return null;
  }
}
