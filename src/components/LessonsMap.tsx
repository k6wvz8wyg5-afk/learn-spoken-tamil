import React, { useState } from "react";
import { UserProfile, Module, ModuleLesson } from "../types";
import { MODULES, isModuleUnlocked, isModuleCompleted, isLessonUnlocked, getModuleProgress, CHARACTERS } from "../data";
import { Lock, CheckCircle2, Play, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LessonsMapProps {
  profile: UserProfile;
  onSelectLesson: (lesson: ModuleLesson) => void;
  onStartSandboxChat: () => void;
  onOpenStickerBook?: () => void;
}

export default function LessonsMap({ profile, onSelectLesson, onStartSandboxChat, onOpenStickerBook }: LessonsMapProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(() => {
    // Auto-expand the first unlocked but not completed module
    for (const mod of MODULES) {
      if (isModuleUnlocked(mod.id, profile.completedLessons) && !isModuleCompleted(mod.id, profile.completedLessons)) {
        return mod.id;
      }
    }
    return "m1";
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className="max-w-lg mx-auto py-4 px-2">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-gray-800">Tamil Learning Path</h2>
        <p className="text-xs text-gray-500 mt-1">Complete modules to unlock the next!</p>
      </div>

      <div className="space-y-3">
        {MODULES.map((mod) => {
          const unlocked = isModuleUnlocked(mod.id, profile.completedLessons);
          const completed = isModuleCompleted(mod.id, profile.completedLessons);
          const progress = getModuleProgress(mod.id, profile.completedLessons);
          const isExpanded = expandedModule === mod.id;
          const character = CHARACTERS[mod.characterId];

          return (
            <div key={mod.id}>
              {/* Module Card */}
              <motion.button
                onClick={() => unlocked && toggleModule(mod.id)}
                disabled={!unlocked}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  completed
                    ? "bg-green-50 border-green-200 shadow-sm"
                    : unlocked
                    ? "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md shadow-sm"
                    : "bg-gray-50 border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    completed ? "bg-green-100" : unlocked ? "bg-emerald-50" : "bg-gray-100"
                  }`}>
                    {unlocked ? mod.icon : "🔒"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-black truncate ${
                        completed ? "text-green-800" : unlocked ? "text-gray-800" : "text-gray-400"
                      }`}>
                        {mod.title}
                      </h3>
                      {completed && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                    <p className={`text-xs mt-0.5 ${unlocked ? "text-gray-500" : "text-gray-400"}`}>
                      {mod.theme} • {character.avatar} {character.name.split(" ")[0]}
                    </p>

                    {unlocked && (
                      <div className="flex items-center gap-1.5 mt-2">
                        {mod.lessons.map((l) => {
                          const lessonDone = profile.completedLessons.includes(l.id);
                          return (
                            <div
                              key={l.id}
                              className={`w-3 h-3 rounded-full border ${
                                lessonDone
                                  ? "bg-green-400 border-green-500"
                                  : "bg-gray-200 border-gray-300"
                              }`}
                            />
                          );
                        })}
                        <span className="text-[10px] font-bold text-gray-400 ml-1">
                          {progress}/4
                        </span>
                      </div>
                    )}
                  </div>

                  {unlocked && (
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  )}
                </div>
              </motion.button>

              {/* Expanded lesson list */}
              <AnimatePresence>
                {isExpanded && unlocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-1 pl-6 pr-2 space-y-2">
                      {mod.lessons.map((lesson) => {
                        const lessonUnlocked = isLessonUnlocked(lesson, profile.completedLessons);
                        const lessonDone = profile.completedLessons.includes(lesson.id);

                        return (
                          <motion.button
                            key={lesson.id}
                            onClick={() => lessonUnlocked && onSelectLesson(lesson)}
                            disabled={!lessonUnlocked}
                            whileTap={lessonUnlocked ? { scale: 0.97 } : {}}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                              lessonDone
                                ? "bg-green-50 border-green-200"
                                : lessonUnlocked
                                ? "bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                                : "bg-gray-50 border-gray-100 opacity-50"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                              lessonDone
                                ? "bg-green-400 text-white"
                                : lessonUnlocked
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-400"
                            }`}>
                              {lessonDone ? "✓" : lesson.lessonNumber}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${
                                lessonUnlocked ? "text-gray-800" : "text-gray-400"
                              }`}>
                                {lesson.title}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {lesson.description}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              {lessonDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : lessonUnlocked ? (
                                <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-gray-300" />
                              )}
                            </div>

                            {lessonUnlocked && (
                              <span className="text-[10px] font-bold text-yellow-600">
                                ⭐{lesson.starsReward}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Balu sandbox chat */}
      <div className="mt-8 text-center flex flex-wrap justify-center gap-3">
        <button
          onClick={onStartSandboxChat}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:bg-orange-100 transition-all"
        >
          <span className="text-2xl">🐻</span>
          <div className="text-left">
            <p className="text-sm font-bold text-orange-800">Chat with Balu!</p>
            <p className="text-[10px] text-orange-600">Free Tamil conversation practice</p>
          </div>
          <MessageCircle className="w-4 h-4 text-orange-400" />
        </button>

        {onOpenStickerBook && (
          <button
            onClick={onOpenStickerBook}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 border-2 border-purple-200 rounded-2xl hover:bg-purple-100 transition-all"
          >
            <span className="text-2xl">🎨</span>
            <div className="text-left">
              <p className="text-sm font-bold text-purple-800">Sticker Book</p>
              <p className="text-[10px] text-purple-600">Speak words to play!</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
