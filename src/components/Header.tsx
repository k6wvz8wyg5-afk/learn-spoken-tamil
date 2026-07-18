import React from "react";
import { UserProfile } from "../types";
import { Star, Trophy, Sparkles, LogOut, Award, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  profile: UserProfile;
  onReset: () => void;
  onShowShelf: () => void;
  showShelfActive: boolean;
  onGoHome: () => void;
  onShowBreathing: () => void;
  onShowDashboard?: () => void;
}

export default function Header({ profile, onReset, onShowShelf, showShelfActive, onGoHome, onShowBreathing, onShowDashboard }: HeaderProps) {
  return (
    <header className="bg-white border-b-4 border-emerald-100 rounded-b-[2.5rem] shadow-sm px-6 py-4 mb-6 transition-all">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Avatar & Name */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 active:scale-95 transition-all group"
          id="header-profile"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-3xl shadow-sm group-hover:rotate-6 transition-transform">
            {profile.avatar}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-1">
              Vanakkam, <span className="text-emerald-600 font-extrabold">{profile.name}</span>!
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="inline-block"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Daily Streak: 🔥 {profile.dailyStreak} day{profile.dailyStreak !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Right Side: Score, Rewards Shelf & Exit */}
        <div className="flex items-center gap-3 flex-wrap justify-center" id="header-stats">
          {/* Calming Bear Breath */}
          <button
            onClick={onShowBreathing}
            id="calming-breath-button"
            className="flex items-center gap-1.5 bg-sky-50 border-3 border-sky-300 px-3.5 py-2 rounded-2xl shadow-sm text-sky-700 hover:bg-sky-100 transition-all active:scale-95 font-extrabold text-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="inline-block text-lg"
            >
              🧘‍♂️
            </motion.span>
            <span>Bear Breath</span>
          </button>

          {/* Star Counter */}
          <motion.div 
            key={profile.stars}
            initial={{ scale: 0.8, y: -5 }}
            animate={{ scale: 1, y: 0 }}
            className="flex items-center gap-1.5 bg-yellow-50 border-3 border-yellow-300 px-4 py-2 rounded-2xl shadow-sm"
          >
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-400 animate-pulse" />
            <span className="text-lg font-extrabold text-yellow-700">{profile.stars}</span>
            <span className="text-xs text-yellow-600 font-bold ml-0.5">Stars</span>
          </motion.div>

          {/* Rewards Shelf Button */}
          <button
            onClick={onShowShelf}
            id="badge-shelf-button"
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-3 font-bold transition-all shadow-sm active:scale-95 ${
              showShelfActive
                ? "bg-purple-100 border-purple-400 text-purple-700"
                : "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
            }`}
          >
            <Trophy className="w-5 h-5 text-purple-500 fill-purple-200" />
            <span className="text-sm">My Badges ({profile.rewards.length})</span>
          </button>

          {/* Parent Area: Dashboard & Reset */}
          {onShowDashboard && (
            <button
              onClick={onShowDashboard}
              id="parent-dashboard-button"
              title="Parent Dashboard"
              className="p-2 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-400 hover:text-purple-500 hover:bg-purple-50 hover:border-purple-200 active:scale-90 transition-all text-xs font-bold flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onReset}
            id="reset-profile-button"
            title="Parent Area - Restart"
            className="p-2 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 active:scale-90 transition-all text-xs font-bold flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Change Kid</span>
          </button>
        </div>
      </div>
    </header>
  );
}
