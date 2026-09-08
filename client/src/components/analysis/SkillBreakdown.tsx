"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { SkillGapItem } from "@/types/api";

interface SkillBreakdownProps {
  skillGap: SkillGapItem;
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ skillGap }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Mastered Skills */}
      <div className="p-4 rounded-xl glass-panel border border-emerald-500/20 bg-emerald-950/10">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Mastered Skills ({skillGap.mastered_skills.length})
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Điểm môn học từ 3.0/4.0 trở lên hoặc có đồ án minh chứng trong hồ sơ:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skillGap.mastered_skills.map((s, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Developing Skills */}
      <div className="p-4 rounded-xl glass-panel border border-amber-500/20 bg-amber-950/10">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Developing Skills ({skillGap.developing_skills.length})
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Đã tiếp cận ở mức cơ sở (Điểm từ 2.0 đến dưới 3.0):
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skillGap.developing_skills.map((s, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Missing Skills */}
      <div className="p-4 rounded-xl glass-panel border border-rose-500/20 bg-rose-950/10">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
            Missing Skills ({skillGap.missing_skills.length})
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Kỹ năng bắt buộc của ngành mà bạn chưa từng tích lũy:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skillGap.missing_skills.map((s, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
