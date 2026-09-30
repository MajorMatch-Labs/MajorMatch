"use client";

import React, { memo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { RadarAxisItem } from "@/types/api";
import { useRadarMetrics } from "@/modules/analytics/hooks/useRadarMetrics";
import { RadarTooltip } from "@/modules/analytics/components/RadarTooltip";
import {
  RADAR_ANIMATION_CONFIG,
  RADAR_THEME_TOKENS,
} from "@/modules/analytics/constants/radarConfig";

interface RadarComparisonProps {
  data: RadarAxisItem[];
  majorName: string;
}

const BaseRadarComparison: React.FC<RadarComparisonProps> = ({ data, majorName }) => {
  // Toi uu hoa memoization qua custom hook useRadarMetrics
  const { transformedData, hasValidData } = useRadarMetrics(data);

  if (!hasValidData || transformedData.length === 0) {
    return (
      <div className="w-full h-[360px] flex items-center justify-center text-slate-500 text-xs italic">
        Chưa có dữ liệu trục năng lực cho chuyên ngành {majorName}
      </div>
    );
  }

  return (
    <div className="w-full h-[360px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={transformedData}>
          <PolarGrid
            stroke={RADAR_THEME_TOKENS.AXIS_GRID.STROKE_COLOR}
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: RADAR_THEME_TOKENS.AXIS_GRID.TEXT_COLOR,
              fontSize: RADAR_THEME_TOKENS.AXIS_GRID.FONT_SIZE,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            stroke={RADAR_THEME_TOKENS.AXIS_GRID.TICK_LINE_COLOR}
            tick={{ fill: "#64748b", fontSize: 9 }}
          />

          {/* Lớp 1: Chuẩn ngành yêu cầu */}
          <Radar
            name={RADAR_THEME_TOKENS.BENCHMARK_SERIES.NAME}
            dataKey="Chuẩn ngành yêu cầu"
            stroke={RADAR_THEME_TOKENS.BENCHMARK_SERIES.STROKE_COLOR}
            strokeWidth={RADAR_THEME_TOKENS.BENCHMARK_SERIES.STROKE_WIDTH}
            strokeDasharray="4 4"
            fill={RADAR_THEME_TOKENS.BENCHMARK_SERIES.FILL_COLOR}
            fillOpacity={RADAR_THEME_TOKENS.BENCHMARK_SERIES.FILL_OPACITY}
            isAnimationActive={RADAR_ANIMATION_CONFIG.IS_ANIMATION_ACTIVE}
            animationDuration={RADAR_ANIMATION_CONFIG.ANIMATION_DURATION_MS}
            animationEasing={RADAR_ANIMATION_CONFIG.ANIMATION_EASING}
          />

          {/* Lớp 2: Năng lực sinh viên hiện tại */}
          <Radar
            name={RADAR_THEME_TOKENS.USER_SERIES.NAME}
            dataKey="Năng lực sinh viên hiện tại"
            stroke={RADAR_THEME_TOKENS.USER_SERIES.STROKE_COLOR}
            strokeWidth={RADAR_THEME_TOKENS.USER_SERIES.STROKE_WIDTH}
            fill={RADAR_THEME_TOKENS.USER_SERIES.FILL_COLOR}
            fillOpacity={RADAR_THEME_TOKENS.USER_SERIES.FILL_OPACITY}
            isAnimationActive={RADAR_ANIMATION_CONFIG.IS_ANIMATION_ACTIVE}
            animationDuration={RADAR_ANIMATION_CONFIG.ANIMATION_DURATION_MS}
            animationEasing={RADAR_ANIMATION_CONFIG.ANIMATION_EASING}
          />

          {/* Tooltip tùy chỉnh giàu tính tương tác */}
          <Tooltip content={<RadarTooltip />} />

          <Legend
            wrapperStyle={{
              paddingTop: "12px",
              fontSize: "12px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Custom Props Comparator cho React.memo:
 * Chống re-render thừa nếu danh sách trục và tên ngành không thay đổi
 */
function areRadarPropsEqual(
  prevProps: RadarComparisonProps,
  nextProps: RadarComparisonProps
): boolean {
  if (prevProps.majorName !== nextProps.majorName) return false;
  if (prevProps.data === nextProps.data) return true;
  if (prevProps.data.length !== nextProps.data.length) return false;

  return prevProps.data.every((item, idx) => {
    const nextItem = nextProps.data[idx];
    return (
      item.axis_name === nextItem.axis_name &&
      item.user_score === nextItem.user_score &&
      item.benchmark_score === nextItem.benchmark_score
    );
  });
}

export const RadarComparison = memo(BaseRadarComparison, areRadarPropsEqual);
