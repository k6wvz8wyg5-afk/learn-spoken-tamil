import React, { useRef, useState, useEffect } from "react";
import { TamilLetter, ModuleLesson, TracingLessonData } from "../types";
import { ArrowLeft, ArrowRight, CheckCircle, Volume2, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { speakTamil } from "../lib/audioHelper";

interface TracingGameProps {
  lesson: ModuleLesson;
  data?: TracingLessonData;
  onComplete: (starsEarned: number) => void;
  onBack: () => void;
}

export default function TracingGame({ lesson, data, onComplete, onBack }: TracingGameProps) {
  const lettersToTrace = data?.letters || [];
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const activeLetterObj = lettersToTrace[currentLetterIdx] || lettersToTrace[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [showFinishedBanner, setShowFinishedBanner] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize Canvas whenever we switch letters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Scale canvas for beautiful, crisp high-DPI rendering
    canvas.width = 320;
    canvas.height = 320;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0ea5e9"; // crisp child-friendly sky blue stroke
    context.lineWidth = 14; // perfect thickness for natural freehand drawing
    contextRef.current = context;
    
    // Clear canvas when switching letters
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    
    // Welcome sound for the active letter
    speakWord(activeLetterObj.spokenExample.split(" ")[0]);

    // Native touch event listeners to prevent page scroll bouncing on mobile
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const coords = getEventCoords(e as any, canvas);
      if (!coords) return;
      context.beginPath();
      context.moveTo(coords.x, coords.y);
      isDrawingRef.current = true;
      setHasDrawn(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const coords = getEventCoords(e as any, canvas);
      if (!coords) return;
      context.lineTo(coords.x, coords.y);
      context.stroke();
      setHasDrawn(true);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      context.closePath();
      isDrawingRef.current = false;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentLetterIdx]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Erase canvas completely for a pure blank drawing board
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Restore styling
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0ea5e9";
    context.lineWidth = 14;

    setHasDrawn(false);
  };

  // Centralized high-fidelity text-to-speech speakTamil helper
  const speakWord = async (word: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setAudioError(false);
    
    try {
      await speakTamil(
        word,
        "meera",
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (err) {
      console.error("Speech error", err);
      setIsSpeaking(false);
      setAudioError(true);
    }
  };

  // Convert mouse/touch event coordinates into exact relative canvas dimensions
  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getEventCoords(e, canvas);
    if (!coords) return;

    contextRef.current?.beginPath();
    contextRef.current?.moveTo(coords.x, coords.y);
    isDrawingRef.current = true;
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getEventCoords(e, canvas);
    if (!coords) return;

    contextRef.current?.lineTo(coords.x, coords.y);
    contextRef.current?.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    isDrawingRef.current = false;
  };

  const handleNext = () => {
    if (currentLetterIdx < lettersToTrace.length - 1) {
      setCurrentLetterIdx(currentLetterIdx + 1);
    } else {
      // Completed all letters in this tracing session!
      setShowFinishedBanner(true);
      setTimeout(() => {
        onComplete(lesson.starsReward);
      }, 2500);
    }
  };

  const handleFinishDrawing = () => {
    if (!completedLetters.includes(activeLetterObj.letter)) {
      setCompletedLetters([...completedLetters, activeLetterObj.letter]);
      speakWord("Semma! Awesome!");
    }
  };

  const letterCompleted = completedLetters.includes(activeLetterObj.letter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4" id="tracing-game-screen">
      {/* Back button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          id="back-to-map-from-tracing"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Lesson
        </button>
        <span className="text-sm font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
          Letter {currentLetterIdx + 1} of {lettersToTrace.length}
        </span>
      </div>

      {/* Meera Squirrel Prompt Header */}
      <div className="flex items-center gap-4 bg-amber-50/70 border-2 border-amber-200/60 p-4 rounded-3xl shadow-sm mb-6 max-w-2xl mx-auto">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-4xl shrink-0"
        >
          🐿️
        </motion.div>
        <div>
          <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">Meera the Squirrel says:</h4>
          <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
            {letterCompleted
              ? "Wonderful! You did an amazing job copying this letter!"
              : "Study the letter shape on the left panel, then draw it on the blank board!"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT PANEL: Reference Model (Clean Letter Glyph with NO Waypoints/Shapes) */}
        <div className="flex flex-col items-center bg-white p-6 rounded-[2.5rem] border-3 border-purple-100 shadow-md w-full">
          <div className="w-full flex items-center justify-between mb-4 border-b border-purple-50 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h3 className="text-xs font-black text-purple-800 uppercase tracking-wider">
                1. Study Letter Shape
              </h3>
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Perfect Model
            </span>
          </div>

          <div className="relative bg-purple-50/20 p-3.5 rounded-[2rem] border-2 border-purple-100/50 w-full max-w-[320px] aspect-square flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full bg-white rounded-[1.5rem] border border-purple-50 shadow-inner flex items-center justify-center select-none">
              {/* Huge, crisp, beautiful Tamil letter glyph with absolutely no vector errors or coordinates */}
              <span className="font-black text-purple-600 text-[130px] leading-none select-none">
                {activeLetterObj.letter}
              </span>
            </div>
          </div>

          {/* Letter Info Card */}
          <div className="mt-4 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <h3 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
              {activeLetterObj.letter} 
              <span className="text-purple-600 font-extrabold text-base">({activeLetterObj.pronunciation})</span>
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{activeLetterObj.englishMeaning}</p>
            
            <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Example Word</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-base font-black text-slate-700">{activeLetterObj.spokenExample}</span>
                <button
                  onClick={() => speakWord(activeLetterObj.spokenExample.split(" ")[0])}
                  className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 active:scale-90 transition-all"
                  title="Listen Example"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-400 font-medium">({activeLetterObj.spokenEnglishExample})</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Pure Blank Drawing Board */}
        <div className="flex flex-col items-center bg-white p-6 rounded-[2.5rem] border-3 border-amber-100 shadow-md w-full">
          <div className="w-full flex items-center justify-between mb-4 border-b border-amber-50 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✏️</span>
              <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                2. Your Blank Board
              </h3>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Freehand Draw
            </span>
          </div>

          <div className="relative bg-amber-50/40 p-4 rounded-[2.5rem] border-4 border-amber-200 shadow-sm w-full max-w-[360px] mx-auto overflow-hidden">
            {/* Pure blank white slate canvas with NO background guides or templates */}
            <div className="relative w-full max-w-[320px] aspect-square mx-auto bg-white rounded-[2rem] border border-amber-100 shadow-inner overflow-hidden" id="canvas-scaling-wrapper">
              
              {/* Interactive Freehand Canvas */}
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="absolute inset-0 bg-transparent cursor-pointer touch-none block w-full h-full z-10"
              />
            </div>

            {/* Celebrate with sweet kid-friendly interactive success banner when letter is marked completed */}
            {letterCompleted && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-white/95 rounded-[2.5rem] flex flex-col items-center justify-center p-6 z-20"
              >
                <div className="w-16 h-16 bg-emerald-100 border-3 border-emerald-400 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                  <CheckCircle className="w-10 h-10 fill-emerald-50" />
                </div>
                <h3 className="text-2xl font-black text-emerald-800">Semma! Brilliant!</h3>
                <p className="text-sm text-gray-500 font-medium text-center mt-1">
                  You drew the letter <b>{activeLetterObj.letter}</b> wonderfully!
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => speakWord(activeLetterObj.letter)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold rounded-xl shadow-sm text-sm flex items-center gap-1.5 transition-all"
                  >
                    <Volume2 className="w-4 h-4 fill-emerald-100" /> Listen Again
                  </button>
                  <button
                    onClick={handleNext}
                    id="tracing-next-button"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold rounded-xl shadow-sm text-sm flex items-center gap-1.5 transition-all"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action controls below drawing board */}
          {!letterCompleted ? (
            <div className="mt-4 w-full flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 w-full justify-center">
                <button
                  onClick={clearCanvas}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> 🧹 Clear Board
                </button>
                
                <button
                  onClick={() => speakWord(activeLetterObj.spokenExample.split(" ")[0])}
                  disabled={isSpeaking}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Volume2 className="w-3.5 h-3.5" /> 🔊 Listen Word
                </button>
              </div>

              {/* Complete Action Button */}
              <button
                onClick={handleFinishDrawing}
                className={`px-6 py-3.5 w-full max-w-[320px] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                  hasDrawn 
                    ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                🌟 Finished Drawing!
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Finished lesson modal */}
      {showFinishedBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-8 max-w-sm text-center border-4 border-amber-300 shadow-xl"
          >
            <span className="text-6xl block animate-bounce">🐿️✨</span>
            <h3 className="text-2xl font-black text-amber-800 mt-4">Amazing Work!</h3>
            <p className="text-sm text-gray-500 mt-1">
              You finished tracing all your vowel letters! Meera is so proud of you!
            </p>
            <div className="mt-4 inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 font-extrabold px-3 py-1.5 rounded-full text-sm">
              🌟 +{lesson.starsReward} Stars Earned!
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
