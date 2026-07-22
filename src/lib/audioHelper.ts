/**
 * Plays base64 audio which can be either a standard encoded audio file (e.g., WAV/MP3)
 * or a raw 16-bit PCM (little-endian) stream as returned by Gemini TTS models.
 */
export async function playAudio(
  base64Data: string,
  sampleRate: number = 24000,
  onEnded?: () => void
): Promise<void> {
  let audioCtx: AudioContext | null = null;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (e) {
    console.error("Failed to initialize AudioContext", e);
    if (onEnded) onEnded();
    return;
  }

  // Convert base64 to binary string
  let binaryString: string;
  try {
    binaryString = atob(base64Data);
  } catch (e) {
    console.error("Failed to decode base64 audio data", e);
    if (onEnded) onEnded();
    return;
  }

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Helper to play raw 16-bit PCM
  const playRawPcm = () => {
    try {
      // 16-bit PCM means 2 bytes per sample
      const bufferLength = Math.floor(bytes.length / 2);
      const floatData = new Float32Array(bufferLength);
      const dataView = new DataView(bytes.buffer);

      for (let i = 0; i < bufferLength; i++) {
        // Little-endian signed 16-bit PCM
        const sample = dataView.getInt16(i * 2, true);
        floatData[i] = sample / 32768.0;
      }

      // Create a mono AudioBuffer at the specified sample rate
      const audioBuffer = audioCtx!.createBuffer(1, floatData.length, sampleRate);
      audioBuffer.getChannelData(0).set(floatData);

      const source = audioCtx!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx!.destination);
      source.start(0);
      if (onEnded) {
        source.onended = onEnded;
      }
    } catch (err) {
      console.error("Error playing raw PCM audio", err);
      if (onEnded) onEnded();
    }
  };

  // Check if it's a standard WAV/MP3 by inspecting the first few bytes (RIFF/ID3 etc)
  const isEncoded = 
    (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) || // RIFF (WAV)
    (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) ||                     // ID3 (MP3)
    (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0);                                    // MP3 sync frame

  if (isEncoded) {
    try {
      const arrayBufferCopy = bytes.buffer.slice(0);
      audioCtx.decodeAudioData(
        arrayBufferCopy,
        (buffer) => {
          try {
            const source = audioCtx!.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx!.destination);
            source.start(0);
            if (onEnded) {
              source.onended = onEnded;
            }
          } catch (playbackErr) {
            console.error("Error playing decoded standard audio", playbackErr);
            if (onEnded) onEnded();
          }
        },
        (err) => {
          console.warn("decodeAudioData failed on encoded signature, falling back to raw PCM", err);
          playRawPcm();
        }
      );
    } catch (e) {
      console.warn("Exception during decodeAudioData, falling back to raw PCM", e);
      playRawPcm();
    }
  } else {
    // If not obviously encoded, play directly as raw 16-bit PCM
    playRawPcm();
  }
}

// Complete mapping of transliterated game words to native Tamil script characters
export const TAMIL_MAP: Record<string, string> = {
  // Letters
  "அ": "அ",
  "ஆ": "ஆ",
  "இ": "இ",
  "ஈ": "ஈ",
  "உ": "உ",
  "ஊ": "ஊ",
  
  // Tracing spoken examples
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

  // Phrases
  "Nalla irukiya?": "நல்லா இருக்கியா?",
  "Enaku saapadu venum": "எனக்கு சாப்பாடு வேணும்",
  "Enga poreenga?": "எங்க போறீங்க?",
  "Semma dhoool!": "செம்ம தூள்!",
  "Enaku thanni kudu": "எனக்கு தண்ணி குடு",
  
  // Individual phrase words
  "Nalla": "நல்லா",
  "irukiya": "இருக்கியா",
  "Enaku": "எனக்கு",
  "saapadu": "சாப்பாடு",
  "venum": "வேணும்",
  "thanni": "தண்ணி",
  "kudu": "குடு",
  "Enga": "எங்க",
  "poreenga": "போறீங்க",
  "Semma": "செம்ம",
  "dhoool": "தூள்",

  // Module 1-5 vocabulary
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
  "Vilayada polama": "விளையாட போலாமா",

  // Encouragement / Feedback
  "Semma!": "செம்ம!",
  "Semma! Awesome!": "செம்ம! அருமை!",
  "Awesome!": "அருமை!",
  "Brilliant!": "அருமை!",
  "Semma! Brilliant!": "செம்ம! அருமை!"
};

/**
 * Normalizes transliterated English/Latin Tamil inputs into beautiful, native Tamil characters.
 */
