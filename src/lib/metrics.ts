export type WordTier = "mastered" | "familiar" | "acquiring";

export interface WordMetric {
  wordId: string;
  attempts: number;
  firstAttemptCorrect: number;
  totalCorrect: number;
  hintUsageCount: number;
  latencies: number[];
  consecutiveFailures: number;
  lastSeen: number;
  quarantined: boolean;
  quarantinedAt?: number;
}

export interface MetricsSummary {
  totalWords: number;
  mastered: number;
  familiar: number;
  acquiring: number;
  overallFAAR: number;
}

const STORAGE_PREFIX = "tamil_kid_word_metrics_";

function getStorageKey(profileName: string): string {
  return STORAGE_PREFIX + profileName.toLowerCase().replace(/\s+/g, "_");
}

export class MetricsEngine {
  private metrics: Map<string, WordMetric> = new Map();
  private profileName: string;

  constructor(profileName: string) {
    this.profileName = profileName;
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(getStorageKey(this.profileName));
      if (raw) {
        const parsed: WordMetric[] = JSON.parse(raw);
        parsed.forEach((m) => this.metrics.set(m.wordId, m));
      }
    } catch {}
  }

  save() {
    try {
      const data = Array.from(this.metrics.values());
      localStorage.setItem(getStorageKey(this.profileName), JSON.stringify(data));
    } catch {}
  }

  private getOrCreate(wordId: string): WordMetric {
    if (!this.metrics.has(wordId)) {
      this.metrics.set(wordId, {
        wordId,
        attempts: 0,
        firstAttemptCorrect: 0,
        totalCorrect: 0,
        hintUsageCount: 0,
        latencies: [],
        consecutiveFailures: 0,
        lastSeen: Date.now(),
        quarantined: false,
      });
    }
    return this.metrics.get(wordId)!;
  }

  recordResult(wordId: string, correct: boolean, latencyMs: number, hintUsed: boolean) {
    const m = this.getOrCreate(wordId);
    m.attempts++;
    m.lastSeen = Date.now();

    if (m.attempts === 1 && correct) {
      m.firstAttemptCorrect++;
    } else if (m.attempts === 1 && !correct) {
      // first attempt was wrong — firstAttemptCorrect stays 0
    }

    if (correct) {
      m.totalCorrect++;
      m.consecutiveFailures = 0;
    } else {
      m.consecutiveFailures++;
    }

    if (hintUsed) {
      m.hintUsageCount++;
    }

    if (latencyMs > 0 && latencyMs < 30000) {
      m.latencies.push(latencyMs);
      if (m.latencies.length > 20) {
        m.latencies = m.latencies.slice(-20);
      }
    }

    if (m.consecutiveFailures >= 5 && !m.quarantined) {
      m.quarantined = true;
      m.quarantinedAt = Date.now();
    }
  }

  recordHint(wordId: string) {
    const m = this.getOrCreate(wordId);
    m.hintUsageCount++;
  }

  getFAAR(wordId: string): number {
    const m = this.metrics.get(wordId);
    if (!m || m.attempts === 0) return 0;
    return m.firstAttemptCorrect / Math.max(1, Math.min(m.attempts, 1));
  }

  getWordFAAR(wordId: string): number {
    const m = this.metrics.get(wordId);
    if (!m || m.attempts === 0) return 0;
    return m.totalCorrect / m.attempts;
  }

  getAvgLatency(wordId: string): number {
    const m = this.metrics.get(wordId);
    if (!m || m.latencies.length === 0) return 0;
    return m.latencies.reduce((a, b) => a + b, 0) / m.latencies.length;
  }

  getHintReliance(wordId: string): number {
    const m = this.metrics.get(wordId);
    if (!m || m.attempts === 0) return 0;
    return m.hintUsageCount / m.attempts;
  }

  getTier(wordId: string): WordTier {
    const m = this.metrics.get(wordId);
    if (!m || m.attempts < 2) return "acquiring";
    const faar = m.totalCorrect / m.attempts;
    if (faar >= 0.8 && m.attempts >= 3) return "mastered";
    if (faar >= 0.4 && m.attempts >= 2) return "familiar";
    return "acquiring";
  }

  getConsecutiveFailures(wordId: string): number {
    return this.metrics.get(wordId)?.consecutiveFailures ?? 0;
  }

  isQuarantined(wordId: string): boolean {
    return this.metrics.get(wordId)?.quarantined ?? false;
  }

  unquarantine(wordId: string) {
    const m = this.metrics.get(wordId);
    if (m) {
      m.quarantined = false;
      m.quarantinedAt = undefined;
      m.consecutiveFailures = 0;
    }
  }

  getMasteredWords(): string[] {
    return Array.from(this.metrics.entries())
      .filter(([_, m]) => this.getTier(m.wordId) === "mastered")
      .map(([id]) => id);
  }

  getSummary(): MetricsSummary {
    const words = Array.from(this.metrics.values());
    let mastered = 0, familiar = 0, acquiring = 0;
    let totalFAAR = 0;

    words.forEach((m) => {
      const tier = this.getTier(m.wordId);
      if (tier === "mastered") mastered++;
      else if (tier === "familiar") familiar++;
      else acquiring++;
      totalFAAR += m.attempts > 0 ? m.totalCorrect / m.attempts : 0;
    });

    return {
      totalWords: words.length,
      mastered,
      familiar,
      acquiring,
      overallFAAR: words.length > 0 ? totalFAAR / words.length : 0,
    };
  }

  getAllMetrics(): WordMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetric(wordId: string): WordMetric | undefined {
    return this.metrics.get(wordId);
  }

  getFilteredLatencies(wordId: string): number[] {
    const m = this.metrics.get(wordId);
    if (!m) return [];
    return m.latencies.filter((l) => l >= 200 && l <= 5000);
  }

  getRecentInteraction(wordId: string): { latencyMs: number; hintDepth: number; errors: number } | null {
    const m = this.metrics.get(wordId);
    if (!m || m.latencies.length === 0) return null;
    const filtered = this.getFilteredLatencies(wordId);
    const latencyMs = filtered.length > 0 ? filtered[filtered.length - 1] : 0;
    const hintDepth = m.hintUsageCount > 0 ? Math.min(m.hintUsageCount / Math.max(1, m.attempts), 1) : 0;
    return { latencyMs, hintDepth, errors: m.consecutiveFailures };
  }
}
