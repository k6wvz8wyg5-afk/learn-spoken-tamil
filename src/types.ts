export enum CharacterId {
  MEERA = "meera",
  KAVIN = "kavin",
  BALU = "balu",
}

export interface Character {
  id: CharacterId;
  name: string;
  avatar: string;
  role: string;
  greeting: string;
  color: string;
  bgColor: string;
  accentColor: string;
}

// --- Game Types ---

export type GameType =
  | "listening"
  | "speaking"
  | "tracing"
  | "matching"
  | "dragdrop"
  | "sorting"
  | "assembly"
  | "command"
  | "phrases"
  | "chat";

// --- Module & Lesson ---

export interface Module {
  id: string;
  title: string;
  tamilTitle: string;
  theme: string;
  characterId: CharacterId;
  icon: string;
  lessons: ModuleLesson[];
  unlockAfter?: string; // module id that must be completed first
}

export interface ModuleLesson {
  id: string;
  moduleId: string;
  lessonNumber: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  characterId: CharacterId;
  gameType: GameType;
  starsReward: number;
  data: LessonData;
}

// --- Polymorphic Lesson Data ---

export type LessonData =
  | ListeningLessonData
  | SpeakingLessonData
  | TracingLessonData
  | MatchingLessonData
  | DragDropLessonData
  | SortingLessonData
  | AssemblyLessonData
  | CommandLessonData
  | PhrasesLessonData
  | ChatLessonData;

export interface ListeningLessonData {
  type: "listening";
  instruction?: string;
  items: ListeningItem[];
}

export interface ListeningItem {
  id: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  emoji: string;
  distractors: { emoji: string; meaning: string }[];
}

export interface SpeakingLessonData {
  type: "speaking";
  instruction?: string;
  items: SpeakingItem[];
}

export interface SpeakingItem {
  id: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  emoji: string;
  acceptedPronunciations: string[];
}

export interface TracingLessonData {
  type: "tracing";
  instruction?: string;
  letters: TamilLetter[];
}

export interface MatchingLessonData {
  type: "matching";
  instruction?: string;
  words: VocabWord[];
}

export interface DragDropLessonData {
  type: "dragdrop";
  instruction?: string;
  sentences: DragDropSentence[];
}

export interface DragDropSentence {
  id: string;
  english: string;
  contextEmoji?: string;
  blocks: DragBlock[];
  targetSlots: number;
}

export interface DragBlock {
  id: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  emoji?: string;
  order: number;
}

export interface SortingLessonData {
  type: "sorting";
  instruction?: string;
  zones: SortZone[];
  items: SortItem[];
}

export interface SortZone {
  id: string;
  label: string;
  tamilLabel: string;
  tamilScript: string;
  emoji: string;
}

export interface SortItem {
  id: string;
  text: string;
  tamilWord?: string;
  emoji: string;
  correctZoneId: string;
}

export interface AssemblyLessonData {
  type: "assembly";
  instruction?: string;
  parts: AssemblyPart[];
  targetLabel: string;
  targetEmoji: string;
}

export interface AssemblyPart {
  id: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  emoji: string;
  slotIndex: number;
}

export interface CommandLessonData {
  type: "command";
  instruction?: string;
  commands: CommandItem[];
}

export interface CommandItem {
  id: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  emoji: string;
  animation: "moveLeft" | "moveRight" | "sit" | "stand" | "comeIn" | "goOut";
}

export interface PhrasesLessonData {
  type: "phrases";
  instruction?: string;
  phrases: SpokenPhrase[];
}

export interface ChatLessonData {
  type: "chat";
  instruction?: string;
  topicPrompts?: string[];
}

// --- Shared Data Types ---

export interface TamilLetter {
  letter: string;
  pronunciation: string;
  englishMeaning: string;
  spokenExample: string;
  spokenEnglishExample: string;
  points: number;
}

export interface VocabWord {
  id: string;
  tamilWord: string;
  tamilScript: string;
  meaning: string;
  category: string;
  emoji: string;
}

export interface SpokenPhrase {
  id: string;
  english: string;
  spokenTamil: string;
  writtenTamil: string;
  pronunciationGuide: string;
  words: { id: string; text: string; order: number }[];
}

// --- User Profile ---

export interface UserProfile {
  name: string;
  avatar: string;
  stars: number;
  unlockedModules: string[];
  completedLessons: string[];
  rewards: Reward[];
  dailyStreak: number;
  lastActive: string;
  // Legacy fields (for migration)
  unlockedLessons?: string[];
  completedGames?: string[];
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}
