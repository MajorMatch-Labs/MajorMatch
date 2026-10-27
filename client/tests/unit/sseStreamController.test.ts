import { afterEach, describe, expect, it, vi } from 'vitest';
import { SseStreamController } from '@/modules/advisor/services/sseStreamController';
import { StreamChatHandlerOptions } from '@/modules/advisor/types/sseTypes';

const encoder = new TextEncoder();
const options = (): StreamChatHandlerOptions => ({
  onToken: vi.fn(), onComplete: vi.fn(), onError: vi.fn(), onStatusChange: vi.fn(),
});
function streamResponse() {
  let source!: ReadableStreamDefaultController<Uint8Array>;
  const cancel = vi.fn();
  const body = new ReadableStream<Uint8Array>({ start(controller) { source = controller; }, cancel });
  return { response: new Response(body), source, cancel };
}

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('SSE request lifecycle', () => {
  it('delivers split UTF-8 tokens and cancels the body after DONE', async () => {
    const stream = streamResponse();
    const opts = options();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(stream.response));
    const running = new SseStreamController().startStream('/synthetic', { message: 'test' }, opts);
    const bytes = encoder.encode('data: {"token":"Việt"}\n\ndata: [DONE]\n\n');
    const split = bytes.findIndex((byte) => byte > 127) + 1;
    stream.source.enqueue(bytes.slice(0, split));
    stream.source.enqueue(bytes.slice(split));
    await running;
    expect(opts.onToken).toHaveBeenCalledTimes(1);
    expect(opts.onToken).toHaveBeenCalledWith('Việt');
    expect(opts.onComplete).toHaveBeenCalledTimes(1);
    expect(stream.cancel).toHaveBeenCalledTimes(1);
  });

  it('keeps manual abort effective when an external signal is supplied', async () => {
    const stream = streamResponse();
    const external = new AbortController();
    const opts = { ...options(), signal: external.signal };
    const fetchMock = vi.fn().mockResolvedValue(stream.response);
    vi.stubGlobal('fetch', fetchMock);
    const controller = new SseStreamController();
    const running = controller.startStream('/synthetic', { message: 'test' }, opts);
    await vi.waitFor(() => expect(opts.onStatusChange).toHaveBeenCalledWith('streaming'));
    controller.abort();
    await running;
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(external.signal.aborted).toBe(false);
    expect(opts.onStatusChange).toHaveBeenLastCalledWith('interrupted');
    expect(opts.onComplete).not.toHaveBeenCalled();
  });

  it('forwards external cancellation and skips fetch for a pre-aborted signal', async () => {
    const external = new AbortController();
    external.abort();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const opts = { ...options(), signal: external.signal };
    await new SseStreamController().startStream('/synthetic', { message: 'test' }, opts);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(opts.onStatusChange).toHaveBeenLastCalledWith('interrupted');
  });

  it('ignores a late response and cleanup from the replaced request', async () => {
    const oldStream = streamResponse();
    const newStream = streamResponse();
    let resolveOld!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce(newStream.response));
    const controller = new SseStreamController();
    const oldOptions = options();
    const newOptions = options();
    const oldRun = controller.startStream('/synthetic', { message: 'old' }, oldOptions);
    const newRun = controller.startStream('/synthetic', { message: 'new' }, newOptions);
    await vi.waitFor(() => expect(newOptions.onStatusChange).toHaveBeenCalledWith('streaming'));
    resolveOld(oldStream.response);
    await oldRun;
    newStream.source.enqueue(encoder.encode('data: {"token":"new"}\n\n'));
    await vi.waitFor(() => expect(newOptions.onToken).toHaveBeenCalledWith('new'));
    controller.abort();
    await newRun;
    expect(oldOptions.onToken).not.toHaveBeenCalled();
    expect(oldOptions.onComplete).not.toHaveBeenCalled();
    expect(oldStream.cancel).toHaveBeenCalledTimes(1);
    expect(newOptions.onStatusChange).toHaveBeenLastCalledWith('interrupted');
  });

  it('reports one timeout error without subsequently reporting completion or interruption', async () => {
    vi.useFakeTimers();
    const stream = streamResponse();
    const opts = { ...options(), timeoutMs: 25 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(stream.response));
    const running = new SseStreamController().startStream('/synthetic', { message: 'test' }, opts);
    await vi.advanceTimersByTimeAsync(26);
    await running;
    expect(opts.onError).toHaveBeenCalledTimes(1);
    expect(opts.onStatusChange).toHaveBeenLastCalledWith('error');
    expect(opts.onComplete).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('treats an error event as failure rather than successful completion', async () => {
    const stream = streamResponse();
    const opts = options();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(stream.response));
    stream.source.enqueue(encoder.encode('data: {"error":"model offline"}\n\n'));
    await new SseStreamController().startStream('/synthetic', { message: 'test' }, opts);
    expect(opts.onError).toHaveBeenCalledWith(new Error('model offline'));
    expect(opts.onComplete).not.toHaveBeenCalled();
  });
});
