import { Reward } from "../types";

export const REWARD_TEMPLATES: Omit<Reward, "unlockedAt">[] = [
  {
    id: "r-m1",
    title: "Family Star",
    description: "Completed Module 1: Family & Self!",
    icon: "👨‍👩‍👧‍👦",
  },
  {
    id: "r-m2",
    title: "Wants & Needs Pro",
    description: "Completed Module 2: Wants and Needs!",
    icon: "🙋",
  },
  {
    id: "r-m3",
    title: "Food Explorer",
    description: "Completed Module 3: Food & Hunger!",
    icon: "🍚",
  },
  {
    id: "r-m4",
    title: "Action Hero",
    description: "Completed Module 4: Commands & Movement!",
    icon: "🏃",
  },
  {
    id: "r-m5",
    title: "Body Builder",
    description: "Completed Module 5: The Body!",
    icon: "💪",
  },
  {
    id: "r-m6",
    title: "Feelings Friend",
    description: "Completed Module 6: Feelings!",
    icon: "😊",
  },
  {
    id: "r-m7",
    title: "Animal Whisperer",
    description: "Completed Module 7: Animals!",
    icon: "🐾",
  },
  {
    id: "r-m8",
    title: "Number Ninja",
    description: "Completed Module 8: Numbers!",
    icon: "🔢",
  },
  {
    id: "r-m9",
    title: "Description Detective",
    description: "Completed Module 9: Descriptions!",
    icon: "🔍",
  },
  {
    id: "r-m10",
    title: "Play Champion",
    description: "Completed Module 10: Play & Interaction!",
    icon: "⚽",
  },
  {
    id: "r-streak-7",
    title: "Week Warrior",
    description: "Maintained a 7-day learning streak!",
    icon: "🔥",
  },
  {
    id: "r-stars-50",
    title: "Rising Star",
    description: "Earned 50 stars on your Tamil journey!",
    icon: "⭐",
  },
  {
    id: "r-stars-200",
    title: "Super Scholar",
    description: "Earned 200 stars — incredible progress!",
    icon: "🏆",
  },
  {
    id: "r-listener",
    title: "Great Listener",
    description: "Completed 10 listening lessons!",
    icon: "👂",
  },
  {
    id: "r-speaker",
    title: "Brave Speaker",
    description: "Completed 5 speaking lessons!",
    icon: "🗣️",
  },
];
