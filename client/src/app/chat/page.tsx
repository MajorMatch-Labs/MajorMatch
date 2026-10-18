"use client";

import React from "react";
import { StreamingChatBox } from "@/components/chat/StreamingChatBox";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="w-full h-[calc(100vh-4.5rem)] max-w-7xl mx-auto py-2 sm:py-3 px-2 sm:px-4 flex flex-col">
      <StreamingChatBox />
    </div>
  );
}
