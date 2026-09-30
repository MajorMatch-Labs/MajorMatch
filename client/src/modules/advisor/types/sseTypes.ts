/**
 * SSE Protocol Types, Chunk Event Structures & Stream States
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Long Nhat <torikun2005@gmail.com> - Tech Lead & Advisor Module
 */

export type SseConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'completed'
  | 'interrupted'
  | 'error';

export interface SseRawEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

export interface SseTokenPayload {
  token?: string;
  delta?: string;
  done?: boolean;
  model?: string;
  error?: string;
}

export interface StreamChatRequestPayload {
  message: string;
  conversation_id?: string;
  target_major?: string;
  context_skills?: {
    mastered: string[];
    missing: string[];
  };
  gpa?: number;
}

export interface StreamChatHandlerOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  onToken: (token: string) => void;
  onStatusChange?: (status: SseConnectionStatus) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}
