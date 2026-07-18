import React, { useState, useRef, useEffect } from "react";
import { ModuleLesson, CharacterId } from "../types";
import { Volume2, ArrowLeft, Send, Sparkles, Loader2, Play } from "lucide-react";
import { motion } from "motion/react";
import { playAudio, speakTamil } from "../lib/audioHelper";

interface BaluChatProps {
  lesson?: ModuleLesson; // Optional, can be played in free sandbox mode too
  onComplete?: (starsEarned: number) => void;
  onBack: () => void;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
  tamil?: string;
  transliteration?: string;
  english?: string;
}

const PRESET_TOPICS = [
  { text: "What is your favorite food? 🍯", query: "Balu, what is your absolute favorite food?" },
  { text: "Sing me a short Tamil song! 🎶", query: "Balu, sing me a simple, sweet 1-line Tamil nursery rhyme with spoken words!" },
  { text: "Let's count to five in Tamil! 🔢", query: "Balu, teach me how to count 1 to 5 in spoken Tamil!" },
  { text: "Teach me a polite greeting! 🙏", query: "Balu, how do I say hello and thank you to my grandma?" },
  { text: "Do a happy bear wiggle! 🕺", query: "Balu, show me your happy dance and say something funny in Tamil!" },
];

export default function BaluChat({ lesson, onComplete, onBack }: BaluChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Vanakkam, kutty! I am Balu. Let's speak Tamil together! Click any topic below or type anything you want!",
      tamil: "வணக்கம் குட்டி! என் கூட தமிழ் பேசலாமா?",
      transliteration: "Vanakkam kutty! En kooda Tamil pesalaama?",
      english: "Hello little friend! Shall we speak Tamil together?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedTurns, setCompletedTurns] = useState(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle playing spoken word from server/browser with high-fidelity Tamil script and native voice matching
  const speakTamilWord = async (word: string) => {
    if (!word) return;
    setIsSpeaking(true);
    
    try {
      await speakTamil(
        word,
        "balu",
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (err) {
      console.error("Centralized speakTamil failed in BaluChat:", err);
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    setLoading(true);
    const newMessages = [...messages, { role: "user" as const, text: userText }];
    setMessages(newMessages);
    setInputValue("");

    try {
      // Map to Gemini chat history format
      const chatHistory = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText, 
          chatHistory,
          characterId: "balu"
        }),
      });

      const data = await response.json();
      
      if (data.tamil) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: data.english,
            tamil: data.tamil,
            transliteration: data.transliteration,
            english: data.english
          }
        ]);
        
        // Auto-pronounce Balu's Tamil answer!
        speakTamilWord(data.tamil || data.transliteration);
        
        // Track completed conversation turns for rewards
        const nextTurns = completedTurns + 1;
        setCompletedTurns(nextTurns);
        
        // If this is the lesson activity and they complete 3 turns, unlock reward
        if (lesson && nextTurns >= 3 && onComplete) {
          setTimeout(() => {
            onComplete(lesson.starsReward);
          }, 4000);
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Balu chat error:", error);
      // Fallback response
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Let's speak Tamil!",
          tamil: "தமிழ் பேசலாம் வாங்க!",
          transliteration: "Tamil pesalaam vaanga!",
          english: "Come, let's speak Tamil!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 h-[calc(100vh-13rem)] flex flex-col" id="balu-chat-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <button
          onClick={onBack}
          id="back-to-map-from-chat"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </button>
        {lesson && (
          <div className="px-3 py-1 bg-orange-100 border border-orange-200 rounded-xl text-xs font-black text-orange-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-orange-400 text-orange-500 animate-spin" />
            Talk Progress: {Math.min(completedTurns, 3)}/3 chats
          </div>
        )}
      </div>

      {/* Main chat body split in 2 columns: left is Balu, right is Chat messages */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow overflow-hidden min-h-0">
        {/* Left Bear Column */}
        <div className="md:col-span-4 bg-orange-50 border-4 border-orange-200 rounded-[2.5rem] p-5 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={isSpeaking ? {
              scale: [1, 1.08, 0.96, 1.05, 1],
              rotate: [0, 4, -4, 3, 0]
            } : {
              y: [0, -5, 0]
            }}
            transition={isSpeaking ? {
              repeat: Infinity,
              duration: 0.8
            } : {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            className="text-8xl mb-3 select-none"
          >
            🐻
          </motion.div>
          <h3 className="text-xl font-black text-orange-800">Balu the Bear</h3>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-white border border-orange-200 px-2.5 py-0.5 rounded-full mt-1.5">
            Active Talk Friend
          </span>

          <p className="text-xs text-orange-700/80 mt-3 font-medium max-w-[15rem] leading-relaxed">
            Choose a preset topic on the right or type with your parent. I will reply and say it in spoken Tamil!
          </p>
        </div>

        {/* Right Messages Column */}
        <div className="md:col-span-8 flex flex-col bg-white border-4 border-slate-100 rounded-[2.5rem] overflow-hidden">
          {/* Scrollable messages area */}
          <div className="flex-grow p-5 overflow-y-auto space-y-4 min-h-0 bg-slate-50/40">
            {messages.map((msg, idx) => {
              const isMe = msg.role === "user";
              return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                    isMe 
                      ? "bg-orange-500 text-white rounded-tr-none" 
                      : "bg-white border-2 border-slate-100 text-slate-800 rounded-tl-none"
                  }`}>
                    {isMe ? (
                      <p className="text-sm font-bold">{msg.text}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {/* Spoken Tamil text */}
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-black text-slate-900 leading-tight">
                            {msg.tamil}
                          </h4>
                          <button
                            onClick={() => speakTamilWord(msg.tamil || msg.transliteration || "")}
                            className="p-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                            title="Speak"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Transliteration guidance */}
                        <p className="text-xs font-extrabold text-orange-700 italic">
                          "{msg.transliteration}"
                        </p>
                        {/* English translation */}
                        <p className="text-xs text-gray-500 font-medium border-t border-slate-100 pt-1.5">
                          {msg.english}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  <span className="text-xs text-gray-400 font-bold">Balu is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset Questions Slider */}
          <div className="p-3 border-t-2 border-slate-50 flex gap-2 overflow-x-auto whitespace-nowrap bg-white select-none scrollbar-none flex-shrink-0">
            {PRESET_TOPICS.map((topic, index) => (
              <button
                key={index}
                onClick={() => sendMessage(topic.query)}
                disabled={loading}
                className="px-3.5 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 disabled:opacity-50 font-bold rounded-xl text-xs flex-shrink-0 transition-all active:scale-95"
              >
                {topic.text}
              </button>
            ))}
          </div>

          {/* Free Text Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
            className="p-3 bg-white border-t-2 border-slate-50 flex gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Balu anything with parent's help..."
              disabled={loading}
              className="flex-grow px-4 py-2.5 bg-slate-50 border-2 border-slate-100 focus:border-orange-300 rounded-2xl text-xs font-bold outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
