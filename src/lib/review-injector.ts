import { GameType, ListeningItem, SpeakingItem, DragDropSentence, DragBlock, SortItem, CommandItem, AssemblyPart } from "../types";
import { VocabEntry } from "./vocabulary-registry";

export type ReviewGameItem =
  | { gameType: "listening"; item: ListeningItem }
  | { gameType: "speaking"; item: SpeakingItem }
  | { gameType: "sorting"; item: SortItem }
  | { gameType: "command"; item: CommandItem };

export function formatAsListeningItem(entry: VocabEntry, allEntries: VocabEntry[]): ListeningItem {
  const distractors = entry.distractors ??
    allEntries
      .filter((e) => e.wordId !== entry.wordId && e.emoji)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((e) => ({ emoji: e.emoji, meaning: e.meaning }));

  return {
    id: `review_${entry.wordId}`,
    tamilWord: entry.tamilWord,
    tamilScript: entry.tamilScript,
    meaning: entry.meaning,
    emoji: entry.emoji,
    distractors: distractors.slice(0, 3),
  };
}

export function formatAsSpeakingItem(entry: VocabEntry): SpeakingItem {
  return {
    id: `review_${entry.wordId}`,
    tamilWord: entry.tamilWord,
    tamilScript: entry.tamilScript,
    meaning: entry.meaning,
    emoji: entry.emoji,
    acceptedPronunciations: entry.acceptedPronunciations ?? [entry.tamilWord.toLowerCase()],
  };
}

export function formatAsCommandItem(entry: VocabEntry): CommandItem {
  const animations: CommandItem["animation"][] = ["moveLeft", "moveRight", "sit", "stand", "comeIn", "goOut"];
  return {
    id: `review_${entry.wordId}`,
    tamilWord: entry.tamilWord,
    tamilScript: entry.tamilScript,
    meaning: entry.meaning,
    emoji: entry.emoji,
    animation: animations[Math.floor(Math.random() * animations.length)],
  };
}

export function formatForGameType(
  entry: VocabEntry,
  targetGameType: GameType,
  allEntries: VocabEntry[]
): ReviewGameItem | null {
  switch (targetGameType) {
    case "listening":
      return { gameType: "listening", item: formatAsListeningItem(entry, allEntries) };
    case "speaking":
      return { gameType: "speaking", item: formatAsSpeakingItem(entry) };
    case "command":
      return { gameType: "command", item: formatAsCommandItem(entry) };
    default:
      return { gameType: "listening", item: formatAsListeningItem(entry, allEntries) };
  }
}

export function interleaveReviewItems<T>(original: T[], reviewItems: T[]): T[] {
  if (reviewItems.length === 0) return original;
  if (original.length <= 2) return [...original, ...reviewItems];

  const result = [...original];
  const insertableRange = { start: 1, end: original.length };
  const spacing = Math.floor((insertableRange.end - insertableRange.start) / (reviewItems.length + 1));

  for (let i = 0; i < reviewItems.length; i++) {
    const pos = insertableRange.start + spacing * (i + 1);
    const clampedPos = Math.min(pos, result.length);
    result.splice(clampedPos + i, 0, reviewItems[i]);
  }

  return result;
}
