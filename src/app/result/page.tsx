"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { MOCK_SKILL_GAP_ANALYSIS } from "@/services/mockData";
import { MajorMatchRankItem } from "@/types/api";
import { MajorCard } from "@/components/analysis/MajorCard";
import { RadarComparison } from "@/components/analysis/RadarComparison";
import { SkillBreakdown } from "@/components/analysis/SkillBreakdown";
import { XaiExplanationCard } from "@/components/analysis/XaiExplanationCard";

export default function ResultPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    analysisResult, analysisStudentId, selectedMajor, isAnalyzing, isGeneratingRoadmap, hasHydrated,
    profile, roadmap, roadmapsByMajor, setSelectedMajor,
    generateRoadmapAction, loadAndSyncAllDataAction,
  } = useProfileStore();
  const [demoMode, setDemoMode] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [demoMajor, setDemoMajor] = useState<MajorMatchRankItem | null>(null);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<number | null>(null);

  useEffect(() => {
    setDemoMode(new URLSearchParams(window.location.search).get("demo") === "1");
    setRouteReady(true);
  }, []);

  useEffect(() => {
    if (!routeReady || demoMode || !hasHydrated || !isAuthenticated || !user?.studentId || (analysisResult && analysisStudentId === user.studentId)) return;
    let active = true;
    setIsSyncing(true);
    loadAndSyncAllDataAction(user.studentId).finally(() => { if (active) setIsSyncing(false); });
    return () => { active = false; };
  }, [routeReady, demoMode, hasHydrated, isAuthenticated, user?.studentId, analysisResult, analysisStudentId, loadAndSyncAllDataAction]);

  const currentResult = demoMode ? MOCK_SKILL_GAP_ANALYSIS : isAuthenticated && analysisStudentId === user?.studentId ? analysisResult : null;
  const recommendations = currentResult?.top_matches || currentResult?.top_recommendations || [];
  const currentMajor = demoMode ? demoMajor || recommendations[0] : selectedMajor || recommendations[0];

  if (!routeReady || !hasHydrated || isSyncing || isAnalyzing) {
    return <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status"><Loader2 className="h-5 w-5 animate-spin text-indigo-600" />Đang tải kết quả...</div>;
  }

  if (!currentResult || !currentMajor) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Sparkles className="h-8 w-8" /></span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chưa có kết quả của bạn</h1>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">{isAuthenticated ? "Chọn lĩnh vực và hoàn thành khảo sát để tạo gợi ý chuyên ngành." : "Đăng nhập và hoàn thành khảo sát để nhận gợi ý dựa trên thông tin của bạn."}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/upload" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">Bắt đầu khảo sát</Link>
          <Link href="/result?demo=1" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Xem báo cáo minh họa</Link>
        </div>
      </div>
    );
  }

  const currentScore = currentMajor.match_percentage ?? currentMajor.match_score;
  const currentRoadmap = !demoMode && Boolean(
    (roadmap && (roadmap.target_major_id === currentMajor.major_id || roadmap.target_major === currentMajor.major_name)) ||
    roadmapsByMajor?.[currentMajor.major_id]
  );

  const handleRoadmap = async () => {
    setRoadmapError(null);
    if (currentRoadmap) { router.push("/roadmap"); return; }
    if (currentSemester === null) { setRoadmapError("Vui lòng chọn học kỳ hiện tại của bạn."); return; }
    try {
      await generateRoadmapAction(currentSemester);
      router.push("/roadmap");
    } catch {
      setRoadmapError("Chưa thể tạo lộ trình. Vui lòng thử lại sau khi kiểm tra kết nối.");
    }
  };

  return (
    <div className="space-y-8 py-4">
      {demoMode && (
        <div role="note" className="flex flex-col gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6"><strong>Dữ liệu minh họa.</strong> Những điểm số và kỹ năng dưới đây thuộc hồ sơ mẫu, không phải kết quả của bạn.</p>
          <Link href="/upload" className="shrink-0 font-semibold underline underline-offset-4">Làm khảo sát của tôi</Link>
        </div>
      )}
      {!demoMode && !profile?.courses?.length && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">Chưa có dữ liệu môn học. Hãy xem gợi ý này trong bối cảnh hệ thống chỉ có câu trả lời khảo sát và lĩnh vực đã chọn.</p>}

      <header>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Bước 2 / 3 · Khám phá kết quả</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Các hướng chuyên ngành để bạn tham khảo</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Chọn một ngành để xem điểm khớp, các nhóm kỹ năng và phần giải thích nếu hệ thống có dữ liệu. Điểm số hỗ trợ so sánh, không thay thế tư vấn học tập.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-3 lg:col-span-5" aria-label="Các chuyên ngành gợi ý">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">So sánh chuyên ngành</h2>
          {recommendations.map((major) => (
            <MajorCard key={major.major_id} major={major} isSelected={currentMajor.major_id === major.major_id} onSelect={(next) => demoMode ? setDemoMajor(next) : setSelectedMajor(next)} />
          ))}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7" aria-label="So sánh năng lực">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Năng lực theo {currentMajor.major_name}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">So sánh năng lực hiện tại với mức tham chiếu của ngành.</p>
            </div>
            {currentScore !== undefined && <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{currentScore}% điểm khớp</span>}
          </div>
          <RadarComparison data={currentMajor.radar_data || []} majorName={currentMajor.major_name} />
          {Boolean(currentMajor.radar_data?.length) && (
            <div className="overflow-x-auto">
              <table className="mt-2 w-full min-w-[340px] border-collapse text-left text-sm text-slate-700 dark:text-slate-200">
                <caption className="mb-2 text-left font-semibold text-slate-900 dark:text-white">Số liệu của biểu đồ (thang 0–10)</caption>
                <thead><tr className="border-b border-slate-200 dark:border-slate-700"><th scope="col" className="py-2 pr-3">Năng lực</th><th scope="col" className="px-3 py-2 text-right">Hiện tại</th><th scope="col" className="py-2 pl-3 text-right">Tham chiếu</th></tr></thead>
                <tbody>{currentMajor.radar_data?.map((axis) => <tr key={axis.axis_name} className="border-b border-slate-100 dark:border-slate-800"><th scope="row" className="py-2 pr-3 font-medium">{axis.axis_name}</th><td className="px-3 py-2 text-right">{axis.user_score}</td><td className="py-2 pl-3 text-right">{axis.benchmark_score}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {currentMajor.xai_explanation ? <XaiExplanationCard explanation={currentMajor.xai_explanation} majorName={currentMajor.major_name} matchPercentage={currentScore ?? 0} /> : <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Chưa có phần giải thích chi tiết cho ngành này.</p>}
      <section aria-label="Kỹ năng theo chuyên ngành" className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Kỹ năng của {currentMajor.major_name}</h2>
        {currentMajor.skill_gap ? <SkillBreakdown skillGap={currentMajor.skill_gap} /> : <p className="rounded-xl border border-slate-200 p-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">Chưa có phân tích kỹ năng riêng cho ngành này.</p>}
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-950 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Bạn muốn tìm hiểu sâu hơn?</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {demoMode
              ? "Hoàn thành khảo sát để tạo lộ trình từ dữ liệu của bạn."
              : currentRoadmap
              ? "Lộ trình đã lưu của ngành này sẵn sàng để xem."
              : "Chọn học kỳ hiện tại để AI xây dựng lộ trình học tập tối ưu cho ngành này."}
          </p>
        </div>
        {demoMode ? (
          <Link
            href="/upload"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Bắt đầu khảo sát <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!currentRoadmap && (
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Học kỳ hiện tại
                <select
                  value={currentSemester ?? ""}
                  onChange={(event) => setCurrentSemester(event.target.value ? Number(event.target.value) : null)}
                  className="ml-2 min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Chọn học kỳ</option>
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((semester) => (
                    <option key={semester} value={semester}>
                      Học kỳ {semester}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              disabled={isGeneratingRoadmap || (!currentRoadmap && currentSemester === null)}
              onClick={handleRoadmap}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGeneratingRoadmap
                ? "Đang tạo lộ trình..."
                : currentRoadmap
                ? "Xem lộ trình"
                : "Tạo lộ trình"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {roadmapError && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{roadmapError}</p>}
    </div>
  );
}
