import React from "react";
import { ModuleLesson, ListeningLessonData, SpeakingLessonData, TracingLessonData, MatchingLessonData, DragDropLessonData, SortingLessonData, AssemblyLessonData, CommandLessonData, PhrasesLessonData } from "../types";
import ListeningGame from "./games/ListeningGame";
import SpeakingGame from "./games/SpeakingGame";
import TracingGame from "./TracingGame";
import VocabularyMatcher from "./VocabularyMatcher";
import DragDropSyntax from "./games/DragDropSyntax";
import SortingGame from "./games/SortingGame";
import AssemblyGame from "./games/AssemblyGame";
import CommandGame from "./games/CommandGame";
import SpokenPhrases from "./SpokenPhrases";
import BaluChat from "./BaluChat";

interface GameRouterProps {
  lesson: ModuleLesson;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function GameRouter({ lesson, onComplete, onBack }: GameRouterProps) {
  switch (lesson.gameType) {
    case "listening":
      return <ListeningGame lesson={lesson} data={lesson.data as ListeningLessonData} onComplete={onComplete} onBack={onBack} />;
    case "speaking":
      return <SpeakingGame lesson={lesson} data={lesson.data as SpeakingLessonData} onComplete={onComplete} onBack={onBack} />;
    case "tracing":
      return <TracingGame lesson={lesson} data={lesson.data as TracingLessonData} onComplete={onComplete} onBack={onBack} />;
    case "matching":
      return <VocabularyMatcher lesson={lesson} data={lesson.data as MatchingLessonData} onComplete={onComplete} onBack={onBack} />;
    case "dragdrop":
      return <DragDropSyntax lesson={lesson} data={lesson.data as DragDropLessonData} onComplete={onComplete} onBack={onBack} />;
    case "sorting":
      return <SortingGame lesson={lesson} data={lesson.data as SortingLessonData} onComplete={onComplete} onBack={onBack} />;
    case "assembly":
      return <AssemblyGame lesson={lesson} data={lesson.data as AssemblyLessonData} onComplete={onComplete} onBack={onBack} />;
    case "command":
      return <CommandGame lesson={lesson} data={lesson.data as CommandLessonData} onComplete={onComplete} onBack={onBack} />;
    case "phrases":
      return <SpokenPhrases lesson={lesson} data={lesson.data as PhrasesLessonData} onComplete={onComplete} onBack={onBack} />;
    case "chat":
      return <BaluChat lesson={lesson} onComplete={onComplete} onBack={onBack} />;
    default:
      return (
        <div className="text-center p-8">
          <p className="text-lg text-gray-500">This game type is coming soon!</p>
          <button onClick={onBack} className="mt-4 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold">
            Go Back
          </button>
        </div>
      );
  }
}
