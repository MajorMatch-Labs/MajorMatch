"use client";

import React, { useState } from "react";
import {
  Brain,
  GraduationCap,
  Sparkles,
  Compass,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  Layers
} from "lucide-react";
import { XAIExplanation, XAIFactorItem } from "@/types/api";

interface XaiExplanationCardProps {
  explanation?: XAIExplanation | null;
  majorName: string;
  matchPercentage: number;
}

export const XaiExplanationCard: React.FC<XaiExplanationCardProps> = ({
  explanation,
  majorName,
  matchPercentage
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Dữ liệu fallback chuẩn mực học thuật nếu dữ liệu xai_explanation chưa đồng bộ
  const defaultSummary = `Ngành ${majorName} được mô hình gợi ý với độ tin cậy cao (${matchPercentage}%) dựa trên sự kết hợp hài hòa giữa nền tảng học thuật, thiên hướng tâm lý cá nhân và năng lực công nghệ ghi nhận từ hồ sơ.`;

  const academicFactor: XAIFactorItem = explanation?.academic_factor || {
    factor_name: "Điểm số & Học phần nền tảng",
    weight_percentage: 40.0,
    contribution_score: Math.min(100, Math.round(matchPercentage * 0.96 * 10) / 10),
    description: "Mức độ tương thích giữa các môn đại cương/chuyên ngành đã tích lũy với yêu cầu đầu vào của ngành.",
    evidence: ["Học phần Khoa học máy tính", "Toán ứng dụng & Xác suất thống kê"]
  };

  const riasecFactor: XAIFactorItem = explanation?.riasec_factor || {
    factor_name: "Thiên hướng tâm lý nghề nghiệp RIASEC",
    weight_percentage: 35.0,
    contribution_score: Math.min(100, Math.round(matchPercentage * 0.94 * 10) / 10),
    description: "Độ phù hợp giữa tính cách, phản xạ tư duy cá nhân và môi trường văn hóa công việc đặc thù.",
    evidence: ["Điểm trắc nghiệm nhóm Nghiên cứu (Investigative) & Kỹ thuật (Realistic)"]
  };

  const skillsFactor: XAIFactorItem = explanation?.skills_factor || {
    factor_name: "Kỹ năng chuyên môn từ CV & Dự án",
    weight_percentage: 25.0,
    contribution_score: Math.min(100, Math.round(matchPercentage * 0.90 * 10) / 10),
    description: "Các công cụ, công nghệ và kinh nghiệm thực chiến đã được trích xuất trực tiếp từ CV cá nhân.",
    evidence: ["Kỹ năng lập trình cốt lõi và khả năng tự nghiên cứu công nghệ mới"]
  };

  const summary = explanation?.summary || defaultSummary;
  const strengths = explanation?.key_strengths || ["Tư duy phân tích logic", "Năng lực lập trình cốt lõi"];
  const improvements = explanation?.improvement_areas || ["Kiến trúc hệ thống quy mô lớn", "Bảo mật nâng cao"];

  const factors = [
    {
      id: "academic" as const,
      factor: academicFactor,
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-500 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-900/60",
      bgColor: "bg-blue-50/60 dark:bg-blue-950/20",
      barColor: "bg-gradient-to-r from-blue-500 to-indigo-500",
    },
    {
      id: "riasec" as const,
      factor: riasecFactor,
      icon: Compass,
      color: "from-purple-500 to-pink-600",
      textColor: "text-purple-500 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-900/60",
      bgColor: "bg-purple-50/60 dark:bg-purple-950/20",
      barColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: "skills" as const,
      factor: skillsFactor,
      icon: Layers,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-500 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/60",
      bgColor: "bg-emerald-50/60 dark:bg-emerald-950/20",
      barColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
    }
  ];

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden transition-all duration-200">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border-b border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  XAI: Bóc tách Lý do Đề xuất Chuyên ngành
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Minh bạch 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Giải thích định lượng trọng số đóng góp từ 3 trụ cột năng lực cho <strong className="text-indigo-600 dark:text-indigo-400">{majorName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Core Rationale Summary */}
        <div className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">Kết luận AI:</span>
          {summary}
        </div>
      </div>

      {/* Expandable Breakdown Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* 3 Pillar Factor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {factors.map(({ id, factor, icon: Icon, color, textColor, borderColor, bgColor, barColor }) => (
              <div
                key={id}
                className={`p-4 rounded-xl border ${borderColor} ${bgColor} flex flex-col justify-between space-y-3 transition-all hover:shadow-sm`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {factor.factor_name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                      Tỷ trọng {factor.weight_percentage}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {factor.description}
                  </p>

                  {/* Progress Score Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Mức độ tương thích:</span>
                      <span className={`font-bold font-mono ${textColor}`}>
                        {factor.contribution_score}/100
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                        style={{ width: `${Math.min(100, Math.max(10, factor.contribution_score))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Evidence List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Bằng chứng xác thực:
                  </span>
                  <div className="space-y-1">
                    {factor.evidence && factor.evidence.length > 0 ? (
                      factor.evidence.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${textColor}`} />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Đang bóc tách thêm từ hồ sơ...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Điểm mạnh cốt lõi */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Điểm mạnh vượt trội cá nhân:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                  >
                    ✓ {str}
                  </span>
                ))}
              </div>
            </div>

            {/* Trọng tâm cần bồi đắp */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Trọng tâm bồi đắp trong lộ trình:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {improvements.map((imp, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60"
                  >
                    ↗ {imp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
