/**
 * Unit test for Roadmap Milestone Skills Integration
 * Phụ trách: Đặng Long Nhật (torikun2005@gmail.com)
 * Module: Advisor & Core Roadmap
 */

import { MOCK_ROADMAP } from "../../src/services/mockData";

describe("Roadmap Milestone Skills Verification Tests", () => {
  it("should have milestone_skills defined for every semester stage", () => {
    expect(MOCK_ROADMAP.semesters.length).toBeGreaterThanOrEqual(3);
    MOCK_ROADMAP.semesters.forEach((sem, idx) => {
      expect(sem.milestone_skills).toBeDefined();
      expect(Array.isArray(sem.milestone_skills)).toBe(true);
      expect(sem.milestone_skills!.length).toBeGreaterThan(0);
    });
  });

  it("should have target_skills defined for each recommended course", () => {
    MOCK_ROADMAP.semesters.forEach((sem) => {
      sem.recommended_courses.forEach((course) => {
        expect(course.target_skills).toBeDefined();
        expect(Array.isArray(course.target_skills)).toBe(true);
        expect(course.target_skills!.length).toBeGreaterThan(0);
      });
    });
  });

  it("should cover core specialized skills across all stages", () => {
    const allSemesterSkills = MOCK_ROADMAP.semesters.flatMap((s) => s.milestone_skills || []);
    expect(allSemesterSkills).toContain("Deep Learning");
    expect(allSemesterSkills).toContain("PyTorch");
    expect(allSemesterSkills).toContain("SQL");
    expect(allSemesterSkills).toContain("NLP");
    expect(allSemesterSkills).toContain("Docker");
    expect(allSemesterSkills).toContain("System Design");
  });

  it("should maintain valid readiness score and milestone count", () => {
    expect(MOCK_ROADMAP.readiness_score).toBeGreaterThan(0);
    expect(MOCK_ROADMAP.readiness_score).toBeLessThanOrEqual(100);
    expect(MOCK_ROADMAP.total_milestones).toBe(MOCK_ROADMAP.semesters.length);
  });
});
