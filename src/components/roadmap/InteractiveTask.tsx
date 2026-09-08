"use client";

import React from "react";
import { Check, BookOpen, Code2, Award } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";

interface InteractiveTaskProps {
  id: string; // Course code hoặc Project title
  type: "course" | "project" | "cert";
  title: string;
  subtitle?: string;
  credits?: number;
  skills?: string[];
  rationale?: string;
}

export const InteractiveTask: React.FC<InteractiveTaskProps> = ({
  id,
  type,
  title,
  subtitle,
  credits,
  skills,
  rationale
}) => {
  const { completedItems, toggleCompletedItem } = useProfileStore();
  const isCompleted = !!completedItems[id];

  return (
    <div
      onClick={() => toggleCompletedItem(id, type === "project" ? "project" : "course")}
      className={`group cursor-pointer rounded-xl p-3.5 transition-all duration-200 border flex items-start gap-3.5 ${
        isCompleted
          ? "bg-emerald-950/20 border-emerald-500/40 text-slate-300"
          : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 text-white"
      }`}
    >
      {/* Checkbox Icon */}
      <div
        className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
          isCompleted
            ? "bg-emerald-500 border-emerald-400 text-slate-950"
            : "border-slate-600 bg-slate-800/50 group-hover:border-indigo-400"
        }`}
      >
        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {type === "course" && (
            <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 font-mono text-[10px] font-bold">
              {subtitle || "MÔN HỌC"}
            </span>
          )}
          {type === "project" && (
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-mono text-[10px] font-bold flex items-center gap-1">
              <Code2 className="w-3 h-3" /> ĐỒ ÁN
            </span>
          )}
          {type === "cert" && (
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 font-mono text-[10px] font-bold flex items-center gap-1">
              <Award className="w-3 h-3" /> CHỨNG CHỈ
            </span>
          )}

          <h5
            className={`text-xs font-semibold tracking-tight transition-all ${
              isCompleted ? "line-through text-slate-400" : "text-slate-100"
            }`}
          >
            {title}
          </h5>

          {credits && (
            <span className="text-[10px] text-slate-400 ml-auto font-mono">
              ({credits} tín chỉ)
            </span>
          )}
        </div>

        {rationale && (
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {rationale}
          </p>
        )}

        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                #{s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
