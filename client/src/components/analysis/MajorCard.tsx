"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MajorRecommendationItem } from "@/types/api";

interface MajorCardProps {
  major: MajorRecommendationItem;
  isSelected: boolean;
  onSelect: (major: MajorRecommendationItem) => void;
}

export function MajorCard({ major, isSelected, onSelect }: MajorCardProps) {
  const score = major.match_percentage ?? major.match_score;
  const boundedScore = typeof score === "number" && Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null;
  const missingCount = major.skill_gap?.missing_skills?.length;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(major)}
      className={`w-full rounded-xl border p-4 text-left shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${isSelected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-base font-bold text-slate-900 dark:text-white">{major.major_name}</span>
        {boundedScore !== null && <span className="shrink-0 text-sm font-bold text-indigo-700 dark:text-indigo-300">{boundedScore}%</span>}
      </span>
      {major.description && <span className="mt-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">{major.description}</span>}
      {boundedScore !== null && <span className="mt-3 block h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true"><span className="block h-full rounded-full bg-indigo-600" style={{ width: `${boundedScore}%` }} /></span>}
      <span className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
        <span className="text-slate-600 dark:text-slate-300">{missingCount === undefined ? "Chưa có dữ liệu kỹ năng" : `${missingCount} kỹ năng cần bổ sung`}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300">{isSelected ? <><CheckCircle2 className="h-4 w-4" />Đang xem</> : <>Xem chi tiết<ArrowRight className="h-4 w-4" /></>}</span>
      </span>
    </button>
  );
}
