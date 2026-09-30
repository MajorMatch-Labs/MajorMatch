/**
 * Interactive Radar Tooltip Component with Dynamic Delta Badges
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
 */

import React from 'react';
import { RadarCustomTooltipProps } from '../types/radarTypes';
import { RADAR_THEME_TOKENS } from '../constants/radarConfig';

export const RadarTooltip: React.FC<RadarCustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const pointData = payload[0].payload;
  const statusMeta =
    pointData.status === 'surplus'
      ? RADAR_THEME_TOKENS.DELTA_STATUS_COLORS.SURPLUS
      : pointData.status === 'gap'
      ? RADAR_THEME_TOKENS.DELTA_STATUS_COLORS.GAP
      : RADAR_THEME_TOKENS.DELTA_STATUS_COLORS.MATCH;

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px] z-50">
      <div className="font-semibold text-slate-100 border-b border-slate-800 pb-1.5 flex items-center justify-between">
        <span>{pointData.axis}</span>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded border font-normal"
          style={{
            color: statusMeta.TEXT,
            backgroundColor: statusMeta.BG,
            borderColor: statusMeta.BORDER,
          }}
        >
          {statusMeta.LABEL}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: RADAR_THEME_TOKENS.USER_SERIES.STROKE_COLOR }}
            />
            <span>Sinh viên hiện tại:</span>
          </div>
          <strong className="font-mono text-indigo-300">
            {pointData['Năng lực sinh viên hiện tại']} / 10
          </strong>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: RADAR_THEME_TOKENS.BENCHMARK_SERIES.STROKE_COLOR }}
            />
            <span>Chuẩn ngành yêu cầu:</span>
          </div>
          <strong className="font-mono text-sky-300">
            {pointData['Chuẩn ngành yêu cầu']} / 10
          </strong>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80 text-[11px]">
          <span className="text-slate-400">Độ lệch năng lực:</span>
          <span
            className="font-mono font-bold"
            style={{ color: statusMeta.TEXT }}
          >
            {pointData.delta > 0 ? `+${pointData.delta}` : pointData.delta}
          </span>
        </div>
      </div>
    </div>
  );
};
