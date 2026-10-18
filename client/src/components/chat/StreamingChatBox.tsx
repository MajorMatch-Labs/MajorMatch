"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Loader2, Square, ArrowDown, AlertTriangle, History, Plus, Clock, MessageSquareQuote, X } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { SseStreamController } from "@/modules/advisor/services/sseStreamController";
import { SseConnectionStatus } from "@/modules/advisor/types/sseTypes";
import { MarkdownMessage } from "@/modules/advisor/components/MarkdownMessage";
import { ApiService } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  session_id: string;
  message_count: number;
  last_message: string;
  updated_at: string;
}

export const StreamingChatBox: React.FC = () => {
  const { selectedMajor, profile } = useProfileStore();
  const { user } = useAuthStore();
  const studentId = user?.studentId || profile?.student_id || "SV-2025001";
  const studentName = user?.name || profile?.full_name || "bạn";
  const targetMajor = selectedMajor?.major_name || "Khoa học Dữ liệu & Trí tuệ Nhân tạo";

  const [currentSessionId, setCurrentSessionId] = useState<string>("default");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Xin chào **${studentName}**! Tôi là Trợ lý Cố vấn Học tập AI của hệ thống MajorMatch. Tôi sẵn sàng giải đáp chi tiết về chuyên ngành **${targetMajor}**, phương pháp ôn tập môn tiên quyết hoặc định hướng làm đồ án thực chiến. Bạn muốn tìm hiểu nội dung nào?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streamStatus, setStreamStatus] = useState<SseConnectionStatus>("idle");
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [isHpcOnline, setIsHpcOnline] = useState<boolean | null>(null);

  const controllerRef = useRef<SseStreamController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantTextRef = useRef<string>("");

  const isStreaming = streamStatus === "connecting" || streamStatus === "streaming";

  const loadSessions = useCallback(() => {
    ApiService.getChatSessions(studentId).then((sess) => {
      setSessions(sess || []);
    });
  }, [studentId]);

  // Khởi tạo controller, kiểm tra trạng thái HPC Node định kỳ & nạp lịch sử hội thoại
  useEffect(() => {
    controllerRef.current = new SseStreamController();
    let isMounted = true;

    const checkNodeStatus = () => {
      ApiService.checkHealth()
        .then((h) => {
          if (isMounted) {
            const pNode = h?.private_compute_node as any;
            const online =
              pNode &&
              (pNode.ollama_status === "online" ||
                pNode.status === "online" ||
                Boolean(pNode.gpu_status) ||
                pNode.status !== "offline");
            setIsHpcOnline(!!online);
          }
        })
        .catch(() => {
          if (isMounted) setIsHpcOnline(false);
        });
    };

    checkNodeStatus();
    loadSessions();
    const intervalId = setInterval(checkNodeStatus, 10000);

    ApiService.getChatHistory(studentId, currentSessionId).then((history) => {
      if (isMounted && history && history.length > 0) {
        setMessages(history);
      } else if (isMounted) {
        setMessages([
          {
            role: "assistant",
            content: `Xin chào **${studentName}**! Tôi là Trợ lý Cố vấn Học tập AI của hệ thống MajorMatch. Tôi sẵn sàng giải đáp chi tiết về chuyên ngành **${targetMajor}**, phương pháp ôn tập môn tiên quyết hoặc định hướng làm đồ án thực chiến. Bạn muốn tìm hiểu nội dung nào?`,
          },
        ]);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      controllerRef.current?.abort();
    };
  }, [studentId, studentName, currentSessionId, loadSessions, targetMajor]);

  const switchSession = async (sid: string) => {
    setCurrentSessionId(sid);
    setIsDrawerOpen(false);
    const hist = await ApiService.getChatHistory(studentId, sid);
    if (hist && hist.length > 0) {
      setMessages(hist);
    } else {
      setMessages([
        {
          role: "assistant",
          content: `Đã chuyển sang phiên tư vấn **${sid}**. Tôi sẵn sàng giải đáp thắc mắc của bạn về chuyên ngành **${targetMajor}**!`,
        },
      ]);
    }
  };

  const createNewSession = () => {
    const newSid = `session-${Date.now().toString(36)}`;
    setCurrentSessionId(newSid);
    setIsDrawerOpen(false);
    setMessages([
      {
        role: "assistant",
        content: `Đã khởi tạo phiên tư vấn mới. Tôi là Cố vấn AI MajorMatch. Hãy đặt bất kỳ câu hỏi nào về môn học, đồ án hay kỹ năng!`,
      },
    ]);
  };

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

    // Lưu tin nhắn của người dùng vào CSDL SQLite kèm session_id
    ApiService.saveChatMessage(studentId, "user", query, currentSessionId);

    // Tạo tin nhắn trợ lý rỗng ban đầu để nhận stream
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    currentAssistantTextRef.current = "";

    const apiBaseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "");
    const endpoint = `${apiBaseUrl}/api/v1/chat/stream`;

    await controllerRef.current?.startStream(
      endpoint,
      {
        message: query,
        student_id: studentId,
        session_id: currentSessionId,
        target_major: targetMajor,
        gpa: profile?.cumulative_gpa,
        context_skills: {
          mastered: profile?.detected_skills || [],
          missing: selectedMajor?.skill_gap?.missing_skills || [],
        },
      },
      {
        onToken: (token) => {
          currentAssistantTextRef.current += token;
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (next[lastIdx]?.role === "assistant") {
              next[lastIdx] = {
                ...next[lastIdx],
                content: next[lastIdx].content + token,
              };
            }
            return next;
          });
        },
        onStatusChange: (status) => setStreamStatus(status),
        onComplete: () => {
          setStreamStatus("completed");
          // Lưu câu trả lời của trợ lý AI vào CSDL SQLite kèm session_id
          if (currentAssistantTextRef.current) {
            ApiService.saveChatMessage(studentId, "assistant", currentAssistantTextRef.current, currentSessionId);
            loadSessions();
          }
        },
        onError: (err) => {
          setStreamStatus("error");
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (next[lastIdx]?.role === "assistant" && !next[lastIdx].content) {
              next[lastIdx] = {
                ...next[lastIdx],
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
    <div className="flex flex-col h-[650px] rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-lg shadow-slate-200/50 dark:shadow-none transition-all">
      {/* Session Drawer Overlay */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-xs flex">
          <div className="w-full sm:w-80 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Lịch sử phiên tư vấn ({sessions.length})
              </h4>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-3 pb-2">
              <button
                onClick={createNewSession}
                className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bắt đầu phiên tư vấn mới</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Chưa có lịch sử phiên tư vấn nào được lưu.
                </div>
              ) : (
                sessions.map((s) => {
                  const isSelected = currentSessionId === s.session_id;
                  return (
                    <div
                      key={s.session_id}
                      onClick={() => switchSession(s.session_id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {s.session_id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {s.message_count} tin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {s.last_message || "Chưa có tin nhắn"}
                      </p>
                      <div className="mt-1 text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {s.updated_at ? s.updated_at.replace("T", " ").replace("Z", "") : "Gần đây"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setIsDrawerOpen(false)} />
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              MajorMatch AI Streaming Assistant
              {isHpcOnline === false ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-medium">
                  Cloud DB Fallback
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 font-medium">
                  Qwen 2.5 Local LLM
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span>Hồ sơ: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{studentId}</strong></span>
              <span>•</span>
              <span>Định hướng: <span className="text-slate-800 dark:text-slate-200 font-semibold">{targetMajor}</span></span>
              <span>•</span>
              <span>Phiên: <span className="font-mono text-indigo-500">{currentSessionId}</span></span>
            </p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            title="Xem các phiên tư vấn trước đây"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Lịch sử phiên</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
              {sessions.length || 1}
            </span>
          </button>

          <button
            type="button"
            onClick={createNewSession}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 shadow-sm transition-all"
            title="Khởi tạo phiên tư vấn mới"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phiên mới</span>
          </button>

          {streamStatus === "streaming" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Stream...
            </span>
          )}
          {streamStatus === "connecting" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30">
              <Loader2 className="w-3 h-3 animate-spin" /> Kết nối...
            </span>
          )}
          {streamStatus === "interrupted" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
              Đã dừng
            </span>
          )}
          {streamStatus === "error" && (
            <button
              type="button"
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                if (lastUserMsg) handleSend(lastUserMsg.content);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/20 transition-colors"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>

      {/* HPC Offline Fast Warning Banner */}
      {isHpcOnline === false && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            Private HPC GPU Node đang ngoại tuyến. Trợ lý AI đang tư vấn dựa trên hồ sơ CSDL đám mây (Cloud DB Mode).
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-mono font-medium shrink-0">
            Cloud DB Active
          </span>
        </div>
      )}

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
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-600/30 dark:border-indigo-500/40 dark:text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              {msg.content ? (
                msg.role === "assistant" ? (
                  <MarkdownMessage content={msg.content} />
                ) : (
                  <span>{msg.content}</span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang suy luận phản hồi...
                </span>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
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
          className="absolute bottom-24 right-6 p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-1.5 text-[11px] transition-all"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Cuộn xuống</span>
        </button>
      )}

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-50/90 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isStreaming}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 dark:bg-slate-900 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 dark:hover:border-indigo-500/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 shadow-xs transition-colors"
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
        className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi bất kỳ câu hỏi nào về môn học, phương pháp hay chuẩn đầu ra..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50"
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
