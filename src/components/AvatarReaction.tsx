import React from "react";
import { motion } from "motion/react";

export type AvatarMood = "idle" | "curious" | "celebrating" | "thinking";

interface AvatarReactionProps {
  emoji: string;
  mood: AvatarMood;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-3xl w-12 h-12",
  md: "text-5xl w-16 h-16",
  lg: "text-7xl w-24 h-24",
};

const moodVariants = {
  idle: {
    scale: 1,
    rotate: 0,
    y: 0,
  },
  curious: {
    scale: 1.05,
    rotate: [0, -8, 8, -4, 0],
    y: 0,
  },
  celebrating: {
    scale: [1, 1.2, 1.1, 1.25, 1],
    rotate: [0, 10, -10, 5, 0],
    y: [0, -12, 0, -8, 0],
  },
  thinking: {
    scale: 1,
    rotate: [0, 3, -3, 0],
    y: [0, -3, 0],
  },
};

const moodTransitions = {
  idle: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  curious: { duration: 0.8, repeat: 0 },
  celebrating: { duration: 1.2, repeat: 0 },
  thinking: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
};

export default function AvatarReaction({ emoji, mood, size = "md" }: AvatarReactionProps) {
  return (
    <motion.div
      className={`flex items-center justify-center rounded-full ${sizeClasses[size]} ${
        mood === "celebrating" ? "drop-shadow-lg" : ""
      }`}
      animate={moodVariants[mood]}
      transition={moodTransitions[mood]}
    >
      <span className="select-none">{emoji}</span>
      {mood === "celebrating" && (
        <motion.span
          className="absolute -top-1 -right-1 text-sm"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          ✨
        </motion.span>
      )}
      {mood === "curious" && (
        <motion.span
          className="absolute -top-1 -right-1 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          🔍
        </motion.span>
      )}
    </motion.div>
  );
}
