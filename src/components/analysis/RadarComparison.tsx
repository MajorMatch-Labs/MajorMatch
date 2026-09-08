"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { RadarAxisItem } from "@/types/api";

interface RadarComparisonProps {
  data: RadarAxisItem[];
  majorName: string;
}

export const RadarComparison: React.FC<RadarComparisonProps> = ({ data, majorName }) => {
  // Chuẩn hóa dữ liệu cho Recharts
  const chartData = data.map((item) => ({
    axis: item.axis,
    "Năng lực hiện tại": item.user_score,
    "Chuẩn ngành yêu cầu": item.benchmark_score,
    fullMark: 10,
  }));

  return (
    <div className="w-full h-[360px] flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            stroke="rgba(255, 255, 255, 0.2)"
            tick={{ fill: "#64748b", fontSize: 9 }}
          />

          {/* Lớp 1: Chuẩn ngành yêu cầu */}
          <Radar
            name="Chuẩn ngành yêu cầu"
            dataKey="Chuẩn ngành yêu cầu"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="#f59e0b"
            fillOpacity={0.12}
          />

          {/* Lớp 2: Năng lực sinh viên hiện tại */}
          <Radar
            name="Năng lực sinh viên hiện tại"
            dataKey="Năng lực hiện tại"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="#6366f1"
            fillOpacity={0.35}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              color: "#fff",
              fontSize: "12px",
            }}
          />
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
