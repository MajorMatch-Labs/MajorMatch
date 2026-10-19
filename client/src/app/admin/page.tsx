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
  KeyRound,
  Activity,
  Archive,
  LayoutDashboard,
  ClipboardList,
  Wifi,
  WifiOff
} from "lucide-react";
import { ApiService } from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";

type TableName = "users" | "user_profiles" | "roadmaps" | "assessments" | "chat_history" | "riasec_surveys";
type ViewMode = "overview" | "students" | "raw" | "operations";

interface AdminStats {
  engine: string;
  db_path: string;
  db_size_kb: number;
  wal_size_kb: number;
  total_records: number;
  table_counts: Record<TableName, number>;
  latest_backup: string;
  backup_count: number;
  server_time: string;
}

interface AdminAuditEvent {
  id: number;
  actor: string;
  action: string;
  resource: string;
  detail: string;
  created_at: string;
}

interface AdminSystemHealth {
  status: string;
  cloud_gateway?: { node?: string; db_engine?: string };
  private_compute_node?: {
    status?: string;
    device?: string;
    message?: string;
    ollama_status?: string;
    active_model?: string;
    gpu_status?: string;
  };
}

interface StudentSummary {
  student_id: string;
  full_name: string;
  has_account: boolean;
  has_profile: boolean;
  has_assessment: boolean;
  cumulative_gpa: number | null;
  total_credits: number | null;
  top_recommended_major: string;
  match_score: number | null;
  readiness_score: number | null;
  dominant_riasec: string;
  has_survey: boolean;
  has_roadmap: boolean;
  chat_count: number;
  updated_at: string;
}

