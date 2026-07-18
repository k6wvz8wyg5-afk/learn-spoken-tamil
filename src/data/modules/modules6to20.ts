import { Module, CharacterId } from "../../types";

export const MODULE_6: Module = {
  id: "m6", title: "Unarvugal", tamilTitle: "உணர்வுகள்", theme: "Feelings",
  characterId: CharacterId.BALU, icon: "😊", unlockAfter: "m5",
  lessons: [
    { id: "m6-l1", moduleId: "m6", lessonNumber: 1, title: "Listen: Feelings!", description: "Hear emotions and tap the right face!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", instruction: "How does this feel? Tap the right face!", items: [
      { id: "m6-l1-1", tamilWord: "Sirippu", tamilScript: "சிரிப்பு", meaning: "Happy", emoji: "😄", distractors: [{ emoji: "😢", meaning: "Sad" }, { emoji: "😠", meaning: "Angry" }, { emoji: "😨", meaning: "Scared" }] },
      { id: "m6-l1-2", tamilWord: "Azhugai", tamilScript: "அழுகை", meaning: "Sad", emoji: "😢", distractors: [{ emoji: "😄", meaning: "Happy" }, { emoji: "😠", meaning: "Angry" }, { emoji: "😨", meaning: "Scared" }] },
      { id: "m6-l1-3", tamilWord: "Kovam", tamilScript: "கோவம்", meaning: "Angry", emoji: "😠", distractors: [{ emoji: "😄", meaning: "Happy" }, { emoji: "😢", meaning: "Sad" }, { emoji: "😨", meaning: "Scared" }] },
      { id: "m6-l1-4", tamilWord: "Bayam", tamilScript: "பயம்", meaning: "Scared", emoji: "😨", distractors: [{ emoji: "😄", meaning: "Happy" }, { emoji: "😢", meaning: "Sad" }, { emoji: "😠", meaning: "Angry" }] },
    ] } },
    { id: "m6-l2", moduleId: "m6", lessonNumber: 2, title: "Match: Feeling Words!", description: "Match the Tamil word to the emotion!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
      { id: "m6-v1", tamilWord: "Sirippu", tamilScript: "சிரிப்பு", meaning: "Happy", category: "Feelings", emoji: "😄" },
      { id: "m6-v2", tamilWord: "Azhugai", tamilScript: "அழுகை", meaning: "Sad", category: "Feelings", emoji: "😢" },
      { id: "m6-v3", tamilWord: "Kovam", tamilScript: "கோவம்", meaning: "Angry", category: "Feelings", emoji: "😠" },
      { id: "m6-v4", tamilWord: "Bayam", tamilScript: "பயம்", meaning: "Scared", category: "Feelings", emoji: "😨" },
    ] } },
    { id: "m6-l3", moduleId: "m6", lessonNumber: 3, title: "Speak: How do you feel?", description: "Say the feeling words!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
      { id: "m6-l3-1", tamilWord: "Sirippu", tamilScript: "சிரிப்பு", meaning: "Happy", emoji: "😄", acceptedPronunciations: ["sirippu", "சிரிப்பு", "siripbu", "chirippu"] },
      { id: "m6-l3-2", tamilWord: "Azhugai", tamilScript: "அழுகை", meaning: "Sad", emoji: "😢", acceptedPronunciations: ["azhugai", "அழுகை", "alugai", "azhukai"] },
      { id: "m6-l3-3", tamilWord: "Kovam", tamilScript: "கோவம்", meaning: "Angry", emoji: "😠", acceptedPronunciations: ["kovam", "கோவம்", "govam", "koham"] },
      { id: "m6-l3-4", tamilWord: "Bayam", tamilScript: "பயம்", meaning: "Scared", emoji: "😨", acceptedPronunciations: ["bayam", "பயம்", "payam", "bhayam"] },
    ] } },
    { id: "m6-l4", moduleId: "m6", lessonNumber: 4, title: "Build: I am scared!", description: "Build feeling sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", instruction: "Tell how you feel!", sentences: [
      { id: "m6-l4-1", english: "I am scared", contextEmoji: "😨", blocks: [{ id: "b1", tamilWord: "Enakku", tamilScript: "எனக்கு", meaning: "For me", order: 0 }, { id: "b2", tamilWord: "bayama", tamilScript: "பயமா", meaning: "scared", emoji: "😨", order: 1 }, { id: "b3", tamilWord: "irukku", tamilScript: "இருக்கு", meaning: "is", order: 2 }], targetSlots: 3 },
      { id: "m6-l4-2", english: "I am angry", contextEmoji: "😠", blocks: [{ id: "b4", tamilWord: "Enakku", tamilScript: "எனக்கு", meaning: "For me", order: 0 }, { id: "b5", tamilWord: "kovama", tamilScript: "கோவமா", meaning: "angry", emoji: "😠", order: 1 }, { id: "b6", tamilWord: "irukku", tamilScript: "இருக்கு", meaning: "is", order: 2 }], targetSlots: 3 },
      { id: "m6-l4-3", english: "I feel happy", contextEmoji: "😄", blocks: [{ id: "b7", tamilWord: "Enakku", tamilScript: "எனக்கு", meaning: "For me", order: 0 }, { id: "b8", tamilWord: "sirippu", tamilScript: "சிரிப்பு", meaning: "happy", emoji: "😄", order: 1 }, { id: "b9", tamilWord: "varudhu", tamilScript: "வருது", meaning: "comes", order: 2 }], targetSlots: 3 },
    ] } },
  ],
};

export const MODULE_7: Module = {
  id: "m7", title: "Mirugangal", tamilTitle: "மிருகங்கள்", theme: "Animals",
  characterId: CharacterId.KAVIN, icon: "🐾", unlockAfter: "m6",
  lessons: [
    { id: "m7-l1", moduleId: "m7", lessonNumber: 1, title: "Listen: Animal Names!", description: "Hear the animal and tap it!", characterId: CharacterId.KAVIN, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
      { id: "m7-l1-1", tamilWord: "Naay", tamilScript: "நாய்", meaning: "Dog", emoji: "🐕", distractors: [{ emoji: "🐱", meaning: "Cat" }, { emoji: "🐦‍⬛", meaning: "Crow" }, { emoji: "🐟", meaning: "Fish" }] },
      { id: "m7-l1-2", tamilWord: "Poonai", tamilScript: "பூனை", meaning: "Cat", emoji: "🐱", distractors: [{ emoji: "🐕", meaning: "Dog" }, { emoji: "🐦‍⬛", meaning: "Crow" }, { emoji: "🐟", meaning: "Fish" }] },
      { id: "m7-l1-3", tamilWord: "Kaaka", tamilScript: "காக்கா", meaning: "Crow", emoji: "🐦‍⬛", distractors: [{ emoji: "🐕", meaning: "Dog" }, { emoji: "🐱", meaning: "Cat" }, { emoji: "🐟", meaning: "Fish" }] },
      { id: "m7-l1-4", tamilWord: "Meen", tamilScript: "மீன்", meaning: "Fish", emoji: "🐟", distractors: [{ emoji: "🐕", meaning: "Dog" }, { emoji: "🐱", meaning: "Cat" }, { emoji: "🐦‍⬛", meaning: "Crow" }] },
    ] } },
    { id: "m7-l2", moduleId: "m7", lessonNumber: 2, title: "Speak: Animal Sounds to Words!", description: "Say the Tamil animal name!", characterId: CharacterId.KAVIN, gameType: "speaking", starsReward: 15, data: { type: "speaking", items: [
      { id: "m7-l2-1", tamilWord: "Naay", tamilScript: "நாய்", meaning: "Dog", emoji: "🐕", acceptedPronunciations: ["naay", "நாய்", "nai", "naai"] },
      { id: "m7-l2-2", tamilWord: "Poonai", tamilScript: "பூனை", meaning: "Cat", emoji: "🐱", acceptedPronunciations: ["poonai", "பூனை", "punai", "poonay"] },
      { id: "m7-l2-3", tamilWord: "Kaaka", tamilScript: "காக்கா", meaning: "Crow", emoji: "🐦‍⬛", acceptedPronunciations: ["kaaka", "காக்கா", "kaka", "kaakaa"] },
      { id: "m7-l2-4", tamilWord: "Meen", tamilScript: "மீன்", meaning: "Fish", emoji: "🐟", acceptedPronunciations: ["meen", "மீன்", "min", "miin"] },
    ] } },
    { id: "m7-l3", moduleId: "m7", lessonNumber: 3, title: "Match: Animals!", description: "Match Tamil word to animal!", characterId: CharacterId.KAVIN, gameType: "matching", starsReward: 20, data: { type: "matching", words: [
      { id: "m7-v1", tamilWord: "Naay", tamilScript: "நாய்", meaning: "Dog", category: "Animals", emoji: "🐕" },
      { id: "m7-v2", tamilWord: "Poonai", tamilScript: "பூனை", meaning: "Cat", category: "Animals", emoji: "🐱" },
      { id: "m7-v3", tamilWord: "Kaaka", tamilScript: "காக்கா", meaning: "Crow", category: "Animals", emoji: "🐦‍⬛" },
      { id: "m7-v4", tamilWord: "Meen", tamilScript: "மீன்", meaning: "Fish", category: "Animals", emoji: "🐟" },
    ] } },
    { id: "m7-l4", moduleId: "m7", lessonNumber: 4, title: "Build: Dog is running!", description: "Build animal action sentences!", characterId: CharacterId.KAVIN, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
      { id: "m7-l4-1", english: "Dog is running", contextEmoji: "🐕🏃", blocks: [{ id: "b1", tamilWord: "Naay", tamilScript: "நாய்", meaning: "Dog", emoji: "🐕", order: 0 }, { id: "b2", tamilWord: "oduthu", tamilScript: "ஓடுது", meaning: "is running", order: 1 }], targetSlots: 2 },
      { id: "m7-l4-2", english: "Cat is sitting", contextEmoji: "🐱🪑", blocks: [{ id: "b3", tamilWord: "Poonai", tamilScript: "பூனை", meaning: "Cat", emoji: "🐱", order: 0 }, { id: "b4", tamilWord: "ukkaruthu", tamilScript: "உக்காருது", meaning: "is sitting", order: 1 }], targetSlots: 2 },
      { id: "m7-l4-3", english: "Crow is flying", contextEmoji: "🐦‍⬛🌤️", blocks: [{ id: "b5", tamilWord: "Kaaka", tamilScript: "காக்கா", meaning: "Crow", emoji: "🐦‍⬛", order: 0 }, { id: "b6", tamilWord: "parakuthu", tamilScript: "பறக்குது", meaning: "is flying", order: 1 }], targetSlots: 2 },
    ] } },
  ],
};

