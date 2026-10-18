"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check,
  AlertCircle,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Database,
  Edit3,
  Save,
  X,
  ExternalLink
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
  const router = useRouter();
  const { profile, dynamicReadinessScore, selectedMajor, setSelectedMajor } = useProfileStore();
  const { user } = useAuthStore();

  // (1) Mỗi sinh viên chỉ có thể xem hồ sơ cá nhân mình
  const activeStudentId = user?.studentId || profile?.student_id || "23IT196";

  const [userState, setUserState] = useState<any | null>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // State cho Modal/Form chỉnh sửa GPA & Tín chỉ
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>("");
  const [editGpa, setEditGpa] = useState<string>("3.25");
  const [editCredits, setEditCredits] = useState<string>("68");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>("");

  // Nạp toàn bộ trạng thái cá nhân hóa từ CSDL thật
  const fetchUserData = async (id: string) => {
    setIsRefreshing(true);
    try {
      const [fullState, sessions] = await Promise.all([
        ApiService.getUserFullState(id),
        ApiService.getChatSessions(id)
      ]);
      setUserState(fullState);
      setChatSessions(sessions || []);

      // Khởi tạo giá trị cho modal edit
      const p = fullState?.profile || {};
      setEditFullName(p.full_name || user?.name || "Đặng Long Nhật");
      setEditGpa(String(p.cumulative_gpa ?? p.gpa ?? 3.25));
      setEditCredits(String(p.total_credits ?? p.completed_credits ?? 68));
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

  // Trích xuất các trường dữ liệu từ CSDL
  const p = userState?.profile || {};
  const studentName = p.full_name || user?.name || "Đặng Long Nhật";
  const gpa = p.cumulative_gpa !== undefined && p.cumulative_gpa !== null
    ? Number(p.cumulative_gpa).toFixed(2)
    : (p.gpa !== undefined && p.gpa !== null ? Number(p.gpa).toFixed(2) : "3.25");
  const credits = p.total_credits ?? p.completed_credits ?? 68;

  const majorName =
    userState?.roadmap?.target_major ||
    userState?.assessment?.target_career ||
    selectedMajor?.major_name ||
    "Kỹ thuật Đám mây & Vận hành Hệ thống";

  const targetMajorId =
    userState?.roadmap?.target_major_id ||
    selectedMajor?.major_id ||
    "DEVOPS_CLOUD";

  const readiness =
    userState?.roadmap?.job_readiness_percentage !== undefined
      ? userState.roadmap.job_readiness_percentage
      : (dynamicReadinessScore || 72.0);

  // (6) Khảo sát RIASEC: Kiểm tra đúng dữ liệu từ DB (không fallback mock)
  const riasecSurvey = userState?.riasec_survey;
  const rawScores = riasecSurvey?.scores || riasecSurvey?.riasec_scores || p.riasec_scores;
  const hasSurveyCompleted = !!(
    rawScores &&
    typeof rawScores === "object" &&
    Object.keys(rawScores).length > 0 &&
    Object.values(rawScores).some((val) => Number(val) > 0)
  );
  const riasecScores = hasSurveyCompleted ? (rawScores as Record<string, number>) : {};

  // (5) Lộ trình học tập & Checkbox hoàn thành
  const roadmapData = userState?.roadmap;
  const completedItems = roadmapData?.completed_items || {};
  const completedList = Object.keys(completedItems).filter((k) => completedItems[k]);
  const totalCompletedCount = completedList.length;

  // Tính tổng số đầu việc của lộ trình định hướng đang chọn
  const phasesList = roadmapData?.phases || [];
  let calculatedTotalItems = 0;
  if (phasesList.length > 0) {
    phasesList.forEach((ph: any) => {
      const skills = ph.milestone_skills?.length || 0;
      const projects = ph.practical_projects?.length || 0;
      const courses = ph.recommended_courses?.length || 0;
      calculatedTotalItems += (skills + projects + courses);
    });
  }
  const totalRoadmapItems = calculatedTotalItems > 0 ? calculatedTotalItems : Math.max(totalCompletedCount, 8);

  // (2) Chuyển đến trang Lộ trình và chọn đúng lộ trình đó
  const handleOpenRoadmap = () => {
    setSelectedMajor({
      major_id: targetMajorId,
      major_name: majorName,
      rank: 1,
      match_percentage: readiness,
      match_score: readiness,
      radar_data: [],
      skill_gap: { mastered_skills: [], developing_skills: [], missing_skills: [] }
    });
    router.push("/roadmap");
  };

  // (3), (4) Xử lý lưu thông tin GPA và Tín chỉ tích lũy vào CSDL SQLite
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const gpaNum = parseFloat(editGpa);
    const creditsNum = parseInt(editCredits, 10);

    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      alert("Điểm GPA phải nằm trong khoảng từ 0.00 đến 4.00!");
      return;
    }
    if (isNaN(creditsNum) || creditsNum < 0 || creditsNum > 200) {
      alert("Số tín chỉ tích lũy phải nằm trong khoảng từ 0 đến 200!");
      return;
    }

    setIsSavingProfile(true);
    setSaveSuccessMsg("");
    try {
      const success = await ApiService.updateUserProfile(activeStudentId, {
        full_name: editFullName.trim(),
        cumulative_gpa: gpaNum,
        total_credits: creditsNum
      });

      if (success) {
        setSaveSuccessMsg("Đã lưu thông tin vào CSDL thành công!");
        // Cập nhật lại userState cục bộ
        setUserState((prev: any) => ({
          ...prev,
          profile: {
            ...(prev?.profile || {}),
            full_name: editFullName.trim(),
            cumulative_gpa: gpaNum,
            gpa: gpaNum,
            total_credits: creditsNum,
            completed_credits: creditsNum
          }
        }));
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSaveSuccessMsg("");
        }, 1200);
      } else {
        alert("Lưu hồ sơ thất bại. Vui lòng kiểm tra kết nối CSDL!");
      }
    } catch (err) {
      console.error("Lỗi cập nhật profile:", err);
      alert("Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4">
      {/* 1. Header: Không còn thanh tìm kiếm MSSV người khác - Chỉ xem hồ sơ cá nhân của chính mình */}
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

        {/* Nút làm mới dữ liệu hồ sơ của chính mình */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchUserData(activeStudentId)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Làm mới Hồ sơ</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Sinh viên & Chỉ số Tổng quan (Họ tên chuẩn VKU, K23, chỉnh sửa GPA & Tín chỉ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Thông tin Học vấn & Năng lực */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/25">
                {studentName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {studentName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50">
                    K23 • VKU
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Mã số sinh viên: <strong className="text-indigo-600 dark:text-indigo-400">{activeStudentId}</strong>
                  <span className="ml-2 text-slate-400">• Trường VKU</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  Định hướng: <span className="text-slate-900 dark:text-white font-bold">{majorName}</span>
                </p>
              </div>
            </div>

            {/* Khối Điểm GPA Tích lũy kèm Nút chỉnh sửa */}
            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Điểm GPA Tích lũy</span>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold transition-colors"
                  title="Chỉnh sửa GPA và Tín chỉ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
              </div>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {gpa} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
              </span>
            </div>
          </div>

          {/* Dải 3 Thẻ Chỉ số Nhanh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Thẻ 1: Tín chỉ tích lũy (Có nút sửa nhanh) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 relative group">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Tín chỉ tích lũy</span>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-slate-400 hover:text-indigo-500 transition-colors"
                  title="Chỉnh sửa số tín chỉ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{credits} TC</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Tiến độ đào tạo: ~{Math.min(100, Math.round((Number(credits) / 130) * 100))}%
              </p>
            </div>

            {/* Thẻ 2: Khảo sát RIASEC (6) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Khảo sát RIASEC</span>
                <BrainCircuit className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {hasSurveyCompleted ? "10/10 câu" : "Chưa làm"}
              </p>
              <p className={`text-[10px] font-medium mt-1 ${hasSurveyCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {hasSurveyCompleted ? "Đã lưu CSDL Cloud" : "Cần hoàn thiện"}
              </p>
            </div>

            {/* Thẻ 3: (5) Đổi thành Lộ trình, bao nhiêu đã hoàn thành/tổng số */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Lộ trình</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {totalCompletedCount}/{totalRoadmapItems} hoàn thành
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-1 truncate" title={majorName}>
                Định hướng: {majorName}
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
              Chỉ số được tính toán động dựa trên GPA thực tế và các đầu việc môn học/đồ án bạn đã tích chọn hoàn thành trong lộ trình.
            </p>
          </div>
        </div>

        {/* Cột 3: (6) Tóm tắt Khảo sát Thiên hướng RIASEC - Chỉ hiển thị khi có dữ liệu thật */}
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
                {hasSurveyCompleted ? "Làm lại →" : "Làm khảo sát →"}
              </Link>
            </div>

            {/* Nếu đã làm khảo sát: Hiển thị đúng 6 nhóm điểm thật từ CSDL */}
            {hasSurveyCompleted ? (
              <div className="space-y-2.5">
                {Object.entries(RIASEC_LABELS).map(([code, info]) => {
                  const score = Number(riasecScores[code] ?? 0);
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
            ) : (
              /* Nếu chưa làm: Hiển thị trạng thái chưa có dữ liệu và nút làm khảo sát, KHÔNG hiện mock data */
              <div className="p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center space-y-3 my-2">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Chưa có kết quả khảo sát
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bạn chưa hoàn thành bài khảo sát trắc nghiệm Holland RIASEC 10 câu.
                  </p>
                </div>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Làm khảo sát ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            Dữ liệu khảo sát giúp AI kết hợp với GPA để đề xuất Top 5 chuyên ngành phù hợp nhất cho sinh viên VKU.
          </div>
        </div>
      </div>

      {/* 3. (2) Chi tiết Tiến trình Lộ trình & Lịch sử Hội thoại AI - Có nút "Xem Lộ trình" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trụ cột: Tiến trình Lộ trình Học tập */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tiến trình Lộ trình Đã tích lũy
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {majorName}
                </p>
              </div>
            </div>

            {/* (2) Nút Xem Lộ trình đưa đến trang lộ trình và chọn đúng lộ trình đó */}
            <button
              type="button"
              onClick={handleOpenRoadmap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Xem Lộ trình</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {completedList.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Bạn chưa tích chọn môn học hoặc đồ án nào trong Cây Lộ trình.
              </p>
              <button
                type="button"
                onClick={handleOpenRoadmap}
                className="inline-block text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 cursor-pointer"
              >
                Khám phá & Tích chọn môn học ngay
              </button>
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

      {/* MODAL (3) & (4): CHỈNH SỬA GPA & TÍN CHỈ TÍCH LŨY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chỉnh sửa Thông tin Học tập
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã số Sinh viên (MSSV)
                </label>
                <input
                  type="text"
                  value={activeStudentId}
                  disabled
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và Tên sinh viên
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ví dụ: Đặng Long Nhật"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Điểm GPA tích lũy (Hệ 4.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={editGpa}
                    onChange={(e) => setEditGpa(e.target.value)}
                    placeholder="Ví dụ: 3.25"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tín chỉ tích lũy (TC)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="200"
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                    placeholder="Ví dụ: 68"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-medium">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Lưu vào CSDL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
