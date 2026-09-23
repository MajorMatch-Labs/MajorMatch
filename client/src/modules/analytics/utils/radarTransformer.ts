/**
 * Radar & Skill Gap Data Transformer
 * Phụ trách: ÁNH VY (Module Analytics)
 * Đặc tả giáo trình: Chương 5 - Architecture & API Consumer (Data Transformation Layer for Recharts)
 */

import { RadarAxisItem, SkillBreakdown } from "@/types/api";

export interface RechartsRadarPoint {
  axis: string;
  "Năng lực sinh viên hiện tại": number;
  "Chuẩn ngành yêu cầu": number;
  fullMark: number;
  delta: number;
  status: "surplus" | "match" | "gap";
}

export interface SkillGapMetrics {
  totalSkills: number;
  masteredCount: number;
  developingCount: number;
  missingCount: number;
  masteredPercentage: number;
  gapPercentage: number;
}

export interface RadarReadinessSummary {
  averageUserScore: number;
  averageBenchmarkScore: number;
  fitPercentage: number;
  strongAxesCount: number;
  gapAxesCount: number;
}

export class RadarTransformer {
  /**
   * Chuyển đổi dữ liệu thô từ API backend (RadarAxisItem[]) sang cấu trúc chuẩn của Recharts Radar
   */
  static transform(rawAxes: RadarAxisItem[] = []): RechartsRadarPoint[] {
    if (!rawAxes || rawAxes.length === 0) {
      return [];
    }

    return rawAxes.map((item) => {
      const axisTitle = item.axis_name || item.axis || "Trục năng lực";
      const user = Number(item.user_score?.toFixed(1)) || 0;
      const benchmark = Number(item.benchmark_score?.toFixed(1)) || 0;
      const delta = Number((user - benchmark).toFixed(1));

      let status: "surplus" | "match" | "gap" = "match";
      if (delta > 0.5) status = "surplus";
      else if (delta < -0.5) status = "gap";

      return {
        axis: axisTitle,
        "Năng lực sinh viên hiện tại": user,
        "Chuẩn ngành yêu cầu": benchmark,
        fullMark: 10,
        delta,
        status
      };
    });
  }

  /**
   * Tính toán chỉ số tổng hợp về mức độ sẵn sàng nghề nghiệp từ các trục Radar
   */
  static summarizeReadiness(rawAxes: RadarAxisItem[] = []): RadarReadinessSummary {
    if (!rawAxes || rawAxes.length === 0) {
      return {
        averageUserScore: 0,
        averageBenchmarkScore: 0,
        fitPercentage: 0,
        strongAxesCount: 0,
        gapAxesCount: 0
      };
    }

    let totalUser = 0;
    let totalBench = 0;
    let strongCount = 0;
    let gapCount = 0;

    rawAxes.forEach((axis) => {
      const u = axis.user_score || 0;
      const b = axis.benchmark_score || 0;
      totalUser += u;
      totalBench += b;

      if (u >= b) strongCount++;
      else if (b - u > 1.0) gapCount++;
    });

    const avgUser = totalUser / rawAxes.length;
    const avgBench = totalBench / rawAxes.length;
    const fitPct = avgBench > 0 ? Math.min(100, Math.round((avgUser / avgBench) * 100)) : 0;

    return {
      averageUserScore: Number(avgUser.toFixed(1)),
      averageBenchmarkScore: Number(avgBench.toFixed(1)),
      fitPercentage: fitPct,
      strongAxesCount: strongCount,
      gapAxesCount: gapCount
    };
  }

  /**
   * Tính toán tỷ lệ phần trăm phân bố kỹ năng trong SkillBreakdown
   */
  static analyzeSkillGap(skillGap?: SkillBreakdown | null): SkillGapMetrics {
    const mastered = skillGap?.mastered_skills?.length || 0;
    const developing = skillGap?.developing_skills?.length || 0;
    const missing = skillGap?.missing_skills?.length || 0;
    const total = mastered + developing + missing;

    const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    const gapPct = total > 0 ? Math.round((missing / total) * 100) : 0;

    return {
      totalSkills: total,
      masteredCount: mastered,
      developingCount: developing,
      missingCount: missing,
      masteredPercentage: masteredPct,
      gapPercentage: gapPct
    };
  }
}
