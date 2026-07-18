import React, { useState, useEffect } from "react";
import { ModuleLesson, DragDropLessonData, DragBlock } from "../../types";
import { speakTamil } from "../../lib/audioHelper";
import { CHARACTERS } from "../../data";
import { getRandomMessage, GENTLE_REDIRECT_MESSAGES, SUCCESS_MESSAGES, FEEDBACK_COLORS, triggerSuccessHaptic, AUTO_REVEAL_DELAY_MS, AUTO_ADVANCE_DELAY_MS } from "../../lib/feedback";
import { useHintTimer } from "../../hooks/useHintTimer";
import { useGameMetrics } from "../../hooks/useGameMetrics";
import { useProfileName } from "../../hooks/useProfileName";
import Confetti from "../Confetti";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DragDropSyntaxProps {
  lesson: ModuleLesson;
  data: DragDropLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function DragDropSyntax({ lesson, data, onComplete, onBack }: DragDropSyntaxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedBlocks, setPlacedBlocks] = useState<(DragBlock | null)[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<DragBlock[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const character = CHARACTERS[lesson.characterId];
  const currentSentence = data.sentences[currentIndex];
  const totalSentences = data.sentences.length;

  const nextExpectedOrder = placedBlocks.filter((b) => b !== null).length;

  const { hintLevel, resetHints, cancelHints } = useHintTimer({
    enabled: isCorrect === null && !completed && !revealCorrect,
    subtleDelayMs: 4000,
    strongDelayMs: 6000,
  });

  const profileName = useProfileName();
  const { startInteraction, recordResult: recordMetric, save: saveMetrics } = useGameMetrics(profileName);

  useEffect(() => {
    if (currentSentence) {
      const slots = new Array(currentSentence.targetSlots).fill(null);
      setPlacedBlocks(slots);
      setAvailableBlocks([...currentSentence.blocks].sort(() => Math.random() - 0.5));
      setIsCorrect(null);
      setRevealCorrect(false);
      resetHints();
      const sentenceId = currentSentence.blocks.map(b => b.tamilWord).join("_");
      startInteraction(sentenceId);
    }
  }, [currentIndex]);

  const advanceToNext = () => {
    if (currentIndex + 1 >= totalSentences) {
      setCompleted(true);
      saveMetrics();
      setTimeout(() => onComplete(lesson.starsReward), 2000);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleBlockTap = (block: DragBlock) => {
    if (isCorrect !== null) return;

    const emptyIdx = placedBlocks.findIndex((b) => b === null);
    if (emptyIdx === -1) return;

    const newPlaced = [...placedBlocks];
    newPlaced[emptyIdx] = block;
    setPlacedBlocks(newPlaced);
    setAvailableBlocks((prev) => prev.filter((b) => b.id !== block.id));

    speakTamil(block.tamilWord, lesson.characterId);

    if (newPlaced.every((b) => b !== null)) {
      const correct = newPlaced.every((b, idx) => b!.order === idx);
      setIsCorrect(correct);
      const sentenceId = currentSentence.blocks.map(b => b.tamilWord).join("_");
      recordMetric(sentenceId, correct, hintLevel !== "none");

      if (correct) {
        setShowConfetti(true);
        triggerSuccessHaptic();
        setTimeout(() => setShowConfetti(false), 1000);
        const fullSentence = currentSentence.blocks
          .sort((a, b) => a.order - b.order)
          .map((b) => b.tamilWord)
          .join(" ");
        setTimeout(() => speakTamil(fullSentence, lesson.characterId), 500);
        setTimeout(() => advanceToNext(), 2500);
      } else {
        // Rubber-band: bounce blocks back after a moment, then reveal correct
        setTimeout(() => {
          setPlacedBlocks(new Array(currentSentence.targetSlots).fill(null));
          setAvailableBlocks([...currentSentence.blocks].sort(() => Math.random() - 0.5));
          setIsCorrect(null);
        }, AUTO_REVEAL_DELAY_MS);

        setTimeout(() => {
          setRevealCorrect(true);
          const fullSentence = currentSentence.blocks
            .sort((a, b) => a.order - b.order)
            .map((b) => b.tamilWord)
            .join(" ");
          speakTamil(fullSentence, lesson.characterId);
        }, AUTO_REVEAL_DELAY_MS + 300);

        setTimeout(() => advanceToNext(), AUTO_REVEAL_DELAY_MS + AUTO_ADVANCE_DELAY_MS + 500);
      }
    }
  };

  const handleSlotTap = (slotIdx: number) => {
    if (isCorrect !== null) return;
    const block = placedBlocks[slotIdx];
    if (!block) return;

    const newPlaced = [...placedBlocks];
    newPlaced[slotIdx] = null;
    setPlacedBlocks(newPlaced);
    setAvailableBlocks((prev) => [...prev, block]);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      >
        <Confetti trigger={true} />
        <span className="text-7xl mb-4">🧩✨</span>
        <h2 className="text-2xl font-black text-gray-800">Sentence Builder Pro!</h2>
        <p className="text-sm text-gray-500 mt-2">You built all the sentences!</p>
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
            {currentIndex + 1} / {totalSentences}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalSentences) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Character prompt */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 mb-5 ${character.bgColor}`}>
        <span className="text-3xl">{character.avatar}</span>
        <div>
          <p className="text-xs font-bold text-gray-500">{character.name}</p>
          <p className="text-sm font-semibold text-gray-700">
            {data.instruction || "Build the sentence!"}
          </p>
        </div>
      </div>

      {/* Target sentence in English */}
      <div className="text-center mb-6">
        {currentSentence.contextEmoji && (
          <span className="text-4xl block mb-2">{currentSentence.contextEmoji}</span>
        )}
        <p className="text-lg font-bold text-gray-700">"{currentSentence.english}"</p>
      </div>

      {/* Reveal correct order */}
      {revealCorrect && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-6"
        >
          {currentSentence.blocks
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <div
                key={block.id}
                className={`px-4 py-3 rounded-2xl border-2 ${FEEDBACK_COLORS.reveal} border-emerald-300 bg-emerald-50`}
              >
                <div className="text-center">
                  {block.emoji && <span className="text-lg">{block.emoji}</span>}
                  <p className="text-sm font-black text-gray-800">{block.tamilWord}</p>
                  <p className="text-[10px] text-gray-400">{block.meaning}</p>
                </div>
              </div>
            ))}
        </motion.div>
      )}

      {/* Drop slots */}
      {!revealCorrect && (
        <div className="flex flex-wrap justify-center gap-3 mb-8 min-h-[70px]">
          {placedBlocks.map((block, idx) => (
            <motion.button
              key={idx}
              layout
              onClick={() => handleSlotTap(idx)}
              className={`min-w-[80px] px-4 py-3 rounded-2xl border-2 border-dashed transition-all ${
                block
                  ? isCorrect === true
                    ? `${FEEDBACK_COLORS.success.border} ${FEEDBACK_COLORS.success.bg}`
                    : isCorrect === false
                    ? `${FEEDBACK_COLORS.error.border} ${FEEDBACK_COLORS.error.bg}`
                    : "border-sky-300 bg-sky-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              {block ? (
                <div className="text-center">
                  {block.emoji && <span className="text-lg">{block.emoji}</span>}
                  <p className="text-sm font-black text-gray-800">{block.tamilWord}</p>
                  <p className="text-[10px] text-gray-400">{block.meaning}</p>
                </div>
              ) : (
                <p className="text-gray-300 text-sm font-bold">___</p>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Available blocks (with spring animation for bounce-back) */}
      {!revealCorrect && (
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <AnimatePresence>
            {availableBlocks.map((block) => (
              <motion.button
                key={block.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleBlockTap(block)}
                className={`px-5 py-3 bg-white border-2 rounded-2xl shadow-sm hover:border-sky-300 hover:bg-sky-50 transition-all ${
                  block.order === nextExpectedOrder && hintLevel === "strong"
                    ? FEEDBACK_COLORS.hint.strong + " border-gray-200"
                    : block.order === nextExpectedOrder && hintLevel === "subtle"
                    ? FEEDBACK_COLORS.hint.subtle + " border-gray-200"
                    : "border-gray-200"
                }`}
              >
                <div className="text-center">
                  {block.emoji && <span className="text-lg">{block.emoji}</span>}
                  <p className="text-sm font-black text-gray-800">{block.tamilWord}</p>
                  <p className="text-[10px] text-gray-400">{block.meaning}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback */}
      <div className="text-center mt-4">
        {isCorrect === false && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm font-bold ${FEEDBACK_COLORS.error.text}`}
          >
            {getRandomMessage(GENTLE_REDIRECT_MESSAGES)} 🧩
          </motion.p>
        )}
        {revealCorrect && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm font-bold ${FEEDBACK_COLORS.success.text}`}
          >
            Here's how it goes! 💡
          </motion.p>
        )}
        {isCorrect === true && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-lg font-black ${FEEDBACK_COLORS.success.text}`}
          >
            ✨ {getRandomMessage(SUCCESS_MESSAGES)}
          </motion.p>
        )}
      </div>
    </div>
  );
}
