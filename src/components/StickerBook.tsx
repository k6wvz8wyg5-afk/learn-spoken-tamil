import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mic, MicOff } from "lucide-react";
import { getVocabularyRegistry, VocabEntry } from "../lib/vocabulary-registry";
import { EventLog } from "../lib/event-log";
import { MODULES } from "../data";
import AvatarReaction from "./AvatarReaction";

interface StickerBookProps {
  profileName: string;
  completedLessons: string[];
  onBack: () => void;
}

interface SpawnedSticker {
  id: string;
  emoji: string;
  word: string;
  x: number;
  y: number;
}

const CANVAS_PADDING = 40;

export default function StickerBook({ profileName, completedLessons, onBack }: StickerBookProps) {
  const registry = useMemo(() => getVocabularyRegistry(MODULES), []);
  const eventLog = useRef(new EventLog(profileName));

  const unlockedWords = useMemo(
    () => registry.getCompletedVocab(completedLessons),
    [registry, completedLessons]
  );
  const allWords = useMemo(() => registry.getAll(), [registry]);

  const [spawned, setSpawned] = useState<SpawnedSticker[]>(() => {
    try {
      const saved = localStorage.getItem(`tamil_kid_sandbox_${profileName}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [spawnCount, setSpawnCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(`tamil_kid_sandbox_${profileName}`, JSON.stringify(spawned));
    } catch {}
  }, [spawned, profileName]);

  const spawnSticker = useCallback((entry: VocabEntry) => {
    const canvas = canvasRef.current;
    const maxX = (canvas?.clientWidth ?? 300) - CANVAS_PADDING * 2;
    const maxY = (canvas?.clientHeight ?? 400) - CANVAS_PADDING * 2;

    const sticker: SpawnedSticker = {
      id: `${entry.wordId}_${Date.now()}`,
      emoji: entry.emoji,
      word: entry.tamilWord,
      x: CANVAS_PADDING + Math.random() * maxX,
      y: CANVAS_PADDING + Math.random() * maxY,
    };

    setSpawned((prev) => [...prev, sticker]);
    setSpawnCount((c) => c + 1);

    eventLog.current.append({
      type: "sandbox_spawn",
      wordId: entry.wordId,
      meta: { emoji: entry.emoji },
    });
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ta-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(result);

      if (event.results[0].isFinal) {
        const matched = unlockedWords.find(
          (w) => w.tamilWord.toLowerCase() === result || result.includes(w.tamilWord.toLowerCase())
        );
        if (matched) {
          spawnSticker(matched);
        }
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, [unlockedWords, spawnSticker]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const avatarMood = spawnCount >= 3 ? "celebrating" : spawnCount > 0 ? "curious" : "idle";

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-lg font-black text-purple-700 flex items-center gap-2">
          🎨 Sticker Book
        </h2>
        <div className="text-xs text-gray-400 font-bold">
          {unlockedWords.length}/{allWords.length} words
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative bg-gradient-to-b from-sky-50 to-emerald-50 border-4 border-dashed border-purple-200 rounded-3xl overflow-hidden min-h-[300px]"
      >
        {spawned.map((sticker) => (
          <motion.div
            key={sticker.id}
            drag
            dragConstraints={canvasRef}
            dragElastic={0.1}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            whileDrag={{ scale: 1.2, zIndex: 50 }}
            className="absolute cursor-grab active:cursor-grabbing select-none"
            style={{ left: sticker.x, top: sticker.y }}
          >
            <div className="text-4xl drop-shadow-md">{sticker.emoji}</div>
            <p className="text-[10px] font-bold text-center text-gray-600 mt-0.5">{sticker.word}</p>
          </motion.div>
        ))}

        {spawned.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-8">
            <div>
              <span className="text-5xl block mb-3">🎤</span>
              <p className="text-sm font-bold text-gray-500">Say a Tamil word to spawn a sticker!</p>
              <p className="text-xs text-gray-400 mt-1">Tap the mic button below and speak</p>
            </div>
          </div>
        )}

        {/* Avatar corner */}
        <div className="absolute bottom-3 right-3">
          <AvatarReaction emoji="🐻" mood={avatarMood} size="sm" />
        </div>
      </div>

      {/* Mic control */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        {transcript && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border-2 border-purple-200 rounded-xl px-3 py-2 text-sm font-bold text-purple-700"
          >
            "{transcript}"
          </motion.div>
        )}
      </div>

      {/* Word grid (unlocked) */}
      <div className="mt-4 bg-white border-2 border-gray-200 rounded-2xl p-3 max-h-32 overflow-y-auto">
        <p className="text-xs font-bold text-gray-500 mb-2">Tap to spawn (or say the Tamil word):</p>
        <div className="flex flex-wrap gap-1.5">
          {unlockedWords.map((w) => (
            <button
              key={w.wordId}
              onClick={() => spawnSticker(w)}
              className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-100 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>{w.emoji}</span>
              <span>{w.tamilWord}</span>
            </button>
          ))}
          {unlockedWords.length === 0 && (
            <p className="text-xs text-gray-400">Complete lessons to unlock stickers!</p>
          )}
        </div>
      </div>
    </div>
  );
}
