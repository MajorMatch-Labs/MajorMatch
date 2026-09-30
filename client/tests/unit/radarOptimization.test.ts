/**
 * Unit Test Suite: Analytics Radar Transformation & Metrics Optimization
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
 */

import { RadarTransformer } from '../../src/modules/analytics/utils/radarTransformer';
import { RadarAxisItem, SkillBreakdown } from '../../src/types/api';

describe('Analytics Module - Radar Transformer & Metrics', () => {
  const sampleAxes: RadarAxisItem[] = [
    { axis_name: 'Toán & Thuật toán', user_score: 8.5, benchmark_score: 7.0 }, // delta +1.5 -> surplus
    { axis_name: 'Lập trình hệ thống', user_score: 7.0, benchmark_score: 7.2 }, // delta -0.2 -> match
    { axis_name: 'Trí tuệ nhân tạo', user_score: 5.0, benchmark_score: 8.0 },   // delta -3.0 -> gap
  ];

  it('chuyển đổi chính xác dữ liệu từ Backend sang cấu trúc Recharts và phân loại status', () => {
    const points = RadarTransformer.transform(sampleAxes);

    expect(points).toHaveLength(3);

    // Trục 1: Vượt trội (Surplus)
    expect(points[0].axis).toBe('Toán & Thuật toán');
    expect(points[0]['Năng lực sinh viên hiện tại']).toBe(8.5);
    expect(points[0]['Chuẩn ngành yêu cầu']).toBe(7.0);
    expect(points[0].delta).toBe(1.5);
    expect(points[0].status).toBe('surplus');

    // Trục 2: Đạt chuẩn (Match)
    expect(points[1].delta).toBe(-0.2);
    expect(points[1].status).toBe('match');

    // Trục 3: Thiếu hụt (Gap)
    expect(points[2].delta).toBe(-3.0);
    expect(points[2].status).toBe('gap');
  });

  it('xử lý an toàn khi mảng trục rỗng hoặc undefined', () => {
    expect(RadarTransformer.transform([])).toEqual([]);
    expect(RadarTransformer.transform(undefined)).toEqual([]);
  });

  it('tính toán chỉ số sẵn sàng nghề nghiệp (summarizeReadiness) chuẩn xác', () => {
    const summary = RadarTransformer.summarizeReadiness(sampleAxes);

    expect(summary.averageUserScore).toBe(6.8); // (8.5 + 7.0 + 5.0) / 3 = 6.83 -> 6.8
    expect(summary.averageBenchmarkScore).toBe(7.4); // (7.0 + 7.2 + 8.0) / 3 = 7.4
    expect(summary.strongAxesCount).toBe(1); // Chỉ có trục 1 >= benchmark
    expect(summary.gapAxesCount).toBe(1); // Chỉ có trục 3 thiếu > 1.0 điểm
    expect(summary.fitPercentage).toBeGreaterThan(0);
    expect(summary.fitPercentage).toBeLessThanOrEqual(100);
  });

  it('phân tích cấu trúc khoảng cách kỹ năng (SkillBreakdown) chính xác', () => {
    const mockSkillBreakdown: SkillBreakdown = {
      mastered_skills: ['Python', 'SQL', 'Git'],
      developing_skills: ['Docker', 'FastAPI'],
      missing_skills: ['Kubernetes', 'CI/CD Pipelines', 'Kafka', 'Terraform'],
    };

    const metrics = RadarTransformer.analyzeSkillGap(mockSkillBreakdown);

    expect(metrics.totalSkills).toBe(9);
    expect(metrics.masteredCount).toBe(3);
    expect(metrics.developingCount).toBe(2);
    expect(metrics.missingCount).toBe(4);
    expect(metrics.masteredPercentage).toBe(33); // 3/9 = 33%
    expect(metrics.gapPercentage).toBe(44);      // 4/9 = 44%
  });
});
