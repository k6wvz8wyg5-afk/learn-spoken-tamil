import React, { useState } from "react";
import { UserProfile, Reward } from "../types";
import { REWARD_TEMPLATES } from "../data";
import { Award, Lock, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface RewardsShelfProps {
  profile: UserProfile;
  onBack: () => void;
}

export default function RewardsShelf({ profile, onBack }: RewardsShelfProps) {
  const [selectedReward, setSelectedReward] = useState<typeof REWARD_TEMPLATES[0] | null>(null);

  // Check if a badge is unlocked by the user
  const isUnlocked = (rewardId: string) => {
    return profile.rewards.some((r) => r.id === rewardId);
  };

  const getUnlockedAt = (rewardId: string) => {
    const found = profile.rewards.find((r) => r.id === rewardId);
    return found ? found.unlockedAt : "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12" id="rewards-shelf-screen">
      {/* Visual Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          id="back-to-map-from-rewards"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Map
        </button>
        <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3.5 py-1.5 rounded-xl font-bold text-sm">
          <Trophy className="w-5 h-5 text-purple-500 fill-purple-100 animate-bounce" />
          Completed Achievements: {profile.rewards.length}/{REWARD_TEMPLATES.length}
        </div>
      </div>

      {/* Hero Banner inside rewards shelf */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-md text-center mb-8 relative overflow-hidden">
        <div className="absolute left-4 -bottom-4 opacity-10 text-8xl pointer-events-none">
          🏆
        </div>
        <div className="relative z-10 max-w-lg mx-auto">
          <h2 className="text-2xl font-black">My Badges Cabinet</h2>
          <p className="text-xs text-purple-100 mt-1 leading-relaxed">
            Every time you complete lessons or speak Tamil with Meera, Kavin, and Balu, they award you custom sticker badges. Collect all of them!
          </p>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {REWARD_TEMPLATES.map((badge, idx) => {
          const unlocked = isUnlocked(badge.id);
          const unlockedDate = getUnlockedAt(badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => unlocked && setSelectedReward(badge)}
              className={`p-6 rounded-[2.5rem] border-4 text-center cursor-pointer transition-all relative overflow-hidden flex flex-col items-center justify-between min-h-[14rem] ${
                unlocked
                  ? "bg-white border-purple-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                  : "bg-slate-50 border-gray-200 opacity-60 cursor-not-allowed"
              }`}
              id={`reward-card-${badge.id}`}
            >
              {/* Badge Icon bubble */}
              <div className="flex flex-col items-center flex-grow justify-center">
                <motion.div
                  animate={unlocked ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md border-4 mb-3 ${
                    unlocked
                      ? "bg-purple-50 border-purple-400"
                      : "bg-gray-100 border-gray-300 filter grayscale"
                  }`}
                >
                  {unlocked ? badge.icon : <Lock className="w-8 h-8 text-gray-400" />}
                </motion.div>

                <h3 className={`text-base font-black ${unlocked ? "text-gray-800" : "text-gray-400"}`}>
                  {badge.title}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1 max-w-[11rem]">
                  {badge.description}
                </p>
              </div>

              {/* Status/Unlocked date bottom indicator */}
              <div className="mt-4 pt-2.5 border-t border-dashed border-gray-100 w-full">
                {unlocked ? (
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    Unlocked: {new Date(unlockedDate).toLocaleDateString()} 🎉
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Locked
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Individual Badge Showcase Pop-up overlay */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-8 max-w-sm text-center border-4 border-purple-300 shadow-2xl relative"
          >
            <div className="absolute right-6 top-6 text-2xl">✨</div>
            <div className="w-24 h-24 bg-purple-50 border-4 border-purple-400 rounded-full flex items-center justify-center text-5xl shadow-md mx-auto mb-4 animate-bounce">
              {selectedReward.icon}
            </div>
            
            <h3 className="text-2xl font-black text-purple-900">{selectedReward.title}</h3>
            <p className="text-xs text-purple-600 font-extrabold mt-1 uppercase tracking-widest">
              Special Trophy Sticker
            </p>
            
            <p className="text-sm text-gray-600 font-medium leading-relaxed mt-3 px-2">
              "Congratulations buddy! You did an absolutely incredible job learning spoken Tamil phrases and pronouncing letters with your character friends!"
            </p>

            <button
              onClick={() => setSelectedReward(null)}
              className="mt-6 px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-extrabold rounded-2xl text-xs shadow-sm active:scale-95 transition-all"
            >
              Wonderful! Keep Learning!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
