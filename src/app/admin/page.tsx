"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ExternalLink,
  ChevronRight,
  Server
} from "lucide-react";
import { ApiService } from "@/services/api";

type TableName = "user_profiles" | "roadmaps" | "assessments" | "chat_history";

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

export default function AdminDatabasePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
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
  }, [fetchStats]);

  useEffect(() => {
    fetchTableData(activeTable, searchTerm);
  }, [activeTable, fetchTableData, searchTerm]);

  const handleRefresh = () => {
    fetchStats();
    fetchTableData(activeTable, searchTerm);
    setActionMessage({ text: "Đã làm mới dữ liệu từ CSDL AWS Cloud thành công!", type: "success" });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDeleteRecord = async () => {
    if (!deleteTarget) return;
    const ok = await ApiService.deleteAdminRecord(deleteTarget.table, deleteTarget.id);
    if (ok) {
      setActionMessage({ text: `Đã xóa thành công bản ghi ID: ${deleteTarget.id}`, type: "success" });
      setDeleteTarget(null);
      fetchStats();
      fetchTableData(activeTable, searchTerm);
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

  const tableTabs: Array<{ id: TableName; label: string; icon: any; count: number }> = [
    { id: "user_profiles", label: "Hồ sơ Sinh viên", icon: Users, count: stats?.table_counts?.user_profiles ?? 0 },
    { id: "roadmaps", label: "Cây Lộ trình", icon: Compass, count: stats?.table_counts?.roadmaps ?? 0 },
    { id: "assessments", label: "Khoảng cách Kỹ năng", icon: Target, count: stats?.table_counts?.assessments ?? 0 },
    { id: "chat_history", label: "Lịch sử Chat AI", icon: MessageSquare, count: stats?.table_counts?.chat_history ?? 0 }
  ];

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
                MajorMatch Database Admin
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-mono font-normal">
                  AWS WAL Active
                </span>
              </h1>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Lưu trữ bền vững & điều phối dữ liệu trên AWS EC2 Cloud
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Cây Lộ trình</p>
              <h3 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">
                {stats?.table_counts?.roadmaps ?? 0}
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
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Tin nhắn Hội thoại</p>
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

        {/* Table Selector & Search Controls */}
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 font-mono">
                  {records.map((row, idx) => {
                    const rowKey = row.student_id || row.id || idx;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {columns.map((col) => {
                          const val = row[col.name];
                          const isJson = typeof val === "string" && (val.startsWith("{") || val.startsWith("["));
                          return (
                            <td key={col.name} className="px-3.5 py-2.5 max-w-[220px] truncate text-[11px]">
                              {isJson ? (
                                <button
                                  onClick={() => setInspectData(parseJsonSafe(val))}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors font-sans"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Xem JSON</span>
                                </button>
                              ) : col.name === "role" ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                                    val === "user"
                                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  }`}
                                >
                                  {val}
                                </span>
                              ) : (
                                <span title={String(val)}>{String(val ?? "-")}</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3.5 py-2.5 text-right whitespace-nowrap space-x-1 font-sans">
                          <button
                            onClick={() => setInspectData(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Xem chi tiết toàn bộ bản ghi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: String(row.student_id || row.id), table: activeTable })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Xóa bản ghi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 font-sans">
            <span>
              Tổng số: <strong>{totalRecords}</strong> bản ghi trong bảng <code>{activeTable}</code>
            </span>
            <span>Hiển thị tối đa 50 bản ghi mới nhất</span>
          </div>
        </div>
      </main>

      {/* Modal Xem JSON Chi Tiết */}
      {inspectData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Chi tiết dữ liệu JSON
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyJson(inspectData)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
                <button
                  onClick={() => setInspectData(null)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-emerald-400 leading-relaxed selection:bg-emerald-800 selection:text-white">
              <pre>{JSON.stringify(inspectData, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Xác nhận xóa bản ghi</h3>
                <p className="text-xs text-slate-500">Thao tác này sẽ xóa vĩnh viễn dữ liệu khỏi CSDL SQLite.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div>Bảng: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{deleteTarget.table}</strong></div>
              <div>Khóa ID: <strong className="font-mono text-rose-600 dark:text-rose-400">{deleteTarget.id}</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteRecord}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
