import React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Radar,
  GitFork,
  Cpu,
  Sparkles,
  CheckCircle,
  FileCheck
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>MajorMatch Web 2.0 Client • Kiến trúc Hybrid Cloud AI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Định lượng Năng lực &{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
            Cá nhân hóa Lộ trình
          </span>{" "}
          Đại học
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Không còn cảm tính khi chọn chuyên ngành. MajorMatch bóc tách bảng điểm PDF,
          đo đạc khoảng cách kỹ năng (Skill Gap) bằng <strong>Cosine Similarity</strong>,
          và sinh cây lộ trình học tập thông minh bảo đảm 100% tính logic về môn tiên quyết.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/upload"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 duration-150"
          >
            <span>Bắt đầu Tải hồ sơ & Trắc nghiệm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/result"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-900 border border-slate-800 text-slate-200 font-medium text-sm transition-all"
          >
            <Radar className="w-4 h-4 text-cyan-400" />
            <span>Xem Báo cáo Mẫu</span>
          </Link>
        </div>
      </div>

      {/* 3 Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            1. Bóc tách PDF & Khử định danh PII
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Thuật toán Regex trích xuất toàn bộ mã môn, tín chỉ và điểm GPA hệ chữ/hệ 4.
            Thông tin cá nhân nhạy cảm được xóa sạch trước khi đưa vào pipeline tính toán AI.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Radar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            2. Đo khoảng cách Kỹ năng Cosine
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vector hóa năng lực học tập đối chiếu với chuẩn chuyên ngành, xuất biểu đồ Radar
            6 trục mạng nhện phân tách rõ ràng Mastered, Developing và Missing Skills.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
            <GitFork className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            3. Web 2.0 Dynamic State Tracking
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Lộ trình học tập tương tác với Interactive Checklist. Khi tích chọn môn đã học,
            chỉ số % Job Readiness tự động nhảy tiến độ tức thời mà không cần reload trang.
          </p>
        </div>
      </div>

      {/* System Metrics Strip */}
      <div className="w-full p-6 rounded-2xl glass-panel border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
            &lt; 1.0s
          </span>
          <div className="text-xs text-slate-400 mt-1">Thời gian bóc tách PDF</div>
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            100%
          </span>
          <div className="text-xs text-slate-400 mt-1">Khử định danh riêng tư</div>
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            6 Trục
          </span>
          <div className="text-xs text-slate-400 mt-1">Đánh giá Radar chuẩn hóa</div>
        </div>
        <div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            Qwen 2.5
          </span>
          <div className="text-xs text-slate-400 mt-1">Cố vấn học tập Streaming</div>
        </div>
      </div>
    </div>
  );
}
