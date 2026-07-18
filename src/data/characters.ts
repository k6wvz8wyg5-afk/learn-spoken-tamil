import { Character, CharacterId } from "../types";

export const CHARACTERS: Record<CharacterId, Character> = {
  [CharacterId.MEERA]: {
    id: CharacterId.MEERA,
    name: "Meera the Squirrel",
    avatar: "🐿️",
    role: "Alphabet Tracing Guide",
    greeting: "En iniya kutty! Let's trace beautiful letters together!",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    accentColor: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700",
  },
  [CharacterId.KAVIN]: {
    id: CharacterId.KAVIN,
    name: "Kavin the Peacock",
    avatar: "🦚",
    role: "Spoken Word Explorer",
    greeting: "Semma! I'm Kavin, let's learn some awesome spoken words today!",
    color: "text-teal-600",
    bgColor: "bg-teal-50 border-teal-200",
    accentColor: "bg-teal-500 hover:bg-teal-600 active:bg-teal-700",
  },
  [CharacterId.BALU]: {
    id: CharacterId.BALU,
    name: "Balu the Bear",
    avatar: "🐻",
    role: "Everyday Talk Friend",
    greeting: "Vanakkam, thambi/thangachi! I love honey, idlis, and speaking Tamil with you!",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    accentColor: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
  },
};