export default function AdminDatabasePage() {
  const { user, isAuthenticated, login, checkAuthSession, error: loginError } = useAuthStore();
  const [sessionReady, setSessionReady] = useState(false);
  const [authExpired, setAuthExpired] = useState(false);
  const isUnlocked = sessionReady && isAuthenticated && user?.role === "admin" && !authExpired;
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    checkAuthSession();
    setSessionReady(true);
  }, [checkAuthSession]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    const success = await login("admin", passcodeInput);
    setPasscodeInput("");
    if (success) {
      setPasscodeError(null);
      setAuthExpired(false);
    } else {
      setPasscodeError(useAuthStore.getState().error || "Không thể đăng nhập quản trị.");
    }
    setSigningIn(false);
  };

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [auditEvents, setAuditEvents] = useState<AdminAuditEvent[] | null>(null);
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealth | null>(null);
  const localCompute = systemHealth?.private_compute_node;
  const localComputeOnline = localCompute?.status === "online"
    || localCompute?.ollama_status === "online"
    || Boolean(localCompute?.gpu_status);
  const localComputeLabel = !systemHealth || !localCompute
    ? "Chưa xác nhận"
    : localComputeOnline
      ? localCompute?.ollama_status === "online" ? "Model đang hoạt động" : "Đang kết nối"
      : localCompute.status === "offline" ? "Ngoại tuyến" : "Chưa xác nhận";
  const localComputeTone = localComputeOnline
    ? "text-emerald-700 dark:text-emerald-300"
    : localCompute?.status === "offline"
      ? "text-rose-700 dark:text-rose-300"
      : "text-amber-700 dark:text-amber-300";
  const [operationsError, setOperationsError] = useState<string | null>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // State cho Raw Table View
  const [activeTable, setActiveTable] = useState<TableName>("user_profiles");
  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [tableUnavailable, setTableUnavailable] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [inspectData, setInspectData] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; table: TableName } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // State cho Student Analytics & Action View
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [studentsUnavailable, setStudentsUnavailable] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(true);
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [majorFilter, setMajorFilter] = useState<string>("ALL");
  const [gpaFilter, setGpaFilter] = useState<string>("ALL");
  const [progressFilter, setProgressFilter] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState<"csv" | "json" | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await ApiService.getAdminStats();
      if (data && data.status === "success") {
        setStats(data);
      }
    } catch (err) {
      setStats(null);
      if (err instanceof Error && err.message.includes("đăng nhập")) setAuthExpired(true);
      setActionMessage({ text: err instanceof Error ? err.message : "Không thể tải thống kê.", type: "error" });
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const list = await ApiService.getAdminStudents();
      if (list.some((item) => typeof item.has_account !== "boolean" || typeof item.has_profile !== "boolean" || typeof item.has_assessment !== "boolean")) {
        throw new Error("Gateway AWS chưa có định dạng dữ liệu quản trị mới. Vui lòng cập nhật gateway rồi làm mới trang.");
      }
      setStudents(list);
      setStudentsUnavailable(false);
    } catch (err) {
      setStudents([]);
      setStudentsUnavailable(true);
      if (err instanceof Error && err.message.includes("đăng nhập")) setAuthExpired(true);
      setActionMessage({ text: err instanceof Error ? err.message : "Không thể tải danh sách sinh viên.", type: "error" });
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const fetchTableData = useCallback(async (table: TableName, search = "") => {
    setLoading(true);
    try {
      const data = await ApiService.getAdminTableRecords(table, search, 50, offset);
      if (data && data.status === "success") {
        setRecords(data.records || []);
        setColumns(data.columns || []);
        setTotalRecords(data.total || 0);
        setTableUnavailable(false);
      } else {
        setRecords([]);
        setColumns([]);
        setTotalRecords(0);
      }
    } catch (err) {
      setRecords([]);
      setTableUnavailable(true);
      if (err instanceof Error && err.message.includes("đăng nhập")) setAuthExpired(true);
      setColumns([]);
      setTotalRecords(0);
      setActionMessage({ text: err instanceof Error ? err.message : `Không thể tải bảng ${table}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [offset]);

  const fetchOperations = useCallback(async () => {
    const [auditResult, healthResult] = await Promise.allSettled([
      ApiService.getAdminAudit(),
      ApiService.getAdminSystemHealth(),
    ]);
    if (auditResult.status === "fulfilled" && Array.isArray(auditResult.value?.events)) {
      setAuditEvents(auditResult.value.events);
    } else {
      setAuditEvents(null);
    }
    if (healthResult.status === "fulfilled" && healthResult.value?.status === "healthy") {
      setSystemHealth(healthResult.value);
    } else {
      setSystemHealth(null);
    }
    const failed = [auditResult, healthResult].find((result) => result.status === "rejected");
    const reason = failed?.status === "rejected" ? failed.reason : null;
    setOperationsError(reason instanceof Error ? reason.message : failed ? "Không thể tải trạng thái vận hành." : null);
    if (reason instanceof Error && reason.message.includes("đăng nhập")) setAuthExpired(true);
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      fetchStats();
      fetchStudents();
      fetchOperations();
    }
  }, [isUnlocked, fetchStats, fetchStudents, fetchOperations]);

  useEffect(() => {
    if (isUnlocked && viewMode === "raw") {
      fetchTableData(activeTable, searchTerm);
    }
  }, [isUnlocked, viewMode, activeTable, fetchTableData, searchTerm]);

  const handleRefresh = () => {
    fetchStats();
    fetchOperations();
    if (viewMode === "students" || viewMode === "overview") {
      fetchStudents();
    } else if (viewMode === "raw") {
      fetchTableData(activeTable, searchTerm);
    }
    setActionMessage(null);
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const result = await ApiService.createAdminBackup();
      setActionMessage({ text: `Đã tạo bản sao ${result.filename} trên máy chủ.`, type: "success" });
      await Promise.all([fetchStats(), fetchOperations()]);
    } catch (err) {
      setActionMessage({ text: err instanceof Error ? err.message : "Không thể tạo bản sao dữ liệu.", type: "error" });
    } finally {
      setCreatingBackup(false);
    }
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
    if (!deleteTarget || deleteConfirmation !== deleteTarget.id) return;
    try {
      await ApiService.deleteAdminRecord(deleteTarget.table, deleteTarget.id);
      setActionMessage({ text: `Đã xóa thành công bản ghi ID: ${deleteTarget.id}`, type: "success" });
      setDeleteTarget(null);
      setDeleteConfirmation("");
      fetchStats();
      fetchTableData(activeTable, searchTerm);
      fetchStudents();
    } catch (err) {
      setActionMessage({ text: err instanceof Error ? err.message : "Không thể xóa bản ghi.", type: "error" });
    }
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
      if (gpaFilter !== "ALL" && (!st.has_profile || st.cumulative_gpa === null)) return false;
      const gpa = st.cumulative_gpa ?? 0;
      if (gpaFilter === "EXCELLENT" && gpa < 3.6) return false;
      if (gpaFilter === "GOOD" && (gpa < 3.2 || gpa >= 3.6)) return false;
      if (gpaFilter === "AVERAGE" && (gpa < 2.5 || gpa >= 3.2)) return false;
      if (gpaFilter === "LOW" && gpa >= 2.5) return false;

      if (progressFilter === "NO_PROFILE" && st.has_profile) return false;
      if (progressFilter === "NO_SURVEY" && st.has_survey) return false;
      if (progressFilter === "NO_ASSESSMENT" && st.has_assessment) return false;
      if (progressFilter === "NO_ROADMAP" && st.has_roadmap) return false;

      return true;
    });
  }, [students, studentSearch, majorFilter, gpaFilter, progressFilter]);

  // Chỉ tính tỷ lệ trên các hồ sơ có đúng loại dữ liệu tương ứng.
  const analyticsMetrics = useMemo(() => {
    const total = students.length || 1;
    const assessed = students.filter((s) => s.has_assessment);
    const profiled = students.filter((s) => s.has_profile && s.cumulative_gpa !== null);
    const planned = students.filter((s) => s.has_roadmap && s.readiness_score !== null);
    let aiCount = 0;
    let seCount = 0;
    let cloudCount = 0;
    let secCount = 0;
    let biCount = 0;
    let otherCount = 0;

    let gpaExc = 0;
    let gpaGood = 0;
    let gpaAvg = 0;
    let gpaLow = 0;

    let surveyDone = 0;
    let roadmapDone = 0;
    students.forEach((s) => {
      if (s.has_assessment) {
        const m = (s.top_recommended_major || "").toLowerCase();
        if (m.includes("trí tuệ") || m.includes("dữ liệu & ai")) aiCount++;
        else if (m.includes("phần mềm") || m.includes("fullstack")) seCount++;
        else if (m.includes("đám mây") || m.includes("devops")) cloudCount++;
        else if (m.includes("an toàn") || m.includes("bảo mật") || m.includes("cyber")) secCount++;
        else if (m.includes("kinh doanh") || m.includes("analytics")) biCount++;
        else otherCount++;
      }

      if (s.has_profile && s.cumulative_gpa !== null) {
        if (s.cumulative_gpa >= 3.6) gpaExc++;
        else if (s.cumulative_gpa >= 3.2) gpaGood++;
        else if (s.cumulative_gpa >= 2.5) gpaAvg++;
        else gpaLow++;
      }

      if (s.has_survey) surveyDone++;
      if (s.has_roadmap) roadmapDone++;
    });

    return {
      total: students.length,
      assessedCount: assessed.length,
      profiledCount: profiled.length,
      plannedCount: planned.length,
      majors: [
        { name: "Khoa học Dữ liệu & AI", count: aiCount, pct: Math.round((aiCount / (assessed.length || 1)) * 100), color: "#6366F1" },
        { name: "Kỹ thuật Phần mềm & Web", count: seCount, pct: Math.round((seCount / (assessed.length || 1)) * 100), color: "#3B82F6" },
        { name: "Cloud Computing & DevOps", count: cloudCount, pct: Math.round((cloudCount / (assessed.length || 1)) * 100), color: "#06B6D4" },
        { name: "An toàn Thông tin", count: secCount, pct: Math.round((secCount / (assessed.length || 1)) * 100), color: "#EC4899" },
        { name: "Data Analytics & BI", count: biCount, pct: Math.round((biCount / (assessed.length || 1)) * 100), color: "#10B981" },
        { name: "Khác / chưa phân loại", count: otherCount, pct: Math.round((otherCount / (assessed.length || 1)) * 100), color: "#64748B" },
      ],
      gpa: [
        { label: "Xuất sắc (>= 3.6)", count: gpaExc, pct: Math.round((gpaExc / (profiled.length || 1)) * 100), color: "#10B981" },
        { label: "Giỏi (3.2 - 3.59)", count: gpaGood, pct: Math.round((gpaGood / (profiled.length || 1)) * 100), color: "#3B82F6" },
        { label: "Khá (2.5 - 3.19)", count: gpaAvg, pct: Math.round((gpaAvg / (profiled.length || 1)) * 100), color: "#F59E0B" },
        { label: "Cần cải thiện (< 2.5)", count: gpaLow, pct: Math.round((gpaLow / (profiled.length || 1)) * 100), color: "#EF4444" },
      ],
      surveyPct: Math.round((surveyDone / total) * 100),
      roadmapPct: Math.round((roadmapDone / total) * 100),
      avgReadiness: planned.length ? Math.round(planned.reduce((sum, item) => sum + (item.readiness_score ?? 0), 0) / planned.length * 10) / 10 : null,
    };
  }, [students]);

  const tableTabs: Array<{ id: TableName; label: string; icon: any; count: number }> = [
    { id: "users", label: "Tài khoản", icon: ShieldCheck, count: stats?.table_counts?.users ?? 0 },
    { id: "user_profiles", label: "Hồ sơ Học tập", icon: Users, count: stats?.table_counts?.user_profiles ?? 0 },
    { id: "riasec_surveys", label: "Khảo sát RIASEC", icon: BrainCircuit, count: stats?.table_counts?.riasec_surveys ?? 0 },
    { id: "roadmaps", label: "Cây Lộ trình", icon: Compass, count: stats?.table_counts?.roadmaps ?? 0 },
    { id: "assessments", label: "Khoảng cách Kỹ năng", icon: Target, count: stats?.table_counts?.assessments ?? 0 },
    { id: "chat_history", label: "Lịch sử Chat AI", icon: MessageSquare, count: stats?.table_counts?.chat_history ?? 0 }
  ];

  if (!sessionReady) {
    return <div role="status" className="py-20 text-center text-sm text-slate-500">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isUnlocked) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center py-8 sm:py-16">
        <div className="grid w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
          <div className="bg-indigo-50 p-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Lock className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">MAJORMATCH / QUẢN TRỊ</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">Điều hành MajorMatch từ một nơi</h1>
            <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">Theo dõi người học, dữ liệu và trạng thái hạ tầng hybrid cloud từ gateway AWS.</p>
            <div className="mt-8 grid gap-3 text-sm text-slate-700 dark:text-slate-300">
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> Hồ sơ và tiến trình người học</p>
              <p className="flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> Trạng thái gateway và máy xử lý local</p>
              <p className="flex items-center gap-2"><Archive className="h-4 w-4 text-indigo-600 dark:text-indigo-300" /> Sao lưu và nhật ký quản trị</p>
            </div>
            <p className="mt-10 border-t border-indigo-200 pt-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">Chỉ dành cho người quản trị được cấp quyền.</p>
          </div>
          <div className="space-y-6 p-8 text-slate-900 dark:text-white sm:p-10">
            <div>
              <h2 className="text-2xl font-bold">Đăng nhập quản trị</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Dùng mật khẩu của tài khoản quản trị được cấp.</p>
              {user && user.role !== "admin" && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Bạn đang đăng nhập bằng tài khoản sinh viên. Đăng nhập quản trị sẽ chuyển tài khoản.</p>}
            </div>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label htmlFor="admin-account" className="mb-2 block text-sm font-medium">Tài khoản</label>
                <input id="admin-account" value="admin" readOnly className="min-h-11 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">Mật khẩu</label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input id="admin-password" type="password" autoComplete="current-password" required value={passcodeInput} onChange={(event) => { setPasscodeInput(event.target.value); setPasscodeError(null); }} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
                </div>
              </div>
              {(passcodeError || loginError) && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{passcodeError || loginError}</p>}
              <button type="submit" disabled={signingIn} className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50">
                {signingIn ? "Đang xác thực..." : "Vào trang quản trị"}
              </button>
            </form>
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-600 underline underline-offset-4 hover:text-indigo-600 dark:text-slate-300">
              <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header Bar */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="min-h-11 px-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 transition-colors flex items-center gap-1.5 text-sm font-medium"
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Trung tâm quản trị
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Người học, dữ liệu và vận hành hybrid cloud
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExportData("csv")}
            disabled={isExporting !== null}
            className="min-h-11 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Xuất bảng dữ liệu sinh viên sang CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isExporting === "csv" ? "Đang xuất..." : "Xuất CSV"}</span>
          </button>
          <button
            onClick={() => handleExportData("json")}
            disabled={isExporting !== null}
            className="min-h-11 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Xuất bảng dữ liệu sinh viên sang JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>{isExporting === "json" ? "Đang xuất..." : "Xuất JSON"}</span>
          </button>
          <button
            onClick={handleRefresh}
            className="min-h-11 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </header>

      {/* Thông báo thao tác */}
      {actionMessage && (
        <div
          role={actionMessage.type === "error" ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
            actionMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Top 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Hồ sơ Sinh viên</p>
              <h3 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {stats?.table_counts?.user_profiles ?? "—"}
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
                {stats?.table_counts?.riasec_surveys ?? "—"}
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
                {stats?.table_counts?.assessments ?? "—"}
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
                {stats?.table_counts?.chat_history ?? "—"}
              </h3>
            </div>
          </div>
        </div>

        {/* Database Info Banner */}
        <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-100 to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
              Dung lượng CSDL: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats ? `${stats.db_size_kb} KB` : "—"}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-500" />
              Nhật ký WAL: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stats ? `${stats.wal_size_kb} KB` : "—"}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Backup gần nhất: <strong className="text-slate-800 dark:text-slate-200">{stats ? stats.latest_backup ?? "Chưa có" : "—"}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {stats?.engine || "Chưa có dữ liệu"}
          </span>
        </div>

        <nav aria-label="Các khu vực quản trị" className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-800">
          {([
            { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
            { id: "students", label: `Người học (${studentsLoading ? "…" : studentsUnavailable ? "—" : students.length})`, icon: Users },
            { id: "raw", label: "Dữ liệu", icon: Database },
            { id: "operations", label: "Vận hành", icon: Activity },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-current={viewMode === id ? "page" : undefined} onClick={() => { setViewMode(id); setActionMessage(null); }}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${viewMode === id ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-indigo-300"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>

        {viewMode === "overview" && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tài khoản đăng ký</p>
              <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.table_counts?.users ?? "—"}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{studentsUnavailable ? "Chưa tải được tình trạng hồ sơ" : `${students.filter((item) => item.has_account && !item.has_profile).length} chưa có hồ sơ học tập`}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Gateway AWS</p>
              <p className={`mt-2 flex items-center gap-2 text-lg font-bold ${systemHealth ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                {systemHealth ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}{systemHealth ? "Đang phản hồi" : "Chưa xác nhận"}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Kiểm tra trạng thái qua gateway</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Máy tính toán local</p>
              <p className={`mt-2 flex items-center gap-2 text-lg font-bold ${localComputeTone}`}>
                {localComputeOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
                {localComputeLabel}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {localCompute?.active_model ? `Model: ${localCompute.active_model}` : "Tác vụ AI cần máy local trực tuyến"}
              </p>
            </div>
          </div>
        )}

        {/* VIEW MODE 1: QUẢN LÝ & THỐNG KÊ SINH VIÊN */}
        {(viewMode === "overview" || viewMode === "students") && (
          <div className="space-y-4">
            {/* Visual Distribution Dashboard (Thống kê Trực quan Toàn trường) */}
            {viewMode === "overview" && (studentsUnavailable || students.length === 0) && <div role="status" className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{studentsUnavailable ? "Chưa tải được dữ liệu người học. Chọn Làm mới để thử lại." : "Chưa có dữ liệu người học để phân tích. Số liệu sẽ xuất hiện khi có tài khoản hoặc hồ sơ thực."}</div>}
            {viewMode === "overview" && !studentsUnavailable && students.length > 0 && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Phân bố Chuyên ngành */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Phân bố Chuyên ngành Đề xuất
                  </h4>
                  <span className="text-xs text-slate-500">{analyticsMetrics.assessedCount} có đánh giá</span>
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
                    Phổ điểm GPA đã có hồ sơ
                  </h4>
                  <span className="text-xs text-slate-500">{analyticsMetrics.profiledCount} hồ sơ · Hệ 4.0</span>
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
                  <span className="text-xs text-slate-500">{students.length} sinh viên</span>
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
                    <span className="text-xs text-slate-500">Readiness TB ({analyticsMetrics.plannedCount} có lộ trình):</span>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {analyticsMetrics.avgReadiness === null ? "Chưa có lộ trình" : `${analyticsMetrics.avgReadiness}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>}

            {/* Bảng điều khiển sinh viên */}
            {viewMode === "students" && <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-xs">
              {/* Bộ lọc đa chiều & Tìm kiếm */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <label htmlFor="student-search" className="sr-only">Tìm sinh viên</label>
                <input
                  id="student-search"
                  type="text"
                  placeholder="Tìm MSSV, tên, chuyên ngành..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="min-h-11 w-full pl-9 pr-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
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
                  aria-label="Lọc chuyên ngành"
                  className="min-h-11 px-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
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
                  aria-label="Lọc điểm GPA"
                  className="min-h-11 px-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                  <option value="ALL">Tất cả phổ điểm</option>
                  <option value="EXCELLENT">Xuất sắc (&gt;= 3.6)</option>
                  <option value="GOOD">Giỏi (3.2 - 3.59)</option>
                  <option value="AVERAGE">Khá (2.5 - 3.19)</option>
                  <option value="LOW">Cần cải thiện (&lt; 2.5)</option>
                </select>
                <select value={progressFilter} onChange={(event) => setProgressFilter(event.target.value)} aria-label="Lọc tiến trình người học"
                  className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value="ALL">Mọi tiến trình</option>
                  <option value="NO_PROFILE">Chưa có hồ sơ</option>
                  <option value="NO_SURVEY">Chưa khảo sát</option>
                  <option value="NO_ASSESSMENT">Chưa đánh giá</option>
                  <option value="NO_ROADMAP">Chưa có lộ trình</option>
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
              ) : studentsUnavailable ? (
                <div role="status" className="p-12 text-center text-sm text-slate-600 dark:text-slate-300">Không thể tải danh sách sinh viên. Kiểm tra kết nối và phiên bản gateway rồi chọn Làm mới.</div>
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
                      <th className="px-3.5 py-3 whitespace-nowrap">Nguồn hồ sơ</th>
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
                        <td className="px-3.5 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{st.has_account ? "Tài khoản" : "Dữ liệu cũ"}</td>
                        <td className="px-3.5 py-3 font-mono whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{st.cumulative_gpa === null ? "Chưa có bảng điểm" : st.cumulative_gpa.toFixed(2)}</span>
                          {st.total_credits !== null && <span className="text-slate-400 text-[11px] ml-1">({st.total_credits} TC)</span>}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                            {st.has_assessment ? st.top_recommended_major : "Chưa đánh giá"}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {st.match_score === null ? "—" : `${st.match_score.toFixed(1)}%`}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${Math.min(100, st.readiness_score ?? 0)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px]">{st.readiness_score === null ? "—" : `${st.readiness_score.toFixed(1)}%`}</span>
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
          </div>}
        </div>
      )}

        {viewMode === "operations" && (
          <section className="space-y-4" aria-labelledby="operations-heading">
            <div>
              <h2 id="operations-heading" className="text-xl font-bold text-slate-900 dark:text-white">Vận hành hệ thống</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Trạng thái trực tiếp từ gateway, bản sao dữ liệu và các thao tác quản trị gần đây.</p>
            </div>
            {operationsError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{operationsError} <button type="button" onClick={fetchOperations} className="ml-2 min-h-11 font-semibold underline">Thử lại</button></div>}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /><h3 className="text-base font-bold">Kết nối hybrid cloud</h3></div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800"><dt>Gateway AWS</dt><dd className="font-semibold">{systemHealth ? "Đang phản hồi" : "Chưa xác nhận"}</dd></div>
                  <div className="flex justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800"><dt>Máy tính toán local</dt><dd className="font-semibold">{localComputeLabel}</dd></div>
                  {localCompute?.active_model && <div className="flex justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800"><dt>Model đang chạy</dt><dd className="font-mono text-right">{localCompute.active_model}</dd></div>}
                  <div className="flex justify-between gap-3"><dt>Cơ sở dữ liệu</dt><dd className="text-right font-semibold">{stats?.engine ?? "Chưa xác nhận"}</dd></div>
                </dl>
                {systemHealth?.private_compute_node?.message && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{systemHealth.private_compute_node.message}</p>}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2"><Archive className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /><h3 className="text-base font-bold">Bản sao SQLite</h3></div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Tạo ảnh chụp nhất quán trên máy chủ. Tệp được giữ trên server và không tải qua trình duyệt.</p>
                <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-2"><dt>Số bản sao</dt><dd className="font-semibold">{stats?.backup_count ?? "—"}</dd></div><div className="flex justify-between gap-2"><dt>Gần nhất</dt><dd className="text-right font-semibold">{stats?.latest_backup ?? "Chưa xác nhận"}</dd></div></dl>
                <button type="button" onClick={handleCreateBackup} disabled={creatingBackup} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50"><Archive className="h-4 w-4" />{creatingBackup ? "Đang tạo bản sao..." : "Tạo bản sao ngay"}</button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /><h3 className="text-base font-bold">Nhật ký quản trị gần đây</h3></div>
              {auditEvents === null ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Chưa tải được nhật ký.</p> : auditEvents.length === 0 ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Chưa có thao tác nào được ghi nhận.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"><tr><th className="py-3 pr-4">Thời điểm UTC</th><th className="py-3 pr-4">Người thực hiện</th><th className="py-3 pr-4">Thao tác</th><th className="py-3">Đối tượng</th></tr></thead><tbody>{auditEvents.map((event) => <tr key={event.id} className="border-b border-slate-100 dark:border-slate-800"><td className="py-3 pr-4 tabular-nums">{event.created_at}</td><td className="py-3 pr-4">{event.actor}</td><td className="py-3 pr-4">{event.action}</td><td className="py-3">{event.resource}</td></tr>)}</tbody></table></div>}
            </div>
          </section>
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
                        setOffset(0);
                      }}
                      className={`min-h-11 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
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
                <label htmlFor="record-search" className="sr-only">Tìm bản ghi</label>
                <input
                  id="record-search"
                  type="text"
                  placeholder="Tìm mã SV, từ khóa..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
                  className="min-h-11 w-full pl-9 pr-3 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
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
              ) : tableUnavailable ? (
                <div role="status" className="p-12 text-center text-sm text-slate-600 dark:text-slate-300">Không thể tải bảng dữ liệu này. Kiểm tra kết nối rồi chọn Làm mới.</div>
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
                                    className="min-h-11 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 flex items-center gap-1 text-xs"
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
                                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 transition-colors"
                                title="Xem toàn bộ bản ghi JSON"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {activeTable !== "users" && <button
                                onClick={() => setDeleteTarget({ id: recordPk, table: activeTable })}
                                className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500 transition-colors"
                                title="Xóa bản ghi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>}
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
              <div className="flex items-center gap-2">
                <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 50))} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-40 dark:border-slate-700">Trước</button>
                <span className="text-sm">Trang {Math.floor(offset / 50) + 1}</span>
                <button type="button" disabled={offset + 50 >= totalRecords} onClick={() => setOffset(offset + 50)} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-40 dark:border-slate-700">Sau</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Xem JSON Chi Tiết */}
      {inspectData && (
        <div role="dialog" aria-modal="true" aria-label="Chi tiết bản ghi" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                Dữ liệu JSON Bản ghi
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyJson(inspectData)}
                  className="min-h-11 px-3 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
                <button
                  aria-label="Đóng chi tiết bản ghi"
                  onClick={() => setInspectData(null)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <div role="dialog" aria-modal="true" aria-label="Xác nhận xóa bản ghi" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
            <div>
              <label htmlFor="delete-confirmation" className="mb-2 block text-sm font-medium">Nhập khóa {deleteTarget.id} để xác nhận</label>
              <input id="delete-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteConfirmation(""); }}
                className="min-h-11 px-4 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                disabled={deleteConfirmation !== deleteTarget.id}
                onClick={handleDeleteRecord}
                className="min-h-11 px-4 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors disabled:opacity-50"
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
