import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { MongoClient, Db } from "mongodb";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

// --- MongoDB connection for persistent profile storage ---
let db: Db | null = null;

async function connectDB(): Promise<Db | null> {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set — profiles will only persist in localStorage (not recommended for production)");
    return null;
  }
  try {
    const client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db("learn-spoken-tamil");
    console.log("Connected to MongoDB");
    return db;
  } catch (e) {
    console.error("MongoDB connection failed:", e);
    return null;
  }
}

// Load all profiles for a device/browser (keyed by a device ID the client sends)
app.get("/api/profiles/:deviceId", async (req, res) => {
  try {
    const database = await connectDB();
    if (!database) return res.json({ profiles: null });

    const doc = await database.collection("profiles").findOne({ deviceId: req.params.deviceId });
    if (!doc) return res.json({ profiles: null });

    res.json({ profiles: doc.profiles, activeIdx: doc.activeIdx ?? 0 });
  } catch (e) {
    console.error("Error loading profiles:", e);
    res.json({ profiles: null });
  }
});

// Save all profiles for a device
app.post("/api/profiles/:deviceId", async (req, res) => {
  try {
    const database = await connectDB();
    if (!database) return res.json({ ok: false, reason: "no_db" });

    const { profiles, activeIdx } = req.body;
    if (!profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ ok: false, reason: "invalid_data" });
    }

    await database.collection("profiles").updateOne(
      { deviceId: req.params.deviceId },
      { $set: { deviceId: req.params.deviceId, profiles, activeIdx: activeIdx ?? 0, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("Error saving profiles:", e);
    res.status(500).json({ ok: false, reason: "server_error" });
  }
});

// Simple persistent disk/memory cache for TTS audio to avoid hitting Gemini API quota
const CACHE_FILE = path.join(process.cwd(), "tts_cache.json");
let ttsCache: Record<string, string> = {};

try {
  if (fs.existsSync(CACHE_FILE)) {
    ttsCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    console.log(`Loaded ${Object.keys(ttsCache).length} cached TTS recordings.`);
  }
} catch (e) {
  console.error("Error loading TTS cache, starting fresh", e);
}

// Complete robust mapping of transliterated phrases/words/letters to Tamil script
const TRANSLITERATION_MAP: Record<string, string> = {
  // Letters
  "அ": "அ",
  "ஆ": "ஆ",
  "இ": "இ",
  "ஈ": "ஈ",
  "உ": "உ",
  "ஊ": "ஊ",
  
  // Tracing spoken words
  "Amma": "அம்மா",
  "Aadu": "ஆடு",
  "Ilay": "இலை",
  "Ee": "ஈ",
  "Ulagam": "உலகம்",
  "Oonjal": "ஊஞ்சல்",

  // Vocabulary words
  "Appa": "அப்பா",
  "Thambi": "தம்பி",
  "Thangachi": "தங்கச்சி",
  "Thaatha": "தாத்தா",
  "Paati": "பாட்டி",
  "Saapadu": "சாப்பாடு",
  "Thanni": "தண்ணி",
  "Pazham": "பழம்",
  "Muttay": "முட்டை",
  "Poonay": "பூனை",
  "Naay": "நாய்",
  "Maadu": "மாடு",
  "Korangu": "குரங்கு",
  "Odu": "ஓடு",
  "Vilayadu": "விளையாடு",
  "Thoongu": "தூங்கு",
  "Saapdu": "சாப்டு",

  // Phrase words / Phrases
  "Nalla irukiya?": "நல்லா இருக்கியா?",
  "Enaku saapadu venum": "எனக்கு சாப்பாடு வேணும்",
  "Thanni kudu": "தண்ணி குடு",
  "Enaku": "எனக்கு",
  "venum": "வேணும்",
  "kudu": "குடு",
  "Nalla": "நல்லா",
  "irukiya": "இருக்கியா",

  // Module 1-5 new vocabulary
  "Naan": "நான்",
  "Thatha": "தாத்தா",
  "Paatti": "பாட்டி",
  "Idhu Amma": "இது அம்மா",
  "Idhu Appa": "இது அப்பா",
  "Idhu Thatha": "இது தாத்தா",
  "Idhu Paatti": "இது பாட்டி",
  "Naan Thambi": "நான் தம்பி",
  "Venum": "வேணும்",
  "Vendaam": "வேண்டாம்",
  "Pothum": "போதும்",
  "Soru": "சோறு",
  "Paal": "பால்",
  "Dosa": "தோசை",
  "Thanni": "தண்ணி",
  "Pasikithu": "பசிக்கிது",
  "Thagam": "தாகம்",
  "Enakku soru venum": "எனக்கு சோறு வேணும்",
  "Enakku paal venum": "எனக்கு பால் வேணும்",
  "Paal vendaam": "பால் வேண்டாம்",
  "Vaa": "வா",
  "Po": "போ",
  "Ukkaaru": "உக்காரு",
  "Nillu": "நில்லு",
  "Ulla vaa": "உள்ள வா",
  "Veliya po": "வெளிய போ",
  "Kannu": "கண்ணு",
  "Kaathu": "காது",
  "Mooku": "மூக்கு",
  "Kai": "கை",
  "Kaal": "கால்",
  "En kai": "என் கை",
  "En kannu": "என் கண்ணு",
  "En mooku": "என் மூக்கு",

  // Modules 6-20 vocabulary
  "Sirippu": "சிரிப்பு",
  "Azhugai": "அழுகை",
  "Kovam": "கோவம்",
  "Bayam": "பயம்",
  "Poonai": "பூனை",
  "Kaaka": "காக்கா",
  "Meen": "மீன்",
  "Onnu": "ஒன்னு",
  "Rendu": "ரெண்டு",
  "Moonu": "மூணு",
  "Naalu": "நாலு",
  "Anju": "அஞ்சு",
  "Perisu": "பெரிசு",
  "Chinnathu": "சின்னது",
  "Soodu": "சூடு",
  "Kulir": "குளிர்",
  "Pande": "பந்து",
  "Bommai": "பொம்மை",
  "Pidi": "பிடி",
  "Thooki podu": "தூக்கி போடு",
  "Enna": "என்ன",
  "Yean": "ஏன்",
  "Enga": "எங்க",
  "Sivappu": "சிவப்பு",
  "Pachai": "பச்சை",
  "Manjal": "மஞ்சள்",
  "Neelam": "நீலம்",
  "Ippo": "இப்போ",
  "Apram": "அப்புறம்",
  "Naalaiki": "நாளைக்கு",
  "Anna": "அண்ணா",
  "Akka": "அக்கா",
  "Veedu": "வீடு",
  "Kadai": "கடை",
  "Veliya": "வெளிய",
  "Mazhai": "மழை",
  "Veyil": "வெயில்",
  "Megam": "மேகம்",
  "Kudu": "குடு",
  "Edu": "எடு",
  "Padi": "படி",
  "Pannu": "பண்ணு",
  "Nandri": "நன்றி",
  "Paravalla": "பரவாயில்லை",
  "Ennodathu": "என்னோடது",
  "Unnodathu": "உன்னோடது",

  // Game feedback / encouragement
  "Semma! Awesome!": "செம்ம! அருமை!",
  "Semma!": "செம்ம!",
  "Awesome!": "அருமை!",
  "Brilliant!": "அருமை!",
  "Semma! Brilliant!": "செம்ம! அருமை!"
};

function getCachedAudio(character: string, text: string): string | null {
  const cleanText = text.trim();
  const key = `${character || "default"}:${cleanText}`;
  return ttsCache[key] || null;
}

function saveCachedAudio(character: string, text: string, base64Audio: string) {
  const cleanText = text.trim();
  const key = `${character || "default"}:${cleanText}`;
  ttsCache[key] = base64Audio;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(ttsCache, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving TTS cache to disk", e);
  }
}

// Lazy-loaded Gemini AI client to prevent startup crashes if API key is missing
let aiClient: any = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing in secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Check API status endpoint
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", geminiKeyConfigured: hasKey });
});

