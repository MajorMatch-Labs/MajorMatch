"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Square,
  ArrowDown,
  AlertTriangle,
  History,
  Plus,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Compass,
  Cpu,
  GraduationCap,
  MessageSquare,
  BookOpen,
  FolderGit2,
  Award,
  ChevronRight
} from "lucide-react";
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
  const studentId = user?.studentId || profile?.student_id || "23IT196";
  const studentName = user?.name || profile?.full_name || "Đặng Long Nhật";
  const displayName = studentName.trim().split(" ").slice(-1)[0] || "Nhật";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const targetMajor = selectedMajor?.major_name || "Kỹ thuật Đám mây & Vận hành Hệ thống";

  const [currentSessionId, setCurrentSessionId] = useState<string>("default");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Xin chào **${displayName}**! Tôi là Trợ lý Cố vấn Học tập AI của hệ thống MajorMatch. Tôi sẵn sàng giải đáp chi tiết về chuyên ngành **${targetMajor}**, phương pháp ôn tập môn tiên quyết hoặc định hướng làm đồ án thực chiến. Bạn muốn tìm hiểu nội dung nào?`,
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
    const intervalId = setInterval(checkNodeStatus, 15000);

    ApiService.getChatHistory(studentId, currentSessionId).then((history) => {
      if (isMounted && history && history.length > 0) {
        setMessages(history);
      } else if (isMounted) {
        setMessages([
          {
            role: "assistant",
            content: `Xin chào **${displayName}**! Tôi là Trợ lý Cố vấn Học tập AI của hệ thống MajorMatch. Tôi sẵn sàng giải đáp chi tiết về chuyên ngành **${targetMajor}**, phương pháp ôn tập môn tiên quyết hoặc định hướng làm đồ án thực chiến. Bạn muốn tìm hiểu nội dung nào?`,
          },
        ]);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      controllerRef.current?.abort();
    };
  }, [studentId, displayName, currentSessionId, loadSessions, targetMajor]);

  const switchSession = async (sid: string) => {
    setCurrentSessionId(sid);
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
    setMessages([
      {
        role: "assistant",
        content: `Đã khởi tạo phiên tư vấn mới. Tôi là Cố vấn AI MajorMatch. Hãy đặt bất kỳ câu hỏi nào về môn học, đồ án hay kỹ năng!`,
      },
    ]);
  };

  // Smart Auto-Scroll
  const scrollToBottom = useCallback((force = false) => {
    if (force || !userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [userScrolledUp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  const handleContainerScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setUserScrolledUp(!isAtBottom);
  };

  const handleStop = () => {
    controllerRef.current?.abort();
    setStreamStatus("interrupted");
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput("");
    setUserScrolledUp(false);
    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);

    // Lưu tin nhắn người dùng vào CSDL
    ApiService.saveChatMessage(studentId, "user", query, currentSessionId);

    // Tạo tin nhắn trợ lý nhận stream
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
        gpa: profile?.cumulative_gpa ?? 2.89,
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

  const starterCards = [
    {
      title: "Ôn tập môn tiên quyết",
      desc: "Cần chuẩn bị kiến thức toán và lập trình gì cho môn Machine Learning (CS402)?",
      prompt: "Cần chuẩn bị kiến thức gì cho môn Machine Learning (CS402)?",
      icon: BookOpen,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Lộ trình thực tập & Cloud",
      desc: "Nên thi chứng chỉ AWS Cloud Practitioner hay Solutions Architect trước kỳ thực tập?",
      prompt: "Nên lấy chứng chỉ Cloud nào trước khi đi thực tập?",
      icon: Award,
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Xây dựng Portfolio",
      desc: "Chiến lược xây dựng dự án DevOps/CI-CD với Docker và Kubernetes trên GitHub?",
      prompt: "Làm sao để xây dựng dự án DevOps thực chiến chuẩn bị CV?",
      icon: FolderGit2,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Cải thiện GPA & Đồ án",
      desc: "Phương pháp cân bằng thời gian giữa học tín chỉ trên lớp và nghiên cứu đồ án?",
      prompt: "Làm sao để cân bằng giữa học trên lớp và làm đồ án cá nhân?",
      icon: GraduationCap,
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
    },
  ];

  const samplePrompts = [
    "Cần chuẩn bị kiến thức gì cho môn CS402?",
    "Lộ trình chứng chỉ AWS cho sinh viên VKU?",
    "Xây dựng đồ án Microservices như thế nào?",
    "Cách cải thiện GPA từ 2.89 lên 3.2?",
  ];

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      {/* 1. SIDEBAR PHONG CÁCH CHATGPT / GEMINI */}
      <aside
        className={`${
          isSidebarOpen ? "w-72 border-r" : "w-0 border-r-0"
        } transition-[width] duration-300 ease-in-out border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/60 flex flex-col z-20 shrink-0 overflow-hidden`}
      >
        <div className="w-72 h-full flex flex-col shrink-0">
          {/* Top: New Chat Button */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Studio Cố vấn AI</span>
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={createNewSession}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/25 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>

          {/* Middle: Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Lịch sử phiên ({sessions.length})
            </div>

            {sessions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Chưa có phiên trò chuyện nào trước đó.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = currentSessionId === s.session_id;
                return (
                  <button
                    key={s.session_id}
                    onClick={() => switchSession(s.session_id)}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/80 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="truncate">{s.last_message || s.session_id}</span>
                        <span className="text-[9px] text-slate-400 shrink-0 ml-1 font-mono">
                          {s.message_count} tin
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{s.updated_at ? s.updated_at.split("T")[0] : "Gần đây"}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom: User Card */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {avatarLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {studentName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                MSSV: <strong className="text-indigo-600 dark:text-indigo-400">{studentId}</strong>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CHAT STAGE (GEMINI / CHATGPT CENTER STAGE) */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-gradient-to-b from-transparent via-slate-50/20 to-slate-100/40 dark:via-slate-900/10 dark:to-slate-950/20">
        {/* Top Header Bar */}
        <header className="h-14 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
              aria-label={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                MajorMatch AI
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Qwen 2.5 7B
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* HPC Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                isHpcOnline
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>{isHpcOnline ? "HPC GPU Ready" : "Cloud DB Mode"}</span>
            </div>

            {streamStatus === "streaming" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trả lời lời...
              </span>
            )}
            {streamStatus === "connecting" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30">
                <Loader2 className="w-3 h-3 animate-spin" /> Kết nối...
              </span>
            )}
          </div>
        </header>

        {/* Message Stream Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleContainerScroll}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-5 scroll-smooth"
        >
          {/* Welcome Screen kiểu Gemini nếu chỉ có 1 tin nhắn mặc định */}
          {messages.length <= 1 && (
            <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Xin chào, {displayName}!
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Tôi có thể giúp bạn giải đáp những thắc mắc nào về lộ trình đại học, chuẩn đầu ra môn học hay chiến lược thực tập hôm nay?
                </p>
              </div>

              {/* 4 Cards Gợi ý phong cách Gemini */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {starterCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(card.prompt)}
                      className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {card.title}
                          </span>
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${card.color} flex items-center justify-center`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {card.desc}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Hỏi ngay</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Danh sách tin nhắn hội thoại */}
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 sm:px-5 py-3 text-xs leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-xs"
                      : "bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 shadow-xs rounded-tl-xs"
                  }`}
                >
                  {msg.content ? (
                    msg.role === "assistant" ? (
                      <MarkdownMessage content={msg.content} />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tổng hợp tri thức...
                    </span>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {avatarLetter}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Nút cuộn xuống đáy */}
        {userScrolledUp && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-6 sm:right-10 p-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-1.5 text-xs transition-all z-10"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Cuộn xuống</span>
          </button>
        )}

        {/* 3. FLOATING INPUT BAR PHONG CÁCH GEMINI / CHATGPT */}
        <div className="p-3 sm:p-4 bg-transparent shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Suggested Prompts Pill Row */}
            {messages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isStreaming}
                    onClick={() => handleSend(p)}
                    className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white/90 hover:bg-indigo-50 dark:bg-slate-800/90 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors shadow-2xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input Capsule Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 shadow-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all p-1.5 pl-4"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhắn tin cho Cố vấn AI MajorMatch..."
                disabled={isStreaming}
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-2"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                  title="Dừng sinh phản hồi"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Dừng</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white shadow-xs transition-all"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>

            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-mono">
              MajorMatch AI có thể phản hồi chưa hoàn hảo. Hãy đối chiếu với Cố vấn học tập khoa CNTT - VKU.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