export const MODULE_8: Module = {
  id: "m8", title: "Enngal", tamilTitle: "எண்கள்", theme: "Numbers 1-5",
  characterId: CharacterId.MEERA, icon: "🔢", unlockAfter: "m7",
  lessons: [
    { id: "m8-l1", moduleId: "m8", lessonNumber: 1, title: "Listen: Numbers!", description: "Hear the number, tap how many!", characterId: CharacterId.MEERA, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
      { id: "m8-l1-1", tamilWord: "Onnu", tamilScript: "ஒன்னு", meaning: "One", emoji: "1️⃣", distractors: [{ emoji: "2️⃣", meaning: "Two" }, { emoji: "3️⃣", meaning: "Three" }, { emoji: "5️⃣", meaning: "Five" }] },
      { id: "m8-l1-2", tamilWord: "Rendu", tamilScript: "ரெண்டு", meaning: "Two", emoji: "2️⃣", distractors: [{ emoji: "1️⃣", meaning: "One" }, { emoji: "3️⃣", meaning: "Three" }, { emoji: "4️⃣", meaning: "Four" }] },
      { id: "m8-l1-3", tamilWord: "Moonu", tamilScript: "மூணு", meaning: "Three", emoji: "3️⃣", distractors: [{ emoji: "1️⃣", meaning: "One" }, { emoji: "2️⃣", meaning: "Two" }, { emoji: "5️⃣", meaning: "Five" }] },
      { id: "m8-l1-4", tamilWord: "Naalu", tamilScript: "நாலு", meaning: "Four", emoji: "4️⃣", distractors: [{ emoji: "2️⃣", meaning: "Two" }, { emoji: "3️⃣", meaning: "Three" }, { emoji: "5️⃣", meaning: "Five" }] },
      { id: "m8-l1-5", tamilWord: "Anju", tamilScript: "அஞ்சு", meaning: "Five", emoji: "5️⃣", distractors: [{ emoji: "1️⃣", meaning: "One" }, { emoji: "3️⃣", meaning: "Three" }, { emoji: "4️⃣", meaning: "Four" }] },
    ] } },
    { id: "m8-l2", moduleId: "m8", lessonNumber: 2, title: "Match: Number Words!", description: "Match the Tamil number!", characterId: CharacterId.MEERA, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
      { id: "m8-v1", tamilWord: "Onnu", tamilScript: "ஒன்னு", meaning: "One", category: "Numbers", emoji: "1️⃣" },
      { id: "m8-v2", tamilWord: "Rendu", tamilScript: "ரெண்டு", meaning: "Two", category: "Numbers", emoji: "2️⃣" },
      { id: "m8-v3", tamilWord: "Moonu", tamilScript: "மூணு", meaning: "Three", category: "Numbers", emoji: "3️⃣" },
      { id: "m8-v4", tamilWord: "Naalu", tamilScript: "நாலு", meaning: "Four", category: "Numbers", emoji: "4️⃣" },
      { id: "m8-v5", tamilWord: "Anju", tamilScript: "அஞ்சு", meaning: "Five", category: "Numbers", emoji: "5️⃣" },
    ] } },
    { id: "m8-l3", moduleId: "m8", lessonNumber: 3, title: "Speak: Count out loud!", description: "Say the numbers in Tamil!", characterId: CharacterId.MEERA, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
      { id: "m8-l3-1", tamilWord: "Onnu", tamilScript: "ஒன்னு", meaning: "One", emoji: "1️⃣", acceptedPronunciations: ["onnu", "ஒன்னு", "onru", "onu"] },
      { id: "m8-l3-2", tamilWord: "Rendu", tamilScript: "ரெண்டு", meaning: "Two", emoji: "2️⃣", acceptedPronunciations: ["rendu", "ரெண்டு", "randu", "rentu"] },
      { id: "m8-l3-3", tamilWord: "Moonu", tamilScript: "மூணு", meaning: "Three", emoji: "3️⃣", acceptedPronunciations: ["moonu", "மூணு", "munu", "moonu"] },
      { id: "m8-l3-4", tamilWord: "Naalu", tamilScript: "நாலு", meaning: "Four", emoji: "4️⃣", acceptedPronunciations: ["naalu", "நாலு", "nalu", "naalu"] },
      { id: "m8-l3-5", tamilWord: "Anju", tamilScript: "அஞ்சு", meaning: "Five", emoji: "5️⃣", acceptedPronunciations: ["anju", "அஞ்சு", "anchu", "anju"] },
    ] } },
    { id: "m8-l4", moduleId: "m8", lessonNumber: 4, title: "Build: Two dosas please!", description: "Build counting sentences!", characterId: CharacterId.MEERA, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
      { id: "m8-l4-1", english: "I want two dosas", contextEmoji: "🫓🫓", blocks: [{ id: "b1", tamilWord: "Rendu", tamilScript: "ரெண்டு", meaning: "Two", order: 0 }, { id: "b2", tamilWord: "dosa", tamilScript: "தோசை", meaning: "dosa", emoji: "🫓", order: 1 }, { id: "b3", tamilWord: "venum", tamilScript: "வேணும்", meaning: "want", order: 2 }], targetSlots: 3 },
      { id: "m8-l4-2", english: "Three balls", contextEmoji: "⚽⚽⚽", blocks: [{ id: "b4", tamilWord: "Moonu", tamilScript: "மூணு", meaning: "Three", order: 0 }, { id: "b5", tamilWord: "pande", tamilScript: "பந்து", meaning: "ball", emoji: "⚽", order: 1 }], targetSlots: 2 },
      { id: "m8-l4-3", english: "Five fruits", contextEmoji: "🍎🍎🍎🍎🍎", blocks: [{ id: "b6", tamilWord: "Anju", tamilScript: "அஞ்சு", meaning: "Five", order: 0 }, { id: "b7", tamilWord: "pazham", tamilScript: "பழம்", meaning: "fruit", emoji: "🍎", order: 1 }], targetSlots: 2 },
    ] } },
  ],
};

