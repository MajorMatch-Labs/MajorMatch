/**
 * Unit test for Curriculum Skill Mapper
 * Phụ trách: Nguyễn Văn Hoàng (hoangtungmy123@gmail.com)
 * Module: Ingestion
 */

import { getSkillsForCourse, categorizeSkill, CURRICULUM_SKILL_CATALOG } from "../../src/modules/ingestion/utils/curriculumSkillMapper";

describe("Curriculum Skill Mapper Unit Tests", () => {
  it("should extract correct skills for foundation courses", () => {
    const mathSkills = getSkillsForCourse("MATH101");
    expect(mathSkills).toContain("Linear Algebra");
    expect(mathSkills).toContain("Probability & Statistics");

    const cs101Skills = getSkillsForCourse("CS101");
    expect(cs101Skills).toContain("Python");
    expect(cs101Skills).toContain("Algorithms");
  });

  it("should extract correct skills for specialized milestone courses", () => {
    const dlSkills = getSkillsForCourse("CS402");
    expect(dlSkills).toContain("Deep Learning");
    expect(dlSkills).toContain("PyTorch");

    const nlpSkills = getSkillsForCourse("CS415");
    expect(nlpSkills).toContain("NLP");
    expect(nlpSkills).toContain("Transformers");

    const mlopsSkills = getSkillsForCourse("CS420");
    expect(mlopsSkills).toContain("Docker");
    expect(mlopsSkills).toContain("MLOps");
  });

  it("should handle lowercase and whitespace in course codes gracefully", () => {
    const skills = getSkillsForCourse("  cs402  ");
    expect(skills).toContain("Deep Learning");
  });

  it("should return empty array for unknown course codes without throwing", () => {
    const skills = getSkillsForCourse("UNKNOWN999");
    expect(skills).toEqual([]);
  });

  it("should properly categorize skills by domain", () => {
    expect(categorizeSkill("Deep Learning")).toBe("ai");
    expect(categorizeSkill("NLP & LLM")).toBe("ai");
    expect(categorizeSkill("SQL Database")).toBe("data");
    expect(categorizeSkill("Docker & Kubernetes")).toBe("infra");
    expect(categorizeSkill("Discrete Math")).toBe("foundation");
    expect(categorizeSkill("Git Version Control")).toBe("software");
  });

  it("should cover all defined courses in curriculum catalog", () => {
    const courseCodes = Object.keys(CURRICULUM_SKILL_CATALOG);
    expect(courseCodes.length).toBeGreaterThanOrEqual(10);
    courseCodes.forEach((code) => {
      const entry = CURRICULUM_SKILL_CATALOG[code];
      expect(entry.skills.length).toBeGreaterThan(0);
      expect(entry.course_name).toBeTruthy();
    });
  });
});
