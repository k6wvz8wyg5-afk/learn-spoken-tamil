import React, { useState, useEffect, useRef } from "react";
import { SpokenPhrase, ModuleLesson, PhrasesLessonData } from "../types";
import { Volume2, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playAudio, speakTamil } from "../lib/audioHelper";
import { triggerSuccessHaptic, getRandomMessage, GENTLE_REDIRECT_MESSAGES, FEEDBACK_COLORS, AUTO_REVEAL_DELAY_MS, AUTO_ADVANCE_DELAY_MS } from "../lib/feedback";
import Confetti from "./Confetti";

interface SpokenPhrasesProps {
  lesson: ModuleLesson;
  data?: PhrasesLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function SpokenPhrases({ lesson, data, onComplete, onBack }: SpokenPhrasesProps) {
  const phrases = data?.phrases || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const activePhrase = phrases[currentIdx];

  const [shuffledWords, setShuffledWords] = useState<{ id: string; text: string; order: number }[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ id: string; text: string; order: number }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const revealTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePhrase) return;

    const scrambled = [...activePhrase.words].sort(() => 0.5 - Math.random());
    setShuffledWords(scrambled);
    setSelectedWords([]);
    setIsCorrect(null);
    setRevealCorrect(false);
    setShowConfetti(false);

