export interface LearningEvent {
  v: number;
  t: number;
  type: EventType;
  wordId?: string;
  lessonId?: string;
  moduleId?: string;
  modality?: string;
  latencyMs?: number;
  hintDepth?: "none" | "subtle" | "strong";
  correct?: boolean;
  avatarBehavior?: string;
  meta?: Record<string, unknown>;
}

export type EventType =
  | "word_presented"
  | "word_correct"
  | "word_incorrect"
  | "hint_used"
  | "sandbox_spawn"
  | "review_injected"
  | "lesson_complete"
  | "module_complete"
  | "session_start";

const SCHEMA_VERSION = 1;
const STORAGE_PREFIX = "tamil_kid_events_";
const FLUSH_THRESHOLD = 10;
const CHUNK_SIZE_BYTES = 500_000;

function getStorageKey(profileName: string): string {
  return STORAGE_PREFIX + profileName.toLowerCase().replace(/\s+/g, "_");
}

function getChunkKey(profileName: string, chunkIdx: number): string {
  return getStorageKey(profileName) + `_chunk_${chunkIdx}`;
}

export class EventLog {
  private buffer: LearningEvent[] = [];
  private profileName: string;
  private boundFlush: () => void;

  constructor(profileName: string) {
    this.profileName = profileName;
    this.boundFlush = () => this.flush();

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.boundFlush);
    }
  }

  append(event: Omit<LearningEvent, "v" | "t">): void {
    const full: LearningEvent = {
      v: SCHEMA_VERSION,
      t: Date.now(),
      ...event,
    };
    this.buffer.push(full);

    if (this.buffer.length >= FLUSH_THRESHOLD) {
      this.flush();
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return;

    try {
      const key = getStorageKey(this.profileName);
      const existing = localStorage.getItem(key) || "";
      const newLines = this.buffer.map((e) => JSON.stringify(e)).join("\n");
      const updated = existing ? existing + "\n" + newLines : newLines;

      if (updated.length > CHUNK_SIZE_BYTES) {
        this.archiveChunk(existing);
        localStorage.setItem(key, newLines);
      } else {
        localStorage.setItem(key, updated);
      }

      this.buffer = [];
    } catch {
      // storage full or unavailable — keep buffer for next attempt
    }
  }

  private archiveChunk(data: string): void {
    let chunkIdx = 0;
    while (localStorage.getItem(getChunkKey(this.profileName, chunkIdx)) !== null) {
      chunkIdx++;
    }
    try {
      localStorage.setItem(getChunkKey(this.profileName, chunkIdx), data);
    } catch {
      // if we can't archive, just lose the oldest data
    }
  }

  readAll(): LearningEvent[] {
    const events: LearningEvent[] = [];

    // Read archived chunks
    let chunkIdx = 0;
    while (true) {
      const chunkData = localStorage.getItem(getChunkKey(this.profileName, chunkIdx));
      if (chunkData === null) break;
      events.push(...this.parseNDJSON(chunkData));
      chunkIdx++;
    }

    // Read current
    const key = getStorageKey(this.profileName);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        events.push(...this.parseNDJSON(raw));
      }
    } catch {
      this.safeFail();
    }

    // Include unflushed buffer
    events.push(...this.buffer);

    return events;
  }

  private parseNDJSON(raw: string): LearningEvent[] {
    const events: LearningEvent[] = [];
    const lines = raw.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line);
        if (parsed && typeof parsed.t === "number" && typeof parsed.type === "string") {
          events.push(parsed as LearningEvent);
        }
      } catch {
        // skip malformed lines
      }
    }
    return events;
  }

  private safeFail(): void {
    try {
      const key = getStorageKey(this.profileName);
      const raw = localStorage.getItem(key);
      if (raw) {
        const backupKey = key + `_backup_${Date.now()}`;
        localStorage.setItem(backupKey, raw);
      }
    } catch {}
  }

  getEventsSince(timestamp: number): LearningEvent[] {
    return this.readAll().filter((e) => e.t >= timestamp);
  }

  getWordHistory(wordId: string): LearningEvent[] {
    return this.readAll().filter((e) => e.wordId === wordId);
  }

  getDailyActivity(days: number): { date: string; count: number }[] {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    const events = this.getEventsSince(cutoff);

    const buckets: Map<string, number> = new Map();
    for (const e of events) {
      const date = new Date(e.t).toLocaleDateString();
      buckets.set(date, (buckets.get(date) || 0) + 1);
    }

    return Array.from(buckets.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  destroy(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.boundFlush);
    }
  }
}
