"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { ApiService } from "@/services/api";
import { useProfileStore } from "@/stores/useProfileStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const StreamingChatBox: React.FC = () => {
  const { selectedMajor } = useProfileStore();
  const targetMajor = selectedMajor?.major_name || "AI & Data Science Specialist";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Xin chào! Tôi là Trợ lý Cố vấn Học tập AI của hệ thống MajorMatch. Tôi sẵn sàng giải đáp chi tiết về chuyên ngành **${targetMajor}**, phương pháp ôn tập môn tiên quyết hoặc định hướng làm đồ án thực chiến. Bạn muốn tìm hiểu nội dung nào?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isStreaming) return;

    setInput("");
    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    // Tạo tin nhắn trợ lý rỗng ban đầu để nhận stream
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await ApiService.streamChat(
      query,
      targetMajor,
      (chunk) => {
        setMessages((prev) => {
          const next = [...prev];
          const currentAssistantMsg = next[assistantIndex];
          if (currentAssistantMsg) {
            next[assistantIndex] = {
              ...currentAssistantMsg,
              content: currentAssistantMsg.content + chunk,
            };
          }
          return next;
        });
      },
      () => {
        setIsStreaming(false);
      },
      () => {
        setIsStreaming(false);
      }
    );
  };

  const samplePrompts = [
    "Cần chuẩn bị kiến thức toán gì cho môn CS402?",
    "Làm sao để cân bằng giữa học trên lớp và làm dự án cá nhân?",
    "Nên lấy chứng chỉ nào trước khi đi thực tập?",
  ];

  return (
    <div className="flex flex-col h-[650px] rounded-2xl glass-panel border border-slate-800 overflow-hidden">
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
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  : "bg-slate-900/80 text-slate-200 border border-slate-800/90 whitespace-pre-wrap"
              }`}
            >
              {msg.content || (
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
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-all"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
