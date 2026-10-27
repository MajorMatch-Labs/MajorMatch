// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RadarAxisItem } from '@/types/api';
import { RadarComparison } from '@/components/analysis/RadarComparison';

const chart = vi.hoisted(() => ({ radar: vi.fn() }));
// Verify our data/animation boundary, not Recharts layout in a simulated DOM.
vi.mock('recharts', () => {
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Container, RadarChart: Container,
    Radar: (props: { isAnimationActive: boolean }) => { chart.radar(props); return null; },
    PolarGrid: () => null, PolarAngleAxis: () => null, PolarRadiusAxis: () => null,
    Tooltip: () => null, Legend: () => null,
  };
});

let motion: MediaQueryList;
let motionListener: (() => void) | undefined;
beforeEach(() => {
  chart.radar.mockClear();
  motionListener = undefined;
  motion = {
    matches: false, media: '(prefers-reduced-motion: reduce)', onchange: null,
    addEventListener: vi.fn((_event, listener: () => void) => { motionListener = listener; }),
    removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
  vi.stubGlobal('matchMedia', vi.fn(() => motion));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Analytics radar component', () => {
  const valid = [{ axis_name: 'Lập trình', user_score: 0, benchmark_score: 7 }];

  it('announces an empty dataset without inventing a table or scores', () => {
    render(<RadarComparison data={[]} majorName="Cloud" />);
    expect(screen.getByRole('status').textContent).toContain('Chưa có dữ liệu');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('provides an accessible numeric alternative, preserving a genuine zero', () => {
    render(<RadarComparison data={valid} majorName="Cloud" />);
    const table = screen.getByRole('table', { name: /So sánh năng lực — Cloud/ });
    const row = within(table).getByRole('row', { name: /Lập trình/ });
    expect(within(row).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['0', '7', '-7']);
  });

  it('discloses partial evidence and excludes invalid rows from the table', () => {
    const partial = [...valid, { axis_name: 'Thiếu', user_score: null, benchmark_score: 8 }] as unknown as RadarAxisItem[];
    render(<RadarComparison data={partial} majorName="Cloud" />);
    expect(screen.getByRole('status').textContent).toContain('1 trục');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
    expect(screen.queryByRole('rowheader', { name: 'Thiếu' })).toBeNull();
  });

  it('replaces the table when switching major, with no stale rows or warning', () => {
    const partial = [...valid, { axis_name: 'Invalid', user_score: NaN, benchmark_score: 8 }];
    const view = render(<RadarComparison data={partial} majorName="Cloud" />);
    view.rerender(<RadarComparison data={[{ axis_name: 'Thống kê', user_score: 8, benchmark_score: 6 }]} majorName="Data" />);
    const table = screen.getByRole('table', { name: /So sánh năng lực — Data/ });
    expect(within(table).getByRole('rowheader', { name: 'Thống kê' })).toBeTruthy();
    expect(screen.queryByRole('rowheader', { name: 'Lập trình' })).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('reacts to reduced motion changes and removes the listener on unmount', () => {
    const view = render(<RadarComparison data={valid} majorName="Cloud" />);
    expect(chart.radar.mock.calls.slice(-2).every(([props]) => props.isAnimationActive)).toBe(true);
    act(() => { Object.defineProperty(motion, 'matches', { value: true }); motionListener?.(); });
    expect(chart.radar.mock.calls.slice(-2).every(([props]) => !props.isAnimationActive)).toBe(true);
    view.unmount();
    expect(motion.removeEventListener).toHaveBeenCalledWith('change', motionListener);
  });
});
