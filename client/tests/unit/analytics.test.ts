/**
 * Unit Test for Analytics Radar Transformer & Skill Gap Metrics
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
 * Module: Analytics & Decision Visualization
 * Tuan 8 - Chuong 8: AI trong Kiem thu Phan mem (Testing & Automation)
 */

import { describe, it, expect } from "vitest";
import { RadarTransformer } from "../../src/modules/analytics/utils/radarTransformer";
import { RadarAxisItem, SkillBreakdown } from "../../src/types/api";

describe("Unit Test: Analytics RadarTransformer & Metrics", () => {
  describe("RadarTransformer.transform()", () => {
    it("should return empty array when input is empty or null", () => {
      expect(RadarTransformer.transform([])).toEqual([]);
      expect(RadarTransformer.transform(undefined as any)).toEqual([]);
    });

    it("should correctly map raw axis items to Recharts radar points", () => {
      const mockAxes: RadarAxisItem[] = [
        { axis_name: "Toán & Thống kê", user_score: 8.5, benchmark_score: 7.0 },
        { axis_name: "Học máy & AI", user_score: 6.0, benchmark_score: 9.0 },
        { axis_name: "Cơ sở dữ liệu", user_score: 7.0, benchmark_score: 7.2 },
      ];

      const points = RadarTransformer.transform(mockAxes);
      expect(points.length).toBe(3);

      // Trục 1: 8.5 vs 7.0 -> delta +1.5 -> surplus
      expect(points[0].axis).toBe("Toán & Thống kê");
      expect(points[0]["Năng lực sinh viên hiện tại"]).toBe(8.5);
      expect(points[0]["Chuẩn ngành yêu cầu"]).toBe(7.0);
      expect(points[0].delta).toBe(1.5);
      expect(points[0].status).toBe("surplus");

      // Trục 2: 6.0 vs 9.0 -> delta -3.0 -> gap
      expect(points[1].delta).toBe(-3.0);
      expect(points[1].status).toBe("gap");

      // Trục 3: 7.0 vs 7.2 -> delta -0.2 -> match (trong khoảng [-0.5, 0.5])
      expect(points[2].delta).toBe(-0.2);
      expect(points[2].status).toBe("match");
    });
  });

  describe("RadarTransformer.summarizeReadiness()", () => {
    it("should handle empty or null axes safely without NaN", () => {
      const summary = RadarTransformer.summarizeReadiness([]);
      expect(summary.averageUserScore).toBe(0);
      expect(summary.averageBenchmarkScore).toBe(0);
      expect(summary.fitPercentage).toBe(0);
      expect(summary.strongAxesCount).toBe(0);
      expect(summary.gapAxesCount).toBe(0);
    });

    it("should accurately compute average scores, fit percentage and gap counts", () => {
      const mockAxes: RadarAxisItem[] = [
        { axis_name: "Toán", user_score: 8.0, benchmark_score: 8.0 }, // strong (u >= b)
        { axis_name: "Lập trình", user_score: 9.0, benchmark_score: 8.0 }, // strong (u >= b)
        { axis_name: "ML", user_score: 5.0, benchmark_score: 8.0 }, // gap (b - u = 3.0 > 1.0)
        { axis_name: "DevOps", user_score: 6.0, benchmark_score: 8.0 }, // gap (b - u = 2.0 > 1.0)
      ];

      const summary = RadarTransformer.summarizeReadiness(mockAxes);
      expect(summary.averageUserScore).toBe(7.0); // (8 + 9 + 5 + 6) / 4 = 7.0
      expect(summary.averageBenchmarkScore).toBe(8.0);
      expect(summary.fitPercentage).toBe(88); // round((7.0 / 8.0) * 100) = 88%
      expect(summary.strongAxesCount).toBe(2);
      expect(summary.gapAxesCount).toBe(2);
    });
  });

  describe("RadarTransformer.analyzeSkillGap()", () => {
    it("should handle null or empty skill breakdown gracefully", () => {
      const metrics = RadarTransformer.analyzeSkillGap(null);
      expect(metrics.totalSkills).toBe(0);
      expect(metrics.masteredCount).toBe(0);
      expect(metrics.developingCount).toBe(0);
      expect(metrics.missingCount).toBe(0);
      expect(metrics.masteredPercentage).toBe(0);
      expect(metrics.gapPercentage).toBe(0);
    });

    it("should accurately calculate skill breakdown distribution percentages", () => {
      const mockSkillGap: SkillBreakdown = {
        mastered_skills: ["Python", "SQL", "Git"], // 3
        developing_skills: ["Docker", "FastAPI"], // 2
        missing_skills: ["Kubernetes", "PyTorch", "Spark", "Transformers", "Kafka"], // 5
      };

      const metrics = RadarTransformer.analyzeSkillGap(mockSkillGap);
      expect(metrics.totalSkills).toBe(10);
      expect(metrics.masteredCount).toBe(3);
      expect(metrics.developingCount).toBe(2);
      expect(metrics.missingCount).toBe(5);
      expect(metrics.masteredPercentage).toBe(30); // 3 / 10 = 30%
      expect(metrics.gapPercentage).toBe(50); // 5 / 10 = 50%
    });
  });
});