export const MODULE_9: Module = {
  id: "m9", title: "Adai-mozhigal", tamilTitle: "அடைமொழிகள்", theme: "Descriptions",
  characterId: CharacterId.KAVIN, icon: "🔍", unlockAfter: "m8",
  lessons: [
    { id: "m9-l1", moduleId: "m9", lessonNumber: 1, title: "Listen: Big or Small?", description: "Hear the description and match!", characterId: CharacterId.KAVIN, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
      { id: "m9-l1-1", tamilWord: "Perisu", tamilScript: "பெரிசு", meaning: "Big", emoji: "🐘", distractors: [{ emoji: "🐜", meaning: "Small" }, { emoji: "🔥", meaning: "Hot" }, { emoji: "❄️", meaning: "Cold" }] },
      { id: "m9-l1-2", tamilWord: "Chinnathu", tamilScript: "சின்னது", meaning: "Small", emoji: "🐜", distractors: [{ emoji: "🐘", meaning: "Big" }, { emoji: "🔥", meaning: "Hot" }, { emoji: "❄️", meaning: "Cold" }] },
      { id: "m9-l1-3", tamilWord: "Soodu", tamilScript: "சூடு", meaning: "Hot", emoji: "🔥", distractors: [{ emoji: "🐘", meaning: "Big" }, { emoji: "🐜", meaning: "Small" }, { emoji: "❄️", meaning: "Cold" }] },
      { id: "m9-l1-4", tamilWord: "Kulir", tamilScript: "குளிர்", meaning: "Cold", emoji: "❄️", distractors: [{ emoji: "🐘", meaning: "Big" }, { emoji: "🐜", meaning: "Small" }, { emoji: "🔥", meaning: "Hot" }] },
    ] } },
    { id: "m9-l2", moduleId: "m9", lessonNumber: 2, title: "Match: Description Words!", description: "Match the Tamil description!", characterId: CharacterId.KAVIN, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
      { id: "m9-v1", tamilWord: "Perisu", tamilScript: "பெரிசு", meaning: "Big", category: "Descriptions", emoji: "🐘" },
      { id: "m9-v2", tamilWord: "Chinnathu", tamilScript: "சின்னது", meaning: "Small", category: "Descriptions", emoji: "🐜" },
      { id: "m9-v3", tamilWord: "Soodu", tamilScript: "சூடு", meaning: "Hot", category: "Descriptions", emoji: "🔥" },
      { id: "m9-v4", tamilWord: "Kulir", tamilScript: "குளிர்", meaning: "Cold", category: "Descriptions", emoji: "❄️" },
    ] } },
    { id: "m9-l3", moduleId: "m9", lessonNumber: 3, title: "Speak: Describe it!", description: "Say the description words!", characterId: CharacterId.KAVIN, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
      { id: "m9-l3-1", tamilWord: "Perisu", tamilScript: "பெரிசு", meaning: "Big", emoji: "🐘", acceptedPronunciations: ["perisu", "பெரிசு", "perichu", "pericu"] },
      { id: "m9-l3-2", tamilWord: "Chinnathu", tamilScript: "சின்னது", meaning: "Small", emoji: "🐜", acceptedPronunciations: ["chinnathu", "சின்னது", "chinathu", "sinnathu"] },
      { id: "m9-l3-3", tamilWord: "Soodu", tamilScript: "சூடு", meaning: "Hot", emoji: "🔥", acceptedPronunciations: ["soodu", "சூடு", "sudu", "choodu"] },
      { id: "m9-l3-4", tamilWord: "Kulir", tamilScript: "குளிர்", meaning: "Cold", emoji: "❄️", acceptedPronunciations: ["kulir", "குளிர்", "kuliru", "koolir"] },
    ] } },
    { id: "m9-l4", moduleId: "m9", lessonNumber: 4, title: "Build: Hot milk please!", description: "Build description sentences!", characterId: CharacterId.KAVIN, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
      { id: "m9-l4-1", english: "I want hot milk", contextEmoji: "🥛🔥", blocks: [{ id: "b1", tamilWord: "Sooda", tamilScript: "சூடா", meaning: "Hot", emoji: "🔥", order: 0 }, { id: "b2", tamilWord: "paal", tamilScript: "பால்", meaning: "milk", emoji: "🥛", order: 1 }, { id: "b3", tamilWord: "venum", tamilScript: "வேணும்", meaning: "want", order: 2 }], targetSlots: 3 },
      { id: "m9-l4-2", english: "Big ball", contextEmoji: "⚽🐘", blocks: [{ id: "b4", tamilWord: "Periya", tamilScript: "பெரிய", meaning: "Big", emoji: "🐘", order: 0 }, { id: "b5", tamilWord: "pande", tamilScript: "பந்து", meaning: "ball", emoji: "⚽", order: 1 }], targetSlots: 2 },
      { id: "m9-l4-3", english: "Small toy", contextEmoji: "🧸🐜", blocks: [{ id: "b6", tamilWord: "Chinna", tamilScript: "சின்ன", meaning: "Small", emoji: "🐜", order: 0 }, { id: "b7", tamilWord: "bommai", tamilScript: "பொம்மை", meaning: "toy", emoji: "🧸", order: 1 }], targetSlots: 2 },
    ] } },
  ],
};

export const MODULE_10: Module = {
  id: "m10", title: "Vilayattu", tamilTitle: "விளையாட்டு", theme: "Play & Interaction",
  characterId: CharacterId.BALU, icon: "⚽", unlockAfter: "m9",
  lessons: [
    { id: "m10-l1", moduleId: "m10", lessonNumber: 1, title: "Listen: Play Words!", description: "Hear play words and tap!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
      { id: "m10-l1-1", tamilWord: "Pande", tamilScript: "பந்து", meaning: "Ball", emoji: "⚽", distractors: [{ emoji: "🧸", meaning: "Toy" }, { emoji: "🤾", meaning: "Throw" }, { emoji: "🤲", meaning: "Catch" }] },
      { id: "m10-l1-2", tamilWord: "Bommai", tamilScript: "பொம்மை", meaning: "Toy", emoji: "🧸", distractors: [{ emoji: "⚽", meaning: "Ball" }, { emoji: "🤾", meaning: "Throw" }, { emoji: "🤲", meaning: "Catch" }] },
      { id: "m10-l1-3", tamilWord: "Thooki podu", tamilScript: "தூக்கி போடு", meaning: "Throw", emoji: "🤾", distractors: [{ emoji: "⚽", meaning: "Ball" }, { emoji: "🧸", meaning: "Toy" }, { emoji: "🤲", meaning: "Catch" }] },
      { id: "m10-l1-4", tamilWord: "Pidi", tamilScript: "பிடி", meaning: "Catch", emoji: "🤲", distractors: [{ emoji: "⚽", meaning: "Ball" }, { emoji: "🧸", meaning: "Toy" }, { emoji: "🤾", meaning: "Throw" }] },
    ] } },
    { id: "m10-l2", moduleId: "m10", lessonNumber: 2, title: "Speak: Play commands!", description: "Say throw and catch!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 15, data: { type: "speaking", items: [
      { id: "m10-l2-1", tamilWord: "Pande", tamilScript: "பந்து", meaning: "Ball", emoji: "⚽", acceptedPronunciations: ["pande", "பந்து", "pandhu", "bande"] },
      { id: "m10-l2-2", tamilWord: "Thooki podu", tamilScript: "தூக்கி போடு", meaning: "Throw", emoji: "🤾", acceptedPronunciations: ["thooki podu", "தூக்கி போடு", "tuki podu", "thooki"] },
      { id: "m10-l2-3", tamilWord: "Pidi", tamilScript: "பிடி", meaning: "Catch", emoji: "🤲", acceptedPronunciations: ["pidi", "பிடி", "bidi", "pudi"] },
      { id: "m10-l2-4", tamilWord: "Vilayada polama", tamilScript: "விளையாட போலாமா", meaning: "Shall we play?", emoji: "🎮", acceptedPronunciations: ["vilayada polama", "விளையாட போலாமா", "vilayada", "vilaiada polama"] },
    ] } },
    { id: "m10-l3", moduleId: "m10", lessonNumber: 3, title: "Match: Play Vocabulary!", description: "Match play words!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 20, data: { type: "matching", words: [
      { id: "m10-v1", tamilWord: "Pande", tamilScript: "பந்து", meaning: "Ball", category: "Play", emoji: "⚽" },
      { id: "m10-v2", tamilWord: "Bommai", tamilScript: "பொம்மை", meaning: "Toy", category: "Play", emoji: "🧸" },
      { id: "m10-v3", tamilWord: "Thooki podu", tamilScript: "தூக்கி போடு", meaning: "Throw", category: "Play", emoji: "🤾" },
      { id: "m10-v4", tamilWord: "Pidi", tamilScript: "பிடி", meaning: "Catch", category: "Play", emoji: "🤲" },
    ] } },
    { id: "m10-l4", moduleId: "m10", lessonNumber: 4, title: "Build: Dad, throw the ball!", description: "Build play sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
      { id: "m10-l4-1", english: "Dad, throw the ball", contextEmoji: "👨⚽", blocks: [{ id: "b1", tamilWord: "Appa", tamilScript: "அப்பா", meaning: "Dad", emoji: "👨", order: 0 }, { id: "b2", tamilWord: "pande", tamilScript: "பந்து", meaning: "ball", emoji: "⚽", order: 1 }, { id: "b3", tamilWord: "thooki podu", tamilScript: "தூக்கி போடு", meaning: "throw", order: 2 }], targetSlots: 3 },
      { id: "m10-l4-2", english: "Shall we play?", contextEmoji: "🎮❓", blocks: [{ id: "b4", tamilWord: "Vilayada", tamilScript: "விளையாட", meaning: "Play", emoji: "🎮", order: 0 }, { id: "b5", tamilWord: "polama?", tamilScript: "போலாமா?", meaning: "shall we?", order: 1 }], targetSlots: 2 },
      { id: "m10-l4-3", english: "Catch the toy", contextEmoji: "🧸🤲", blocks: [{ id: "b6", tamilWord: "Bommai", tamilScript: "பொம்மை", meaning: "Toy", emoji: "🧸", order: 0 }, { id: "b7", tamilWord: "pidi", tamilScript: "பிடி", meaning: "catch", emoji: "🤲", order: 1 }], targetSlots: 2 },
    ] } },
  ],
};

