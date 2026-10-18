"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  GitBranch,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Database
} from "lucide-react";
import { ApiService } from "@/services/api";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAuthStore } from "@/stores/useAuthStore";

export const dynamic = "force-dynamic";

const RIASEC_LABELS: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  R: { label: "Realistic (Thực tế)", desc: "Kỹ thuật, phần cứng, hệ thống mạng", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" },
  I: { label: "Investigative (Nghiên cứu)", desc: "Khoa học dữ liệu, AI, thuật toán", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500" },
  A: { label: "Artistic (Nghệ thuật)", desc: "UI/UX, thiết kế đồ họa, sáng tạo nội dung", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500" },
  S: { label: "Social (Xã hội)", desc: "Làm việc nhóm, quản lý dự án, đào tạo", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500" },
  E: { label: "Enterprising (Quản lý)", desc: "Product Manager, khởi nghiệp công nghệ", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500" },
  C: { label: "Conventional (Nề nếp)", desc: "QA/QC, bảo mật thông tin, vận hành", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500" }
};

export default function ProfilePage() {
  const { profile, dynamicReadinessScore, selectedMajor } = useProfileStore();
  const { user } = useAuthStore();

  const [studentIdInput, setStudentIdInput] = useState<string>(
    user?.studentId || profile?.student_id || "SV-2025001"
  );
  const [activeStudentId, setActiveStudentId] = useState<string>(
    user?.studentId || profile?.student_id || "SV-2025001"
  );
  const [userState, setUserState] = useState<any | null>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Nạp toàn bộ trạng thái cá nhân hóa từ CSDL
  const fetchUserData = async (id: string) => {
    setIsRefreshing(true);
    try {
      const [fullState, sessions] = await Promise.all([
        ApiService.getUserFullState(id),
        ApiService.getChatSessions(id)
      ]);
      setUserState(fullState);
      setChatSessions(sessions || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu hồ sơ cá nhân:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserData(activeStudentId);
  }, [activeStudentId]);

  const handleSearchStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentIdInput.trim()) {
      setActiveStudentId(studentIdInput.trim());
    }
  };

  // Trích xuất các trường dữ liệu
  const p = userState?.profile || {};
  const studentName = p.full_name || user?.name || "Nguyễn Văn An";
  const gpa = p.gpa ? Number(p.gpa).toFixed(2) : "3.25";
  const credits = p.completed_credits || 68;
  const majorName =
    userState?.roadmap?.target_major ||
    userState?.assessment?.target_career ||
    selectedMajor?.major_name ||
    "Kỹ thuật Đám mây & Vận hành Hệ thống";
  const readiness =
    userState?.roadmap?.job_readiness_percentage !== undefined
      ? userState.roadmap.job_readiness_percentage
      : dynamicReadinessScore || 64.5;

  // Khảo sát RIASEC
  const riasecSurvey = userState?.riasec_survey;
  const riasecScores = riasecSurvey?.riasec_scores || { R: 8, I: 9, A: 5, S: 6, E: 7, C: 6 };
  const hasSurveyCompleted = !!(riasecSurvey && riasecSurvey.survey_data);

  // Lộ trình học tập & Checkbox hoàn thành
  const roadmapData = userState?.roadmap;
  const completedItems = roadmapData?.completed_items || {};
  const completedList = Object.keys(completedItems).filter((k) => completedItems[k]);
  const totalCompletedCount = completedList.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4">
      {/* 1. Header & Bộ chuyển đổi MSSV */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel-glow border border-indigo-200 dark:border-indigo-500/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-400 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Không gian Cá nhân hóa & Quản lý Năng lực Toàn diện</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hồ sơ & Tiến trình Cá nhân
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Đồng bộ 100% dữ liệu khảo sát, kết quả đề xuất, tiến trình lộ trình và lịch sử tư vấn AI.
          </p>
        </div>

        {/* Thanh tìm kiếm / Đổi MSSV */}
        <form onSubmit={handleSearchStudent} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              placeholder="Nhập MSSV (vd: SV-2025001)..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono w-48 sm:w-56"
            />
          </div>
          <button
            type="submit"
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Nạp Hồ sơ</span>
          </button>
        </form>
      </div>

      {/* Chip gợi ý chuyển nhanh MSSV mẫu */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-[11px] uppercase tracking-wider">Hồ sơ mẫu nhanh:</span>
        {["SV-2025001", "22IT001", "SV-2025002", "SV-2025003"].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setStudentIdInput(id);
              setActiveStudentId(id);
            }}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
              activeStudentId === id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {/* 2. Thẻ Sinh viên & Chỉ số Tổng quan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Thông tin Học vấn & Năng lực */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/25">
                {studentName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {studentName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50">
                    K22 • Chính quy
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Mã số sinh viên: <strong className="text-indigo-600 dark:text-indigo-400">{activeStudentId}</strong>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  Định hướng: <span className="text-slate-900 dark:text-white font-bold">{majorName}</span>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Điểm GPA Tích lũy</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {gpa} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
              </span>
            </div>
          </div>

          {/* Dải 3 Thẻ Chỉ số Nhanh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Tín chỉ tích lũy</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{credits} TC</p>
              <p className="text-[10px] text-slate-500 mt-1">Tiến độ đào tạo: ~52%</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Khảo sát RIASEC</span>
                <BrainCircuit className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {hasSurveyCompleted ? "10/10 câu" : "Chưa làm"}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                {hasSurveyCompleted ? "Đã lưu CSDL Cloud" : "Cần hoàn thiện"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Đầu việc Lộ trình</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {totalCompletedCount} đã hoàn thành
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Tích chọn trong Lộ trình
              </p>
            </div>
          </div>

          {/* Job Readiness Indicator */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200">
                Chỉ số Sẵn sàng Nghề nghiệp (Job Readiness Score):
              </span>
              <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 text-sm">
                {readiness}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, readiness))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Chỉ số được tính toán động dựa trên GPA thực tế và các đầu việc môn học/đồ án bạn đã tích chọn hoàn thành.
            </p>
          </div>
        </div>

        {/* Cột 3: Tóm tắt Khảo sát Thiên hướng RIASEC */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Thiên hướng RIASEC</span>
              </h4>
              <Link
                href="/upload"
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Làm lại &rarr;
              </Link>
            </div>

            {/* Danh sách 6 nhóm RIASEC */}
            <div className="space-y-2.5">
              {Object.entries(RIASEC_LABELS).map(([code, info]) => {
                const score = riasecScores[code] || 0;
                const percentage = Math.min(100, Math.round((score / 10) * 100));
                return (
                  <div key={code} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${info.color}`}>
                        {info.label.split(" ")[0]}
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                        {score} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${info.bg} rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            Dữ liệu khảo sát giúp ML kết hợp với GPA để đề xuất Top 5 chuyên ngành phù hợp nhất.
          </div>
        </div>
      </div>

      {/* 3. Chi tiết Tiến trình Lộ trình & Lịch sử Hội thoại AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trụ cột: Tiến trình Lộ trình Học tập */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Tiến trình Lộ trình Đã tích lũy
              </h4>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Mở Cây Lộ trình</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {completedList.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Bạn chưa tích chọn môn học hoặc đồ án nào trong Cây Lộ trình.
              </p>
              <Link
                href="/roadmap"
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
              >
                Khám phá & Tích chọn môn học ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các đầu việc chuyên môn bạn đã hoàn thành (Tổng cộng {completedList.length} đầu việc):
              </p>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {completedList.map((itemId, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                      {itemId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trụ cột: Lịch sử Tư vấn Trợ lý AI */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Phiên Tư vấn Trợ lý AI
              </h4>
            </div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Vào Khung Chat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {chatSessions.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Chưa có phiên tư vấn nào được ghi nhận cho sinh viên này.
              </p>
              <Link
                href="/chat"
                className="inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
              >
                Bắt đầu hội thoại với Trợ lý AI
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Danh sách các phiên tư vấn đã lưu (Tổng số: {chatSessions.length} phiên):
              </p>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {chatSessions.map((session, sIdx) => (
                  <Link
                    key={sIdx}
                    href={`/chat?session=${encodeURIComponent(session.session_id)}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800 transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 truncate">
                        Phiên: {session.session_id}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {session.last_message || "Chưa có nội dung"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                        {session.message_count} tin
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
