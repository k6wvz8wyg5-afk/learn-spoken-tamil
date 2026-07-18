export const GENTLE_REDIRECT_MESSAGES = [
  "Hmm, that didn't stick! Let's try another way!",
  "Not quite — let's hear it again!",
  "Almost! The sound is tricky — listen one more time!",
  "Let's explore a different path!",
  "Interesting choice! Let's find the matching one.",
  "That one's sneaky! Let's look closer.",
  "Hmm, close! Let's see what fits.",
  "Let's try that puzzle piece somewhere else!",
];

export const SUCCESS_MESSAGES = [
  "You got it!",
  "Brilliant ear!",
  "Tamil superstar!",
  "Semma! Perfect!",
  "Your brain is growing!",
  "Nailed it!",
  "Look at you go!",
  "Amazing!",
];

export const FEEDBACK_COLORS = {
  error: {
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-500",
  },
  success: {
    border: "border-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  hint: {
    subtle: "ring-2 ring-purple-200",
    strong: "ring-2 ring-purple-400 animate-pulse",
  },
  reveal: "ring-2 ring-emerald-300 animate-pulse",
} as const;

export const AUTO_REVEAL_DELAY_MS = 2000;
export const AUTO_ADVANCE_DELAY_MS = 1500;

export function triggerSuccessHaptic(): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(50);
  }
}

export function getRandomMessage(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}
