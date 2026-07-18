import React, { useState, useEffect } from "react";
import { ModuleLesson, CommandLessonData, CommandItem } from "../../types";
import { speakTamil } from "../../lib/audioHelper";
import { CHARACTERS } from "../../data";
import { getRandomMessage, GENTLE_REDIRECT_MESSAGES, SUCCESS_MESSAGES, FEEDBACK_COLORS, triggerSuccessHaptic, AUTO_REVEAL_DELAY_MS, AUTO_ADVANCE_DELAY_MS } from "../../lib/feedback";
import { useHintTimer } from "../../hooks/useHintTimer";
import { useGameMetrics } from "../../hooks/useGameMetrics";
import { useProfileName } from "../../hooks/useProfileName";
import Confetti from "../Confetti";
import { ArrowLeft, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommandGameProps {
  lesson: ModuleLesson;
  data: CommandLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

const ANIMATION_STYLES: Record<string, React.CSSProperties> = {
  moveRight: { transform: "translateX(80px)" },
  moveLeft: { transform: "translateX(-80px)" },
  sit: { transform: "translateY(30px) scaleY(0.7)" },
  stand: { transform: "translateY(0) scaleY(1)" },
  comeIn: { transform: "translateX(0) scale(1.1)" },
  goOut: { transform: "translateX(100px) scale(0.6)", opacity: 0.4 },
};

export default function CommandGame({ lesson, data, onComplete, onBack }: CommandGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [avatarStyle, setAvatarStyle] = useState<React.CSSProperties>({});
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const character = CHARACTERS[lesson.characterId];
  const currentCommand = data.commands[currentIndex];
  const totalCommands = data.commands.length;

  const { hintLevel, resetHints, cancelHints } = useHintTimer({
    enabled: feedback === null && !completed,
    subtleDelayMs: 4000,
    strongDelayMs: 6000,
  });

  const profileName = useProfileName();
  const { startInteraction, recordResult: recordMetric, save: saveMetrics } = useGameMetrics(profileName);

  useEffect(() => {
    setActiveCommand(null);
    setAvatarStyle({});
    setRevealCorrect(false);
    resetHints();
    startInteraction(currentCommand.tamilWord);
    const timer = setTimeout(() => {
      speakTamil(currentCommand.tamilWord, lesson.characterId);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const playAudio = () => {
    speakTamil(currentCommand.tamilWord, lesson.characterId);
  };

  const advanceToNext = () => {
    if (currentIndex + 1 >= totalCommands) {
      setCompleted(true);
      saveMetrics();
      setTimeout(() => onComplete(lesson.starsReward), 2000);
    } else {
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
    }
  };

  const handleCommandTap = (command: CommandItem) => {
    if (feedback !== null) return;
    cancelHints();

    setActiveCommand(command.id);
    const correct = command.id === currentCommand.id;
    setFeedback(correct ? "correct" : "wrong");
    recordMetric(currentCommand.tamilWord, correct, hintLevel !== "none");

    if (correct) {
      setScore((s) => s + 1);
      setShowConfetti(true);
      triggerSuccessHaptic();
      setTimeout(() => setShowConfetti(false), 1000);
      setAvatarStyle({
        ...ANIMATION_STYLES[command.animation],
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      });
      speakTamil(command.tamilWord, lesson.characterId);
      setTimeout(() => advanceToNext(), 2000);
    } else {
      // Auto-reveal and auto-advance
      setTimeout(() => {
        setRevealCorrect(true);
        setAvatarStyle({
          ...ANIMATION_STYLES[currentCommand.animation],
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        });
        speakTamil(currentCommand.tamilWord, lesson.characterId);
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
        <span className="text-7xl mb-4">🎬</span>
        <h2 className="text-2xl font-black text-gray-800">Great Commands!</h2>
        <p className="text-sm text-gray-500 mt-2">You explored {totalCommands} actions!</p>
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
            {currentIndex + 1} / {totalCommands}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalCommands) * 100}%` }}
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
            {data.instruction || "Listen and tap the right action!"}
          </p>
        </div>
      </div>

      {/* Audio replay */}
      <button
        onClick={playAudio}
        className="mx-auto mb-4 flex items-center gap-2 px-6 py-3 bg-orange-100 border-2 border-orange-200 rounded-2xl hover:bg-orange-150"
      >
        <Volume2 className="w-5 h-5 text-orange-600" />
        <span className="text-sm font-bold text-orange-700">🔊 Play Again</span>
      </button>

      {/* Avatar stage */}
      <div className="relative mx-auto w-48 h-48 bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl border-2 border-gray-200 flex items-center justify-center mb-6 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-200/50 rounded-b-3xl" />
        <motion.span
          className="text-7xl select-none z-10"
          style={avatarStyle}
        >
          {character.avatar}
        </motion.span>
      </div>

      {/* Command buttons */}
      <div className="grid grid-cols-2 gap-3">
        {data.commands.map((cmd) => {
          let btnStyle = "border-gray-200 bg-white hover:border-orange-300";
          if (activeCommand === cmd.id && feedback === "correct") {
            btnStyle = `${FEEDBACK_COLORS.success.border} ${FEEDBACK_COLORS.success.bg}`;
          } else if (activeCommand === cmd.id && feedback === "wrong") {
            btnStyle = `${FEEDBACK_COLORS.error.border} ${FEEDBACK_COLORS.error.bg}`;
          } else if (revealCorrect && cmd.id === currentCommand.id) {
            btnStyle = `${FEEDBACK_COLORS.reveal} border-emerald-300 bg-emerald-50`;
          } else if (cmd.id === currentCommand.id && hintLevel === "strong") {
            btnStyle = `${FEEDBACK_COLORS.hint.strong} border-gray-200 bg-white`;
          } else if (cmd.id === currentCommand.id && hintLevel === "subtle") {
            btnStyle = `${FEEDBACK_COLORS.hint.subtle} border-gray-200 bg-white`;
          }

          return (
            <motion.button
              key={cmd.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCommandTap(cmd)}
              disabled={feedback !== null}
              className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all shadow-sm disabled:opacity-70 ${btnStyle}`}
            >
              <span className="text-3xl">{cmd.emoji}</span>
              <p className="text-sm font-black text-gray-800">{cmd.tamilWord}</p>
              <p className="text-xs text-gray-400">{cmd.meaning}</p>
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
            That's "{currentCommand.tamilWord}" — {currentCommand.meaning}! 💡
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
