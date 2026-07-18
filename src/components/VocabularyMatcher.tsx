import React, { useState, useEffect } from "react";
import { VocabWord, ModuleLesson, MatchingLessonData } from "../types";
import { Volume2, ArrowLeft, CheckCircle, AlertCircle, Award } from "lucide-react";
import { motion } from "motion/react";
import { playAudio, speakTamil } from "../lib/audioHelper";

interface VocabularyMatcherProps {
  lesson: ModuleLesson;
  data?: MatchingLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function VocabularyMatcher({ lesson, data, onComplete, onBack }: VocabularyMatcherProps) {
  const gameWords = data?.words || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const activeWord = gameWords[currentIdx];

  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]); // track which ones were solved on first try
  const [showFinished, setShowFinished] = useState(false);
  const [exploredOptions, setExploredOptions] = useState<string[]>([]);

  // Set up options when active word changes
  useEffect(() => {
    if (!activeWord) return;

    // Shuffle options: correct one + 3 random ones from the game words pool
    const pool = gameWords.filter((w) => w.id !== activeWord.id);
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const incorrectOptions = shuffledPool.slice(0, 3).map((w) => w.tamilWord);

    const combined = [activeWord.tamilWord, ...incorrectOptions].sort(() => 0.5 - Math.random());
    setOptions(combined);
    setSelectedOption(null);
    setIsCorrect(null);
    setExploredOptions([]);

    speakTamilWord(activeWord.tamilWord);
  }, [currentIdx]);

  // Handle playing spoken word from server/browser with high-fidelity Tamil script and native voice matching
  const speakTamilWord = async (word: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    
    try {
      await speakTamil(
        word,
        "kavin",
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (err) {
      console.error("Centralized speakTamil failed in VocabularyMatcher:", err);
      setIsSpeaking(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (isCorrect) return; // Prevent clicking after correct answer is found
    
    setSelectedOption(option);
    const correct = option === activeWord.tamilWord;
    setIsCorrect(correct);
    
    if (correct) {
      speakTamilWord(activeWord.tamilWord);
      setScores((prev) => [...prev, true]);
    } else {
      speakTamilWord(option); // Speak word to show what it is!
      if (!exploredOptions.includes(option)) {
        setExploredOptions((prev) => [...prev, option]);
      }
      setScores((prev) => [...prev, false]);
    }
  };

  const handleNext = () => {
    if (currentIdx < gameWords.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed vocabulary challenge!
      setShowFinished(true);
      setTimeout(() => {
        onComplete(lesson.starsReward);
      }, 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4" id="vocab-matching-screen">
      {/* Top controls */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          id="back-to-map-from-vocab"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Game
        </button>
        <span className="text-sm font-black text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl">
          Word Match {currentIdx + 1}/{gameWords.length}
        </span>
      </div>

      {/* Main Game Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Kavin the Peacock instructions */}
        <div className="md:col-span-4 flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-7xl mb-2"
          >
            🦚
          </motion.div>
          <div className="bg-teal-50 border-3 border-teal-200 p-4 rounded-3xl relative shadow-sm">
            <h4 className="text-sm font-bold text-teal-800">Kavin the Peacock says:</h4>
            <p className="text-xs text-teal-700/90 font-medium mt-1 leading-relaxed">
              {isCorrect === true
                ? "Excellent! You found the correct word! Let's say it out loud together!"
                : selectedOption && !isCorrect
                ? `Oh, wonderful! You found "${selectedOption}", which means "${gameWords.find(w => w.tamilWord === selectedOption)?.meaning || "something else"}"! Let's keep exploring to find "${activeWord?.meaning}"!`
                : `Can you find the spoken Tamil word for "${activeWord?.meaning}"? Take your time!`}
            </p>
          </div>
        </div>

        {/* Word Clue Card & Answer Options */}
        <div className="md:col-span-8 flex flex-col items-center">
          {/* Large Concept Card */}
          <motion.div 
            key={activeWord.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-4 border-teal-200 p-8 rounded-[2.5rem] text-center w-full max-w-sm shadow-sm relative overflow-hidden"
          >
            {/* Big Emoji */}
            <span className="text-7xl block mb-2 select-none animate-bounce">{activeWord.emoji}</span>
            <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{activeWord.meaning}</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 block">
              Spoken Word Challenge
            </span>

            {/* Pronunciation Play Button */}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => speakTamilWord(activeWord.tamilWord)}
                disabled={isSpeaking}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-sm text-sm active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4 fill-white" /> Listen Sound
              </button>
            </div>
          </motion.div>

          {/* Grid of Tamil Option Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
            {options.map((option) => {
              const isOptionCorrect = option === activeWord.tamilWord;
              const isExplored = exploredOptions.includes(option);
              
              let btnClass = "bg-white border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-teal-50/30";
              if (isCorrect) {
                if (isOptionCorrect) {
                  btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200";
                } else {
                  btnClass = "bg-gray-50 border-gray-100 text-gray-300 pointer-events-none";
                }
              } else if (isExplored) {
                btnClass = "bg-sky-50 border-sky-300 text-sky-800 shadow-sm";
              }

              return (
                <motion.button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  disabled={isCorrect === true}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-2xl border-3 font-extrabold text-base transition-all shadow-sm flex flex-col items-center justify-center min-h-[4.5rem] ${btnClass}`}
                >
                  <span className="leading-tight">{option}</span>
                  {isExplored && (
                    <span className="text-[10px] font-bold text-sky-600 mt-1 leading-none">
                      (= {gameWords.find((w) => w.tamilWord === option)?.meaning})
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback & Continue Area */}
          {isCorrect === true && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center w-full"
            >
              <div className="flex items-center gap-2 p-3 rounded-2xl border-2 w-full max-w-sm bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-black">Semma Smart! You got it!</p>
                  <p className="text-[10px] font-medium leading-relaxed opacity-90">
                    "{activeWord.tamilWord}" in colloquial Tamil means "{activeWord.meaning}" (Written: {activeWord.tamilScript})
                  </p>
                </div>
              </div>

              <button
                onClick={handleNext}
                id="matcher-action-button"
                className="mt-4 px-8 py-3 font-black rounded-2xl shadow-sm text-sm active:scale-95 transition-all text-white bg-teal-500 hover:bg-teal-600 shadow-teal-100"
              >
                Next Word!
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Complete celebratory modal */}
      {showFinished && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-8 max-w-sm text-center border-4 border-teal-300 shadow-xl"
          >
            <span className="text-6xl block animate-bounce">🦚🎉</span>
            <h3 className="text-2xl font-black text-teal-800 mt-4">Awesome Matcher!</h3>
            <p className="text-sm text-gray-500 mt-1">
              You matched all the words correctly with Kavin! You are amazing!
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
