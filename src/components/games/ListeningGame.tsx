import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ModuleLesson, ListeningLessonData, ListeningItem } from "../../types";
import { speakTamil } from "../../lib/audioHelper";
import { CHARACTERS } from "../../data";
import { getRandomMessage, GENTLE_REDIRECT_MESSAGES, SUCCESS_MESSAGES, FEEDBACK_COLORS, triggerSuccessHaptic, AUTO_REVEAL_DELAY_MS, AUTO_ADVANCE_DELAY_MS } from "../../lib/feedback";
import { useHintTimer } from "../../hooks/useHintTimer";
import { useGameMetrics } from "../../hooks/useGameMetrics";
import { useProfileName } from "../../hooks/useProfileName";
import Confetti from "../Confetti";
import { ArrowLeft, Volume2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ListeningGameProps {
  lesson: ModuleLesson;
  data: ListeningLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function ListeningGame({ lesson, data, onComplete, onBack }: ListeningGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const character = CHARACTERS[lesson.characterId];
  const currentItem = data.items[currentIndex];
  const totalItems = data.items.length;

  const { hintLevel, resetHints, cancelHints } = useHintTimer({
    enabled: selectedId === null && !completed,
    subtleDelayMs: 4000,
    strongDelayMs: 6000,
  });

  const profileName = useProfileName();
  const { startInteraction, recordResult: recordMetric, recordHint, save: saveMetrics } = useGameMetrics(profileName);

  const playAudio = useCallback(() => {
    if (currentItem) {
      speakTamil(currentItem.tamilWord, lesson.characterId);
    }
  }, [currentItem, lesson.characterId]);

  useEffect(() => {
    const timer = setTimeout(() => playAudio(), 600);
    if (currentItem) startInteraction(currentItem.tamilWord);
    return () => clearTimeout(timer);
  }, [currentIndex, playAudio]);

  const options = useMemo(() => {
    if (!currentItem) return [];
    return [
      { emoji: currentItem.emoji, meaning: currentItem.meaning, isCorrect: true },
      ...currentItem.distractors.map((d) => ({ ...d, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  const advanceToNext = useCallback(() => {
    if (currentIndex + 1 >= totalItems) {
      setCompleted(true);
      cancelHints();
      saveMetrics();
      setTimeout(() => onComplete(lesson.starsReward), 2000);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedId(null);
      setIsCorrect(null);
      setRevealCorrect(false);
      resetHints();
    }
  }, [currentIndex, totalItems, lesson.starsReward, onComplete, cancelHints, resetHints]);

  const handleSelect = (option: { emoji: string; meaning: string; isCorrect: boolean }) => {
    if (selectedId !== null) return;
    setSelectedId(option.emoji + option.meaning);
    cancelHints();
    recordMetric(currentItem.tamilWord, option.isCorrect, hintLevel !== "none");

    if (option.isCorrect) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setShowConfetti(true);
      triggerSuccessHaptic();
      speakTamil(currentItem.tamilWord, lesson.characterId);
      setTimeout(() => setShowConfetti(false), 1000);
      setTimeout(() => advanceToNext(), 1500);
    } else {
      setIsCorrect(false);
      setTimeout(() => {
        setRevealCorrect(true);
        speakTamil(currentItem.tamilWord, lesson.characterId);
      }, AUTO_REVEAL_DELAY_MS);
      setTimeout(() => advanceToNext(), AUTO_REVEAL_DELAY_MS + AUTO_ADVANCE_DELAY_MS);
    }
  };

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      >
        <Confetti trigger={true} />
        <span className="text-7xl mb-4">🎉</span>
        <h2 className="text-2xl font-black text-gray-800">Amazing Listening!</h2>
        <p className="text-sm text-gray-500 mt-2">
          You explored {totalItems} sounds!
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 font-black px-6 py-2 rounded-full text-lg">
          ⭐ +{lesson.starsReward} Stars!
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-500">
            {currentIndex + 1} / {totalItems}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Character prompt */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 mb-6 ${character.bgColor}`}>
        <span className="text-3xl">{character.avatar}</span>
        <div>
          <p className="text-xs font-bold text-gray-500">{character.name}</p>
          <p className="text-sm font-semibold text-gray-700">
            {data.instruction || "Listen and tap the right picture!"}
          </p>
        </div>
      </div>

      {/* Audio play button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={playAudio}
        className="mx-auto mb-8 flex items-center gap-3 px-8 py-4 bg-indigo-100 border-2 border-indigo-200 rounded-2xl hover:bg-indigo-150 transition-colors"
      >
        <Volume2 className="w-6 h-6 text-indigo-600" />
        <span className="text-lg font-black text-indigo-700">
          🔊 Play Sound
        </span>
      </motion.button>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          {options.map((option) => {
            const optionId = option.emoji + option.meaning;
            const isSelected = selectedId === optionId;
            let borderColor = "border-gray-200 hover:border-gray-300";
            let bgColor = "bg-white";
            let extraClasses = "";

            if (isSelected && isCorrect) {
              borderColor = FEEDBACK_COLORS.success.border;
              bgColor = FEEDBACK_COLORS.success.bg;
            } else if (isSelected && isCorrect === false) {
              borderColor = FEEDBACK_COLORS.error.border;
              bgColor = FEEDBACK_COLORS.error.bg;
            } else if (revealCorrect && option.isCorrect) {
              extraClasses = FEEDBACK_COLORS.reveal;
              borderColor = "border-emerald-300";
              bgColor = "bg-emerald-50";
            } else if (option.isCorrect && hintLevel === "strong") {
              extraClasses = FEEDBACK_COLORS.hint.strong;
            } else if (option.isCorrect && hintLevel === "subtle") {
              extraClasses = FEEDBACK_COLORS.hint.subtle;
            }

            return (
              <motion.button
                key={optionId}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(option)}
                disabled={selectedId !== null}
                className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-3 transition-all ${borderColor} ${bgColor} ${extraClasses} shadow-sm disabled:cursor-default`}
              >
                <span className="text-5xl mb-2">{option.emoji}</span>
                <span className="text-xs font-bold text-gray-500">{option.meaning}</span>
                {isSelected && isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                )}
                {revealCorrect && option.isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {isCorrect === false && !revealCorrect && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-4 text-sm font-bold ${FEEDBACK_COLORS.error.text}`}
          >
            {getRandomMessage(GENTLE_REDIRECT_MESSAGES)} 🔍
          </motion.p>
        )}
        {revealCorrect && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-4 text-sm font-bold ${FEEDBACK_COLORS.success.text}`}
          >
            That's "{currentItem.tamilWord}" — {currentItem.meaning}! 💡
          </motion.p>
        )}
        {isCorrect === true && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-4 text-sm font-bold ${FEEDBACK_COLORS.success.text}`}
          >
            ✨ {getRandomMessage(SUCCESS_MESSAGES)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
