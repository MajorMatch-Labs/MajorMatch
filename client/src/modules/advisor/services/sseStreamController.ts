/**
 * SSE Stream Controller with AbortSignal & Idle Timeout Guard
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Long Nhat <torikun2005@gmail.com> - Tech Lead & Advisor Module
 */

import {
  StreamChatRequestPayload,
  StreamChatHandlerOptions,
  SseConnectionStatus,
} from '../types/sseTypes';
import { SseLineBufferParser } from '../utils/sseParser';

export class SseStreamController {
  private abortController: AbortController | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private parser: SseLineBufferParser = new SseLineBufferParser();
  private static readonly DEFAULT_IDLE_TIMEOUT_MS = 15000; // 15 giay guard

  /**
   * Khoi chay ket noi Streaming toi Backend HPC qua Server-Sent Events
   */
  public async startStream(
    endpointUrl: string,
    payload: StreamChatRequestPayload,
    options: StreamChatHandlerOptions
  ): Promise<void> {
    this.abort(); // Huy ket noi cu neu dang chay
    this.abortController = new AbortController();
    this.parser.reset();

    const signal = options.signal || this.abortController.signal;
    const timeoutMs = options.timeoutMs || SseStreamController.DEFAULT_IDLE_TIMEOUT_MS;

    options.onStatusChange?.('connecting');
    this.resetIdleTimer(timeoutMs, options);

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP_${response.status}: Kết nối máy chủ AI thất bại (${response.statusText})`);
      }

      if (!response.body) {
        throw new Error('STREAM_EMPTY: Phản hồi từ máy chủ không chứa luồng dữ liệu ReadableStream');
      }

      options.onStatusChange?.('streaming');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let streamFinished = false;

      while (!streamFinished) {
        const { value, done } = await reader.read();

        if (done) {
          streamFinished = true;
          break;
        }

        this.resetIdleTimer(timeoutMs, options);
        const chunkText = decoder.decode(value, { stream: true });
        const events = this.parser.feed(chunkText);

        for (const evt of events) {
          const payload = SseLineBufferParser.extractTokenPayload(evt);
          if (!payload) continue;

          if (payload.token) {
            options.onToken(payload.token);
          }

          if (payload.done) {
            streamFinished = true;
            break;
          }
        }
      }

      this.clearIdleTimer();
      options.onStatusChange?.('completed');
      options.onComplete?.();
    } catch (error: any) {
      this.clearIdleTimer();
      if (error.name === 'AbortError') {
        options.onStatusChange?.('interrupted');
      } else {
        options.onStatusChange?.('error');
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Ngat ket noi chu dong tu phia nguoi dung
   */
  public abort(): void {
    this.clearIdleTimer();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private resetIdleTimer(timeoutMs: number, options: StreamChatHandlerOptions): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      this.abort();
      options.onStatusChange?.('error');
      options.onError?.(new Error(`STREAM_TIMEOUT: Quá thời gian chờ phản hồi (${timeoutMs / 1000}s)`));
    }, timeoutMs);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}
