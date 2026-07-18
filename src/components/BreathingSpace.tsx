import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Wind, Sparkles, X, Volume2 } from "lucide-react";

interface BreathingSpaceProps {
  onClose: () => void;
}

const SOOTHING_PHRASES = [
  "You are doing absolutely wonderful! There is no hurry at all.",
  "Mistakes are just magic clues! They help our brains grow bigger and stronger.",
  "Every time you try, you make Balu, Meera, and Kavin so happy!",
  "You are super smart exactly as you are. Let's just play and explore!",
  "Take a deep breath. Learning is a fun adventure, not a race!",
  "It is perfectly okay if things don't go right the first time. We try together!"
];

export default function BreathingSpace({ onClose }: BreathingSpaceProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Cycle through breathing phases:
  // Inhale: 4s -> Hold: 2s -> Exhale: 4s -> repeat
  useEffect(() => {
    let timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (phase === "inhale") {
            setPhase("hold");
            return 2;
          } else if (phase === "hold") {
            setPhase("exhale");
            return 4;
          } else {
            setPhase("inhale");
            // Choose a new comforting phrase after each complete breath
            setPhraseIdx((prevIdx) => (prevIdx + 1) % SOOTHING_PHRASES.length);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Speaking voice comfort
  const speakComfort = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(SOOTHING_PHRASES[phraseIdx]);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Speak comfort phrases when they change
    speakComfort();
  }, [phraseIdx]);

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center p-4" id="breathing-space-modal">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border-8 border-indigo-200 rounded-[3rem] p-8 max-w-lg w-full text-center relative shadow-2xl overflow-hidden"
      >
        {/* Background bubbles */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-sky-100 rounded-full filter blur-xl opacity-40 -translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-100 rounded-full filter blur-2xl opacity-40 translate-x-10 translate-y-10" />

        {/* Close Button */}
        <button
          onClick={() => {
            if ("speechSynthesis" in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className="absolute right-6 top-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-all active:scale-90 z-10"
          id="close-breathing-button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot */}
        <div className="flex flex-col items-center mb-2">
          <motion.div
            animate={{
              y: phase === "inhale" ? [0, -12] : phase === "exhale" ? [-12, 0] : -12,
              scale: phase === "hold" ? [1, 1.05, 1] : 1
            }}
            transition={{ duration: phase === "hold" ? 1 : 4, ease: "easeInOut" }}
            className="text-7xl select-none"
          >
            🐻🧘‍♂️
          </motion.div>
          <h3 className="text-xl font-black text-indigo-950 mt-2">Balu's Bear Breath</h3>
          <p className="text-xs text-indigo-500 font-extrabold uppercase tracking-widest">
            Calming, Mistake-Free Cozy Corner
          </p>
        </div>

        {/* Breathing Animation Circle */}
        <div className="h-44 flex items-center justify-center my-4 relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={phase}
              initial={{ scale: phase === "inhale" ? 0.7 : 1.3, opacity: 0.5 }}
              animate={{
                scale: phase === "inhale" ? 1.3 : phase === "exhale" ? 0.7 : 1.3,
                opacity: 1,
              }}
              transition={{
                duration: phase === "hold" ? 2 : 4,
                ease: "easeInOut",
              }}
              className={`rounded-full flex items-center justify-center shadow-lg border-4 ${
                phase === "inhale"
                  ? "bg-sky-100 border-sky-400 w-28 h-28 text-sky-600"
                  : phase === "hold"
                  ? "bg-indigo-100 border-indigo-400 w-32 h-32 text-indigo-700"
                  : "bg-teal-100 border-teal-400 w-28 h-28 text-teal-600"
              }`}
            >
              <div className="text-center flex flex-col items-center">
                {phase === "inhale" && <Wind className="w-6 h-6 animate-pulse" />}
                {phase === "hold" && <Sparkles className="w-6 h-6 animate-spin" />}
                {phase === "exhale" && <Wind className="w-6 h-6 rotate-180" />}
                
                <span className="text-xs font-black uppercase mt-1 tracking-wider">
                  {phase === "inhale" && "Breathe In"}
                  {phase === "hold" && "Hold Peace"}
                  {phase === "exhale" && "Breathe Out"}
                </span>
                <span className="text-lg font-black">{secondsLeft}s</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Reassuring text cards */}
        <div className="bg-indigo-50/60 border-2 border-indigo-100 p-5 rounded-2xl relative min-h-[5rem] flex flex-col justify-center items-center">
          <p className="text-sm font-bold text-indigo-900 leading-relaxed max-w-sm">
            "{SOOTHING_PHRASES[phraseIdx]}"
          </p>
          <button 
            onClick={speakComfort}
            className="absolute bottom-2 right-2 p-1 bg-white border border-indigo-100 text-indigo-500 rounded-lg hover:bg-indigo-50"
            title="Read Aloud"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Encouraging Footer */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white" /> Ready to Play again!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