    speakTamilWord(activePhrase.spokenTamil);
  }, [currentIdx]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const speakTamilWord = async (phrase: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    try {
      await speakTamil(
        phrase,
        "balu",
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleWordClick = (word: { id: string; text: string; order: number }) => {
    if (isCorrect !== null) return;

    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    setShuffledWords(shuffledWords.filter((w) => w.id !== word.id));

    speakTamilWord(word.text);

    if (newSelected.length === activePhrase.words.length) {
      const correct = newSelected.every((w, idx) => w.order === idx);
      setIsCorrect(correct);
      if (correct) {
        triggerSuccessHaptic();
        setShowConfetti(true);
        speakTamilWord(activePhrase.spokenTamil);
      } else {
        // Rubber-band: auto-bounce back after delay, then reveal correct
        revealTimerRef.current = window.setTimeout(() => {
          // Bounce words back
          setSelectedWords([]);
          setShuffledWords([...activePhrase.words].sort(() => 0.5 - Math.random()));
          setRevealCorrect(true);
          speakTamilWord(activePhrase.spokenTamil);

          // Auto-advance after showing correct
          advanceTimerRef.current = window.setTimeout(() => {
            handleNext();
          }, AUTO_ADVANCE_DELAY_MS + 1000);
        }, AUTO_REVEAL_DELAY_MS);
      }
    }
  };

  const handleRemoveWord = (word: { id: string; text: string; order: number }) => {
    if (isCorrect !== null) return;

    setSelectedWords(selectedWords.filter((w) => w.id !== word.id));
    setShuffledWords([...shuffledWords, word]);
  };

  const handleNext = () => {
    if (currentIdx < phrases.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowCelebrate(true);
      setTimeout(() => {
        onComplete(lesson.starsReward);
      }, 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4" id="phrase-bubble-screen">
      <Confetti trigger={showConfetti} />

      {/* Top action row */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          id="back-to-map-from-phrases"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Game
        </button>
        <span className="text-sm font-black text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl">
          Phrase Challenge {currentIdx + 1}/{phrases.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Balu instructions */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="text-7xl mb-2"
          >
            🐻
          </motion.div>
          <div className="bg-orange-50 border-3 border-orange-200 p-4 rounded-3xl relative shadow-sm">
            <h4 className="text-sm font-bold text-orange-800">Balu the Bear:</h4>
            <p className="text-xs text-orange-700/90 font-medium mt-1 leading-relaxed">
              {isCorrect === true
                ? "Balu is dancing! You built it right! Speak it out loud with me!"
                : isCorrect === false
                ? getRandomMessage(GENTLE_REDIRECT_MESSAGES)
                : "Can you click the word bubbles in order to say: " + activePhrase.english + "?"}
            </p>
          </div>
        </div>

        {/* Bubble builder workspace */}
        <div className="md:col-span-8 flex flex-col items-center">
          <div className="bg-white border-4 border-orange-100 p-6 rounded-[2.5rem] w-full max-w-sm shadow-sm">
            {/* Target English phrase */}
            <div className="text-center">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
                How to say:
              </span>
              <h3 className="text-xl font-extrabold text-gray-800">"{activePhrase.english}"</h3>
            </div>

            {/* Assemble workspace box */}
            <div className="mt-6 bg-slate-50 rounded-2xl p-4 min-h-[4.5rem] flex flex-wrap gap-2 items-center justify-center border-2 border-dashed border-gray-200">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-gray-400 font-medium select-none">Tap bubbles below...</span>
              ) : (
                selectedWords.map((word) => (
                  <motion.button
                    key={word.id}
                    onClick={() => handleRemoveWord(word)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`px-3.5 py-1.5 rounded-full font-black text-sm border-2 transition-colors shadow-sm ${
                      isCorrect === true
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isCorrect === false
                        ? `${FEEDBACK_COLORS.error.bg} ${FEEDBACK_COLORS.error.border} ${FEEDBACK_COLORS.error.text}`
                        : "bg-orange-100 border-orange-300 text-orange-800"
                    }`}
                  >
                    {word.text}
                  </motion.button>
                ))
              )}
            </div>

            {/* Correct order reveal */}
            <AnimatePresence>
              {revealCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 rounded-xl bg-emerald-50 ring-2 ring-emerald-300 animate-pulse"
                >
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Correct order:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {activePhrase.words
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((w) => (
                        <span key={w.id} className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-black">
                          {w.text}
                        </span>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scrambled bubbles options */}
            {shuffledWords.length > 0 && !revealCorrect && (
              <div className="mt-6">
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Scrambled Bubbles
                </p>
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {shuffledWords.map((word) => (
                    <motion.button
                      key={word.id}
                      onClick={() => handleWordClick(word)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="px-4 py-2 bg-orange-50 border-3 border-orange-200 text-orange-800 rounded-full font-black text-sm shadow-sm hover:bg-orange-100 active:scale-95 transition-all"
                    >
                      {word.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Success: pronunciation guide + continue */}
            {isCorrect === true && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center"
              >
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Spoken Pronunciation Guide</div>
                <h4 className="text-lg font-black text-emerald-800 mt-0.5">{activePhrase.spokenTamil}</h4>
                <p className="text-xs text-gray-400 font-medium italic mt-0.5">"{activePhrase.pronunciationGuide}"</p>
                <p className="text-[10px] text-gray-400 mt-1">(Written Tamil: {activePhrase.writtenTamil})</p>

                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={() => speakTamilWord(activePhrase.spokenTamil)}
                    disabled={isSpeaking}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-600 shadow-sm active:scale-95 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 fill-white" /> Listen Sound
                  </button>
                  <button
                    onClick={handleNext}
                    id="phrase-next-button"
                    className="px-5 py-2 bg-purple-500 text-white font-extrabold text-xs rounded-xl hover:bg-purple-600 shadow-sm active:scale-95 transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Celebratory Modal */}
      {showCelebrate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-8 max-w-sm text-center border-4 border-orange-300 shadow-xl"
          >
            <span className="text-6xl block animate-bounce">🐻🎉🍯</span>
            <h3 className="text-2xl font-black text-orange-800 mt-4">Sweet Victory!</h3>
            <p className="text-sm text-gray-500 mt-1">
              You explored all the spoken sentences! Balu is sharing his honey jar with you!
            </p>
            <div className="mt-4 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 font-extrabold px-3 py-1.5 rounded-full text-sm">
              🌟 +{lesson.starsReward} Stars Earned!
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
