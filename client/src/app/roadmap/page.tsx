"use client";

import React, { useEffect, useState } from "react";
import { useProfileStore } from "@/stores/useProfileStore";
import { MilestoneTree } from "@/components/roadmap/MilestoneTree";
import { Sparkles, MessageSquare, ArrowLeft, Loader2, GitBranch, RefreshCw, CheckCircle2, CircleDashed } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function RoadmapPage() {
  const {
    roadmap,
    roadmapsByMajor,
    selectedMajor,
    analysisResult,
    profile,
    isGeneratingRoadmap,
    generateRoadmapAction,
    loadSavedRoadmapAction,
    setSelectedMajor,
    hasHydrated,
  } = useProfileStore();

  const [isInitialSyncing, setIsInitialSyncing] = useState(true);

  // Tự động kiểm tra và nạp lộ trình đã lưu trong CSDL
  useEffect(() => {
    if (!hasHydrated) return;
    let isMounted = true;
    const studentId = profile?.student_id || "SV-2025001";

    loadSavedRoadmapAction(studentId)
      .finally(() => {
        if (isMounted) setIsInitialSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hasHydrated, profile, loadSavedRoadmapAction]);

  // Danh sách Top 5 chuyên ngành từ phân tích năng lực
  const availableMajors =
    analysisResult?.top_matches ||
    analysisResult?.top_recommendations ||
    (selectedMajor ? [selectedMajor] : []);

  // Xác định chuyên ngành đang chọn
  const activeMajor =
    selectedMajor ||
    availableMajors[0] || {
      major_id: "DEVOPS_CLOUD",
      major_name: "Kỹ thuật Đám mây & Vận hành Hệ thống (DevOps/Cloud)",
      match_percentage: 100.0,
      rank: 1,
      radar_data: [],
      skill_gap: { mastered_skills: [], developing_skills: [], missing_skills: [] }
    };

  const activeMajorId = activeMajor.major_id;

  // Tìm lộ trình tương ứng với chuyên ngành đang chọn
  const activeRoadmap =
    roadmapsByMajor?.[activeMajorId] ||
    (roadmap?.target_major_id === activeMajorId ? roadmap : null);

  const hasRoadmapGenerated = !!(
    activeRoadmap &&
    activeRoadmap.semesters &&
    activeRoadmap.semesters.length > 0
  );

  const handleGenerateForActiveMajor = async () => {
    await generateRoadmapAction(4);
  };

  if (isInitialSyncing || !hasHydrated) {
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
            Đang Kiểm tra & Nạp Lộ trình Học tập
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Hệ thống đang đồng bộ dữ liệu từ CSDL đám mây bền vững...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* 1. Header & Navigation */}
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
            Chọn chuyên ngành bên dưới để xem hoặc kiến tạo lộ trình học tập tối ưu tương ứng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasRoadmapGenerated && (
            <button
              type="button"
              disabled={isGeneratingRoadmap}
              onClick={handleGenerateForActiveMajor}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
              title="Kích hoạt mô hình AI suy luận và tái tạo lộ trình mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingRoadmap ? "animate-spin" : ""}`} />
              <span>Tạo lại với AI</span>
            </button>
          )}
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

      {/* 2. Thanh Chuyển đổi Nhanh giữa Top 5 Chuyên ngành */}
      {availableMajors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Chuyên ngành mục tiêu ({availableMajors.length} ngành được gợi ý):
            </span>
            <span className="text-[11px] text-slate-500">
              Nhấp vào ngành để chuyển đổi cây lộ trình tương ứng
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {availableMajors.map((major) => {
              const isSelected = major.major_id === activeMajorId;
              const isGenerated = !!(
                roadmapsByMajor?.[major.major_id]?.semesters?.length ||
                (roadmap?.target_major_id === major.major_id && roadmap?.semesters?.length)
              );

              return (
                <button
                  key={major.major_id}
                  type="button"
                  onClick={() => setSelectedMajor(major)}
                  className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-500/30"
                      : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold line-clamp-1">
                      {major.major_name}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      {major.match_percentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">
                      Hạng #{major.rank || 1}
                    </span>
                    {isGenerated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã có lộ trình
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        <CircleDashed className="w-3 h-3" />
                        Chưa tạo lộ trình
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Hiển thị Lộ trình (Đã tạo) HOẶC Trạng thái Chưa tạo (Chờ bấm nút) */}
      {hasRoadmapGenerated ? (
        <MilestoneTree
          semesters={activeRoadmap.semesters}
          targetMajor={activeMajor.major_name}
        />
      ) : (
        /* Trạng thái CHƯA TẠO LỘ TRÌNH cho ngành này */
        <div className="p-8 rounded-2xl glass-panel-glow border border-indigo-200 dark:border-indigo-500/30 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <GitBranch className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Chưa có Lộ trình cho {activeMajor.major_name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Ngành này hiện có chỉ số sẵn sàng ban đầu là{" "}
                <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  {activeMajor.match_percentage}%
                </strong>
                . Hãy kích hoạt mô hình AI để xây dựng kế hoạch bồi đắp các kỹ năng còn thiếu.
              </p>
            </div>

            {/* Danh sách kỹ năng còn thiếu của ngành này */}
            {activeMajor.skill_gap?.missing_skills && activeMajor.skill_gap.missing_skills.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-left">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                  Kỹ năng cần bồi đắp ({activeMajor.skill_gap.missing_skills.length} kỹ năng):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeMajor.skill_gap.missing_skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isGeneratingRoadmap}
              onClick={handleGenerateForActiveMajor}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 duration-150"
            >
              {isGeneratingRoadmap ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI đang phân rã kỹ năng và sinh 3 giai đoạn học tập...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Lộ trình cho ngành này với AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
