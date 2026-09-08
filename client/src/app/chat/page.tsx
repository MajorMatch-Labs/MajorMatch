"use client";

import React from "react";
import { StreamingChatBox } from "@/components/chat/StreamingChatBox";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Server-Sent Events (SSE) Streaming</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cố vấn Học tập Trí tuệ Nhân tạo
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Hỏi đáp chuyên sâu về lộ trình đại học, môn học tiên quyết, và chiến lược xây dựng CV/Portfolio.
        </p>
      </div>

      <StreamingChatBox />

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bảo mật dữ liệu hội thoại trên Private GPU Node</span>
        </div>
        <div>Mô hình AI: Qwen 2.5 7B Instruct (Lượng tử hóa Q4_K_M)</div>
      </div>
    </div>
  );
}
