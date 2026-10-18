/**
 * Integration Test for Zustand Global State Store (useProfileStore)
 * Phụ trách: Đặng Long Nhật (torikun2005@gmail.com)
 * Vai trò: Tech Lead / Architecture / Module Advisor
 * Tuần 8 - Chương 8: AI trong Kiểm thử Phần mềm (Testing & Automation)
 */

import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { useProfileStore } from "../../src/stores/useProfileStore";
import { MOCK_ROADMAP, MOCK_SKILL_GAP_ANALYSIS } from "../../src/services/mockData";
import { ProfileData } from "../../src/types/api";

// Cung cấp Polyfill LocalStorage cho môi trường kiểm thử Node.js của Vitest
beforeAll(() => {
  const storage: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
    length: 0,
    key: () => null,
  };
});

describe("Integration Test: useProfileStore Lifecycle and State Sync", () => {
  beforeEach(() => {
    // Reset Zustand store state trước mỗi bài kiểm thử
    useProfileStore.getState().resetAll();
  });

  it("should initialize with empty default state", () => {
    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
    expect(state.uploadedFileName).toBeNull();
    expect(state.analysisResult).toBeNull();
    expect(state.analysisStudentId).toBeNull();
    expect(state.roadmap).toBeNull();
    expect(state.completedItems).toEqual({});
    expect(state.isAnalyzing).toBe(false);
    expect(state.riasecAnswers).toEqual({});
    expect(state.selectedCareerTags).toEqual([]);
  });

  it("should correctly update transcript profile and calculate metadata", () => {
    const mockProfile: ProfileData = {
      student_id: "SV-TEST-2026",
      full_name: "Sinh Viên Thử Nghiệm",
      cumulative_gpa: 3.75,
      total_credits: 45,
      courses: [
        { course_code: "IT101", course_name: "Nhập môn Lập trình", credits: 3, grade: "A" },
        { course_code: "IT102", course_name: "Cấu trúc dữ liệu", credits: 4, grade: "B+" },
      ],
      detected_skills: ["Python", "Algorithms", "Data Structures"],
    };

    useProfileStore.getState().setProfile(mockProfile, "bang_diem_sv.pdf");

    const state = useProfileStore.getState();
    expect(state.profile).not.toBeNull();
    expect(state.profile?.student_id).toBe("SV-TEST-2026");
    expect(state.profile?.cumulative_gpa).toBe(3.75);
    expect(state.profile?.courses.length).toBe(2);
    expect(state.uploadedFileName).toBe("bang_diem_sv.pdf");
  });

  it("should sync analysis result and match targets", () => {
    useProfileStore.getState().setAnalysisResult(MOCK_SKILL_GAP_ANALYSIS as any);

    const state = useProfileStore.getState();
    expect(state.analysisResult).not.toBeNull();
    expect(state.analysisResult?.top_matches.length).toBeGreaterThan(0);
    expect(state.analysisResult?.radar_chart_data.length).toBe(6);
    expect(state.selectedMajor).not.toBeNull();
    expect(state.selectedMajor?.major_id).toBe("CS_DATA_AI");
  });

  it("should integrate roadmap and dynamically toggle item completion", () => {
    useProfileStore.getState().setRoadmap(MOCK_ROADMAP);

    let state = useProfileStore.getState();
    expect(state.roadmap).not.toBeNull();
    expect(state.roadmap?.semesters.length).toBeGreaterThanOrEqual(3);

    const targetCourse = state.roadmap!.semesters[0].recommended_courses[0];
    const courseCode = targetCourse.course_code;

    // Toggle hoàn thành môn học
    useProfileStore.getState().toggleCompletedItem(courseCode, "course");

    state = useProfileStore.getState();
    expect(state.completedItems[courseCode]).toBe(true);
    expect(state.dynamicReadinessScore).toBeGreaterThan(0);

    // Toggle lại để bỏ đánh dấu
    useProfileStore.getState().toggleCompletedItem(courseCode, "course");
    state = useProfileStore.getState();
    expect(state.completedItems[courseCode]).toBe(false);
  });

  it("should manage RIASEC scores and career tags", () => {
    useProfileStore.getState().setRiasecScore("R", 4.5);
    useProfileStore.getState().setRiasecScore("I", 4.8);
    useProfileStore.getState().toggleCareerTag("AI_RESEARCH");

    const state = useProfileStore.getState();
    expect(state.riasecScores["R"]).toBe(4.5);
    expect(state.riasecScores["I"]).toBe(4.8);
    expect(state.selectedCareerTags).toContain("AI_RESEARCH");

    // Toggle career tag lần 2 để gỡ bỏ
    useProfileStore.getState().toggleCareerTag("AI_RESEARCH");
    expect(useProfileStore.getState().selectedCareerTags).not.toContain("AI_RESEARCH");
  });

  it("invalidates an existing result when an answer changes", () => {
    useProfileStore.getState().setAnalysisResult(MOCK_SKILL_GAP_ANALYSIS);
    useProfileStore.getState().setRoadmap(MOCK_ROADMAP);

    useProfileStore.getState().setRiasecAnswers({ 1: 4 });

    const state = useProfileStore.getState();
    expect(state.riasecAnswers).toEqual({ 1: 4 });
    expect(state.analysisResult).toBeNull();
    expect(state.analysisStudentId).toBeNull();
    expect(state.selectedMajor).toBeNull();
    expect(state.roadmap).toBeNull();
  });

  it("should fully restore core initial state on resetAll call", () => {
    useProfileStore.getState().setAnalysisResult(MOCK_SKILL_GAP_ANALYSIS as any);
    useProfileStore.getState().setRoadmap(MOCK_ROADMAP);

    useProfileStore.getState().resetAll();

    const state = useProfileStore.getState();
    expect(state.profile).toBeNull();
    expect(state.uploadedFileName).toBeNull();
    expect(state.analysisResult).toBeNull();
    expect(state.roadmap).toBeNull();
    expect(state.completedItems).toEqual({});
    expect(state.selectedMajor).toBeNull();
  });
});
