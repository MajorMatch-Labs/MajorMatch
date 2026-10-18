"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Users,
  Compass,
  Target,
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  ArrowLeft,
  HardDrive,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  BrainCircuit,
  Download,
  FileSpreadsheet,
  FileJson,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  Server,
  Lock,
  KeyRound
} from "lucide-react";
import { ApiService } from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";

type TableName = "users" | "user_profiles" | "roadmaps" | "assessments" | "chat_history" | "riasec_surveys";
type ViewMode = "students" | "raw";

interface AdminStats {
  engine: string;
  db_path: string;
  db_size_kb: number;
  wal_size_kb: number;
  total_records: number;
  table_counts: Record<TableName, number>;
  latest_backup: string;
  server_time: string;
}

interface StudentSummary {
  student_id: string;
  full_name: string;
  cumulative_gpa: number;
  total_credits: number;
  top_recommended_major: string;
  match_score: number;
  readiness_score: number;
  dominant_riasec: string;
  has_survey: boolean;
  has_roadmap: boolean;
  chat_count: number;
  updated_at: string;
}

export default function AdminDatabasePage() {
  const { user } = useAuthStore();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  useEffect(() => {
    if (user && (user.role === "admin" || user.studentId?.toLowerCase() === "admin")) {
      setIsUnlocked(true);
      return;
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("majormatch_admin_unlocked");
      if (stored === "true") {
        setIsUnlocked(true);
      }
    }
  }, [user]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passcodeInput.trim() === "admin123" ||
      passcodeInput.trim() === "Admin123" ||
      passcodeInput.trim() === "160205"
    ) {
      setIsUnlocked(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("majormatch_admin_unlocked", "true");
      }
      setPasscodeError(null);
    } else {
      setPasscodeError("Mật mã quản trị viên không chính xác. Vui lòng thử lại hoặc đăng nhập tài khoản admin.");
    }
  };

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("students");

  // State cho Raw Table View
  const [activeTable, setActiveTable] = useState<TableName>("user_profiles");
  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inspectData, setInspectData] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; table: TableName } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // State cho Student Analytics & Action View
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(true);
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [majorFilter, setMajorFilter] = useState<string>("ALL");
  const [gpaFilter, setGpaFilter] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState<"csv" | "json" | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await ApiService.getAdminStats();
      if (data && data.status === "success") {
        setStats(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải stats:", err);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const list = await ApiService.getAdminStudents();
      setStudents(list);
    } catch (err) {
      console.error("Lỗi khi tải danh sách sinh viên:", err);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const fetchTableData = useCallback(async (table: TableName, search = "") => {
    setLoading(true);
    try {
      const data = await ApiService.getAdminTableRecords(table, search, 50, 0);
      if (data && data.status === "success") {
        setRecords(data.records || []);
        setColumns(data.columns || []);
        setTotalRecords(data.total || 0);
      } else {
        setRecords([]);
        setColumns([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error(`Lỗi khi tải dữ liệu bảng ${table}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, [fetchStats, fetchStudents]);

  useEffect(() => {
    if (viewMode === "raw") {
      fetchTableData(activeTable, searchTerm);
    }
  }, [viewMode, activeTable, fetchTableData, searchTerm]);

  const handleRefresh = () => {
    fetchStats();
    if (viewMode === "students") {
      fetchStudents();
    } else {
      fetchTableData(activeTable, searchTerm);
    }
    setActionMessage({ text: "Đã làm mới dữ liệu từ CSDL AWS Cloud thành công!", type: "success" });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleExportData = async (format: "csv" | "json") => {
    setIsExporting(format);
    try {
      await ApiService.exportAdminData(format);
      setActionMessage({ text: `Xuất tệp ${format.toUpperCase()} thành công!`, type: "success" });
    } catch (err) {
      setActionMessage({ text: `Xuất tệp ${format.toUpperCase()} thất bại!`, type: "error" });
    } finally {
      setIsExporting(null);
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteTarget) return;
    const ok = await ApiService.deleteAdminRecord(deleteTarget.table, deleteTarget.id);
    if (ok) {
      setActionMessage({ text: `Đã xóa thành công bản ghi ID: ${deleteTarget.id}`, type: "success" });
      setDeleteTarget(null);
      fetchStats();
      fetchTableData(activeTable, searchTerm);
      fetchStudents();
    } else {
      setActionMessage({ text: `Xóa thất bại bản ghi ID: ${deleteTarget.id}`, type: "error" });
    }
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleCopyJson = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseJsonSafe = (raw: string) => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  // Lọc danh sách sinh viên tổng hợp
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // Tìm kiếm từ khóa
      if (studentSearch.trim()) {
        const query = studentSearch.toLowerCase();
        const matchId = (st.student_id || "").toLowerCase().includes(query);
        const matchName = (st.full_name || "").toLowerCase().includes(query);
        const matchMajor = (st.top_recommended_major || "").toLowerCase().includes(query);
        if (!matchId && !matchName && !matchMajor) return false;
      }
      // Lọc chuyên ngành
      if (majorFilter !== "ALL") {
        if (!(st.top_recommended_major || "").toLowerCase().includes(majorFilter.toLowerCase())) {
          return false;
        }
      }
      // Lọc GPA
      if (gpaFilter === "EXCELLENT" && st.cumulative_gpa < 3.6) return false;
      if (gpaFilter === "GOOD" && (st.cumulative_gpa < 3.2 || st.cumulative_gpa >= 3.6)) return false;
      if (gpaFilter === "AVERAGE" && (st.cumulative_gpa < 2.5 || st.cumulative_gpa >= 3.2)) return false;
      if (gpaFilter === "LOW" && st.cumulative_gpa >= 2.5) return false;

      return true;
    });
  }, [students, studentSearch, majorFilter, gpaFilter]);

  // Phân tích dữ liệu thống kê trực quan toàn trường
  const analyticsMetrics = useMemo(() => {
    const total = students.length || 1;
    let aiCount = 0;
    let seCount = 0;
    let cloudCount = 0;
    let secCount = 0;
    let biCount = 0;

    let gpaExc = 0;
    let gpaGood = 0;
    let gpaAvg = 0;
    let gpaLow = 0;

    let surveyDone = 0;
    let roadmapDone = 0;
    let totalReadiness = 0;

    students.forEach((s) => {
      const m = (s.top_recommended_major || "").toLowerCase();
      if (m.includes("trí tuệ") || m.includes("dữ liệu & ai") || m.includes("ai")) aiCount++;
      else if (m.includes("phần mềm") || m.includes("fullstack")) seCount++;
      else if (m.includes("đám mây") || m.includes("devops")) cloudCount++;
      else if (m.includes("an toàn") || m.includes("bảo mật") || m.includes("cyber")) secCount++;
      else biCount++;

      if (s.cumulative_gpa >= 3.6) gpaExc++;
      else if (s.cumulative_gpa >= 3.2) gpaGood++;
      else if (s.cumulative_gpa >= 2.5) gpaAvg++;
      else gpaLow++;

      if (s.has_survey) surveyDone++;
      if (s.has_roadmap) roadmapDone++;
      totalReadiness += s.readiness_score || 0;
    });

    return {
      total: students.length,
      majors: [
        { name: "Khoa học Dữ liệu & AI", count: aiCount, pct: Math.round((aiCount / total) * 100), color: "#6366F1" },
        { name: "Kỹ thuật Phần mềm & Web", count: seCount, pct: Math.round((seCount / total) * 100), color: "#3B82F6" },
        { name: "Cloud Computing & DevOps", count: cloudCount, pct: Math.round((cloudCount / total) * 100), color: "#06B6D4" },
        { name: "An toàn Thông tin", count: secCount, pct: Math.round((secCount / total) * 100), color: "#EC4899" },
        { name: "Data Analytics & BI", count: biCount, pct: Math.round((biCount / total) * 100), color: "#10B981" },
      ],
      gpa: [
        { label: "Xuất sắc (>= 3.6)", count: gpaExc, pct: Math.round((gpaExc / total) * 100), color: "#10B981" },
        { label: "Giỏi (3.2 - 3.59)", count: gpaGood, pct: Math.round((gpaGood / total) * 100), color: "#3B82F6" },
        { label: "Khá (2.5 - 3.19)", count: gpaAvg, pct: Math.round((gpaAvg / total) * 100), color: "#F59E0B" },
        { label: "Cần cải thiện (< 2.5)", count: gpaLow, pct: Math.round((gpaLow / total) * 100), color: "#EF4444" },
      ],
      surveyPct: Math.round((surveyDone / total) * 100),
      roadmapPct: Math.round((roadmapDone / total) * 100),
      avgReadiness: Math.round((totalReadiness / total) * 10) / 10,
    };
  }, [students]);

  const tableTabs: Array<{ id: TableName; label: string; icon: any; count: number }> = [
    { id: "users", label: "Tài khoản Sinh viên", icon: ShieldCheck, count: stats?.table_counts?.users ?? 0 },
    { id: "user_profiles", label: "Hồ sơ Học tập", icon: Users, count: stats?.table_counts?.user_profiles ?? 0 },
    { id: "riasec_surveys", label: "Khảo sát RIASEC", icon: BrainCircuit, count: stats?.table_counts?.riasec_surveys ?? 0 },
    { id: "roadmaps", label: "Cây Lộ trình", icon: Compass, count: stats?.table_counts?.roadmaps ?? 0 },
    { id: "assessments", label: "Khoảng cách Kỹ năng", icon: Target, count: stats?.table_counts?.assessments ?? 0 },
    { id: "chat_history", label: "Lịch sử Chat AI", icon: MessageSquare, count: stats?.table_counts?.chat_history ?? 0 }
  ];

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Khu vực Quản trị Hệ thống</h1>
            <p className="text-xs text-slate-400 mt-2">
              Dành riêng cho Quản trị viên MajorMatch. Nhập mật mã xác thực hoặc đăng nhập bằng tài khoản Quản trị viên chuẩn.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Mật mã Admin</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Nhập mật mã quản trị..."
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setPasscodeError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                  autoFocus
                />
              </div>
            </div>

            {passcodeError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-lg">
                {passcodeError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 text-white"
            >
              Mở khóa Quản trị
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex justify-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-indigo-600 to-sky-600 dark:from-indigo-400 dark:to-sky-400 bg-clip-text text-transparent flex items-center gap-2">
                MajorMatch Site Admin & Data Management
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-mono font-normal">
                  AWS WAL Active
                </span>
              </h1>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Thống kê kết quả, quản lý hồ sơ sinh viên và xử lý dữ liệu đào tạo
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExportData("csv")}
            disabled={isExporting !== null}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Xuất bảng dữ liệu sinh viên sang CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting === "csv" ? "Đang xuất..." : "Xuất CSV"}</span>
          </button>
          <button
            onClick={() => handleExportData("json")}
            disabled={isExporting !== null}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-medium shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Xuất bảng dữ liệu sinh viên sang JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting === "json" ? "Đang xuất..." : "Xuất JSON"}</span>
          </button>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </header>

      {/* Thông báo thao tác */}
      {actionMessage && (
        <div
          className={`px-4 py-2.5 text-xs font-medium text-center transition-all ${
            actionMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Hồ sơ Sinh viên</p>
              <h3 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {stats?.table_counts?.user_profiles ?? 0}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Bài Khảo sát RIASEC</p>
              <h3 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {stats?.table_counts?.riasec_surveys ?? 0}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Khoảng cách Kỹ năng</p>
              <h3 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {stats?.table_counts?.assessments ?? 0}
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Tin nhắn Tư vấn AI</p>
              <h3 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {stats?.table_counts?.chat_history ?? 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Database Info Banner */}
        <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-100 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
              Dung lượng CSDL: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats?.db_size_kb ?? 0} KB</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-500" />
              Nhật ký WAL: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats?.wal_size_kb ?? 0} KB</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Backup gần nhất: <strong className="text-slate-800 dark:text-slate-200">{stats?.latest_backup ?? "Chưa có"}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {stats?.engine || "SQLite Persistent WAL"}
          </span>
        </div>

        {/* Chuyển đổi chế độ xem: Tổng hợp Sinh viên vs Raw Explorer */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("students")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                viewMode === "students"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-indigo-600"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Quản lý & Thống kê Sinh viên ({students.length})</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                viewMode === "raw"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-indigo-600"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Trình duyệt CSDL Chi tiết (Raw SQLite)</span>
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: QUẢN LÝ & THỐNG KÊ SINH VIÊN */}
        {viewMode === "students" && (
          <div className="space-y-4">
            {/* Visual Distribution Dashboard (Thống kê Trực quan Toàn trường) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Phân bố Chuyên ngành */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Phân bố Chuyên ngành Đề xuất
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{students.length} SV</span>
                </div>
                <div className="space-y-2">
                  {analyticsMetrics.majors.map((m) => (
                    <div key={m.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px]">{m.name}</span>
                        <span className="font-mono text-slate-500">{m.count} ({m.pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Phổ điểm GPA */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-sky-500" />
                    Phổ điểm GPA Toàn trường
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Hệ 4.0</span>
                </div>
                <div className="space-y-2">
                  {analyticsMetrics.gpa.map((g) => (
                    <div key={g.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300">{g.label}</span>
                        <span className="font-mono text-slate-500">{g.count} ({g.pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${g.pct}%`, backgroundColor: g.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Khảo sát RIASEC & Sẵn sàng Nghề nghiệp */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                    Tiến trình Khảo sát & Đào tạo
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Realtime</span>
                </div>
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Tỷ lệ đã làm RIASEC</span>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{analyticsMetrics.surveyPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${analyticsMetrics.surveyPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Tỷ lệ kích hoạt Lộ trình</span>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{analyticsMetrics.roadmapPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${analyticsMetrics.roadmapPct}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Readiness TB toàn trường:</span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {analyticsMetrics.avgReadiness}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảng điều khiển sinh viên */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-xs">
              {/* Bộ lọc đa chiều & Tìm kiếm */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm MSSV, tên, chuyên ngành..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Ngành:</span>
                </div>
                <select
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Tất cả chuyên ngành</option>
                  <option value="Trí tuệ Nhân tạo">Trí tuệ Nhân tạo & Data</option>
                  <option value="Phần mềm">Kỹ thuật Phần mềm / Web</option>
                  <option value="Đám mây">Cloud & DevOps</option>
                  <option value="An toàn">An toàn Thông tin</option>
                  <option value="Kinh doanh">Phân tích Dữ liệu BI</option>
                </select>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                  <span>GPA:</span>
                </div>
                <select
                  value={gpaFilter}
                  onChange={(e) => setGpaFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Tất cả phổ điểm</option>
                  <option value="EXCELLENT">Xuất sắc (&gt;= 3.6)</option>
                  <option value="GOOD">Giỏi (3.2 - 3.59)</option>
                  <option value="AVERAGE">Khá (2.5 - 3.19)</option>
                  <option value="LOW">Cần cải thiện (&lt; 2.5)</option>
                </select>
              </div>
            </div>

            {/* Bảng danh sách sinh viên */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              {studentsLoading ? (
                <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                  <span>Đang tổng hợp dữ liệu sinh viên từ AWS Cloud...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Không tìm thấy hồ sơ sinh viên nào khớp với bộ lọc.
                </div>
              ) : (
                <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-3.5 py-3 whitespace-nowrap">MSSV</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Họ & Tên</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">GPA / Tín chỉ</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Ngành Đề Xuất #1</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Phù Hợp %</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Readiness Lộ Trình</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Holland</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Khảo Sát</th>
                      <th className="px-3.5 py-3 whitespace-nowrap">Chat AI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredStudents.map((st) => (
                      <tr key={st.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-3.5 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {st.student_id}
                        </td>
                        <td className="px-3.5 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {st.full_name}
                        </td>
                        <td className="px-3.5 py-3 font-mono whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{st.cumulative_gpa.toFixed(2)}</span>
                          <span className="text-slate-400 text-[11px] ml-1">({st.total_credits} TC)</span>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                            {st.top_recommended_major}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {st.match_score > 0 ? `${st.match_score.toFixed(1)}%` : "—"}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${Math.min(100, st.readiness_score)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px]">{st.readiness_score > 0 ? `${st.readiness_score.toFixed(1)}%` : "0%"}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="font-mono font-bold px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {st.dominant_riasec}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          {st.has_survey ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã làm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <XCircle className="w-3.5 h-3.5" /> Chưa làm
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {st.chat_count > 0 ? `${st.chat_count} tin` : "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

        {/* VIEW MODE 2: TRÌNH DUYỆT CSDL CHI TIẾT (RAW SQLITE EXPLORER) */}
        {viewMode === "raw" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Table Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                {tableTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTable === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTable(tab.id);
                        setSearchTerm("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm mã SV, từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Table Data View */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                  <span>Đang tải dữ liệu từ CSDL...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Không tìm thấy bản ghi nào trong bảng <strong>{activeTable}</strong>.
                </div>
              ) : (
                <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.name} className="px-3.5 py-3 whitespace-nowrap">
                          {col.name} {col.pk && <span className="text-amber-500 font-bold">(PK)</span>}
                        </th>
                      ))}
                      <th className="px-3.5 py-3 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {records.map((row, idx) => {
                      const recordPk = row.id ?? row.student_id ?? String(idx);
                      return (
                        <tr key={recordPk} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {columns.map((col) => {
                            const val = row[col.name];
                            const isJson = typeof val === "string" && (val.startsWith("{") || val.startsWith("["));
                            return (
                              <td key={col.name} className="px-3.5 py-3 max-w-xs truncate font-mono text-[11px]">
                                {isJson ? (
                                  <button
                                    onClick={() => setInspectData(parseJsonSafe(val))}
                                    className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[10px]"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>JSON ({val.length} bytes)</span>
                                  </button>
                                ) : val !== null && val !== undefined ? (
                                  String(val)
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700 italic">null</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectData(row)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Xem toàn bộ bản ghi JSON"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: recordPk, table: activeTable })}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Xóa bản ghi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Phân trang tóm tắt */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span>
                Hiển thị <strong>{records.length}</strong> / <strong>{totalRecords}</strong> bản ghi
              </span>
              <span className="text-[11px] font-mono">Trang 1 • Giới hạn 50 bản ghi/lần</span>
            </div>
          </div>
        )}
      </main>

      {/* Modal Xem JSON Chi Tiết */}
      {inspectData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                Dữ liệu JSON Bản ghi
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyJson(inspectData)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
                <button
                  onClick={() => setInspectData(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-5 overflow-auto flex-1 font-mono text-xs bg-slate-950 text-slate-100 rounded-b-2xl">
              <pre>{JSON.stringify(inspectData, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Bản Ghi */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Xác nhận xóa bản ghi</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bạn có chắc chắn muốn xóa bản ghi khóa <strong>{deleteTarget.id}</strong> khỏi bảng{" "}
                <strong>{deleteTarget.table}</strong>? Hành động này không thể hoàn tác trên CSDL SQLite.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteRecord}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
              >
                Xác nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