// Modules 11-20: Same pattern with simplified data
export const MODULE_11: Module = { id: "m11", title: "Kelvigal", tamilTitle: "கேள்விகள்", theme: "Questions", characterId: CharacterId.BALU, icon: "❓", unlockAfter: "m10", lessons: [
  { id: "m11-l1", moduleId: "m11", lessonNumber: 1, title: "Listen: Question Words!", description: "Hear What, Why, Where!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m11-l1-1", tamilWord: "Enna", tamilScript: "என்ன", meaning: "What", emoji: "❓", distractors: [{ emoji: "🤔", meaning: "Why" }, { emoji: "📍", meaning: "Where" }, { emoji: "👤", meaning: "Who" }] },
    { id: "m11-l1-2", tamilWord: "Yean", tamilScript: "ஏன்", meaning: "Why", emoji: "🤔", distractors: [{ emoji: "❓", meaning: "What" }, { emoji: "📍", meaning: "Where" }, { emoji: "👤", meaning: "Who" }] },
    { id: "m11-l1-3", tamilWord: "Enga", tamilScript: "எங்க", meaning: "Where", emoji: "📍", distractors: [{ emoji: "❓", meaning: "What" }, { emoji: "🤔", meaning: "Why" }, { emoji: "👤", meaning: "Who" }] },
  ] } },
  { id: "m11-l2", moduleId: "m11", lessonNumber: 2, title: "Match: Questions!", description: "Match question words!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m11-v1", tamilWord: "Enna", tamilScript: "என்ன", meaning: "What", category: "Questions", emoji: "❓" },
    { id: "m11-v2", tamilWord: "Yean", tamilScript: "ஏன்", meaning: "Why", category: "Questions", emoji: "🤔" },
    { id: "m11-v3", tamilWord: "Enga", tamilScript: "எங்க", meaning: "Where", category: "Questions", emoji: "📍" },
  ] } },
  { id: "m11-l3", moduleId: "m11", lessonNumber: 3, title: "Speak: Ask Questions!", description: "Say the question words!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m11-l3-1", tamilWord: "Enna", tamilScript: "என்ன", meaning: "What", emoji: "❓", acceptedPronunciations: ["enna", "என்ன", "ena", "yenna"] },
    { id: "m11-l3-2", tamilWord: "Yean", tamilScript: "ஏன்", meaning: "Why", emoji: "🤔", acceptedPronunciations: ["yean", "ஏன்", "yen", "yaen"] },
    { id: "m11-l3-3", tamilWord: "Enga", tamilScript: "எங்க", meaning: "Where", emoji: "📍", acceptedPronunciations: ["enga", "எங்க", "enge", "yenge"] },
  ] } },
  { id: "m11-l4", moduleId: "m11", lessonNumber: 4, title: "Build: Where is the ball?", description: "Build question sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m11-l4-1", english: "Where is the ball?", contextEmoji: "⚽📍", blocks: [{ id: "b1", tamilWord: "Pande", tamilScript: "பந்து", meaning: "Ball", emoji: "⚽", order: 0 }, { id: "b2", tamilWord: "enga?", tamilScript: "எங்க?", meaning: "where?", order: 1 }], targetSlots: 2 },
    { id: "m11-l4-2", english: "What is this?", contextEmoji: "❓👆", blocks: [{ id: "b3", tamilWord: "Idhu", tamilScript: "இது", meaning: "This", order: 0 }, { id: "b4", tamilWord: "enna?", tamilScript: "என்ன?", meaning: "what?", order: 1 }], targetSlots: 2 },
    { id: "m11-l4-3", english: "Why are you crying?", contextEmoji: "🤔😢", blocks: [{ id: "b5", tamilWord: "Yean", tamilScript: "ஏன்", meaning: "Why", order: 0 }, { id: "b6", tamilWord: "azhura?", tamilScript: "அழுற?", meaning: "crying?", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_12: Module = { id: "m12", title: "Nirangal", tamilTitle: "நிறங்கள்", theme: "Colors", characterId: CharacterId.KAVIN, icon: "🌈", unlockAfter: "m11", lessons: [
  { id: "m12-l1", moduleId: "m12", lessonNumber: 1, title: "Listen: Colors!", description: "Hear and tap the color!", characterId: CharacterId.KAVIN, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m12-l1-1", tamilWord: "Sivappu", tamilScript: "சிவப்பு", meaning: "Red", emoji: "🔴", distractors: [{ emoji: "🟢", meaning: "Green" }, { emoji: "🟡", meaning: "Yellow" }, { emoji: "🔵", meaning: "Blue" }] },
    { id: "m12-l1-2", tamilWord: "Pachai", tamilScript: "பச்சை", meaning: "Green", emoji: "🟢", distractors: [{ emoji: "🔴", meaning: "Red" }, { emoji: "🟡", meaning: "Yellow" }, { emoji: "🔵", meaning: "Blue" }] },
    { id: "m12-l1-3", tamilWord: "Manjal", tamilScript: "மஞ்சள்", meaning: "Yellow", emoji: "🟡", distractors: [{ emoji: "🔴", meaning: "Red" }, { emoji: "🟢", meaning: "Green" }, { emoji: "🔵", meaning: "Blue" }] },
    { id: "m12-l1-4", tamilWord: "Neelam", tamilScript: "நீலம்", meaning: "Blue", emoji: "🔵", distractors: [{ emoji: "🔴", meaning: "Red" }, { emoji: "🟢", meaning: "Green" }, { emoji: "🟡", meaning: "Yellow" }] },
  ] } },
  { id: "m12-l2", moduleId: "m12", lessonNumber: 2, title: "Match: Color Words!", description: "Match Tamil colors!", characterId: CharacterId.KAVIN, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m12-v1", tamilWord: "Sivappu", tamilScript: "சிவப்பு", meaning: "Red", category: "Colors", emoji: "🔴" },
    { id: "m12-v2", tamilWord: "Pachai", tamilScript: "பச்சை", meaning: "Green", category: "Colors", emoji: "🟢" },
    { id: "m12-v3", tamilWord: "Manjal", tamilScript: "மஞ்சள்", meaning: "Yellow", category: "Colors", emoji: "🟡" },
    { id: "m12-v4", tamilWord: "Neelam", tamilScript: "நீலம்", meaning: "Blue", category: "Colors", emoji: "🔵" },
  ] } },
  { id: "m12-l3", moduleId: "m12", lessonNumber: 3, title: "Speak: Say the colors!", description: "Name the colors in Tamil!", characterId: CharacterId.KAVIN, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m12-l3-1", tamilWord: "Sivappu", tamilScript: "சிவப்பு", meaning: "Red", emoji: "🔴", acceptedPronunciations: ["sivappu", "சிவப்பு", "sivapu", "chevappu"] },
    { id: "m12-l3-2", tamilWord: "Pachai", tamilScript: "பச்சை", meaning: "Green", emoji: "🟢", acceptedPronunciations: ["pachai", "பச்சை", "pachchai", "pacchai"] },
    { id: "m12-l3-3", tamilWord: "Manjal", tamilScript: "மஞ்சள்", meaning: "Yellow", emoji: "🟡", acceptedPronunciations: ["manjal", "மஞ்சள்", "manjel", "mancal"] },
    { id: "m12-l3-4", tamilWord: "Neelam", tamilScript: "நீலம்", meaning: "Blue", emoji: "🔵", acceptedPronunciations: ["neelam", "நீலம்", "nilam", "neelum"] },
  ] } },
  { id: "m12-l4", moduleId: "m12", lessonNumber: 4, title: "Build: Red ball!", description: "Build color sentences!", characterId: CharacterId.KAVIN, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m12-l4-1", english: "Red ball", contextEmoji: "🔴⚽", blocks: [{ id: "b1", tamilWord: "Sivappu", tamilScript: "சிவப்பு", meaning: "Red", emoji: "🔴", order: 0 }, { id: "b2", tamilWord: "pande", tamilScript: "பந்து", meaning: "ball", emoji: "⚽", order: 1 }], targetSlots: 2 },
    { id: "m12-l4-2", english: "Green leaf", contextEmoji: "🟢🍃", blocks: [{ id: "b3", tamilWord: "Pachai", tamilScript: "பச்சை", meaning: "Green", emoji: "🟢", order: 0 }, { id: "b4", tamilWord: "ilai", tamilScript: "இலை", meaning: "leaf", emoji: "🍃", order: 1 }], targetSlots: 2 },
    { id: "m12-l4-3", english: "Blue sky", contextEmoji: "🔵🌤️", blocks: [{ id: "b5", tamilWord: "Neela", tamilScript: "நீல", meaning: "Blue", emoji: "🔵", order: 0 }, { id: "b6", tamilWord: "vaanam", tamilScript: "வானம்", meaning: "sky", emoji: "🌤️", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_13: Module = { id: "m13", title: "Kaalam", tamilTitle: "காலம்", theme: "Time", characterId: CharacterId.BALU, icon: "⏰", unlockAfter: "m12", lessons: [
  { id: "m13-l1", moduleId: "m13", lessonNumber: 1, title: "Listen: Now or Later?", description: "Hear time words!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m13-l1-1", tamilWord: "Ippo", tamilScript: "இப்போ", meaning: "Now", emoji: "⏰", distractors: [{ emoji: "🔜", meaning: "Later" }, { emoji: "🌅", meaning: "Tomorrow" }, { emoji: "🤷", meaning: "Maybe" }] },
    { id: "m13-l1-2", tamilWord: "Apram", tamilScript: "அப்புறம்", meaning: "Later", emoji: "🔜", distractors: [{ emoji: "⏰", meaning: "Now" }, { emoji: "🌅", meaning: "Tomorrow" }, { emoji: "🤷", meaning: "Maybe" }] },
    { id: "m13-l1-3", tamilWord: "Naalaiki", tamilScript: "நாளைக்கு", meaning: "Tomorrow", emoji: "🌅", distractors: [{ emoji: "⏰", meaning: "Now" }, { emoji: "🔜", meaning: "Later" }, { emoji: "🤷", meaning: "Maybe" }] },
  ] } },
  { id: "m13-l2", moduleId: "m13", lessonNumber: 2, title: "Match: Time Words!", description: "Match time vocabulary!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m13-v1", tamilWord: "Ippo", tamilScript: "இப்போ", meaning: "Now", category: "Time", emoji: "⏰" },
    { id: "m13-v2", tamilWord: "Apram", tamilScript: "அப்புறம்", meaning: "Later", category: "Time", emoji: "🔜" },
    { id: "m13-v3", tamilWord: "Naalaiki", tamilScript: "நாளைக்கு", meaning: "Tomorrow", category: "Time", emoji: "🌅" },
  ] } },
  { id: "m13-l3", moduleId: "m13", lessonNumber: 3, title: "Speak: When?", description: "Say the time words!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m13-l3-1", tamilWord: "Ippo", tamilScript: "இப்போ", meaning: "Now", emoji: "⏰", acceptedPronunciations: ["ippo", "இப்போ", "ipo", "ippa"] },
    { id: "m13-l3-2", tamilWord: "Apram", tamilScript: "அப்புறம்", meaning: "Later", emoji: "🔜", acceptedPronunciations: ["apram", "அப்புறம்", "appuram", "aprom"] },
    { id: "m13-l3-3", tamilWord: "Naalaiki", tamilScript: "நாளைக்கு", meaning: "Tomorrow", emoji: "🌅", acceptedPronunciations: ["naalaiki", "நாளைக்கு", "nalaikku", "naalaiku"] },
  ] } },
  { id: "m13-l4", moduleId: "m13", lessonNumber: 4, title: "Build: I want it now!", description: "Build time sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m13-l4-1", english: "I want it now", contextEmoji: "⏰✅", blocks: [{ id: "b1", tamilWord: "Enakku", tamilScript: "எனக்கு", meaning: "For me", order: 0 }, { id: "b2", tamilWord: "ippo", tamilScript: "இப்போ", meaning: "now", emoji: "⏰", order: 1 }, { id: "b3", tamilWord: "venum", tamilScript: "வேணும்", meaning: "want", order: 2 }], targetSlots: 3 },
    { id: "m13-l4-2", english: "We'll play later", contextEmoji: "🔜🎮", blocks: [{ id: "b4", tamilWord: "Apram", tamilScript: "அப்புறம்", meaning: "Later", emoji: "🔜", order: 0 }, { id: "b5", tamilWord: "vilayalaam", tamilScript: "விளையாலாம்", meaning: "we'll play", order: 1 }], targetSlots: 2 },
    { id: "m13-l4-3", english: "Let's go tomorrow", contextEmoji: "🌅🚶", blocks: [{ id: "b6", tamilWord: "Naalaiki", tamilScript: "நாளைக்கு", meaning: "Tomorrow", emoji: "🌅", order: 0 }, { id: "b7", tamilWord: "polaam", tamilScript: "போலாம்", meaning: "let's go", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_14: Module = { id: "m14", title: "Udanpirappugal", tamilTitle: "உடன்பிறப்புகள்", theme: "Siblings", characterId: CharacterId.BALU, icon: "👫", unlockAfter: "m13", lessons: [
  { id: "m14-l1", moduleId: "m14", lessonNumber: 1, title: "Listen: Brother & Sister!", description: "Hear sibling names!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m14-l1-1", tamilWord: "Anna", tamilScript: "அண்ணா", meaning: "Older brother", emoji: "👦", distractors: [{ emoji: "👧", meaning: "Older sister" }, { emoji: "🧒", meaning: "Younger brother" }, { emoji: "👶", meaning: "Younger sister" }] },
    { id: "m14-l1-2", tamilWord: "Akka", tamilScript: "அக்கா", meaning: "Older sister", emoji: "👧", distractors: [{ emoji: "👦", meaning: "Older brother" }, { emoji: "🧒", meaning: "Younger brother" }, { emoji: "👶", meaning: "Younger sister" }] },
    { id: "m14-l1-3", tamilWord: "Thambi", tamilScript: "தம்பி", meaning: "Younger brother", emoji: "🧒", distractors: [{ emoji: "👦", meaning: "Older brother" }, { emoji: "👧", meaning: "Older sister" }, { emoji: "👶", meaning: "Younger sister" }] },
    { id: "m14-l1-4", tamilWord: "Thangachi", tamilScript: "தங்கச்சி", meaning: "Younger sister", emoji: "👶", distractors: [{ emoji: "👦", meaning: "Older brother" }, { emoji: "👧", meaning: "Older sister" }, { emoji: "🧒", meaning: "Younger brother" }] },
  ] } },
  { id: "m14-l2", moduleId: "m14", lessonNumber: 2, title: "Speak: Say sibling names!", description: "Practice sibling pronunciation!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 15, data: { type: "speaking", items: [
    { id: "m14-l2-1", tamilWord: "Anna", tamilScript: "அண்ணா", meaning: "Older brother", emoji: "👦", acceptedPronunciations: ["anna", "அண்ணா", "ana", "annan"] },
    { id: "m14-l2-2", tamilWord: "Akka", tamilScript: "அக்கா", meaning: "Older sister", emoji: "👧", acceptedPronunciations: ["akka", "அக்கா", "aka", "akkaa"] },
    { id: "m14-l2-3", tamilWord: "Thambi", tamilScript: "தம்பி", meaning: "Younger brother", emoji: "🧒", acceptedPronunciations: ["thambi", "தம்பி", "tambi", "dhambi"] },
    { id: "m14-l2-4", tamilWord: "Thangachi", tamilScript: "தங்கச்சி", meaning: "Younger sister", emoji: "👶", acceptedPronunciations: ["thangachi", "தங்கச்சி", "tangachi", "thangachi"] },
  ] } },
  { id: "m14-l3", moduleId: "m14", lessonNumber: 3, title: "Match: Sibling Words!", description: "Match siblings!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 20, data: { type: "matching", words: [
    { id: "m14-v1", tamilWord: "Anna", tamilScript: "அண்ணா", meaning: "Older brother", category: "Family", emoji: "👦" },
    { id: "m14-v2", tamilWord: "Akka", tamilScript: "அக்கா", meaning: "Older sister", category: "Family", emoji: "👧" },
    { id: "m14-v3", tamilWord: "Thambi", tamilScript: "தம்பி", meaning: "Younger brother", category: "Family", emoji: "🧒" },
    { id: "m14-v4", tamilWord: "Thangachi", tamilScript: "தங்கச்சி", meaning: "Younger sister", category: "Family", emoji: "👶" },
  ] } },
  { id: "m14-l4", moduleId: "m14", lessonNumber: 4, title: "Build: This is my brother!", description: "Build sibling sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m14-l4-1", english: "This is my older brother", contextEmoji: "👦", blocks: [{ id: "b1", tamilWord: "Idhu", tamilScript: "இது", meaning: "This", order: 0 }, { id: "b2", tamilWord: "en", tamilScript: "என்", meaning: "my", order: 1 }, { id: "b3", tamilWord: "anna", tamilScript: "அண்ணா", meaning: "older brother", emoji: "👦", order: 2 }], targetSlots: 3 },
    { id: "m14-l4-2", english: "Where is older sister?", contextEmoji: "👧📍", blocks: [{ id: "b4", tamilWord: "Akka", tamilScript: "அக்கா", meaning: "Older sister", emoji: "👧", order: 0 }, { id: "b5", tamilWord: "enga?", tamilScript: "எங்க?", meaning: "where?", order: 1 }], targetSlots: 2 },
    { id: "m14-l4-3", english: "Younger brother, come!", contextEmoji: "🧒👋", blocks: [{ id: "b6", tamilWord: "Thambi", tamilScript: "தம்பி", meaning: "Younger brother", emoji: "🧒", order: 0 }, { id: "b7", tamilWord: "vaa", tamilScript: "வா", meaning: "come", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_15: Module = { id: "m15", title: "Idangal", tamilTitle: "இடங்கள்", theme: "Places", characterId: CharacterId.KAVIN, icon: "🏠", unlockAfter: "m14", lessons: [
  { id: "m15-l1", moduleId: "m15", lessonNumber: 1, title: "Listen: Places!", description: "Hear and find the place!", characterId: CharacterId.KAVIN, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m15-l1-1", tamilWord: "Veedu", tamilScript: "வீடு", meaning: "House", emoji: "🏠", distractors: [{ emoji: "🏪", meaning: "Shop" }, { emoji: "🏫", meaning: "School" }, { emoji: "🌳", meaning: "Outside" }] },
    { id: "m15-l1-2", tamilWord: "Kadai", tamilScript: "கடை", meaning: "Shop", emoji: "🏪", distractors: [{ emoji: "🏠", meaning: "House" }, { emoji: "🏫", meaning: "School" }, { emoji: "🌳", meaning: "Outside" }] },
    { id: "m15-l1-3", tamilWord: "School", tamilScript: "ஸ்கூல்", meaning: "School", emoji: "🏫", distractors: [{ emoji: "🏠", meaning: "House" }, { emoji: "🏪", meaning: "Shop" }, { emoji: "🌳", meaning: "Outside" }] },
    { id: "m15-l1-4", tamilWord: "Veliya", tamilScript: "வெளிய", meaning: "Outside", emoji: "🌳", distractors: [{ emoji: "🏠", meaning: "House" }, { emoji: "🏪", meaning: "Shop" }, { emoji: "🏫", meaning: "School" }] },
  ] } },
  { id: "m15-l2", moduleId: "m15", lessonNumber: 2, title: "Match: Place Names!", description: "Match places!", characterId: CharacterId.KAVIN, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m15-v1", tamilWord: "Veedu", tamilScript: "வீடு", meaning: "House", category: "Places", emoji: "🏠" },
    { id: "m15-v2", tamilWord: "Kadai", tamilScript: "கடை", meaning: "Shop", category: "Places", emoji: "🏪" },
    { id: "m15-v3", tamilWord: "School", tamilScript: "ஸ்கூல்", meaning: "School", category: "Places", emoji: "🏫" },
    { id: "m15-v4", tamilWord: "Veliya", tamilScript: "வெளிய", meaning: "Outside", category: "Places", emoji: "🌳" },
  ] } },
  { id: "m15-l3", moduleId: "m15", lessonNumber: 3, title: "Speak: Say the places!", description: "Name the places!", characterId: CharacterId.KAVIN, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m15-l3-1", tamilWord: "Veedu", tamilScript: "வீடு", meaning: "House", emoji: "🏠", acceptedPronunciations: ["veedu", "வீடு", "vidu", "veetu"] },
    { id: "m15-l3-2", tamilWord: "Kadai", tamilScript: "கடை", meaning: "Shop", emoji: "🏪", acceptedPronunciations: ["kadai", "கடை", "kadei", "kade"] },
    { id: "m15-l3-3", tamilWord: "Veliya", tamilScript: "வெளிய", meaning: "Outside", emoji: "🌳", acceptedPronunciations: ["veliya", "வெளிய", "velia", "veliye"] },
  ] } },
  { id: "m15-l4", moduleId: "m15", lessonNumber: 4, title: "Build: Go outside!", description: "Build place sentences!", characterId: CharacterId.KAVIN, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m15-l4-1", english: "Go outside", contextEmoji: "🌳👉", blocks: [{ id: "b1", tamilWord: "Veliya", tamilScript: "வெளிய", meaning: "Outside", emoji: "🌳", order: 0 }, { id: "b2", tamilWord: "po", tamilScript: "போ", meaning: "go", order: 1 }], targetSlots: 2 },
    { id: "m15-l4-2", english: "Let's go to the shop", contextEmoji: "🏪🚶", blocks: [{ id: "b3", tamilWord: "Kadai-kku", tamilScript: "கடைக்கு", meaning: "To the shop", emoji: "🏪", order: 0 }, { id: "b4", tamilWord: "polaam", tamilScript: "போலாம்", meaning: "let's go", order: 1 }], targetSlots: 2 },
    { id: "m15-l4-3", english: "Go home", contextEmoji: "🏠👉", blocks: [{ id: "b5", tamilWord: "Veedu-kku", tamilScript: "வீட்டுக்கு", meaning: "To home", emoji: "🏠", order: 0 }, { id: "b6", tamilWord: "po", tamilScript: "போ", meaning: "go", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_16: Module = { id: "m16", title: "Vahanangal", tamilTitle: "வாகனங்கள்", theme: "Vehicles", characterId: CharacterId.KAVIN, icon: "🚗", unlockAfter: "m15", lessons: [
  { id: "m16-l1", moduleId: "m16", lessonNumber: 1, title: "Listen: Vehicles!", description: "Hear and tap the vehicle!", characterId: CharacterId.KAVIN, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m16-l1-1", tamilWord: "Car", tamilScript: "கார்", meaning: "Car", emoji: "🚗", distractors: [{ emoji: "🚌", meaning: "Bus" }, { emoji: "🚂", meaning: "Train" }, { emoji: "🚲", meaning: "Cycle" }] },
    { id: "m16-l1-2", tamilWord: "Bus", tamilScript: "பஸ்", meaning: "Bus", emoji: "🚌", distractors: [{ emoji: "🚗", meaning: "Car" }, { emoji: "🚂", meaning: "Train" }, { emoji: "🚲", meaning: "Cycle" }] },
    { id: "m16-l1-3", tamilWord: "Train", tamilScript: "ட்ரெயின்", meaning: "Train", emoji: "🚂", distractors: [{ emoji: "🚗", meaning: "Car" }, { emoji: "🚌", meaning: "Bus" }, { emoji: "🚲", meaning: "Cycle" }] },
    { id: "m16-l1-4", tamilWord: "Cycle", tamilScript: "சைக்கிள்", meaning: "Cycle", emoji: "🚲", distractors: [{ emoji: "🚗", meaning: "Car" }, { emoji: "🚌", meaning: "Bus" }, { emoji: "🚂", meaning: "Train" }] },
  ] } },
  { id: "m16-l2", moduleId: "m16", lessonNumber: 2, title: "Match: Vehicle Names!", description: "Match vehicles!", characterId: CharacterId.KAVIN, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m16-v1", tamilWord: "Car", tamilScript: "கார்", meaning: "Car", category: "Vehicles", emoji: "🚗" },
    { id: "m16-v2", tamilWord: "Bus", tamilScript: "பஸ்", meaning: "Bus", category: "Vehicles", emoji: "🚌" },
    { id: "m16-v3", tamilWord: "Train", tamilScript: "ட்ரெயின்", meaning: "Train", category: "Vehicles", emoji: "🚂" },
    { id: "m16-v4", tamilWord: "Cycle", tamilScript: "சைக்கிள்", meaning: "Cycle", category: "Vehicles", emoji: "🚲" },
  ] } },
  { id: "m16-l3", moduleId: "m16", lessonNumber: 3, title: "Speak: Vehicle sounds!", description: "Say the vehicle names!", characterId: CharacterId.KAVIN, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m16-l3-1", tamilWord: "Car", tamilScript: "கார்", meaning: "Car", emoji: "🚗", acceptedPronunciations: ["car", "கார்", "kaar", "kar"] },
    { id: "m16-l3-2", tamilWord: "Bus", tamilScript: "பஸ்", meaning: "Bus", emoji: "🚌", acceptedPronunciations: ["bus", "பஸ்", "bas", "buss"] },
    { id: "m16-l3-3", tamilWord: "Train", tamilScript: "ட்ரெயின்", meaning: "Train", emoji: "🚂", acceptedPronunciations: ["train", "ட்ரெயின்", "tren", "trayn"] },
    { id: "m16-l3-4", tamilWord: "Cycle", tamilScript: "சைக்கிள்", meaning: "Cycle", emoji: "🚲", acceptedPronunciations: ["cycle", "சைக்கிள்", "saikil", "caikil"] },
  ] } },
  { id: "m16-l4", moduleId: "m16", lessonNumber: 4, title: "Build: Big bus!", description: "Build vehicle sentences!", characterId: CharacterId.KAVIN, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m16-l4-1", english: "Big bus", contextEmoji: "🚌🐘", blocks: [{ id: "b1", tamilWord: "Periya", tamilScript: "பெரிய", meaning: "Big", order: 0 }, { id: "b2", tamilWord: "bus", tamilScript: "பஸ்", meaning: "bus", emoji: "🚌", order: 1 }], targetSlots: 2 },
    { id: "m16-l4-2", english: "Shall we go in the car?", contextEmoji: "🚗❓", blocks: [{ id: "b3", tamilWord: "Car-la", tamilScript: "கார்ல", meaning: "In car", emoji: "🚗", order: 0 }, { id: "b4", tamilWord: "polama?", tamilScript: "போலாமா?", meaning: "shall we go?", order: 1 }], targetSlots: 2 },
    { id: "m16-l4-3", english: "Train is coming", contextEmoji: "🚂🔜", blocks: [{ id: "b5", tamilWord: "Train", tamilScript: "ட்ரெயின்", meaning: "Train", emoji: "🚂", order: 0 }, { id: "b6", tamilWord: "varudhu", tamilScript: "வருது", meaning: "is coming", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_17: Module = { id: "m17", title: "Udamai", tamilTitle: "உடமை", theme: "Possession", characterId: CharacterId.BALU, icon: "🎁", unlockAfter: "m16", lessons: [
  { id: "m17-l1", moduleId: "m17", lessonNumber: 1, title: "Listen: Mine or Yours?", description: "Hear possession words!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m17-l1-1", tamilWord: "Ennodathu", tamilScript: "என்னோடது", meaning: "Mine", emoji: "🙋", distractors: [{ emoji: "🫵", meaning: "Yours" }, { emoji: "👥", meaning: "Theirs" }, { emoji: "❓", meaning: "Whose" }] },
    { id: "m17-l1-2", tamilWord: "Unnodathu", tamilScript: "உன்னோடது", meaning: "Yours", emoji: "🫵", distractors: [{ emoji: "🙋", meaning: "Mine" }, { emoji: "👥", meaning: "Theirs" }, { emoji: "❓", meaning: "Whose" }] },
    { id: "m17-l1-3", tamilWord: "Avangadhu", tamilScript: "அவங்கது", meaning: "Theirs", emoji: "👥", distractors: [{ emoji: "🙋", meaning: "Mine" }, { emoji: "🫵", meaning: "Yours" }, { emoji: "❓", meaning: "Whose" }] },
  ] } },
  { id: "m17-l2", moduleId: "m17", lessonNumber: 2, title: "Match: Possession!", description: "Match ownership words!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m17-v1", tamilWord: "Ennodathu", tamilScript: "என்னோடது", meaning: "Mine", category: "Possession", emoji: "🙋" },
    { id: "m17-v2", tamilWord: "Unnodathu", tamilScript: "உன்னோடது", meaning: "Yours", category: "Possession", emoji: "🫵" },
    { id: "m17-v3", tamilWord: "Avangadhu", tamilScript: "அவங்கது", meaning: "Theirs", category: "Possession", emoji: "👥" },
  ] } },
  { id: "m17-l3", moduleId: "m17", lessonNumber: 3, title: "Speak: It's mine!", description: "Say the ownership words!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m17-l3-1", tamilWord: "Ennodathu", tamilScript: "என்னோடது", meaning: "Mine", emoji: "🙋", acceptedPronunciations: ["ennodathu", "என்னோடது", "enodadu", "ennodadu"] },
    { id: "m17-l3-2", tamilWord: "Unnodathu", tamilScript: "உன்னோடது", meaning: "Yours", emoji: "🫵", acceptedPronunciations: ["unnodathu", "உன்னோடது", "unodadu", "unnodadu"] },
    { id: "m17-l3-3", tamilWord: "Avangadhu", tamilScript: "அவங்கது", meaning: "Theirs", emoji: "👥", acceptedPronunciations: ["avangadhu", "அவங்கது", "avangadu", "avangadhu"] },
  ] } },
  { id: "m17-l4", moduleId: "m17", lessonNumber: 4, title: "Build: This is mine!", description: "Build ownership sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m17-l4-1", english: "This is mine", contextEmoji: "🙋👆", blocks: [{ id: "b1", tamilWord: "Idhu", tamilScript: "இது", meaning: "This", order: 0 }, { id: "b2", tamilWord: "ennodathu", tamilScript: "என்னோடது", meaning: "mine", emoji: "🙋", order: 1 }], targetSlots: 2 },
    { id: "m17-l4-2", english: "That is yours", contextEmoji: "🫵👆", blocks: [{ id: "b3", tamilWord: "Adhu", tamilScript: "அது", meaning: "That", order: 0 }, { id: "b4", tamilWord: "unnodathu", tamilScript: "உன்னோடது", meaning: "yours", emoji: "🫵", order: 1 }], targetSlots: 2 },
    { id: "m17-l4-3", english: "This is theirs", contextEmoji: "👥👆", blocks: [{ id: "b5", tamilWord: "Idhu", tamilScript: "இது", meaning: "This", order: 0 }, { id: "b6", tamilWord: "avangadhu", tamilScript: "அவங்கது", meaning: "theirs", emoji: "👥", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_18: Module = { id: "m18", title: "Vaanilai", tamilTitle: "வானிலை", theme: "Weather", characterId: CharacterId.MEERA, icon: "🌤️", unlockAfter: "m17", lessons: [
  { id: "m18-l1", moduleId: "m18", lessonNumber: 1, title: "Listen: Weather!", description: "Hear weather words!", characterId: CharacterId.MEERA, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m18-l1-1", tamilWord: "Mazhai", tamilScript: "மழை", meaning: "Rain", emoji: "🌧️", distractors: [{ emoji: "🌞", meaning: "Sun" }, { emoji: "💨", meaning: "Wind" }, { emoji: "☁️", meaning: "Cloud" }] },
    { id: "m18-l1-2", tamilWord: "Veyil", tamilScript: "வெயில்", meaning: "Sun", emoji: "🌞", distractors: [{ emoji: "🌧️", meaning: "Rain" }, { emoji: "💨", meaning: "Wind" }, { emoji: "☁️", meaning: "Cloud" }] },
    { id: "m18-l1-3", tamilWord: "Kaathu", tamilScript: "காத்து", meaning: "Wind", emoji: "💨", distractors: [{ emoji: "🌧️", meaning: "Rain" }, { emoji: "🌞", meaning: "Sun" }, { emoji: "☁️", meaning: "Cloud" }] },
    { id: "m18-l1-4", tamilWord: "Megam", tamilScript: "மேகம்", meaning: "Cloud", emoji: "☁️", distractors: [{ emoji: "🌧️", meaning: "Rain" }, { emoji: "🌞", meaning: "Sun" }, { emoji: "💨", meaning: "Wind" }] },
  ] } },
  { id: "m18-l2", moduleId: "m18", lessonNumber: 2, title: "Match: Weather!", description: "Match weather words!", characterId: CharacterId.MEERA, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m18-v1", tamilWord: "Mazhai", tamilScript: "மழை", meaning: "Rain", category: "Weather", emoji: "🌧️" },
    { id: "m18-v2", tamilWord: "Veyil", tamilScript: "வெயில்", meaning: "Sun", category: "Weather", emoji: "🌞" },
    { id: "m18-v3", tamilWord: "Kaathu", tamilScript: "காத்து", meaning: "Wind", category: "Weather", emoji: "💨" },
    { id: "m18-v4", tamilWord: "Megam", tamilScript: "மேகம்", meaning: "Cloud", category: "Weather", emoji: "☁️" },
  ] } },
  { id: "m18-l3", moduleId: "m18", lessonNumber: 3, title: "Speak: Weather report!", description: "Say weather words!", characterId: CharacterId.MEERA, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m18-l3-1", tamilWord: "Mazhai", tamilScript: "மழை", meaning: "Rain", emoji: "🌧️", acceptedPronunciations: ["mazhai", "மழை", "malai", "mazhe"] },
    { id: "m18-l3-2", tamilWord: "Veyil", tamilScript: "வெயில்", meaning: "Sun", emoji: "🌞", acceptedPronunciations: ["veyil", "வெயில்", "veyilu", "vayil"] },
    { id: "m18-l3-3", tamilWord: "Kaathu", tamilScript: "காத்து", meaning: "Wind", emoji: "💨", acceptedPronunciations: ["kaathu", "காத்து", "kathu", "kaadhu"] },
    { id: "m18-l3-4", tamilWord: "Megam", tamilScript: "மேகம்", meaning: "Cloud", emoji: "☁️", acceptedPronunciations: ["megam", "மேகம்", "megham", "mekam"] },
  ] } },
  { id: "m18-l4", moduleId: "m18", lessonNumber: 4, title: "Build: Rain is coming!", description: "Build weather sentences!", characterId: CharacterId.MEERA, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m18-l4-1", english: "Rain is coming", contextEmoji: "🌧️🔜", blocks: [{ id: "b1", tamilWord: "Mazhai", tamilScript: "மழை", meaning: "Rain", emoji: "🌧️", order: 0 }, { id: "b2", tamilWord: "varudhu", tamilScript: "வருது", meaning: "is coming", order: 1 }], targetSlots: 2 },
    { id: "m18-l4-2", english: "Sun is beating", contextEmoji: "🌞🔥", blocks: [{ id: "b3", tamilWord: "Veyil", tamilScript: "வெயில்", meaning: "Sun", emoji: "🌞", order: 0 }, { id: "b4", tamilWord: "adikkuthu", tamilScript: "அடிக்குது", meaning: "is beating", order: 1 }], targetSlots: 2 },
    { id: "m18-l4-3", english: "Wind is blowing", contextEmoji: "💨🌬️", blocks: [{ id: "b5", tamilWord: "Kaathu", tamilScript: "காத்து", meaning: "Wind", emoji: "💨", order: 0 }, { id: "b6", tamilWord: "adikkuthu", tamilScript: "அடிக்குது", meaning: "is blowing", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_19: Module = { id: "m19", title: "Seyalgal 2", tamilTitle: "செயல்கள் 2", theme: "Doing Things", characterId: CharacterId.BALU, icon: "🤹", unlockAfter: "m18", lessons: [
  { id: "m19-l1", moduleId: "m19", lessonNumber: 1, title: "Listen: Action Words 2!", description: "Hear give, take, read!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m19-l1-1", tamilWord: "Kudu", tamilScript: "குடு", meaning: "Give", emoji: "🤲", distractors: [{ emoji: "✊", meaning: "Take" }, { emoji: "📖", meaning: "Read" }, { emoji: "💪", meaning: "Do" }] },
    { id: "m19-l1-2", tamilWord: "Edu", tamilScript: "எடு", meaning: "Take", emoji: "✊", distractors: [{ emoji: "🤲", meaning: "Give" }, { emoji: "📖", meaning: "Read" }, { emoji: "💪", meaning: "Do" }] },
    { id: "m19-l1-3", tamilWord: "Padi", tamilScript: "படி", meaning: "Read", emoji: "📖", distractors: [{ emoji: "🤲", meaning: "Give" }, { emoji: "✊", meaning: "Take" }, { emoji: "💪", meaning: "Do" }] },
    { id: "m19-l1-4", tamilWord: "Pannu", tamilScript: "பண்ணு", meaning: "Do", emoji: "💪", distractors: [{ emoji: "🤲", meaning: "Give" }, { emoji: "✊", meaning: "Take" }, { emoji: "📖", meaning: "Read" }] },
  ] } },
  { id: "m19-l2", moduleId: "m19", lessonNumber: 2, title: "Match: Do/Give/Take!", description: "Match action words!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m19-v1", tamilWord: "Kudu", tamilScript: "குடு", meaning: "Give", category: "Actions", emoji: "🤲" },
    { id: "m19-v2", tamilWord: "Edu", tamilScript: "எடு", meaning: "Take", category: "Actions", emoji: "✊" },
    { id: "m19-v3", tamilWord: "Padi", tamilScript: "படி", meaning: "Read", category: "Actions", emoji: "📖" },
    { id: "m19-v4", tamilWord: "Pannu", tamilScript: "பண்ணு", meaning: "Do", category: "Actions", emoji: "💪" },
  ] } },
  { id: "m19-l3", moduleId: "m19", lessonNumber: 3, title: "Speak: Give, Take!", description: "Say the action words!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m19-l3-1", tamilWord: "Kudu", tamilScript: "குடு", meaning: "Give", emoji: "🤲", acceptedPronunciations: ["kudu", "குடு", "kutu", "kodu"] },
    { id: "m19-l3-2", tamilWord: "Edu", tamilScript: "எடு", meaning: "Take", emoji: "✊", acceptedPronunciations: ["edu", "எடு", "yedhu", "edhu"] },
    { id: "m19-l3-3", tamilWord: "Padi", tamilScript: "படி", meaning: "Read", emoji: "📖", acceptedPronunciations: ["padi", "படி", "pathi", "paadi"] },
    { id: "m19-l3-4", tamilWord: "Pannu", tamilScript: "பண்ணு", meaning: "Do", emoji: "💪", acceptedPronunciations: ["pannu", "பண்ணு", "panu", "panra"] },
  ] } },
  { id: "m19-l4", moduleId: "m19", lessonNumber: 4, title: "Build: Give it to me!", description: "Build action sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m19-l4-1", english: "Give it to me", contextEmoji: "🙋🤲", blocks: [{ id: "b1", tamilWord: "Enakku", tamilScript: "எனக்கு", meaning: "To me", order: 0 }, { id: "b2", tamilWord: "kudu", tamilScript: "குடு", meaning: "give", emoji: "🤲", order: 1 }], targetSlots: 2 },
    { id: "m19-l4-2", english: "Take the ball", contextEmoji: "⚽✊", blocks: [{ id: "b3", tamilWord: "Pande", tamilScript: "பந்து", meaning: "Ball", emoji: "⚽", order: 0 }, { id: "b4", tamilWord: "edu", tamilScript: "எடு", meaning: "take", emoji: "✊", order: 1 }], targetSlots: 2 },
    { id: "m19-l4-3", english: "Read the book", contextEmoji: "📖👀", blocks: [{ id: "b5", tamilWord: "Pustaham", tamilScript: "புஸ்தகம்", meaning: "Book", emoji: "📖", order: 0 }, { id: "b6", tamilWord: "padi", tamilScript: "படி", meaning: "read", order: 1 }], targetSlots: 2 },
  ] } },
] };

