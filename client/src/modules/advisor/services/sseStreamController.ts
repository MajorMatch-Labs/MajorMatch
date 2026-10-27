/** One isolated lifecycle per request: replacement streams cannot share buffers or timers. */
import { StreamChatRequestPayload, StreamChatHandlerOptions, SseConnectionStatus } from '../types/sseTypes';
import { SseLineBufferParser } from '../utils/sseParser';

interface StreamSession {
  controller: AbortController;
  parser: SseLineBufferParser;
  timer: ReturnType<typeof setTimeout> | null;
  reader?: ReadableStreamDefaultReader<Uint8Array>;
  options: StreamChatHandlerOptions;
  terminal: boolean;
}

export class SseStreamController {
  private active: StreamSession | null = null;
  private static readonly DEFAULT_IDLE_TIMEOUT_MS = 45000;

  public async startStream(endpointUrl: string, payload: StreamChatRequestPayload, options: StreamChatHandlerOptions): Promise<void> {
    this.abort();
    const session: StreamSession = {
      controller: new AbortController(), parser: new SseLineBufferParser(),
      timer: null, options, terminal: false,
    };
    this.active = session;
    const onExternalAbort = () => this.stop(session);
    options.signal?.addEventListener('abort', onExternalAbort, { once: true });
    const timeoutMs = options.timeoutMs ?? SseStreamController.DEFAULT_IDLE_TIMEOUT_MS;

    try {
      options.onStatusChange?.('connecting');
      if (options.signal?.aborted) this.stop(session);
      if (!this.isCurrent(session)) return;
      this.resetIdleTimer(session, timeoutMs);
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(payload),
        // External cancellation is forwarded to this controller; abort() always works.
        signal: session.controller.signal,
      });
      if (!this.isCurrent(session)) {
        await response.body?.cancel();
        return;
      }
      if (!response.ok) throw new Error(`HTTP_${response.status}: Kết nối máy chủ AI thất bại`);
      if (!response.body) throw new Error('STREAM_EMPTY: Phản hồi không chứa luồng dữ liệu');

      session.reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      options.onStatusChange?.('streaming');
      while (this.isCurrent(session)) {
        const { value, done } = await session.reader.read();
        if (!this.isCurrent(session)) return;
        if (done) {
          this.finish(session, 'completed');
          return;
        }
        this.resetIdleTimer(session, timeoutMs);
        for (const event of session.parser.feed(decoder.decode(value, { stream: true }))) {
          if (!this.isCurrent(session)) return;
          const token = SseLineBufferParser.extractTokenPayload(event);
          if (token?.error) throw new Error(token.error);
          if (token?.token) options.onToken(token.token);
          if (token?.done) {
            this.finish(session, 'completed');
            return;
          }
        }
      }
    } catch (error: unknown) {
      if (this.isCurrent(session)) {
        this.finish(session, session.controller.signal.aborted ? 'interrupted' : 'error',
          error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      this.clearIdleTimer(session);
      options.signal?.removeEventListener('abort', onExternalAbort);
      // A [DONE] event can arrive while the HTTP body remains open.
      if (session.reader) {
        try { await session.reader.cancel(); } catch { /* Already aborted/errored. */ }
        session.reader.releaseLock();
      }
      if (this.active === session) this.active = null;
    }
  }

  public abort(): void {
    if (this.active) this.stop(this.active);
  }

  private isCurrent(session: StreamSession): boolean {
    return this.active === session && !session.terminal;
  }

  private finish(session: StreamSession, status: SseConnectionStatus, error?: Error): void {
    if (!this.isCurrent(session)) return;
    session.terminal = true;
    this.clearIdleTimer(session);
    session.options.onStatusChange?.(status);
    if (status === 'completed') session.options.onComplete?.();
    if (status === 'error' && error) session.options.onError?.(error);
  }

  private stop(session: StreamSession): void {
    this.finish(session, 'interrupted');
    session.controller.abort();
    void session.reader?.cancel().catch(() => undefined);
  }

  private resetIdleTimer(session: StreamSession, timeoutMs: number): void {
    this.clearIdleTimer(session);
    session.timer = setTimeout(() => {
      this.finish(session, 'error', new Error(`STREAM_TIMEOUT: Quá thời gian chờ phản hồi (${timeoutMs / 1000}s)`));
      session.controller.abort();
      void session.reader?.cancel().catch(() => undefined);
    }, timeoutMs);
  }

  private clearIdleTimer(session: StreamSession): void {
    if (session.timer !== null) clearTimeout(session.timer);
    session.timer = null;
  }
}
