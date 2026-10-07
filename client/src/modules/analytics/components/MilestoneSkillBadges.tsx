"use client";

import React, { useMemo } from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";

interface MilestoneSkillBadgesProps {
  skills: string[];
  semesterTitle?: string;
  className?: string;
}

export const MilestoneSkillBadges: React.FC<MilestoneSkillBadgesProps> = ({
  skills,
  semesterTitle,
  className = ""
}) => {
  const { analysisResult } = useProfileStore();

  // Danh sách kỹ năng còn thiếu của sinh viên từ kết quả phân tích
  const missingSkillsSet = useMemo(() => {
    const list = analysisResult?.skill_breakdown?.missing_skills || [];
    return new Set(list.map((s) => s.toLowerCase().trim()));
  }, [analysisResult]);

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Kỹ năng đầu ra giai đoạn {semesterTitle ? `(${semesterTitle})` : ""}:</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {skills.length} kỹ năng trọng tâm
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, idx) => {
          const isClosingGap = missingSkillsSet.has(skill.toLowerCase().trim());
          
          return (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-200 border ${
                isClosingGap
                  ? "bg-indigo-950/80 text-indigo-200 border-indigo-500/50 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/30"
                  : "bg-slate-800/60 text-slate-300 border-slate-700/50 hover:border-slate-600"
              }`}
            >
              {isClosingGap ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="Kỹ năng này giúp bù đắp trực tiếp khoảng trống năng lực hiện tại">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {skill}
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">Bù đắp Gap</span>
                </span>
              ) : (
                <>
                  <span className="text-slate-500 font-mono">#</span>
                  {skill}
                </>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};
