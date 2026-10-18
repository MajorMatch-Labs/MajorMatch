"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  UploadCloud,
  Radar,
  GitFork,
  MessageSquare,
  ShieldCheck,
  Github,
  Sun,
  Moon,
  User,
  LogOut,
  Database,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(true);
  const { user, isAuthenticated, openAuthModal, logout, checkAuthSession } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuthSession();
    const isDarkTheme = document.documentElement.classList.contains("dark");
    setIsDark(isDarkTheme);
  }, [checkAuthSession]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("majormatch-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("majormatch-theme", "light");
    }
  };

  const navLinks = isAuthenticated
    ? [
        { href: "/", label: "Trang chủ", icon: Compass },
        { href: "/upload", label: "Khảo sát", icon: UploadCloud },
        { href: "/result", label: "Kết quả", icon: Radar },
        { href: "/roadmap", label: "Lộ trình", icon: GitFork },
        { href: "/chat", label: "Trợ lý AI", icon: MessageSquare },
        { href: "/profile", label: "Hồ sơ", icon: User },
      ]
    : [
        { href: "/", label: "Trang chủ", icon: Compass },
        { href: "/upload", label: "Khảo sát", icon: UploadCloud },
      ];

  const displayName = user?.name ? user.name.trim().split(" ").slice(-1)[0] : "Sinh viên";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/90 dark:border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              MajorMatch
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 -mt-1">
              Định hướng học tập
            </span>
          </div>
        </Link>

        {/* Navigation Links - Ẩn khi phóng to / màn hình thu nhỏ, chuyển sang menu 3 gạch */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme & Auth */}
        <div className="flex items-center gap-2.5">

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-slate-200 dark:border-slate-800"
            title={isDark ? "Chuyển sang chế độ Sáng (Light mode)" : "Chuyển sang chế độ Tối (Dark mode)"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* User Account / Login Button */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold">
                  {avatarLetter}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline">
                  {displayName}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-xl p-3 bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">MSSV: {user.studentId}</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                      {user.major}
                    </p>
                  </div>
                  <div className="pt-2 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Hồ sơ & Tiến trình</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsMobileMenuOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="flex min-h-11 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}

          <a
            href="https://github.com/MajorMatch-Labs/MajorMatch"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200 dark:border-slate-800"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Nút 3 gạch mở Menu khi thu nhỏ hoặc phóng to màn hình */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800 shadow-xs"
            aria-label="Toggle navigation menu"
            title="Menu điều hướng"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu thả xuống khi phóng to hoặc màn hình di động */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
