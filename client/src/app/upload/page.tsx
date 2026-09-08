"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { RiasecSurvey } from "@/components/upload/RiasecSurvey";
import { useProfileStore } from "@/stores/useProfileStore";
import { ApiService } from "@/services/api";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const {
    profile,
    selectedCareerTags,
    riasecScores,
    isAnalyzing,
    setAnalyzing,
    setAnalysisResult,
  } = useProfileStore();

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    try {
      const targetCareer = selectedCareerTags[0] || "ai_engineer";
      const userSkills = profile?.detected_skills || [
        "Python", "Algorithms", "Data Structures", "SQL", "Web Development"
      ];

      const res = await ApiService.analyzeSkillGap(targetCareer, userSkills, riasecScores);
      setAnalysisResult(res);
      router.push("/result");
    } catch {
      console.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bước 1 / 3: Thu thập Hồ sơ & Sở thích</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Tải Bảng điểm & Trắc nghiệm Thiên hướng
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hệ thống sẽ kết hợp kết quả học tập thực tế và thiên hướng RIASEC để đề xuất Top ngành nghề tối ưu nhất.
        </p>
      </div>

      {/* 1. File Upload Dropzone */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          A. Tải lên bảng điểm hoặc CV (PDF)
        </h3>
        <FileDropzone />
      </div>

      {/* 2. Survey & Career Tag Selection */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-slate-200">
          B. Khảo sát thiên hướng & Định hướng nghề nghiệp
        </h3>
        <RiasecSurvey />
      </div>

      {/* 3. Action Submit Button */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Sẵn sàng phân tích định lượng?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Mô-đun Scikit-learn sẽ tính Cosine Similarity và sinh biểu đồ Radar 6 trục.
          </p>
        </div>

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleStartAnalysis}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 duration-150"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang tính toán Cosine Matrix...</span>
            </>
          ) : (
            <>
              <span>Phân tích Khoảng cách Kỹ năng</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
