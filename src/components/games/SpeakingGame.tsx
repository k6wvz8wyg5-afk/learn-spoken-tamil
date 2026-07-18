import React, { useState, useEffect, useRef, useCallback } from "react";
import { ModuleLesson, SpeakingLessonData, SpeakingItem } from "../../types";
import { speakTamil } from "../../lib/audioHelper";
import { CHARACTERS } from "../../data";
import { triggerSuccessHaptic } from "../../lib/feedback";
import Confetti from "../Confetti";
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SpeakingGameProps {
  lesson: ModuleLesson;
  data: SpeakingLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function SpeakingGame({ lesson, data, onComplete, onBack }: SpeakingGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [completed, setCompleted] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(12).fill(0));
  const [speechSupported] = useState(!!SpeechRecognition);
  const [holdTimer, setHoldTimer] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const character = CHARACTERS[lesson.characterId];
  const currentItem = data.items[currentIndex];
  const totalItems = data.items.length;

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const playExample = () => {
    if (currentItem) {
      speakTamil(currentItem.tamilWord, lesson.characterId);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => playExample(), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const levels = Array.from(dataArray.slice(0, 12)).map((v) => v / 255);
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch {
      // Mic access denied — will rely on fallback
    }
  };

  const matchesPronunciation = (spoken: string, accepted: string[]): boolean => {
    const normalized = spoken.toLowerCase().trim();
    return accepted.some((a) => {
      const target = a.toLowerCase().trim();
      if (normalized.includes(target) || target.includes(normalized)) return true;
      // Simple Levenshtein-like: allow 2 char difference for short words
      if (Math.abs(normalized.length - target.length) <= 2) {
        let diff = 0;
        const shorter = normalized.length < target.length ? normalized : target;
        const longer = normalized.length >= target.length ? normalized : target;
        for (let i = 0; i < shorter.length; i++) {
          if (shorter[i] !== longer[i]) diff++;
        }
        return diff <= 2;
      }
      return false;
    });
  };

  const startListening = async () => {
    setTranscript("");
    setResult(null);
    setIsListening(true);
    await startVisualizer();

    if (speechSupported) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ta-IN";
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);

        if (event.results[event.results.length - 1].isFinal) {
          const allAlternatives: string[] = [];
          for (let i = 0; i < event.results.length; i++) {
            for (let j = 0; j < event.results[i].length; j++) {
              allAlternatives.push(event.results[i][j].transcript);
            }
          }
          const matched = allAlternatives.some((alt) =>
            matchesPronunciation(alt, currentItem.acceptedPronunciations)
          );
          handleResult(matched);
        }
      };

      recognition.onerror = () => {
        // On error, give benefit of the doubt after delay
        setTimeout(() => handleResult(true), 2000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      // Auto-stop after 5 seconds
      setTimeout(() => {
        try { recognition.stop(); } catch {}
      }, 5000);
    } else {
      // Fallback: no speech API — accept after 3 seconds of "speaking"
      const timer = window.setTimeout(() => {
        handleResult(true);
      }, 3000);
      setHoldTimer(timer);
    }
  };

  const stopListening = () => {
    cleanup();
    setIsListening(false);
    setAudioLevels(new Array(12).fill(0));
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  };

  const handleResult = (correct: boolean) => {
    cleanup();
    setIsListening(false);
    setAudioLevels(new Array(12).fill(0));
    setResult(correct ? "correct" : "wrong");

    if (correct) {
      triggerSuccessHaptic();
      setTimeout(() => {
        if (currentIndex + 1 >= totalItems) {
          setCompleted(true);
          setTimeout(() => onComplete(lesson.starsReward), 2000);
        } else {
          setCurrentIndex((i) => i + 1);
          setResult(null);
          setTranscript("");
        }
      }, 1800);
    } else {
      setTimeout(() => {
        setResult(null);
        setTranscript("");
      }, 2000);
    }
  };

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center"
      >
        <span className="text-7xl mb-4">🗣️🎉</span>
        <h2 className="text-2xl font-black text-gray-800">Great Speaking!</h2>
        <p className="text-sm text-gray-500 mt-2">You said all the words!</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 font-black px-6 py-2 rounded-full text-lg">
          ⭐ +{lesson.starsReward} Stars!
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-500">
            {currentIndex + 1} / {totalItems}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Character prompt */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 mb-6 ${character.bgColor}`}>
        <span className="text-3xl">{character.avatar}</span>
        <div>
          <p className="text-xs font-bold text-gray-500">{character.name}</p>
          <p className="text-sm font-semibold text-gray-700">
            {data.instruction || "Say the word out loud!"}
          </p>
        </div>
      </div>

      {/* Word to say */}
      <div className="text-center mb-6">
        <span className="text-6xl block mb-3">{currentItem.emoji}</span>
        <h2 className="text-3xl font-black text-gray-800">{currentItem.tamilWord}</h2>
        <p className="text-lg text-gray-400 mt-1">{currentItem.tamilScript}</p>
        <p className="text-sm text-gray-500 mt-1">({currentItem.meaning})</p>

        <button
          onClick={playExample}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-bold hover:text-indigo-800"
        >
          <Volume2 className="w-4 h-4" /> Listen first
        </button>
      </div>

      {/* Equalizer visualizer */}
      <div className="flex items-end justify-center gap-1 h-16 mb-6">
        {audioLevels.map((level, i) => (
          <motion.div
            key={i}
            animate={{ height: isListening ? `${Math.max(8, level * 64)}px` : "8px" }}
            transition={{ duration: 0.05 }}
            className={`w-3 rounded-full ${isListening ? "bg-purple-400" : "bg-gray-200"}`}
            style={{ minHeight: "8px" }}
          />
        ))}
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3">
        {!isListening ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={startListening}
            disabled={result === "correct"}
            className="w-20 h-20 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50"
          >
            <Mic className="w-8 h-8" />
          </motion.button>
        ) : (
          <motion.button
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            onClick={stopListening}
            className="w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg"
          >
            <MicOff className="w-8 h-8" />
          </motion.button>
        )}

        <p className="text-xs text-gray-400 font-medium">
          {isListening ? "Listening... speak now!" : "Tap the mic and say the word!"}
        </p>

        {transcript && (
          <p className="text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-xl">
            Heard: "{transcript}"
          </p>
        )}
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {result === "correct" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-lg font-black text-emerald-600">✨ Perfect! You said it great!</p>
          </motion.div>
        )}
        {result === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-sm font-bold text-slate-500">Almost! Try again — you've got this! 💪</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!speechSupported && (
        <p className="mt-4 text-xs text-center text-gray-400">
          Speech recognition not available — speaking for 3 seconds counts as a pass!
        </p>
      )}
    </div>
  );
}
