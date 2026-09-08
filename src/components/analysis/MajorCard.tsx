"use client";

import React from "react";
import { Trophy, ArrowRight, CheckCircle } from "lucide-react";
import { MajorRecommendationItem } from "@/types/api";

interface MajorCardProps {
  major: MajorRecommendationItem;
  isSelected: boolean;
  onSelect: (major: MajorRecommendationItem) => void;
}

export const MajorCard: React.FC<MajorCardProps> = ({ major, isSelected, onSelect }) => {
  const rankColors = [
    "from-amber-400 to-yellow-600 border-amber-500/40 text-amber-300",
    "from-slate-300 to-slate-500 border-slate-400/40 text-slate-200",
    "from-amber-700 to-amber-900 border-amber-700/40 text-amber-500",
  ];

  return (
    <div
      onClick={() => onSelect(major)}
      className={`relative cursor-pointer rounded-xl p-4 transition-all duration-200 border ${
        isSelected
          ? "glass-panel-glow border-indigo-500/60 bg-indigo-950/20 scale-[1.01]"
          : "glass-panel border-slate-800 hover:border-slate-700 bg-slate-900/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${
              rankColors[major.rank - 1] || "from-indigo-500 to-indigo-700"
            }`}
          >
            #{major.rank}
          </span>
          <h4 className="text-sm font-bold text-white tracking-tight">{major.major_name}</h4>
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold text-indigo-300 font-mono">
            {major.match_score}%
          </span>
          <div className="text-[10px] text-slate-400 uppercase font-medium -mt-0.5">
            Match Score
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{major.description}</p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${major.match_score}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
        <span className="text-slate-400 text-[11px]">
          {major.skill_gap.missing_skills.length} kỹ năng cần bù đắp
        </span>
        <span
          className={`flex items-center gap-1 font-semibold text-[11px] ${
            isSelected ? "text-indigo-400" : "text-slate-400"
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" /> Đang chọn
            </>
          ) : (
            <>
              Xem chi tiết <ArrowRight className="w-3 h-3" />
            </>
          )}
        </span>
      </div>
    </div>
  );
};