export function getTamilScript(word: string): string {
  const clean = word.trim();
  if (TAMIL_MAP[clean]) return TAMIL_MAP[clean];
  
  // Strip punctuation like ? or !
  const stripped = clean.replace(/[?!.,]/g, "");
  if (TAMIL_MAP[stripped]) return TAMIL_MAP[stripped];
  
  // Lowercase checks
  const lower = clean.toLowerCase();
  if (TAMIL_MAP[lower]) return TAMIL_MAP[lower];
  
  const strippedLower = stripped.toLowerCase();
  if (TAMIL_MAP[strippedLower]) return TAMIL_MAP[strippedLower];

  return clean; // fallback to original input
}

/**
 * Centralized high-fidelity text-to-speech engine.
 * Attempts server-side Gemini TTS first.
 * If server fails (quota limits/network), falls back to highly-optimized local browser SpeechSynthesis.
 * Always speaks real Tamil script instead of phonetic Latin text for beautiful native pronunciations.
 */
export async function speakTamil(
  text: string,
  character: "meera" | "kavin" | "balu" = "meera",
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  if (onStart) onStart();

  const tamilText = getTamilScript(text);

  // 1. Try server-side TTS
  try {
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, character }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        await playAudio(data.audio, 24000, onEnd);
        return;
      }
    }
  } catch (err) {
    // Server unavailable or network error — fall through to fallback
  }

  // 2. Try server-side Google Translate TTS proxy (no CORS issues)
  try {
    const proxyUrl = `/api/tts-fallback?text=${encodeURIComponent(text)}`;
    const audio = new Audio(proxyUrl);
    audio.playbackRate = 0.85;
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject();
      audio.play().catch(reject);
    });
    if (onEnd) onEnd();
    return;
  } catch {
    // Proxy also failed — fall through to browser TTS
  }

  // 3. Last resort: browser SpeechSynthesis / client-side audio
  speakWithBrowserTTS(tamilText, text, onEnd);
}

function speakWithBrowserTTS(tamilText: string, transliteration: string, onEnd?: () => void): void {
  if (typeof window === "undefined") {
    if (onEnd) onEnd();
    return;
  }

  // Try Web Speech API first
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const tamilVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("ta"));

    // If no Tamil voices available, skip straight to audio element
    if (tamilVoices.length === 0 && voices.length > 0) {
      speakWithAudioElement(tamilText, transliteration, onEnd);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(tamilText);
    utterance.lang = "ta-IN";
    utterance.rate = 0.8;

    let settled = false;
    let invoked = false;

    const performSpeak = () => {
      if (invoked) return;
      invoked = true;
      const currentVoices = window.speechSynthesis.getVoices();
      const tamil = currentVoices.filter((v) => v.lang.toLowerCase().startsWith("ta"));

      if (tamil.length === 0) {
        settled = true;
        speakWithAudioElement(tamilText, transliteration, onEnd);
        return;
      }

      const premium = tamil.find(
        (v) => v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium")
      );
      utterance.voice = premium || tamil[0];

      utterance.onend = () => {
        if (!settled) {
          settled = true;
          if (onEnd) onEnd();
        }
      };
      utterance.onerror = () => {
        if (!settled) {
          settled = true;
          speakWithAudioElement(tamilText, transliteration, onEnd);
        }
      };

      window.speechSynthesis.speak(utterance);

      // Detect silent failure — if not speaking after 1.5s, use audio element
      setTimeout(() => {
        if (!settled && !window.speechSynthesis.speaking) {
          settled = true;
          speakWithAudioElement(tamilText, transliteration, onEnd);
        }
      }, 1500);
    };

    if (voices.length > 0) {
      performSpeak();
    } else {
      const handleVoicesChanged = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        performSpeak();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

      // If voices never load, fall through after 500ms
      setTimeout(() => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        if (!settled) {
          performSpeak();
        }
      }, 500);
    }
  } else {
    speakWithAudioElement(tamilText, transliteration, onEnd);
  }
}

function speakWithAudioElement(tamilText: string, transliteration: string, onEnd?: () => void): void {
  try {
    const encodedText = encodeURIComponent(tamilText);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encodedText}`;

    const audio = new Audio(url);
    audio.playbackRate = 0.85;
    audio.onended = () => { if (onEnd) onEnd(); };
    audio.onerror = () => {
      // Final fallback: English transliteration
      try {
        const enUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(transliteration)}`;
        const enAudio = new Audio(enUrl);
        enAudio.playbackRate = 0.8;
        enAudio.onended = () => { if (onEnd) onEnd(); };
        enAudio.onerror = () => { if (onEnd) onEnd(); };
        enAudio.play().catch(() => { if (onEnd) onEnd(); });
      } catch {
        if (onEnd) onEnd();
      }
    };
    audio.play().catch(() => {
      if (onEnd) onEnd();
    });
  } catch {
    if (onEnd) onEnd();
  }
}