export const MODULE_20: Module = { id: "m20", title: "Mariyadhai", tamilTitle: "மரியாதை", theme: "Politeness", characterId: CharacterId.BALU, icon: "🙏", unlockAfter: "m19", lessons: [
  { id: "m20-l1", moduleId: "m20", lessonNumber: 1, title: "Listen: Polite Words!", description: "Hear thank you, sorry, okay!", characterId: CharacterId.BALU, gameType: "listening", starsReward: 15, data: { type: "listening", items: [
    { id: "m20-l1-1", tamilWord: "Nandri", tamilScript: "நன்றி", meaning: "Thank you", emoji: "🙏", distractors: [{ emoji: "🙇", meaning: "Sorry" }, { emoji: "👍", meaning: "It's okay" }, { emoji: "👋", meaning: "Hello" }] },
    { id: "m20-l1-2", tamilWord: "Sorry", tamilScript: "ஸாரி", meaning: "Sorry", emoji: "🙇", distractors: [{ emoji: "🙏", meaning: "Thank you" }, { emoji: "👍", meaning: "It's okay" }, { emoji: "👋", meaning: "Hello" }] },
    { id: "m20-l1-3", tamilWord: "Paravalla", tamilScript: "பரவாயில்லை", meaning: "It's okay", emoji: "👍", distractors: [{ emoji: "🙏", meaning: "Thank you" }, { emoji: "🙇", meaning: "Sorry" }, { emoji: "👋", meaning: "Hello" }] },
  ] } },
  { id: "m20-l2", moduleId: "m20", lessonNumber: 2, title: "Match: Polite Phrases!", description: "Match polite words!", characterId: CharacterId.BALU, gameType: "matching", starsReward: 15, data: { type: "matching", words: [
    { id: "m20-v1", tamilWord: "Nandri", tamilScript: "நன்றி", meaning: "Thank you", category: "Polite", emoji: "🙏" },
    { id: "m20-v2", tamilWord: "Sorry", tamilScript: "ஸாரி", meaning: "Sorry", category: "Polite", emoji: "🙇" },
    { id: "m20-v3", tamilWord: "Paravalla", tamilScript: "பரவாயில்லை", meaning: "It's okay", category: "Polite", emoji: "👍" },
  ] } },
  { id: "m20-l3", moduleId: "m20", lessonNumber: 3, title: "Speak: Be Polite!", description: "Say polite words!", characterId: CharacterId.BALU, gameType: "speaking", starsReward: 20, data: { type: "speaking", items: [
    { id: "m20-l3-1", tamilWord: "Nandri", tamilScript: "நன்றி", meaning: "Thank you", emoji: "🙏", acceptedPronunciations: ["nandri", "நன்றி", "nanri", "nandry"] },
    { id: "m20-l3-2", tamilWord: "Sorry", tamilScript: "ஸாரி", meaning: "Sorry", emoji: "🙇", acceptedPronunciations: ["sorry", "ஸாரி", "sori", "soree"] },
    { id: "m20-l3-3", tamilWord: "Paravalla", tamilScript: "பரவாயில்லை", meaning: "It's okay", emoji: "👍", acceptedPronunciations: ["paravalla", "பரவாயில்லை", "paravala", "paravaille"] },
  ] } },
  { id: "m20-l4", moduleId: "m20", lessonNumber: 4, title: "Build: Thank you Mom!", description: "Build polite sentences!", characterId: CharacterId.BALU, gameType: "dragdrop", starsReward: 25, data: { type: "dragdrop", sentences: [
    { id: "m20-l4-1", english: "Thank you Mom", contextEmoji: "🙏👩", blocks: [{ id: "b1", tamilWord: "Nandri", tamilScript: "நன்றி", meaning: "Thank you", emoji: "🙏", order: 0 }, { id: "b2", tamilWord: "Amma", tamilScript: "அம்மா", meaning: "Mom", emoji: "👩", order: 1 }], targetSlots: 2 },
    { id: "m20-l4-2", english: "Sorry Dad", contextEmoji: "🙇👨", blocks: [{ id: "b3", tamilWord: "Sorry", tamilScript: "ஸாரி", meaning: "Sorry", emoji: "🙇", order: 0 }, { id: "b4", tamilWord: "Appa", tamilScript: "அப்பா", meaning: "Dad", emoji: "👨", order: 1 }], targetSlots: 2 },
    { id: "m20-l4-3", english: "It's okay brother", contextEmoji: "👍🧒", blocks: [{ id: "b5", tamilWord: "Paravalla", tamilScript: "பரவாயில்லை", meaning: "It's okay", emoji: "👍", order: 0 }, { id: "b6", tamilWord: "thambi", tamilScript: "தம்பி", meaning: "younger brother", emoji: "🧒", order: 1 }], targetSlots: 2 },
  ] } },
] };
