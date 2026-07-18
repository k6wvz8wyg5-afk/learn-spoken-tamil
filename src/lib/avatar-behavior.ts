import { WordTier } from "./metrics";
import { GameType } from "../types";

export type AvatarBehavior = "shared_discovery" | "desire_obstacle" | "silly_mistake" | "asymmetric_knowledge";

interface BehaviorTemplate {
  intro: string[];
  success: string[];
  mood: "curious" | "celebrating" | "thinking" | "idle";
}

export const BEHAVIOR_TEMPLATES: Record<AvatarBehavior, BehaviorTemplate> = {
  shared_discovery: {
    intro: [
      "Ooh! What's that? Let's find out together!",
      "Look what I found! Do you know this one?",
      "Hey! I think I've seen this before... help me remember!",
    ],
    success: [
      "We did it together!",
      "Yes! I knew we could figure it out!",
      "That's amazing! We're such a great team!",
    ],
    mood: "curious",
  },
  desire_obstacle: {
    intro: [
      "I really want to say this but I forgot the word...",
      "Oh no! I need this word but I can't remember it!",
      "Can you help me? I'm trying to think of something...",
    ],
    success: [
      "THAT'S the one! Thank you so much!",
      "Yes yes yes! You saved me!",
      "You remembered it! You're the best helper!",
    ],
    mood: "thinking",
  },
  silly_mistake: {
    intro: [
      "I think this one is... wait, no that's not right...",
      "Hmm, is this a banana? No no, that's silly!",
      "I'm going to guess... a cloud? Haha, I'm so confused!",
    ],
    success: [
      "Ohhh! Of course! I was being so silly!",
      "Haha, you're way smarter than me!",
      "I should have known that! Good thing you're here!",
    ],
    mood: "celebrating",
  },
  asymmetric_knowledge: {
    intro: [
      "I bet you know something I don't...",
      "You've learned so many cool words!",
      "Show me what you know!",
    ],
    success: [
      "Wow, you know so much!",
      "That's incredible! You're teaching ME now!",
      "I wish I was as smart as you!",
    ],
    mood: "idle",
  },
};

interface BehaviorWeight {
  behavior: AvatarBehavior;
  baseWeight: number;
}

const BEHAVIOR_WEIGHTS: BehaviorWeight[] = [
  { behavior: "shared_discovery", baseWeight: 0.3 },
  { behavior: "desire_obstacle", baseWeight: 0.3 },
  { behavior: "silly_mistake", baseWeight: 0.25 },
  { behavior: "asymmetric_knowledge", baseWeight: 0.15 },
];

const RECENCY_PENALTY = 0.3;

export class AvatarBehaviorController {
  private recentBehaviors: AvatarBehavior[] = [];

  selectBehavior(wordTier: WordTier, modality: GameType): AvatarBehavior {
    const weights = BEHAVIOR_WEIGHTS.map(({ behavior, baseWeight }) => {
      let weight = baseWeight;

      // Boost based on context
      if (modality === "listening" || modality === "matching") {
        if (behavior === "shared_discovery") weight *= 1.5;
      } else if (modality === "speaking" || modality === "command") {
        if (behavior === "desire_obstacle") weight *= 1.5;
      }

      if (wordTier === "familiar" && behavior === "silly_mistake") {
        weight *= 1.4;
      }

      if (wordTier === "mastered" && behavior === "asymmetric_knowledge") {
        weight *= 1.6;
      }

      // Recency penalty
      const recentCount = this.recentBehaviors.filter((b) => b === behavior).length;
      weight *= Math.pow(1 - RECENCY_PENALTY, recentCount);

      return { behavior, weight };
    });

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const { behavior, weight } of weights) {
      roll -= weight;
      if (roll <= 0) {
        this.recentBehaviors.push(behavior);
        if (this.recentBehaviors.length > 4) {
          this.recentBehaviors.shift();
        }
        return behavior;
      }
    }

    return "shared_discovery";
  }

  getTemplate(behavior: AvatarBehavior): BehaviorTemplate {
    return BEHAVIOR_TEMPLATES[behavior];
  }

  getRandomIntro(behavior: AvatarBehavior): string {
    const intros = BEHAVIOR_TEMPLATES[behavior].intro;
    return intros[Math.floor(Math.random() * intros.length)];
  }

  getRandomSuccess(behavior: AvatarBehavior): string {
    const successes = BEHAVIOR_TEMPLATES[behavior].success;
    return successes[Math.floor(Math.random() * successes.length)];
  }
}