// Dynamic Children's Text-To-Speech endpoint in Tamil
app.post("/api/speak", async (req, res) => {
  try {
    const { text, character } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS pronunciation guide." });
    }

    // 1. Check cache first
    const cachedAudio = getCachedAudio(character, text);
    if (cachedAudio) {
      console.log(`[TTS Cache Hit] character: ${character}, text: "${text}"`);
      return res.json({ audio: cachedAudio });
    }

    console.log(`[TTS Cache Miss] Fetching from Gemini. character: ${character}, text: "${text}"`);

    const ai = getAIClient();
    
    // Resolve transliterated word/phrase to native Tamil script for natural vocal synthesis
    const cleanText = text.trim();
    const mappedTamil = TRANSLITERATION_MAP[cleanText] || cleanText;

    // Customize the speaking style based on character role - demand warm, human, natural voice
    let styleInstruction = "Speak cheerfully, naturally, clearly, and slowly like a warm native Tamil speaker teaching a child.";
    let voiceName = "Kore"; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    
    if (character === "balu") {
      styleInstruction = "Speak in a deep, warm, friendly, gentle, and slow voice.";
      voiceName = "Fenrir";
    } else if (character === "meera") {
      styleInstruction = "Speak in a sweet, slow, encouraging, helpful voice.";
      voiceName = "Zephyr";
    } else if (character === "kavin") {
      styleInstruction = "Speak in a friendly, enthusiastic, bouncy, slow voice.";
      voiceName = "Kore";
    }

    const prompt = `You are a native Tamil language teacher. Pronounce this Tamil word or phrase slowly, warmly, and with a beautiful, natural, perfectly authentic native Tamil accent: "${mappedTamil}". Instruction: ${styleInstruction}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini TTS model");
    }

    // 2. Save to cache
    saveCachedAudio(character, text, base64Audio);

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error("Gemini TTS Error:", error);

    const isQuotaExceeded = error.message?.includes("429") || 
                            error.message?.includes("QUOTA_EXCEEDED") || 
                            error.message?.includes("quota") ||
                            error.status === "RESOURCE_EXHAUSTED" ||
                            (error.message && error.message.toLowerCase().includes("limit"));

    if (isQuotaExceeded) {
      console.warn("Gemini TTS quota exceeded. Notifying client to fallback gracefully.");
      // Return 200 OK with null audio and fallback true, to trigger frontend's SpeechSynthesis smoothly
      return res.status(200).json({
        audio: null,
        error: "QUOTA_EXCEEDED",
        message: "Gemini TTS quota limit reached. Falling back to browser TTS pronunciation guide.",
        fallback: true
      });
    }

    res.status(500).json({ 
      error: error.message || "Failed to generate TTS audio",
      fallback: true 
    });
  }
});

// AI character interactive chat endpoint for spoken dialogue practice
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory, characterId } = req.body;
    const ai = getAIClient();

    let characterPrompt = "";
    if (characterId === "balu") {
      characterPrompt = `You are Balu the Bear (கரடி - Karadi), a lovable, cute, round, friendly brown bear who teaches spoken Tamil to a 6-year-old child.
The child has high intelligence but also ADHD and high anxiety around mistakes. Speak in extremely soothing, reassuring, gentle, warm, and colloquial spoken Tamil (e.g. use "epdi irukeenga" instead of "nalama", "saapdunga" instead of "unungal").
NEVER say the kid is wrong or correct them negatively. Instead, celebrate their curiosity, praise their effort warmly, and encourage them.
Keep responses extremely simple, warm, and no more than one short sentence. Always praise the kid!`;
    } else if (characterId === "meera") {
      characterPrompt = `You are Meera the Squirrel (அணில் - Anil), a tiny, extremely helpful, sweet, and gentle squirrel who guides kids in writing and alphabet tracing.
The child has high intelligence but also ADHD and high anxiety around mistakes. Speak gently, with massive encouragement and soothing patience.
Focus on effort and practice over perfect accuracy. Use colloquial spoken Tamil. No more than one short sentence.`;
    } else {
      characterPrompt = `You are Kavin the Peacock (மயில் - Mayil), an energetic, colorful, dancing peacock who loves words and vocabulary matching games.
The child has high intelligence but also ADHD and high anxiety around mistakes. Be super supportive, excited about their effort, reassuring, and celebratory.
Focus on learning as a fun exploration rather than a test. Use colloquial spoken Tamil. No more than one short sentence.`;
    }

    const systemInstruction = `${characterPrompt}
Always respond in JSON format with EXACTLY the following fields:
{
  "tamil": "The response in spoken/colloquial Tamil script",
  "transliteration": "Phonetic English guide (e.g., 'Vanakkam kutty! Nalla irukiya?')",
  "english": "English translation for the parent and child"
}`;

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const turn of chatHistory) {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message || "Hello! Teach me a word!" }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini Model");
    }

    const data = JSON.parse(responseText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate character response",
      fallback: {
        tamil: "வணக்கம்! என்னோடு விளையாட வா!",
        transliteration: "Vanakkam! Ennodu vilayada vaa!",
        english: "Hello! Come play with me!"
      }
    });
  }
});

// Configure Vite middleware in development or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
