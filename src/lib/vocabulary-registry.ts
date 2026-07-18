import { Module, ModuleLesson, GameType, ListeningLessonData, SpeakingLessonData, MatchingLessonData, DragDropLessonData, SortingLessonData, AssemblyLessonData, CommandLessonData } from "../types";

export interface VocabEntry {
  wordId: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  emoji: string;
  sourceModuleId: string;
  sourceLessonId: string;
  sourceGameType: GameType;
  category?: string;
  acceptedPronunciations?: string[];
  distractors?: { emoji: string; meaning: string }[];
}

function normalizeWordId(tamilWord: string): string {
  return tamilWord.toLowerCase().trim();
}

export class VocabularyRegistry {
  private entries: Map<string, VocabEntry> = new Map();

  buildFromModules(modules: Module[]): void {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        this.extractFromLesson(lesson);
      }
    }
  }

  private extractFromLesson(lesson: ModuleLesson): void {
    const data = lesson.data as any;
    if (!data) return;

    switch (lesson.gameType) {
      case "listening":
        this.extractListening(lesson, data as ListeningLessonData);
        break;
      case "speaking":
        this.extractSpeaking(lesson, data as SpeakingLessonData);
        break;
      case "matching":
        this.extractMatching(lesson, data as MatchingLessonData);
        break;
      case "dragdrop":
        this.extractDragDrop(lesson, data as DragDropLessonData);
        break;
      case "sorting":
        this.extractSorting(lesson, data as SortingLessonData);
        break;
      case "assembly":
        this.extractAssembly(lesson, data as AssemblyLessonData);
        break;
      case "command":
        this.extractCommand(lesson, data as CommandLessonData);
        break;
    }
  }

  private addEntry(entry: VocabEntry): void {
    const id = normalizeWordId(entry.tamilWord);
    if (!this.entries.has(id)) {
      this.entries.set(id, { ...entry, wordId: id });
    } else {
      const existing = this.entries.get(id)!;
      if (entry.acceptedPronunciations && !existing.acceptedPronunciations) {
        existing.acceptedPronunciations = entry.acceptedPronunciations;
      }
      if (entry.distractors && !existing.distractors) {
        existing.distractors = entry.distractors;
      }
    }
  }

  private extractListening(lesson: ModuleLesson, data: ListeningLessonData): void {
    for (const item of data.items) {
      this.addEntry({
        wordId: normalizeWordId(item.tamilWord),
        tamilWord: item.tamilWord,
        tamilScript: item.tamilScript,
        meaning: item.meaning,
        emoji: item.emoji,
        sourceModuleId: lesson.moduleId,
        sourceLessonId: lesson.id,
        sourceGameType: "listening",
        distractors: item.distractors,
      });
    }
  }

  private extractSpeaking(lesson: ModuleLesson, data: SpeakingLessonData): void {
    for (const item of data.items) {
      this.addEntry({
        wordId: normalizeWordId(item.tamilWord),
        tamilWord: item.tamilWord,
        tamilScript: item.tamilScript,
        meaning: item.meaning,
        emoji: item.emoji,
        sourceModuleId: lesson.moduleId,
        sourceLessonId: lesson.id,
        sourceGameType: "speaking",
        acceptedPronunciations: item.acceptedPronunciations,
      });
    }
  }

  private extractMatching(lesson: ModuleLesson, data: MatchingLessonData): void {
    for (const word of data.words) {
      this.addEntry({
        wordId: normalizeWordId(word.tamilWord),
        tamilWord: word.tamilWord,
        tamilScript: word.tamilScript,
        meaning: word.meaning,
        emoji: word.emoji,
        sourceModuleId: lesson.moduleId,
        sourceLessonId: lesson.id,
        sourceGameType: "matching",
        category: word.category,
      });
    }
  }

  private extractDragDrop(lesson: ModuleLesson, data: DragDropLessonData): void {
    for (const sentence of data.sentences) {
      for (const block of sentence.blocks) {
        if (block.tamilWord && block.meaning) {
          this.addEntry({
            wordId: normalizeWordId(block.tamilWord),
            tamilWord: block.tamilWord,
            tamilScript: block.tamilScript,
            meaning: block.meaning,
            emoji: block.emoji || "",
            sourceModuleId: lesson.moduleId,
            sourceLessonId: lesson.id,
            sourceGameType: "dragdrop",
          });
        }
      }
    }
  }

  private extractSorting(lesson: ModuleLesson, data: SortingLessonData): void {
    for (const item of data.items) {
      if (item.tamilWord) {
        this.addEntry({
          wordId: normalizeWordId(item.tamilWord),
          tamilWord: item.tamilWord,
          tamilScript: "",
          meaning: item.text,
          emoji: item.emoji,
          sourceModuleId: lesson.moduleId,
          sourceLessonId: lesson.id,
          sourceGameType: "sorting",
        });
      }
    }
  }

  private extractAssembly(lesson: ModuleLesson, data: AssemblyLessonData): void {
    for (const part of data.parts) {
      this.addEntry({
        wordId: normalizeWordId(part.tamilWord),
        tamilWord: part.tamilWord,
        tamilScript: part.tamilScript,
        meaning: part.meaning,
        emoji: part.emoji,
        sourceModuleId: lesson.moduleId,
        sourceLessonId: lesson.id,
        sourceGameType: "assembly",
      });
    }
  }

  private extractCommand(lesson: ModuleLesson, data: CommandLessonData): void {
    for (const cmd of data.commands) {
      this.addEntry({
        wordId: normalizeWordId(cmd.tamilWord),
        tamilWord: cmd.tamilWord,
        tamilScript: cmd.tamilScript,
        meaning: cmd.meaning,
        emoji: cmd.emoji,
        sourceModuleId: lesson.moduleId,
        sourceLessonId: lesson.id,
        sourceGameType: "command",
      });
    }
  }

  get(wordId: string): VocabEntry | undefined {
    return this.entries.get(normalizeWordId(wordId));
  }

  getAll(): VocabEntry[] {
    return Array.from(this.entries.values());
  }

  getByModule(moduleId: string): VocabEntry[] {
    return this.getAll().filter((e) => e.sourceModuleId === moduleId);
  }

  getCompletedVocab(completedLessons: string[]): VocabEntry[] {
    const completed = new Set(completedLessons);
    return this.getAll().filter((e) => completed.has(e.sourceLessonId));
  }

  getRandomDistractors(excludeWordId: string, count: number): VocabEntry[] {
    const excluded = normalizeWordId(excludeWordId);
    const all = this.getAll().filter((e) => e.wordId !== excluded && e.emoji);
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  size(): number {
    return this.entries.size;
  }
}

let registryInstance: VocabularyRegistry | null = null;

export function getVocabularyRegistry(modules: Module[]): VocabularyRegistry {
  if (!registryInstance) {
    registryInstance = new VocabularyRegistry();
    registryInstance.buildFromModules(modules);
  }
  return registryInstance;
}
