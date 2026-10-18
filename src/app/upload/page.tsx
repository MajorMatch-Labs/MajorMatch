"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { RiasecSurvey } from "@/components/upload/RiasecSurvey";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  const router = useRouter();
  const {
    isAnalyzing,
    calculateMatchAction,
    hasHydrated,
    riasecAnswers,
    selectedCareerTags,
    profile,
  } = useProfileStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const [isClientMounted, setIsClientMounted] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const handleStartAnalysis = async () => {
    setAnalysisError(null);
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (Object.keys(riasecAnswers || {}).length !== 10) {
      setAnalysisError("Vui lòng trả lời đủ 10 câu hỏi khảo sát.");
      return;
    }
    if (selectedCareerTags.length === 0) {
      setAnalysisError("Vui lòng chọn ít nhất một lĩnh vực quan tâm.");
      return;
    }
    try {
      await calculateMatchAction();
      router.push("/result");
    } catch {
      setAnalysisError("Chưa thể phân tích lúc này. Vui lòng thử lại sau khi kiểm tra kết nối.");
    }
  };

  // Tránh Hydration mismatch giữa SSR và Zustand Persist State trên Client
  if (!isClientMounted || !hasHydrated) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Đang mở hồ sơ của bạn...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bước 1 / 3 · Hồ sơ và sở thích</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bắt đầu với thông tin của bạn
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Tải bảng điểm nếu có, chọn lĩnh vực quan tâm và trả lời 10 câu hỏi. Bạn sẽ xem được phần nào của kết quả dựa trên thông tin mình đã cung cấp.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700 dark:text-slate-200">Bạn có thể xem câu hỏi trước. Hãy đăng nhập để tải bảng điểm, lưu khảo sát và tạo kết quả của mình.</p>
          <button type="button" onClick={() => openAuthModal("login")} className="min-h-11 shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Đăng nhập</button>
        </div>
      )}

      {/* 1. File Dropzone */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
          1. Bảng điểm hoặc CV dạng PDF (không bắt buộc)
        </h3>
        <FileDropzone />
      </div>

      {/* 2. Survey & Career Tag Selection */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
          2. Lĩnh vực quan tâm và khảo sát sở thích
        </h3>
        <RiasecSurvey />
      </div>

      {/* 3. Action Submit Button */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-indigo-200 dark:border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">3. Xem gợi ý chuyên ngành</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isAuthenticated ? Object.keys(riasecAnswers || {}).length : 0}/10 câu đã trả lời · {isAuthenticated ? selectedCareerTags.length : 0} lĩnh vực đã chọn · {isAuthenticated && profile?.courses?.length ? "Đã có dữ liệu môn học" : "Chưa có dữ liệu môn học"}
          </p>
          {isAuthenticated && !profile?.courses?.length && <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">Nếu tiếp tục, gợi ý sẽ chỉ dựa trên khảo sát và lĩnh vực bạn chọn.</p>}
        </div>

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleStartAnalysis}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 sm:w-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang phân tích...</span>
            </>
          ) : (
            <>
              <span>Xem gợi ý của tôi</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {analysisError && <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">{analysisError}</p>}
    </div>
  );
}
