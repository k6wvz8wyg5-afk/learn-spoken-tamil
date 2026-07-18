import React from "react";
import { motion } from "motion/react";

interface ConfettiProps {
  trigger: boolean;
}

const COLORS = ["#10b981", "#f59e0b", "#8b5cf6", "#3b82f6", "#ec4899", "#06b6d4"];

export default function Confetti({ trigger }: ConfettiProps) {
  if (!trigger) return null;

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 150 + 50),
    rotate: Math.random() * 360,
    color: COLORS[i % COLORS.length],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.2,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: "50%",
            top: "50%",
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            scale: [1, 1.2, 0.5],
            rotate: p.rotate,
          }}
          transition={{
            duration: 0.9,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
