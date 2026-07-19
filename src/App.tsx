import React, { useState, useEffect } from "react";
import { UserProfile, ModuleLesson, Reward } from "./types";
import { MODULES, REWARD_TEMPLATES, isModuleCompleted, getModule } from "./data";
import Header from "./components/Header";
import LessonsMap from "./components/LessonsMap";
import GameRouter from "./components/GameRouter";
import BaluChat from "./components/BaluChat";
import RewardsShelf from "./components/RewardsShelf";
import BreathingSpace from "./components/BreathingSpace";
import ProfileSwitcher from "./components/ProfileSwitcher";
import ParentDashboard from "./components/ParentDashboard";
import StickerBook from "./components/StickerBook";
import { ProfileNameProvider } from "./hooks/useProfileName";
import { Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";

const AVATARS = ["🦁", "🐨", "🦊", "🐼", "🦉", "🦖", "🦄", "🐵"];

async function loadProfilesFromServer(name: string): Promise<{ profiles: UserProfile[] | null; activeIdx: number }> {
  try {
    const res = await fetch(`/api/profiles/${encodeURIComponent(name.toLowerCase().trim())}`);
    if (!res.ok) return { profiles: null, activeIdx: 0 };
    const data = await res.json();
    if (!data.profiles) return { profiles: null, activeIdx: 0 };
    return { profiles: data.profiles.map(migrateProfile), activeIdx: data.activeIdx ?? 0 };
  } catch {
    return { profiles: null, activeIdx: 0 };
  }
}

function saveProfilesToServer(profiles: UserProfile[], activeIdx: number) {
  const profile = profiles[activeIdx];
  if (!profile || !profile.name) return;
  const key = profile.name.toLowerCase().trim();
  fetch(`/api/profiles/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profiles, activeIdx }),
  }).catch(() => {});
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  avatar: "🦁",
  stars: 0,
  unlockedModules: ["m1"],
  completedLessons: [],
  rewards: [],
  dailyStreak: 1,
  lastActive: new Date().toDateString(),
};

function cleanupStorage() {
  try {
    const keysToEvict: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("tamil_kid_events_") || key.includes("_chunk_") || key.startsWith("tamil_kid_sandbox_"))) {
        keysToEvict.push(key);
      }
    }
    keysToEvict.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function migrateProfile(profile: any): UserProfile {
  if (profile.unlockedModules && profile.completedLessons) {
    return profile as UserProfile;
  }
  return {
    name: profile.name || "",
    avatar: profile.avatar || "🦁",
    stars: profile.stars || 0,
    unlockedModules: ["m1"],
    completedLessons: [],
    rewards: profile.rewards || [],
    dailyStreak: profile.dailyStreak || 1,
    lastActive: profile.lastActive || new Date().toDateString(),
  };
}

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileIdx, setActiveProfileIdx] = useState<number>(0);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [activeLesson, setActiveLesson] = useState<ModuleLesson | null>(null);
  const [showShelf, setShowShelf] = useState(false);
  const [showSandboxChat, setShowSandboxChat] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showStickerBook, setShowStickerBook] = useState(false);
  const [starSplash, setStarSplash] = useState<number | null>(null);

  const profile = profiles[activeProfileIdx] || null;

  useEffect(() => {
    // Load from localStorage first (instant), then reconcile with server
    const savedMulti = localStorage.getItem("tamil_kid_profiles");
    const savedActiveIdx = localStorage.getItem("tamil_kid_active_profile_idx");

    let loadedProfiles: UserProfile[] = [];
    let activeIdx = 0;

    if (savedMulti) {
      try {
        const parsed = JSON.parse(savedMulti);
        loadedProfiles = parsed.map(migrateProfile);
        activeIdx = savedActiveIdx ? JSON.parse(savedActiveIdx) : 0;
      } catch (e) {
        console.error("Error loading profiles", e);
      }
    } else {
      const savedSingle = localStorage.getItem("tamil_kid_profile");
      if (savedSingle) {
        try {
          const parsed = JSON.parse(savedSingle);
          loadedProfiles = [migrateProfile(parsed)];
          activeIdx = 0;
        } catch (e) {
          console.error("Error loading single profile", e);
        }
      }
    }

    if (loadedProfiles.length > 0) {
      if (activeIdx < 0 || activeIdx >= loadedProfiles.length) activeIdx = 0;

      const current = loadedProfiles[activeIdx];
      const today = new Date().toDateString();
      if (current.lastActive !== today) {
        const lastDate = new Date(current.lastActive);
        const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let updatedStreak = current.dailyStreak;
        if (diffDays === 1) updatedStreak += 1;
        else if (diffDays > 1) updatedStreak = 1;

        loadedProfiles[activeIdx] = { ...current, dailyStreak: updatedStreak, lastActive: today };
      }

      setProfiles(loadedProfiles);
      setActiveProfileIdx(activeIdx);
      setIsOnboarding(false);

      try {
        localStorage.setItem("tamil_kid_profiles", JSON.stringify(loadedProfiles));
        localStorage.setItem("tamil_kid_active_profile_idx", JSON.stringify(activeIdx));
      } catch (e) {
        console.warn("localStorage full, clearing old data", e);
        cleanupStorage();
        try {
          localStorage.setItem("tamil_kid_profiles", JSON.stringify(loadedProfiles));
          localStorage.setItem("tamil_kid_active_profile_idx", JSON.stringify(activeIdx));
        } catch {}
      }

      // Also sync to server
      saveProfilesToServer(loadedProfiles, activeIdx);
    } else {
      // No local data — show onboarding (will check server when name is entered)
      setIsOnboarding(true);
    }
  }, []);

  const saveProfiles = (updatedProfiles: UserProfile[], activeIdx: number) => {
    setProfiles(updatedProfiles);
    setActiveProfileIdx(activeIdx);
    try {
      localStorage.setItem("tamil_kid_profiles", JSON.stringify(updatedProfiles));
      localStorage.setItem("tamil_kid_active_profile_idx", JSON.stringify(activeIdx));
    } catch (e) {
      console.warn("localStorage full, clearing old data", e);
      cleanupStorage();
      try {
        localStorage.setItem("tamil_kid_profiles", JSON.stringify(updatedProfiles));
        localStorage.setItem("tamil_kid_active_profile_idx", JSON.stringify(activeIdx));
      } catch {}
    }
    saveProfilesToServer(updatedProfiles, activeIdx);
  };

  const saveProfile = (newProfile: UserProfile) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[activeProfileIdx] = newProfile;
    saveProfiles(updatedProfiles, activeProfileIdx);
  };

  const handleOnboardingSubmit = async (name: string, avatar: string) => {
    if (!name.trim()) return;

    // Check if this profile already exists on the server
    const { profiles: serverProfiles, activeIdx: serverIdx } = await loadProfilesFromServer(name);
    if (serverProfiles && serverProfiles.length > 0) {
      setProfiles(serverProfiles);
      setActiveProfileIdx(serverIdx);
      setIsOnboarding(false);
      try {
        localStorage.setItem("tamil_kid_profiles", JSON.stringify(serverProfiles));
        localStorage.setItem("tamil_kid_active_profile_idx", JSON.stringify(serverIdx));
      } catch {}
      return;
    }

    // New profile
    const newProf: UserProfile = { ...DEFAULT_PROFILE, name: name.trim(), avatar, lastActive: new Date().toDateString() };
    const updatedProfiles = [...profiles, newProf];
    saveProfiles(updatedProfiles, updatedProfiles.length - 1);
    setIsOnboarding(false);
  };

  const handleAddProfile = (name: string, avatar: string) => {
    if (!name.trim()) return;
    const newProf: UserProfile = { ...DEFAULT_PROFILE, name: name.trim(), avatar, lastActive: new Date().toDateString() };
    const updatedProfiles = [...profiles, newProf];
    saveProfiles(updatedProfiles, updatedProfiles.length - 1);
  };

  const handleSelectProfile = (idx: number) => {
    if (idx < 0 || idx >= profiles.length) return;
    saveProfiles(profiles, idx);
    setShowProfileSwitcher(false);
    setActiveLesson(null);
    setShowShelf(false);
    setShowSandboxChat(false);
  };

  const handleDeleteProfile = (idx: number) => {
    if (profiles.length <= 1) return;
    const updatedProfiles = profiles.filter((_, i) => i !== idx);
    let newIdx = activeProfileIdx;
    if (idx === activeProfileIdx) newIdx = 0;
    else if (idx < activeProfileIdx) newIdx = activeProfileIdx - 1;
    saveProfiles(updatedProfiles, newIdx);
  };

  const handleLessonComplete = (starsEarned: number) => {
    if (!profile || !activeLesson) return;

    const alreadyCompleted = profile.completedLessons.includes(activeLesson.id);
    const updatedCompleted = alreadyCompleted
      ? profile.completedLessons
      : [...profile.completedLessons, activeLesson.id];

    const newStars = profile.stars + starsEarned;
    setStarSplash(starsEarned);

    // Check if module just completed — unlock next
    const updatedModules = [...profile.unlockedModules];
    const currentModule = getModule(activeLesson.moduleId);
    if (currentModule) {
      const moduleNowComplete = currentModule.lessons.every((l) => updatedCompleted.includes(l.id));
      if (moduleNowComplete) {
        const nextModule = MODULES.find((m) => m.unlockAfter === currentModule.id);
        if (nextModule && !updatedModules.includes(nextModule.id)) {
          updatedModules.push(nextModule.id);
        }
      }
    }

    // Check rewards
    const newRewards: Reward[] = [...profile.rewards];
    const awardBadge = (badgeId: string) => {
      if (newRewards.some((r) => r.id === badgeId)) return;
      const template = REWARD_TEMPLATES.find((t) => t.id === badgeId);
      if (template) {
        newRewards.push({ ...template, unlockedAt: new Date().toISOString() });
      }
    };

    // Module completion badges
    MODULES.forEach((mod) => {
      if (isModuleCompleted(mod.id, updatedCompleted)) {
        awardBadge(`r-${mod.id}`);
      }
    });

    // Star milestones
    if (newStars >= 50) awardBadge("r-stars-50");
    if (newStars >= 200) awardBadge("r-stars-200");

    // Skill badges
    const listeningCount = updatedCompleted.filter((id) => {
      const parts = id.split("-");
      return parts[1] === "l1";
    }).length;
    if (listeningCount >= 10) awardBadge("r-listener");

    const speakingCount = updatedCompleted.filter((id) => {
      const parts = id.split("-");
      return parts[1] === "l2" || parts[1] === "l3";
    }).length;
    if (speakingCount >= 5) awardBadge("r-speaker");

    const updatedProfile: UserProfile = {
      ...profile,
      stars: newStars,
      completedLessons: updatedCompleted,
      unlockedModules: updatedModules,
      rewards: newRewards,
    };

    saveProfile(updatedProfile);

    setTimeout(() => {
      setStarSplash(null);
      setActiveLesson(null);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 pb-8 flex flex-col font-sans">
      {isOnboarding ? (
        <div className="flex-grow flex items-center justify-center p-4 min-h-screen">
          <OnboardingPanel onSubmit={handleOnboardingSubmit} />
        </div>
      ) : profile ? (
        <>
          <Header
            profile={profile}
            onReset={() => setShowProfileSwitcher(true)}
            onShowShelf={() => {
              setShowShelf(true);
              setActiveLesson(null);
              setShowSandboxChat(false);
              setShowDashboard(false);
              setShowStickerBook(false);
            }}
            showShelfActive={showShelf}
            onGoHome={() => {
              setShowShelf(false);
              setActiveLesson(null);
              setShowSandboxChat(false);
              setShowDashboard(false);
              setShowStickerBook(false);
            }}
            onShowBreathing={() => setShowBreathing(true)}
            onShowDashboard={() => {
              setShowDashboard(true);
              setShowShelf(false);
              setActiveLesson(null);
              setShowSandboxChat(false);
              setShowStickerBook(false);
            }}
          />

          <main className="flex-grow px-2 sm:px-6">
            {showDashboard ? (
              <ParentDashboard profileName={profile.name} onBack={() => setShowDashboard(false)} />
            ) : showShelf ? (
              <RewardsShelf profile={profile} onBack={() => setShowShelf(false)} />
            ) : showStickerBook ? (
              <StickerBook profileName={profile.name} completedLessons={profile.completedLessons} onBack={() => setShowStickerBook(false)} />
            ) : showSandboxChat ? (
              <BaluChat onBack={() => setShowSandboxChat(false)} />
            ) : activeLesson ? (
              <ProfileNameProvider value={profile.name}>
                <GameRouter
                  lesson={activeLesson}
                  onComplete={handleLessonComplete}
                  onBack={() => setActiveLesson(null)}
                />
              </ProfileNameProvider>
            ) : (
              <LessonsMap
                profile={profile}
                onSelectLesson={(lesson) => {
                  setActiveLesson(lesson);
                  setShowShelf(false);
                  setShowSandboxChat(false);
                  setShowStickerBook(false);
                }}
                onStartSandboxChat={() => {
                  setShowSandboxChat(true);
                  setShowShelf(false);
                  setActiveLesson(null);
                  setShowStickerBook(false);
                }}
                onOpenStickerBook={() => {
                  setShowStickerBook(true);
                  setShowShelf(false);
                  setActiveLesson(null);
                  setShowSandboxChat(false);
                }}
              />
            )}
          </main>
        </>
      ) : null}

      {showBreathing && <BreathingSpace onClose={() => setShowBreathing(false)} />}

      {showProfileSwitcher && (
        <ProfileSwitcher
          profiles={profiles}
          activeIdx={activeProfileIdx}
          onSelect={handleSelectProfile}
          onAddProfile={handleAddProfile}
          onDeleteProfile={handleDeleteProfile}
          onClose={() => setShowProfileSwitcher(false)}
        />
      )}

      {starSplash !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-sm text-center border-4 border-yellow-300 shadow-2xl relative"
          >
            <span className="text-7xl block animate-bounce">🏆🌟✨</span>
            <h2 className="text-3xl font-black text-gray-800 mt-4">Fantastic!</h2>
            <p className="text-sm text-gray-500 font-semibold mt-2">
              You completed the challenge and earned stars!
            </p>
            <div className="mt-5 inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 text-yellow-800 font-black px-6 py-2.5 rounded-full text-lg shadow-sm">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-400 animate-pulse" />
              +{starSplash} Stars!
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface OnboardingPanelProps {
  onSubmit: (name: string, avatar: string) => void;
}

function OnboardingPanel({ onSubmit }: OnboardingPanelProps) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white border-4 border-emerald-100 p-8 rounded-[3rem] w-full max-w-md shadow-lg text-center"
    >
      <span className="text-6xl block select-none mb-3 animate-bounce">🎒🎒</span>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Learn Spoken Tamil!</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
        Create a profile to play tracing games, match fun words, and talk in Tamil with Balu!
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(name, selectedAvatar); }}
        className="mt-6 space-y-5 text-left"
      >
        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
            Kid's First Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name (e.g. Advik)..."
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 focus:border-emerald-300 outline-none rounded-2xl text-sm font-bold placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">
            Pick a Friend Mascot Avatar
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedAvatar(emoji)}
                className={`p-3 text-3xl rounded-2xl border-3 transition-all hover:scale-105 active:scale-95 ${
                  selectedAvatar === emoji
                    ? "bg-emerald-50 border-emerald-400 shadow-sm"
                    : "bg-slate-50 border-transparent hover:border-slate-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md disabled:opacity-50 mt-4 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 fill-white" /> Let's Start Playing!
        </button>
      </form>
    </motion.div>
  );
}
