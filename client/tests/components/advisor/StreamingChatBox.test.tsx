// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StreamingChatBox } from '@/components/chat/StreamingChatBox';
import { useProfileStore } from '@/stores/useProfileStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { StreamChatHandlerOptions } from '@/modules/advisor/types/sseTypes';

const mock = vi.hoisted(() => ({
  history: vi.fn(), sessions: vi.fn(), health: vi.fn(), save: vi.fn(),
  attempts: [] as StreamChatHandlerOptions[], abort: vi.fn(),
}));
vi.mock('@/services/api', () => ({ ApiService: {
  getChatHistory: mock.history, getChatSessions: mock.sessions,
  checkHealth: mock.health, saveChatMessage: mock.save,
} }));
vi.mock('@/modules/advisor/services/sseStreamController', () => ({
  SseStreamController: class {
    abort = mock.abort;
    async startStream(_url: string, _payload: unknown, options: StreamChatHandlerOptions) {
      mock.attempts.push(options);
      options.onStatusChange?.('streaming');
    }
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mock.attempts.length = 0;
  mock.history.mockResolvedValue([]);
  mock.sessions.mockResolvedValue([]);
  mock.health.mockResolvedValue({ private_compute_node: { ollama_status: 'online' } });
  mock.save.mockResolvedValue(true);
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  useProfileStore.getState().resetAll();
  useAuthStore.setState({ user: { id: 'test-a', studentId: 'TEST-A', name: 'Synthetic A', email: 'a@example.test' }, isAuthenticated: true });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

async function sendMessage() {
  const input = screen.getByPlaceholderText('Nhắn tin cho Cố vấn AI MajorMatch...') as HTMLInputElement;
  await waitFor(() => expect(input.disabled).toBe(false));
  fireEvent.change(input, { target: { value: 'Synthetic question' } });
  fireEvent.click(screen.getByTitle('Gửi tin nhắn'));
  expect(mock.attempts).toHaveLength(1);
  return mock.attempts[0];
}

describe('Advisor conversation ownership', () => {
  it('ignores late tokens and completion after Stop, retaining partial output', async () => {
    render(<StreamingChatBox />);
    const old = await sendMessage();
    act(() => old.onToken('Partial answer'));
    fireEvent.click(screen.getByTitle('Dừng sinh phản hồi'));
    act(() => { old.onToken('STALE'); old.onComplete?.(); });
    expect(screen.getByText('Partial answer')).toBeTruthy();
    expect(screen.queryByText(/STALE/)).toBeNull();
    expect(mock.save.mock.calls.filter((call) => call[1] === 'assistant')).toHaveLength(0);
    expect(screen.getByRole('status').textContent).toContain('đã dừng');
    expect(mock.abort).toHaveBeenCalled();
  });

  it('rejects callbacks from the previous learner after an account change', async () => {
    render(<StreamingChatBox />);
    const old = await sendMessage();
    act(() => useAuthStore.setState({ user: { id: 'test-b', studentId: 'TEST-B', name: 'Synthetic B', email: 'b@example.test' } }));
    await waitFor(() => expect(mock.history).toHaveBeenCalledWith('TEST-B', 'default'));
    act(() => { old.onToken('OLD LEARNER CONTENT'); old.onComplete?.(); old.onError?.(new Error('old error')); });
    expect(screen.queryByText(/OLD LEARNER/)).toBeNull();
    expect(mock.save.mock.calls.filter((call) => call[1] === 'assistant')).toHaveLength(0);
  });

  it('rejects callbacks when academic evidence changes even if the major is unchanged', async () => {
    render(<StreamingChatBox />);
    const old = await sendMessage();
    await act(async () => useProfileStore.setState({ profile: { student_id: 'TEST-A', cumulative_gpa: 3.4, total_credits: 3, courses: [], detected_skills: ['New evidence'] } }));
    act(() => { old.onToken('OUTDATED EVIDENCE'); old.onComplete?.(); });
    expect(screen.queryByText(/OUTDATED EVIDENCE/)).toBeNull();
    expect(mock.save.mock.calls.filter((call) => call[1] === 'assistant')).toHaveLength(0);
  });

  it('rejects the previous major response after switching the selected major', async () => {
    useProfileStore.setState({ selectedMajor: { major_id: 'A', major_name: 'Synthetic Cloud', rank: 1, match_percentage: 60 } });
    render(<StreamingChatBox />);
    const old = await sendMessage();
    await act(async () => useProfileStore.setState({ selectedMajor: { major_id: 'B', major_name: 'Synthetic Data', rank: 2, match_percentage: 50 } }));
    act(() => { old.onToken('OLD MAJOR RESPONSE'); old.onComplete?.(); });
    expect(screen.queryByText(/OLD MAJOR RESPONSE/)).toBeNull();
    expect(mock.save.mock.calls.filter((call) => call[1] === 'assistant')).toHaveLength(0);
  });

  it('does not let late history for the previous session overwrite the current session', async () => {
    let resolveOld!: (messages: { role: string; content: string }[]) => void;
    mock.history.mockImplementation((_student: string, session: string) => session === 'default'
      ? new Promise((resolve) => { resolveOld = resolve; })
      : Promise.resolve([{ role: 'assistant', content: 'Current session history' }]));
    render(<StreamingChatBox />);
    fireEvent.click(screen.getByRole('button', { name: 'Cuộc trò chuyện mới' }));
    await screen.findByText('Current session history');
    await act(async () => resolveOld([{ role: 'assistant', content: 'OLD HISTORY' }]));
    expect(screen.queryByText('OLD HISTORY')).toBeNull();
    expect(screen.getByText('Current session history')).toBeTruthy();
  });

  it('keeps a real stream failure visible without claiming an offline success', async () => {
    render(<StreamingChatBox />);
    const attempt = await sendMessage();
    act(() => attempt.onError?.(new Error('model unavailable')));
    expect(screen.getByRole('alert').textContent).toContain('Vui lòng thử lại');
    expect(screen.queryByText(/Đã kích hoạt phản hồi ngoại tuyến/)).toBeNull();
  });

  it('aborts on unmount and rejects late persistence callbacks', async () => {
    const view = render(<StreamingChatBox />);
    const attempt = await sendMessage();
    view.unmount();
    act(() => { attempt.onToken('after unmount'); attempt.onComplete?.(); });
    expect(mock.abort).toHaveBeenCalled();
    expect(mock.save.mock.calls.filter((call) => call[1] === 'assistant')).toHaveLength(0);
  });
});
