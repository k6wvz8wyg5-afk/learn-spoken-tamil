import React, { useState } from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, UserPlus, Trash2, Star, Flame, Sparkles, Check } from "lucide-react";

interface ProfileSwitcherProps {
  profiles: UserProfile[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  onAddProfile: (name: string, avatar: string) => void;
  onDeleteProfile: (idx: number) => void;
  onClose: () => void;
}

const AVATARS = ["🦁", "🐨", "🦊", "🐼", "🦉", "🦖", "🦄", "🐵"];

export default function ProfileSwitcher({
  profiles,
  activeIdx,
  onSelect,
  onAddProfile,
  onDeleteProfile,
  onClose,
}: ProfileSwitcherProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddProfile(newName.trim(), selectedAvatar);
    setNewName("");
    setSelectedAvatar(AVATARS[0]);
    setShowAddForm(false);
  };

  const handleDelete = (e: React.MouseEvent, idx: number, name: string) => {
    e.stopPropagation(); // Prevent selecting
    const isParent = confirm(`Parents: Are you sure you want to delete ${name}'s progress? This cannot be undone.`);
    if (isParent) {
      onDeleteProfile(idx);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
      id="profile-switcher-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border-8 border-emerald-100 rounded-[3rem] p-6 sm:p-8 max-w-2xl w-full text-center relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-full translate-y-12 -translate-x-12 pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0 relative z-10">
          <div className="text-left">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Who is Playing?</h3>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
              Select your space or create a new buddy!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-2xl transition-all active:scale-90"
            id="close-switcher-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto min-h-0 px-2 pb-4 relative z-10">
          <AnimatePresence mode="wait">
            {!showAddForm ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {profiles.map((p, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <motion.div
                      key={`${p.name}-${idx}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(idx)}
                      className={`p-5 rounded-[2.5rem] border-4 text-left cursor-pointer transition-all flex items-center justify-between shadow-sm relative group ${
                        isActive
                          ? "bg-emerald-50/50 border-emerald-400 ring-4 ring-emerald-100"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 bg-amber-50 border-3 border-amber-200 rounded-3xl flex items-center justify-center text-4xl shadow-sm relative">
                          {p.avatar}
                          {isActive && (
                            <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        {/* Profile Info */}
                        <div>
                          <h4 className="text-lg font-black text-slate-800 leading-tight">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2.5 mt-1.5">
                            <span className="flex items-center gap-1 text-xs font-extrabold text-yellow-600 bg-yellow-50 border border-yellow-200/50 px-2 py-0.5 rounded-lg">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                              {p.stars}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-extrabold text-orange-600 bg-orange-50 border border-orange-200/50 px-2 py-0.5 rounded-lg">
                              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
                              {p.dailyStreak}d
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete icon - hidden unless hovered/tapped on mobile for safety, and parents confirmation */}
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(e, idx, p.name)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Kid Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}

                {/* Add New Profile card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(true)}
                  className="p-5 rounded-[2.5rem] border-4 border-dashed border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/10 cursor-pointer flex items-center justify-center gap-3 min-h-[6.5rem] transition-all"
                  id="add-new-profile-card"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-500">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-black text-slate-700">Add New Player</h4>
                    <p className="text-xs text-slate-400 font-semibold">Perfect for brothers, sisters, or friends!</p>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md mx-auto"
              >
                <div className="bg-emerald-50/30 border-3 border-emerald-100 p-6 rounded-[2.5rem] text-left">
                  <h4 className="text-lg font-black text-slate-800 mb-1">Create a New Profile</h4>
                  <p className="text-xs text-slate-500 font-medium mb-4">
                    Enter the kid's name and choose a mascot buddy to start a brand new Tamil learning path!
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                        Kid's First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter name (e.g. Advik)..."
                        className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-emerald-300 outline-none rounded-2xl text-sm font-bold placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
                        Pick a Mascot Avatar
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {AVATARS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSelectedAvatar(emoji)}
                            className={`p-2.5 text-2xl rounded-2xl border-3 transition-all hover:scale-105 active:scale-95 ${
                              selectedAvatar === emoji
                                ? "bg-emerald-50 border-emerald-400 shadow-sm"
                                : "bg-white border-transparent hover:border-slate-100"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newName.trim()}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 fill-white" /> Create Profile
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
