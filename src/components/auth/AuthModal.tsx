"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { X, Mail, Lock, User, GraduationCap, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export const AuthModal: React.FC = () => {
  const { isModalOpen, closeAuthModal, activeTab, openAuthModal, login, register, error, clearError } = useAuthStore();
  const [identifier, setIdentifier] = useState(""); // MSSV hoặc Email cho Login
  const [studentId, setStudentId] = useState("");   // MSSV cho Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (activeTab === "login") {
      if (!identifier.trim()) {
        setIsLoading(false);
        return;
      }
      await login(identifier.trim(), password);
    } else {
      if (!studentId.trim() || !email.trim() || !name.trim()) {
        setIsLoading(false);
        return;
      }
      if (studentId.trim().toUpperCase() === "ADMIN" || studentId.trim().toUpperCase() === "ROOT") {
        useAuthStore.setState({ error: "Tài khoản 'admin' là tài khoản hệ thống mặc định, không cần đăng ký. Vui lòng chuyển sang tab Đăng nhập." });
        setIsLoading(false);
        return;
      }
      await register({
        student_id: studentId.trim(),
        email: email.trim(),
        full_name: name.trim(),
        password: password,
      });
    }

    setIsLoading(false);
  };

  const switchTab = (tab: "login" | "register") => {
    clearError();
    openAuthModal(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeTab === "login" ? "Đăng nhập Tài khoản" : "Tạo Tài khoản Sinh viên"}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {activeTab === "login"
              ? "Truy cập hồ sơ học tập và đồng bộ dữ liệu từ CSDL MajorMatch"
              : "Đăng ký tài khoản sinh viên chính thức để lưu trữ bảng điểm & lộ trình"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-5">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "login"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchTab("register")}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "register"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === "login" ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mã số Sinh viên (MSSV) hoặc Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ví dụ: 23IT196 hoặc nhatdl.23it@vku.udn.vn"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mã số Sinh viên (MSSV) *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: 23IT196"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Đặng Long Nhật"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Sinh viên / Học thuật *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sinhvien@vku.udn.vn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mật khẩu {activeTab === "register" ? "(Tối thiểu 6 ký tự)" : ""} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={activeTab === "register" ? 6 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <span>
              {isLoading
                ? "Đang xử lý..."
                : activeTab === "login"
                ? "Xác nhận Đăng nhập"
                : "Hoàn tất Đăng ký"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Mã hóa thông tin theo tiêu chuẩn bảo mật PII & Salted Hash</span>
        </div>
      </div>
    </div>
  );
};
