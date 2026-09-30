"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Loader2, Square, ArrowDown } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";
import { SseStreamController } from "@/modules/advisor/services/sseStreamController";
import { SseConnectionStatus } from "@/modules/advisor/types/sseTypes";
import { MarkdownMessage } from "@/modules/advisor/components/MarkdownMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const StreamingChatBox: React.FC = () => {
  const { selectedMajor, profile } = useProfileStore();
  const targetMajor = selectedMajor?.major_name || "AI & Data Science Specialist";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Xin chào! Tôi là Trợ lý Cố vấn Học tập AI của hệ thống MajorMatch. Tôi sẵn sàng giải đáp chi tiết về chuyên ngành **${targetMajor}**, phương pháp ôn tập môn tiên quyết hoặc định hướng làm đồ án thực chiến. Bạn muốn tìm hiểu nội dung nào?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streamStatus, setStreamStatus] = useState<SseConnectionStatus>("idle");
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const controllerRef = useRef<SseStreamController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStreaming = streamStatus === "connecting" || streamStatus === "streaming";

  // Khoi tao controller
  useEffect(() => {
    controllerRef.current = new SseStreamController();
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // Xu ly cuon thong minh (Smart Auto-Scroll)
  const scrollToBottom = useCallback((force = false) => {
    if (force || !userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [userScrolledUp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  // Nhan dien khi nguoi dung chu dong cuon chuot len de doc lai tin nhan cu
  const handleContainerScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setUserScrolledUp(!isAtBottom);
  };

  const handleStop = () => {
    controllerRef.current?.abort();
    setStreamStatus("interrupted");
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isStreaming) return;

    setInput("");
    setUserScrolledUp(false);
    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);

    // Tạo tin nhắn trợ lý rỗng ban đầu để nhận stream
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const endpoint = `${apiBaseUrl}/api/v1/chat/stream`;

    await controllerRef.current?.startStream(
      endpoint,
      {
        message: query,
        target_major: targetMajor,
        gpa: profile?.cumulative_gpa,
        context_skills: {
          mastered: profile?.detected_skills || [],
          missing: selectedMajor?.skill_gap?.missing_skills || [],
        },
      },
      {
        onToken: (token) => {
          setMessages((prev) => {
            const next = [...prev];
            const currentAssistantMsg = next[assistantIndex];
            if (currentAssistantMsg) {
              next[assistantIndex] = {
                ...currentAssistantMsg,
                content: currentAssistantMsg.content + token,
              };
            }
            return next;
          });
        },
        onStatusChange: (status) => setStreamStatus(status),
        onComplete: () => setStreamStatus("completed"),
        onError: (err) => {
          setStreamStatus("error");
          setMessages((prev) => {
            const next = [...prev];
            const currentAssistantMsg = next[assistantIndex];
            if (currentAssistantMsg && !currentAssistantMsg.content) {
              next[assistantIndex] = {
                ...currentAssistantMsg,
                content: `⚠️ Có lỗi kết nối tới AI Backend: ${err.message}. Đã kích hoạt phản hồi ngoại tuyến.`,
              };
            }
            return next;
          });
        },
      }
    );
  };

  const samplePrompts = [
    "Cần chuẩn bị kiến thức toán gì cho môn CS402?",
    "Làm sao để cân bằng giữa học trên lớp và làm dự án cá nhân?",
    "Nên lấy chứng chỉ nào trước khi đi thực tập?",
  ];

  return (
    <div className="flex flex-col h-[650px] rounded-2xl glass-panel border border-slate-800 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              MajorMatch AI Streaming Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Qwen 2.5 Local LLM
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Định hướng bám sát chuyên ngành: <span className="text-indigo-300">{targetMajor}</span>
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          {streamStatus === "streaming" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Đang nhận stream...
            </span>
          )}
          {streamStatus === "connecting" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang kết nối...
            </span>
          )}
        </div>
      </div>

      {/* Message History */}
      <div
        ref={scrollContainerRef}
        onScroll={handleContainerScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900/80 text-slate-200 border border-slate-800/90"
              }`}
            >
              {msg.content ? (
                msg.role === "assistant" ? (
                  <MarkdownMessage content={msg.content} />
                ) : (
                  <span>{msg.content}</span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 text-indigo-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang suy luận phản hồi...
                </span>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Nút hỗ trợ cuộn nhanh xuống đáy nếu người dùng đang đọc ở trên */}
      {userScrolledUp && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-24 right-6 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-slate-700 shadow-xl flex items-center gap-1.5 text-[11px] transition-all"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Cuộn xuống</span>
        </button>
      )}

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isStreaming}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 hover:bg-indigo-950 hover:text-indigo-300 border border-slate-800 text-slate-400 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi bất kỳ câu hỏi nào về môn học, phương pháp hay chuẩn đầu ra..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none placeholder:text-slate-500 disabled:opacity-50"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Dừng sinh phản hồi"
          >
            <Square className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Dừng</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};
