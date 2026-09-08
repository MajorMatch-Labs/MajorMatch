"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  UploadCloud,
  Radar,
  GitFork,
  MessageSquare,
  ShieldCheck,
  Github
} from "lucide-react";
import { ApiService } from "@/services/api";
import { HealthCheckResponse } from "@/types/api";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    ApiService.checkHealth().then(setHealth);
  }, []);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: Compass },
    { href: "/upload", label: "Tải hồ sơ & Khảo sát", icon: UploadCloud },
    { href: "/result", label: "Khoảng cách Kỹ năng", icon: Radar },
    { href: "/roadmap", label: "Lộ trình Tương tác", icon: GitFork },
    { href: "/chat", label: "Trợ lý AI Streaming", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              MajorMatch
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 -mt-1">
              AI Skill Advisor Web 2.0
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Node Status & Github */}
        <div className="flex items-center gap-3">
          {health && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">HPC Private Node</span>
              <span className="text-emerald-400 font-mono text-[10px]">Ready</span>
            </div>
          )}

          <a
            href="https://github.com/MajorMatch-Labs/majormatch-client"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-slate-800"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
