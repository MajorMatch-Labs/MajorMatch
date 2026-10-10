"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/stores/useProfileStore";
import { MajorCard } from "@/components/analysis/MajorCard";
import { RadarComparison } from "@/components/analysis/RadarComparison";
import { SkillBreakdown } from "@/components/analysis/SkillBreakdown";
import { Sparkles, ArrowRight, Loader2, GitBranch, Cpu } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const {
    analysisResult,
    selectedMajor,
    isAnalyzing,
    isGeneratingRoadmap,
    setSelectedMajor,
    calculateMatchAction,
    generateRoadmapAction,
  } = useProfileStore();

  // Tự động kích hoạt tính toán Cosine Similarity nếu người dùng vào thẳng trang /result
  useEffect(() => {
    if (!analysisResult && !isAnalyzing) {
      calculateMatchAction();
    }
  }, [analysisResult, isAnalyzing, calculateMatchAction]);

  const handleGenerateRoadmap = async () => {
    if (!selectedMajor && !analysisResult?.top_matches?.[0]) return;
    try {
      await generateRoadmapAction(4);
      router.push("/roadmap");
    } catch (err) {
      console.error("Lỗi khi sinh lộ trình RAG LLM:", err);
    }
  };

  if (isAnalyzing || !analysisResult) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-600/10 border-2 border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
            <Cpu className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <Loader2 className="w-8 h-8 text-cyan-500 absolute -top-2 -right-2 animate-spin" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Đang Tính Toán Ma Trận Cosine Similarity
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Private HPC Compute Node đang vector hóa hồ sơ học tập và đối chiếu 6 trục năng lực với chuẩn ngành đào tạo...
          </p>
        </div>
      </div>
    );
  }

  const currentResult = analysisResult;
  const recommendations = currentResult.top_matches || currentResult.top_recommendations || [];
  const currentMajor = selectedMajor || recommendations[0];

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 dark:bg-cyan-600/10 dark:border-cyan-500/20 dark:text-cyan-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bước 2 / 3: Kết quả Định lượng & Radar Chart</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Báo cáo Khoảng cách Kỹ năng (Skill Gap Analysis)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Hệ thống xếp hạng Top 3 ngành nghề phù hợp nhất dựa trên điểm số Cosine Similarity và đối chiếu 6 trục năng lực.
        </p>
      </div>

      {/* Grid: Top 3 Cards + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Danh sách Top 3 ngành nghề (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            Top 3 Chuyên ngành Phù hợp Nhất:
          </span>
          {recommendations.map((major) => (
            <MajorCard
              key={major.rank}
              major={major}
              isSelected={currentMajor?.major_name === major.major_name}
              onSelect={(m) => setSelectedMajor(m)}
            />
          ))}
        </div>

        {/* Cột phải: Biểu đồ Radar đa tầng của ngành đang chọn (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Biểu đồ Radar Năng lực:{" "}
                <span className="text-indigo-600 dark:text-indigo-400">{currentMajor?.major_name}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30 text-xs font-mono font-bold">
                {currentMajor?.match_percentage || currentMajor?.match_score}% Match
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Đối chiếu 2 lớp: Năng lực hiện tại (Xanh Indigo) so với Chuẩn ngành yêu cầu (Viền Cam).
            </p>
          </div>

          <RadarComparison
            data={currentMajor?.radar_data || currentResult.radar_chart_data || []}
            majorName={currentMajor?.major_name || "Chuyên ngành"}
          />

          <div className="text-[11px] text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-3">
            Tọa độ 6 trục được chuẩn hóa theo thang điểm 10 toán học.
          </div>
        </div>
      </div>

      {/* Phân rã 3 nhóm kỹ năng */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Phân rã Kỹ năng của {currentMajor?.major_name}:
        </span>
        <SkillBreakdown skillGap={currentMajor?.skill_gap || currentResult.skill_breakdown} />
      </div>

      {/* CTA Button: Sinh lộ trình học tập với AI */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            Sẵn sàng xây dựng lộ trình học tập cá nhân hóa?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Ollama Qwen 2.5 và ChromaDB RAG sẽ đề xuất các môn tiên quyết để bù đắp các Missing Skills.
          </p>
        </div>

        <button
          type="button"
          disabled={isGeneratingRoadmap}
          onClick={handleGenerateRoadmap}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 duration-150"
        >
          {isGeneratingRoadmap ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang truy vấn RAG & Ollama LLM...</span>
            </>
          ) : (
            <>
              <span>Sinh Lộ trình Học tập (Roadmap)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
