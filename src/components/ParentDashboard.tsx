import React, { useState, useMemo } from "react";
import { MetricsEngine, WordMetric, WordTier } from "../lib/metrics";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ParentDashboardProps {
  profileName: string;
  onBack: () => void;
}

const TIER_COLORS: Record<WordTier, { bg: string; border: string; text: string; label: string }> = {
  mastered: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", label: "Mastered" },
  familiar: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", label: "Familiar" },
  acquiring: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", label: "Acquiring" },
};

export default function ParentDashboard({ profileName, onBack }: ParentDashboardProps) {
  const engine = useMemo(() => new MetricsEngine(profileName), [profileName]);
  const [refreshKey, setRefreshKey] = useState(0);

  const metrics = useMemo(() => engine.getAllMetrics(), [engine, refreshKey]);
  const summary = useMemo(() => engine.getSummary(), [engine, refreshKey]);

  const groupedWords = useMemo(() => {
    const groups: Record<WordTier, WordMetric[]> = { mastered: [], familiar: [], acquiring: [] };
    metrics.forEach((m) => {
      const tier = engine.getTier(m.wordId);
      groups[tier].push(m);
    });
    return groups;
  }, [metrics, engine]);

  const quarantined = useMemo(() => metrics.filter((m) => m.quarantined), [metrics]);

  const handleUnquarantine = (wordId: string) => {
    engine.unquarantine(wordId);
    engine.save();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold rounded-xl text-sm flex items-center gap-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
          <BarChart3 className="w-4 h-4" />
          Parent Dashboard
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-gray-800">{summary.totalWords}</p>
          <p className="text-xs text-gray-500 font-medium">Words Seen</p>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-700">{summary.mastered}</p>
          <p className="text-xs text-emerald-600 font-medium">Mastered</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-amber-700">{summary.familiar}</p>
          <p className="text-xs text-amber-600 font-medium">Familiar</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-purple-700">{(summary.overallFAAR * 100).toFixed(0)}%</p>
          <p className="text-xs text-purple-600 font-medium">Overall FAAR</p>
        </div>
      </div>

      {/* Quarantined words */}
      {quarantined.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full" />
            Quarantined Words ({quarantined.length})
          </h3>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-3">
              These words had 5+ consecutive failures and were removed from the critical path. Tap to reintroduce.
            </p>
            <div className="flex flex-wrap gap-2">
              {quarantined.map((m) => (
                <button
                  key={m.wordId}
                  onClick={() => handleUnquarantine(m.wordId)}
                  className="px-3 py-1.5 bg-white border-2 border-slate-300 rounded-full text-xs font-bold text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-1"
                >
                  {m.wordId}
                  <RefreshCw className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Word tiers */}
      {(["mastered", "familiar", "acquiring"] as WordTier[]).map((tier) => {
        const words = groupedWords[tier];
        const config = TIER_COLORS[tier];
        if (words.length === 0) return null;

        return (
          <div key={tier} className="mb-6">
            <h3 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${config.bg} border ${config.border}`} />
              {config.label} ({words.length})
            </h3>
            <div className={`${config.bg} border-2 ${config.border} rounded-2xl p-4`}>
              <div className="flex flex-wrap gap-2">
                {words.map((m) => (
                  <motion.div
                    key={m.wordId}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-3 py-1.5 bg-white border ${config.border} rounded-full text-xs font-bold ${config.text}`}
                  >
                    {m.wordId}
                    <span className="ml-1 text-gray-400">
                      ({(m.totalCorrect / Math.max(1, m.attempts) * 100).toFixed(0)}%)
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {metrics.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl block mb-4">📊</span>
          <p className="text-gray-500 font-medium">No learning data yet!</p>
          <p className="text-xs text-gray-400 mt-1">Data will appear as lessons are completed.</p>
        </div>
      )}
    </div>
  );
}
