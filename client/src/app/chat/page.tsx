"use client";

import React from "react";
import { StreamingChatBox } from "@/components/chat/StreamingChatBox";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-20 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <StreamingChatBox />
    </div>
  );
}
