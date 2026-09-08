"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/stores/useProfileStore";
import { MajorCard } from "@/components/analysis/MajorCard";
import { RadarComparison } from "@/components/analysis/RadarComparison";
import { SkillBreakdown } from "@/components/analysis/SkillBreakdown";
import { ApiService } from "@/services/api";
import { MOCK_SKILL_GAP_ANALYSIS } from "@/services/mockData";
import { Sparkles, ArrowRight, Loader2, GitBranch } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const {
    analysisResult,
    selectedMajor,
    profile,
    isGeneratingRoadmap,
    setAnalysisResult,
    setSelectedMajor,
    setRoadmap,
    setGeneratingRoadmap,
  } = useProfileStore();

  // Tự động nạp dữ liệu mẫu nếu người dùng truy cập trực tiếp trang /result
  useEffect(() => {
    if (!analysisResult) {
      setAnalysisResult(MOCK_SKILL_GAP_ANALYSIS);
    }
  }, [analysisResult, setAnalysisResult]);

  const currentResult = analysisResult || MOCK_SKILL_GAP_ANALYSIS;
  const currentMajor = selectedMajor || currentResult.top_recommendations[0];

  const handleGenerateRoadmap = async () => {
    if (!currentMajor) return;
    setGeneratingRoadmap(true);
    try {
      const gpa = profile?.cumulative_gpa || 3.42;
      const res = await ApiService.generateRoadmap(
        currentMajor.major_name,
        currentMajor.skill_gap.missing_skills,
        gpa
      );
      setRoadmap(res);
      router.push("/roadmap");
    } catch {
      console.error("Failed to generate roadmap");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bước 2 / 3: Kết quả Định lượng & Radar Chart</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Báo cáo Khoảng cách Kỹ năng (Skill Gap Analysis)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hệ thống xếp hạng Top 3 ngành nghề phù hợp nhất dựa trên điểm số Cosine Similarity và đối chiếu 6 trục năng lực.
        </p>
      </div>

      {/* Grid: Top 3 Cards + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Danh sách Top 3 ngành nghề (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Top 3 Chuyên ngành Phù hợp Nhất:
          </span>
          {currentResult.top_recommendations.map((major) => (
            <MajorCard
              key={major.rank}
              major={major}
              isSelected={currentMajor.major_name === major.major_name}
              onSelect={(m) => setSelectedMajor(m)}
            />
          ))}
        </div>

        {/* Cột phải: Biểu đồ Radar đa tầng của ngành đang chọn (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Biểu đồ Radar Năng lực:{" "}
                <span className="text-indigo-400">{currentMajor.major_name}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                {currentMajor.match_score}% Match
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Đối chiếu 2 lớp: Năng lực hiện tại (Xanh Indigo) so với Chuẩn ngành yêu cầu (Viền Cam).
            </p>
          </div>

          <RadarComparison
            data={currentMajor.radar_data}
            majorName={currentMajor.major_name}
          />

          <div className="text-[11px] text-center text-slate-500 border-t border-slate-800/80 pt-3">
            Tọa độ 6 trục được chuẩn hóa theo thang điểm 10 toán học.
          </div>
        </div>
      </div>

      {/* Phân rã 3 nhóm kỹ năng */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Phân rã Kỹ năng của {currentMajor.major_name}:
        </span>
        <SkillBreakdown skillGap={currentMajor.skill_gap} />
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
