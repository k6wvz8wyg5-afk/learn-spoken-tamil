import React, { useState, useEffect } from "react";
import { ModuleLesson, AssemblyLessonData, AssemblyPart } from "../../types";
import { speakTamil } from "../../lib/audioHelper";
import { CHARACTERS } from "../../data";
import { getRandomMessage, GENTLE_REDIRECT_MESSAGES, SUCCESS_MESSAGES, FEEDBACK_COLORS, triggerSuccessHaptic, AUTO_REVEAL_DELAY_MS, AUTO_ADVANCE_DELAY_MS } from "../../lib/feedback";
import { useHintTimer } from "../../hooks/useHintTimer";
import { useGameMetrics } from "../../hooks/useGameMetrics";
import { useProfileName } from "../../hooks/useProfileName";
import Confetti from "../Confetti";
import { ArrowLeft, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AssemblyGameProps {
  lesson: ModuleLesson;
  data: AssemblyLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function AssemblyGame({ lesson, data, onComplete, onBack }: AssemblyGameProps) {
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [placedParts, setPlacedParts] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const character = CHARACTERS[lesson.characterId];
  const currentPart = data.parts[currentPartIdx];
  const totalParts = data.parts.length;

  const { hintLevel, resetHints, cancelHints } = useHintTimer({
    enabled: feedback === null && !completed,
    subtleDelayMs: 4000,
    strongDelayMs: 6000,
  });

  const profileName = useProfileName();
  const { startInteraction, recordResult: recordMetric, save: saveMetrics } = useGameMetrics(profileName);

  useEffect(() => {
    if (currentPart) {
      setRevealCorrect(false);
      resetHints();
      startInteraction(currentPart.tamilWord);
      const timer = setTimeout(() => {
        speakTamil(currentPart.tamilWord, lesson.characterId);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentPartIdx]);

  const playAudio = () => {
    if (currentPart) {
      speakTamil(currentPart.tamilWord, lesson.characterId);
    }
  };

  const advanceToNext = () => {
    setFeedback(null);
    if (currentPartIdx + 1 >= totalParts) {
      setCompleted(true);
      saveMetrics();
      setTimeout(() => onComplete(lesson.starsReward), 2000);
    } else {
      setCurrentPartIdx((i) => i + 1);
    }
  };

  const handlePartTap = (part: AssemblyPart) => {
    if (feedback !== null) return;
    cancelHints();

    const correct = part.slotIndex === currentPart.slotIndex;
    setFeedback(correct ? "correct" : "wrong");
    recordMetric(currentPart.tamilWord, correct, hintLevel !== "none");

    if (correct) {
      triggerSuccessHaptic();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
      speakTamil(part.tamilWord, lesson.characterId);
      setPlacedParts((prev) => new Set([...prev, part.slotIndex]));
      setTimeout(() => advanceToNext(), 1500);
    } else {
      // Auto-reveal correct answer, then advance
      setTimeout(() => {
        setRevealCorrect(true);
        setPlacedParts((prev) => new Set([...prev, currentPart.slotIndex]));
        speakTamil(currentPart.tamilWord, lesson.characterId);
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
        <span className="text-7xl mb-4">🧩🧍</span>
        <h2 className="text-2xl font-black text-gray-800">Body Complete!</h2>
        <p className="text-sm text-gray-500 mt-2">You built the whole character!</p>
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
            {placedParts.size} / {totalParts}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full transition-all"
              style={{ width: `${(placedParts.size / totalParts) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Character prompt */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 mb-4 ${character.bgColor}`}>
        <span className="text-3xl">{character.avatar}</span>
        <div>
          <p className="text-xs font-bold text-gray-500">{character.name}</p>
          <p className="text-sm font-semibold text-gray-700">
            {data.instruction || "Listen and tap the matching body part!"}
          </p>
        </div>
      </div>

      {/* Audio button */}
      <button
        onClick={playAudio}
        className="mx-auto mb-4 flex items-center gap-2 px-6 py-3 bg-pink-100 border-2 border-pink-200 rounded-2xl"
      >
        <Volume2 className="w-5 h-5 text-pink-600" />
        <span className="text-sm font-bold text-pink-700">🔊 "{currentPart.tamilWord}"</span>
      </button>

      {/* Body outline with slots */}
      <div className="relative mx-auto w-40 h-56 bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl border-2 border-amber-200 mb-6 flex flex-col items-center justify-center gap-1">
        <span className="text-4xl">{data.targetEmoji}</span>
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {data.parts.map((part, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
                placedParts.has(part.slotIndex)
                  ? `${FEEDBACK_COLORS.success.bg} border-emerald-300`
                  : "bg-gray-100 border-dashed border-gray-300"
              }`}
            >
              {placedParts.has(part.slotIndex) ? part.emoji : "?"}
            </div>
          ))}
        </div>
      </div>

      {/* Part options to tap */}
      <div className="grid grid-cols-3 gap-3">
        {data.parts
          .filter((p) => !placedParts.has(p.slotIndex))
          .map((part) => {
            let style = "border-gray-200 bg-white hover:border-pink-300";
            if (feedback === "correct" && part.slotIndex === currentPart.slotIndex) {
              style = `${FEEDBACK_COLORS.success.border} ${FEEDBACK_COLORS.success.bg}`;
            } else if (revealCorrect && part.slotIndex === currentPart.slotIndex) {
              style = `${FEEDBACK_COLORS.reveal} border-emerald-300 bg-emerald-50`;
            } else if (part.slotIndex === currentPart.slotIndex && hintLevel === "strong") {
              style = `${FEEDBACK_COLORS.hint.strong} border-gray-200 bg-white`;
            } else if (part.slotIndex === currentPart.slotIndex && hintLevel === "subtle") {
              style = `${FEEDBACK_COLORS.hint.subtle} border-gray-200 bg-white`;
            }

            return (
              <motion.button
                key={part.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePartTap(part)}
                disabled={feedback !== null}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${style}`}
              >
                <span className="text-2xl">{part.emoji}</span>
                <p className="text-xs font-bold text-gray-700">{part.tamilWord}</p>
                <p className="text-[10px] text-gray-400">{part.meaning}</p>
              </motion.button>
            );
          })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback === "wrong" && !revealCorrect && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-4 text-sm font-bold ${FEEDBACK_COLORS.error.text}`}
          >
            {getRandomMessage(GENTLE_REDIRECT_MESSAGES)} 🔍
          </motion.p>
        )}
        {revealCorrect && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center mt-4 text-sm font-bold ${FEEDBACK_COLORS.success.text}`}
          >
            That's {currentPart.tamilWord} ({currentPart.meaning})! 💡
          </motion.p>
        )}
        {feedback === "correct" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
