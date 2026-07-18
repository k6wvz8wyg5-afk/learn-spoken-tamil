import { useMemo, useRef } from "react";
import { ModuleLesson, ListeningLessonData, SpeakingLessonData, CommandLessonData } from "../types";
import { MODULES } from "../data";
import { VocabularyRegistry, getVocabularyRegistry, VocabEntry } from "../lib/vocabulary-registry";
import { SRSEngine } from "../lib/srs-engine";
import { EventLog, LearningEvent } from "../lib/event-log";
import { formatAsListeningItem, formatAsSpeakingItem, formatAsCommandItem, interleaveReviewItems } from "../lib/review-injector";

const MAX_REVIEW_ITEMS = 2;

export interface ReviewMeta {
  injectedWordIds: string[];
  behaviors: Map<string, string>;
}

export interface AugmentedLesson {
  lesson: ModuleLesson;
  augmentedData: ModuleLesson["data"];
  reviewMeta: ReviewMeta;
}

export function useRepetitionSystem(profileName: string) {
  const registry = useMemo(() => getVocabularyRegistry(MODULES), []);
  const srsRef = useRef<SRSEngine | null>(null);
  const eventLogRef = useRef<EventLog | null>(null);

  if (!srsRef.current) {
    srsRef.current = new SRSEngine(profileName);
  }
  if (!eventLogRef.current) {
    eventLogRef.current = new EventLog(profileName);
  }

  const srs = srsRef.current;
  const eventLog = eventLogRef.current;

  function initializeWordIfNew(wordId: string, modality: ModuleLesson["gameType"]): void {
    if (!srs.hasWord(wordId)) {
      srs.initializeWord(wordId, modality);
    }
  }

  function augmentLesson(lesson: ModuleLesson, completedLessons: string[]): AugmentedLesson {
    const emptyMeta: ReviewMeta = { injectedWordIds: [], behaviors: new Map() };

    try {
      const dueWords = srs.getDueWords();
      if (dueWords.length === 0) {
        return { lesson, augmentedData: lesson.data, reviewMeta: emptyMeta };
      }

      const completedVocab = registry.getCompletedVocab(completedLessons);
      const completedIds = new Set(completedVocab.map((v) => v.wordId));

      // Filter due words to only those from earlier modules (not current lesson's module)
      const eligibleDue = dueWords.filter((r) => {
        const entry = registry.get(r.wordId);
        return entry && entry.sourceModuleId !== lesson.moduleId && completedIds.has(r.wordId);
      });

      if (eligibleDue.length === 0) {
        return { lesson, augmentedData: lesson.data, reviewMeta: emptyMeta };
      }

      const toInject = eligibleDue.slice(0, MAX_REVIEW_ITEMS);
      const injectedWordIds: string[] = [];
      const behaviors = new Map<string, string>();

      const allEntries = registry.getAll();

      // Inject based on current lesson's game type
      const gameType = lesson.gameType;
      const data = lesson.data;

      if (gameType === "listening" && data.type === "listening") {
        const reviewItems = toInject.map((r) => {
          const entry = registry.get(r.wordId)!;
          injectedWordIds.push(r.wordId);
          srs.updateModality(r.wordId, "listening");
          eventLog.append({ type: "review_injected", wordId: r.wordId, lessonId: lesson.id, modality: "listening" });
          return formatAsListeningItem(entry, allEntries);
        });

        const augmented: ListeningLessonData = {
          ...data,
          items: interleaveReviewItems(data.items, reviewItems),
        };
        return { lesson, augmentedData: augmented, reviewMeta: { injectedWordIds, behaviors } };
      }

      if (gameType === "speaking" && data.type === "speaking") {
        const reviewItems = toInject.map((r) => {
          const entry = registry.get(r.wordId)!;
          injectedWordIds.push(r.wordId);
          srs.updateModality(r.wordId, "speaking");
          eventLog.append({ type: "review_injected", wordId: r.wordId, lessonId: lesson.id, modality: "speaking" });
          return formatAsSpeakingItem(entry);
        });

        const augmented: SpeakingLessonData = {
          ...data,
          items: interleaveReviewItems(data.items, reviewItems),
        };
        return { lesson, augmentedData: augmented, reviewMeta: { injectedWordIds, behaviors } };
      }

      if (gameType === "command" && data.type === "command") {
        const reviewItems = toInject.map((r) => {
          const entry = registry.get(r.wordId)!;
          injectedWordIds.push(r.wordId);
          srs.updateModality(r.wordId, "command");
          eventLog.append({ type: "review_injected", wordId: r.wordId, lessonId: lesson.id, modality: "command" });
          return formatAsCommandItem(entry);
        });

        const augmented: CommandLessonData = {
          ...data,
          commands: interleaveReviewItems(data.commands, reviewItems),
        };
        return { lesson, augmentedData: augmented, reviewMeta: { injectedWordIds, behaviors } };
      }

      // For game types we can't easily inject into (dragdrop, sorting, assembly, matching),
      // return unmodified — the child still benefits from the lesson's own repetition
      return { lesson, augmentedData: lesson.data, reviewMeta: emptyMeta };
    } catch {
      return { lesson, augmentedData: lesson.data, reviewMeta: emptyMeta };
    }
  }

  function recordReviewResult(wordId: string, friction: { latencyMs: number; hintDepth: "none" | "subtle" | "strong"; trajectoryErrors: number }) {
    srs.recordReview(wordId, friction);
    srs.save();
  }

  function logEvent(event: Omit<LearningEvent, "v" | "t">) {
    eventLog.append(event);
  }

  function flushEvents() {
    eventLog.flush();
  }

  return {
    registry,
    srs,
    eventLog,
    augmentLesson,
    initializeWordIfNew,
    recordReviewResult,
    logEvent,
    flushEvents,
  };
}
