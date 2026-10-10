"use client";

import React, { useEffect } from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { MilestoneTree } from "@/components/roadmap/MilestoneTree";
import { MOCK_ROADMAP } from "@/services/mockData";
import { Sparkles, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const { roadmap, selectedMajor, setRoadmap } = useProfileStore();

  useEffect(() => {
    if (!roadmap) {
      setRoadmap(MOCK_ROADMAP);
    }
  }, [roadmap, setRoadmap]);

  const currentRoadmap = roadmap || MOCK_ROADMAP;
  const majorName = selectedMajor?.major_name || currentRoadmap.target_major;

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-600/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 3 / 3: Không gian Lộ trình Tương tác Web 2.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cây Lộ trình Học tập Cá nhân hóa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tích chọn vào các môn học hoặc đồ án bạn đã hoàn thành để cập nhật chỉ số % Job Readiness ngay tức khắc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/result"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-medium shadow-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Radar</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Hỏi Trợ lý AI</span>
          </Link>
        </div>
      </div>

      {/* Interactive Milestone Tree */}
      <MilestoneTree
        semesters={currentRoadmap.semesters}
        targetMajor={majorName}
      />
    </div>
  );
}
