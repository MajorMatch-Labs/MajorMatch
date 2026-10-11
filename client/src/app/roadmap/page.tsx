"use client";

import React, { useEffect } from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { MilestoneTree } from "@/components/roadmap/MilestoneTree";
import { Sparkles, MessageSquare, ArrowLeft, Loader2, GitBranch, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const {
    roadmap,
    selectedMajor,
    profile,
    isGeneratingRoadmap,
    generateRoadmapAction,
    loadSavedRoadmapAction,
  } = useProfileStore();

  // Ưu tiên nạp lộ trình đã lưu trong CSDL thật, chỉ sinh mới khi CSDL chưa có dữ liệu
  useEffect(() => {
    const studentId = profile?.student_id || "SV-2025001";
    if (!roadmap && !isGeneratingRoadmap) {
      loadSavedRoadmapAction(studentId).then((hasSaved) => {
        if (!hasSaved) {
          generateRoadmapAction(4);
        }
      });
    }
  }, [roadmap, isGeneratingRoadmap, profile, loadSavedRoadmapAction, generateRoadmapAction]);

  const handleRegenerate = async () => {
    await generateRoadmapAction(4);
  };

  if (isGeneratingRoadmap || !roadmap) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-md mx-auto">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-600/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
            <GitBranch className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <Loader2 className="w-8 h-8 text-indigo-500 absolute -top-2 -right-2 animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Đang Xây Dựng Cây Lộ Trình Năng Lực Cá Nhân Hóa
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            ChromaDB RAG và mô hình Ollama Qwen 2.5 7B đang phân rã kỹ năng và phân bổ 3 giai đoạn phát triển năng lực...
          </p>
        </div>
      </div>
    );
  }

  const currentRoadmap = roadmap;
  const majorName = selectedMajor?.major_name || currentRoadmap.target_major;

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-600/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước 3 / 3: Không gian Lộ trình Tương tác Web 2.0 (CSDL Bền Vững)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cây Lộ trình Năng lực Cá nhân hóa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Lộ trình được lưu trữ vĩnh viễn trong CSDL. Tích chọn vào các môn học hoặc đồ án để cập nhật chỉ số % Job Readiness ngay tức khắc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isGeneratingRoadmap}
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
            title="Kích hoạt mô hình AI suy luận và tái tạo lộ trình mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingRoadmap ? "animate-spin" : ""}`} />
            <span>Tạo lại Lộ trình với AI</span>
          </button>
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
