import React, { useState, useEffect } from "react";
import { ModuleLesson, SortingLessonData, SortItem } from "../../types";
import { speakTamil } from "../../lib/audioHelper";
import { CHARACTERS } from "../../data";
import { getRandomMessage, GENTLE_REDIRECT_MESSAGES, SUCCESS_MESSAGES, FEEDBACK_COLORS, triggerSuccessHaptic } from "../../lib/feedback";
import { useHintTimer } from "../../hooks/useHintTimer";
import { useGameMetrics } from "../../hooks/useGameMetrics";
import { useProfileName } from "../../hooks/useProfileName";
import Confetti from "../Confetti";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SortingGameProps {
  lesson: ModuleLesson;
  data: SortingLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function SortingGame({ lesson, data, onComplete, onBack }: SortingGameProps) {
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const character = CHARACTERS[lesson.characterId];
  const currentItem = data.items[currentItemIdx];
  const totalItems = data.items.length;

  const { hintLevel, resetHints, cancelHints } = useHintTimer({
    enabled: feedback === null && !completed,
    subtleDelayMs: 4000,
    strongDelayMs: 6000,
  });

  const profileName = useProfileName();
  const { startInteraction, recordResult: recordMetric, save: saveMetrics } = useGameMetrics(profileName);

  useEffect(() => {
    if (currentItem && currentItem.tamilWord) {
      startInteraction(currentItem.tamilWord);
      const timer = setTimeout(() => {
        speakTamil(currentItem.tamilWord, lesson.characterId);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentItemIdx]);

  const handleZoneSelect = (zoneId: string) => {
    if (feedback !== null) return;
    cancelHints();

    const correct = currentItem.correctZoneId === zoneId;
    setFeedback(correct ? "correct" : "wrong");
    recordMetric(currentItem.tamilWord || currentItem.text, correct, hintLevel !== "none");

    if (correct) {
      setScore((s) => s + 1);
      setShowConfetti(true);
      triggerSuccessHaptic();
      setTimeout(() => setShowConfetti(false), 1000);
      const zone = data.zones.find((z) => z.id === zoneId);
      if (zone) speakTamil(zone.tamilLabel, lesson.characterId);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentItemIdx + 1 >= totalItems) {
        setCompleted(true);
        cancelHints();
        saveMetrics();
        setTimeout(() => onComplete(lesson.starsReward), 2000);
      } else {
        setCurrentItemIdx((i) => i + 1);
        resetHints();
      }
    }, correct ? 1200 : 1500);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      >
        <Confetti trigger={true} />
        <span className="text-7xl mb-4">🎯</span>
        <h2 className="text-2xl font-black text-gray-800">Great Sorting!</h2>
        <p className="text-sm text-gray-500 mt-2">You explored {totalItems} items!</p>
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
            {currentItemIdx + 1} / {totalItems}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all"
              style={{ width: `${((currentItemIdx + 1) / totalItems) * 100}%` }}
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
            {data.instruction || "Sort the items into the right zone!"}
          </p>
        </div>
      </div>

      {/* Current item */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className={`mx-auto w-fit px-8 py-6 rounded-3xl border-3 mb-8 text-center shadow-sm ${
            feedback === "correct"
              ? `${FEEDBACK_COLORS.success.border} ${FEEDBACK_COLORS.success.bg}`
              : feedback === "wrong"
              ? `${FEEDBACK_COLORS.error.border} ${FEEDBACK_COLORS.error.bg}`
              : "border-gray-200 bg-white"
          }`}
        >
          <span className="text-5xl block mb-2">{currentItem.emoji}</span>
          <p className="text-base font-bold text-gray-700">{currentItem.text}</p>
        </motion.div>
      </AnimatePresence>

      {/* Sorting zones */}
      <div className="grid grid-cols-2 gap-4">
        {data.zones.map((zone) => {
          const isCorrectZone = zone.id === currentItem.correctZoneId;
          let zoneStyle = "border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50";
          if (isCorrectZone && hintLevel === "strong") {
            zoneStyle = `${FEEDBACK_COLORS.hint.strong} border-gray-200 bg-white`;
          } else if (isCorrectZone && hintLevel === "subtle") {
            zoneStyle = `${FEEDBACK_COLORS.hint.subtle} border-gray-200 bg-white`;
          }

          return (
            <motion.button
              key={zone.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleZoneSelect(zone.id)}
              disabled={feedback !== null}
              className={`flex flex-col items-center gap-2 p-6 rounded-3xl border-3 transition-all shadow-sm disabled:opacity-70 ${zoneStyle}`}
            >
              <span className="text-4xl">{zone.emoji}</span>
              <p className="text-lg font-black text-gray-800">{zone.tamilLabel}</p>
              <p className="text-xs font-medium text-gray-400">{zone.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback === "correct" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-5 text-sm font-bold ${FEEDBACK_COLORS.success.text}`}
          >
            ✨ {getRandomMessage(SUCCESS_MESSAGES)}
          </motion.p>
        )}
        {feedback === "wrong" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-5 text-sm font-bold ${FEEDBACK_COLORS.error.text}`}
          >
            {getRandomMessage(GENTLE_REDIRECT_MESSAGES)} 🔍
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
