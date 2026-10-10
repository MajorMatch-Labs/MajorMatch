"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, Filter } from "lucide-react";
import { SkillGapItem } from "@/types/api";

type FilterTab = "all" | "mastered" | "developing" | "missing";

interface SkillBreakdownProps {
  skillGap: SkillGapItem;
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ skillGap }) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const total =
    (skillGap.mastered_skills?.length || 0) +
    (skillGap.developing_skills?.length || 0) +
    (skillGap.missing_skills?.length || 0);

  const showMastered = activeFilter === "all" || activeFilter === "mastered";
  const showDeveloping = activeFilter === "all" || activeFilter === "developing";
  const showMissing = activeFilter === "all" || activeFilter === "missing";

  return (
    <div className="space-y-4">
      {/* Bộ lọc tương tác theo nhóm kỹ năng */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-300">Phân rã kỹ năng ({total} kỹ năng):</span>
        </div>
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Tất cả ({total})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("mastered")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeFilter === "mastered"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300"
            }`}
          >
            Đạt ({skillGap.mastered_skills?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("developing")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeFilter === "developing"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300"
            }`}
          >
            Đang học ({skillGap.developing_skills?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("missing")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeFilter === "missing"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300"
            }`}
          >
            Thiếu ({skillGap.missing_skills?.length || 0})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Mastered Skills */}
        {showMastered && (
          <div className={`p-4 rounded-xl glass-panel border border-emerald-300 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/10 shadow-sm transition-all duration-300 ${
            activeFilter === "mastered" ? "md:col-span-3 scale-[1.01]" : ""
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Mastered Skills ({skillGap.mastered_skills?.length || 0})
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
              Điểm môn học từ 3.0/4.0 trở lên hoặc có đồ án minh chứng trong hồ sơ:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillGap.mastered_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. Developing Skills */}
        {showDeveloping && (
          <div className={`p-4 rounded-xl glass-panel border border-amber-300 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/10 shadow-sm transition-all duration-300 ${
            activeFilter === "developing" ? "md:col-span-3 scale-[1.01]" : ""
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Developing Skills ({skillGap.developing_skills?.length || 0})
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
              Đã tiếp cận ở mức cơ sở (Điểm từ 2.0 đến dưới 3.0):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillGap.developing_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 3. Missing Skills */}
        {showMissing && (
          <div className={`p-4 rounded-xl glass-panel border border-rose-300 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-950/10 shadow-sm transition-all duration-300 ${
            activeFilter === "missing" ? "md:col-span-3 scale-[1.01]" : ""
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Missing Skills ({skillGap.missing_skills?.length || 0})
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
              Kỹ năng bắt buộc của ngành mà bạn chưa từng tích lũy:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillGap.missing_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
