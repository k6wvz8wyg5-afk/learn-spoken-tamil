import { GameType } from "../types";

export type FrictionBand = "fluid" | "hesitant" | "assisted";

export interface SRSRecord {
  wordId: string;
  currentInterval: number; // hours
  nextDue: number; // timestamp ms
  frictionScore: number;
  frictionHistory: number[]; // last 5 scores
  acquisitionModality: GameType;
  lastReviewModality: GameType;
  modalityRotation: GameType[];
  reviewCount: number;
  lastReviewed: number; // timestamp ms
  consecutiveFluid: number;
}

export interface FrictionInput {
  latencyMs: number;
  hintDepth: "none" | "subtle" | "strong";
  trajectoryErrors: number;
}

const MODALITY_CYCLE: GameType[] = ["listening", "speaking", "dragdrop", "sorting", "matching", "command"];

const INITIAL_INTERVAL_HOURS = 4;
const FRICTION_WEIGHTS = { latency: 0.4, hint: 0.35, error: 0.25 };
const BAND_THRESHOLDS = { fluid: 0.25, hesitant: 0.6 };
const BAND_MULTIPLIERS: Record<FrictionBand, number> = { fluid: 2.5, hesitant: 1.2, assisted: 0.5 };
const OUTLIER_LOW = 200;
const OUTLIER_HIGH = 5000;

const STORAGE_PREFIX = "tamil_kid_srs_";

function getStorageKey(profileName: string): string {
  return STORAGE_PREFIX + profileName.toLowerCase().replace(/\s+/g, "_");
}

export function computeFriction(input: FrictionInput): number {
  const latencyFactor = Math.min(1, Math.max(0, (input.latencyMs - 800) / 3000));

  let hintFactor = 0;
  if (input.hintDepth === "subtle") hintFactor = 0.5;
  else if (input.hintDepth === "strong") hintFactor = 1.0;

  const errorFactor = Math.min(1, Math.max(0, input.trajectoryErrors / 3));

  return (
    FRICTION_WEIGHTS.latency * latencyFactor +
    FRICTION_WEIGHTS.hint * hintFactor +
    FRICTION_WEIGHTS.error * errorFactor
  );
}

export function getFrictionBand(score: number): FrictionBand {
  if (score < BAND_THRESHOLDS.fluid) return "fluid";
  if (score < BAND_THRESHOLDS.hesitant) return "hesitant";
  return "assisted";
}

export function getIntervalMultiplier(band: FrictionBand): number {
  return BAND_MULTIPLIERS[band];
}

export class SRSEngine {
  private records: Map<string, SRSRecord> = new Map();
  private profileName: string;

  constructor(profileName: string) {
    this.profileName = profileName;
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(getStorageKey(this.profileName));
      if (raw) {
        const parsed: SRSRecord[] = JSON.parse(raw);
        parsed.forEach((r) => this.records.set(r.wordId, r));
      }
    } catch {}
  }

  save() {
    try {
      const data = Array.from(this.records.values());
      localStorage.setItem(getStorageKey(this.profileName), JSON.stringify(data));
    } catch {}
  }

  initializeWord(wordId: string, acquisitionModality: GameType): void {
    if (this.records.has(wordId)) return;
    const now = Date.now();
    this.records.set(wordId, {
      wordId,
      currentInterval: INITIAL_INTERVAL_HOURS,
      nextDue: now + INITIAL_INTERVAL_HOURS * 60 * 60 * 1000,
      frictionScore: 0.5,
      frictionHistory: [],
      acquisitionModality,
      lastReviewModality: acquisitionModality,
      modalityRotation: [acquisitionModality],
      reviewCount: 0,
      lastReviewed: now,
      consecutiveFluid: 0,
    });
  }

  recordReview(wordId: string, friction: FrictionInput): void {
    const record = this.records.get(wordId);
    if (!record) return;

    const isOutlier = friction.latencyMs < OUTLIER_LOW || friction.latencyMs > OUTLIER_HIGH;
    const score = isOutlier ? record.frictionScore : computeFriction(friction);

    record.frictionScore = score;
    record.frictionHistory.push(score);
    if (record.frictionHistory.length > 5) {
      record.frictionHistory = record.frictionHistory.slice(-5);
    }

    const band = getFrictionBand(score);
    const multiplier = getIntervalMultiplier(band);
    record.currentInterval = Math.max(1, record.currentInterval * multiplier);

    const now = Date.now();
    record.nextDue = now + record.currentInterval * 60 * 60 * 1000;
    record.lastReviewed = now;
    record.reviewCount++;

    if (band === "fluid") {
      record.consecutiveFluid++;
    } else {
      record.consecutiveFluid = 0;
    }
  }

  getDueWords(now?: number): SRSRecord[] {
    const t = now ?? Date.now();
    return Array.from(this.records.values())
      .filter((r) => r.nextDue <= t)
      .sort((a, b) => a.nextDue - b.nextDue);
  }

  getOverdueWords(now?: number): SRSRecord[] {
    const t = now ?? Date.now();
    const oneIntervalAgo = (r: SRSRecord) => t - r.nextDue > r.currentInterval * 60 * 60 * 1000;
    return this.getDueWords(t).filter(oneIntervalAgo);
  }

  getNextModality(wordId: string): GameType {
    const record = this.records.get(wordId);
    if (!record) return "listening";

    const lastIdx = MODALITY_CYCLE.indexOf(record.lastReviewModality);
    const nextIdx = (lastIdx + 1) % MODALITY_CYCLE.length;
    const nextModality = MODALITY_CYCLE[nextIdx];

    // Skip acquisition modality on first few reviews to force different context
    if (record.reviewCount < 3 && nextModality === record.acquisitionModality) {
      return MODALITY_CYCLE[(nextIdx + 1) % MODALITY_CYCLE.length];
    }

    return nextModality;
  }

  updateModality(wordId: string, modality: GameType): void {
    const record = this.records.get(wordId);
    if (!record) return;
    record.lastReviewModality = modality;
    record.modalityRotation.push(modality);
    if (record.modalityRotation.length > 10) {
      record.modalityRotation = record.modalityRotation.slice(-10);
    }
  }

  getRecord(wordId: string): SRSRecord | undefined {
    return this.records.get(wordId);
  }

  getAllRecords(): SRSRecord[] {
    return Array.from(this.records.values());
  }

  hasWord(wordId: string): boolean {
    return this.records.has(wordId);
  }

  size(): number {
    return this.records.size;
  }
}
