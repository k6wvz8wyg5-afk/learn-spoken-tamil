import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AvatarBehavior, BEHAVIOR_TEMPLATES } from "../lib/avatar-behavior";
import AvatarReaction, { AvatarMood } from "./AvatarReaction";

interface ReviewWrapperProps {
  behavior: AvatarBehavior;
  introText: string;
  children: React.ReactNode;
  onIntroComplete?: () => void;
}

const INTRO_DURATION_MS = 2000;

export default function ReviewWrapper({ behavior, introText, children, onIntroComplete }: ReviewWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      onIntroComplete?.();
    }, INTRO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onIntroComplete]);

  const template = BEHAVIOR_TEMPLATES[behavior];
  const mood: AvatarMood = template.mood;

  return (
    <div className="relative">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl"
          >
            <div className="text-center p-6 max-w-xs">
              <AvatarReaction emoji="🐻" mood={mood} size="lg" />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 relative"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-50 border-l-2 border-t-2 border-amber-200 rotate-45" />
                <p className="text-sm font-bold text-amber-800">{introText}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={showIntro ? { opacity: 0.3 } : { opacity: 1 }}
        animate={{ opacity: showIntro ? 0.3 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
