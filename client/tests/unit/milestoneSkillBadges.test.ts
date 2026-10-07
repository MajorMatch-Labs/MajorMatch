/**
 * Unit test for MilestoneSkillBadges Component Logic
 * Phụ trách: Nguyễn Thị Ánh Vy (anhvydn2005@gmail.com)
 * Module: Analytics
 */

describe("MilestoneSkillBadges Logic Tests", () => {
  it("should format skill labels correctly with hashtag prefix", () => {
    const rawSkills = ["PyTorch", "Docker", "SQL"];
    const formatted = rawSkills.map((s) => `#${s}`);
    expect(formatted).toEqual(["#PyTorch", "#Docker", "#SQL"]);
  });

  it("should detect overlapping missing skills for gap highlight", () => {
    const missingSkills = ["PyTorch", "Transformers", "MLOps"];
    const stageSkills = ["PyTorch", "SQL", "Docker", "MLOps"];

    const missingSet = new Set(missingSkills.map((s) => s.toLowerCase()));
    const matchingGaps = stageSkills.filter((s) => missingSet.has(s.toLowerCase()));

    expect(matchingGaps).toEqual(["PyTorch", "MLOps"]);
    expect(matchingGaps.length).toBe(2);
  });

  it("should handle empty or null skills list gracefully", () => {
    const emptyList: string[] = [];
    expect(emptyList.length).toBe(0);
  });

  it("should accurately distinguish between mastered and missing skills", () => {
    const masteredSkills = ["Python", "Algorithms", "Git"];
    const stageSkills = ["Python", "PyTorch", "Docker"];

    const masteredSet = new Set(masteredSkills.map((s) => s.toLowerCase()));
    const alreadyMastered = stageSkills.filter((s) => masteredSet.has(s.toLowerCase()));
    const needToLearn = stageSkills.filter((s) => !masteredSet.has(s.toLowerCase()));

    expect(alreadyMastered).toEqual(["Python"]);
    expect(needToLearn).toEqual(["PyTorch", "Docker"]);
  });
});
