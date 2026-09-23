/**
 * Zustand Global Reactive Store cho MajorMatch Client
 * Quản lý State toàn cục, tích hợp trực tiếp API Service & tính toán động Web 2.0
 * Phụ trách: LONG NHẬT (Tech Lead & Architecture Core)
 */

import { create } from "zustand";
import {
  ProfileData,
  CalculateMatchResponse,
  MajorMatchRankItem,
  RoadmapGenerationResponse,
  CalculateMatchRequest,
  HollandScores,
  CourseInputAssessment
} from "../types/api";
import { ApiService } from "../services/api";

interface ProfileState {
  // Dữ liệu hồ sơ học tập
  profile: ProfileData | null;
  uploadedFileName: string | null;
  isUploading: boolean;

  // Trắc nghiệm Holland RIASEC & Định hướng nghề nghiệp
  riasecScores: Record<string, number>;
  selectedCareerTags: string[];

  // Kết quả phân tích Skill Gap & Ngành đề xuất
  analysisResult: CalculateMatchResponse | null;
  selectedMajor: MajorMatchRankItem | null;
  isAnalyzing: boolean;

  // Lộ trình học tập cá nhân hóa & Tương tác động Web 2.0
  roadmap: RoadmapGenerationResponse | null;
  isGeneratingRoadmap: boolean;
  completedItems: Record<string, boolean>; // key: course_code hoặc project_title
  dynamicReadinessScore: number;

  // Actions đồng bộ
  setProfile: (profile: ProfileData, fileName: string) => void;
  setUploading: (val: boolean) => void;
  setRiasecScore: (group: string, score: number) => void;
  toggleCareerTag: (tagId: string) => void;
  setAnalysisResult: (res: CalculateMatchResponse) => void;
  setSelectedMajor: (major: MajorMatchRankItem) => void;
  setAnalyzing: (val: boolean) => void;
  setRoadmap: (roadmap: RoadmapGenerationResponse) => void;
  setGeneratingRoadmap: (val: boolean) => void;

  // Web 2.0 Dynamic State: Toggle checkbox môn học / đồ án và tính toán lại điểm tức thì
  toggleCompletedItem: (itemId: string, itemType: "course" | "project") => void;
  resetAll: () => void;

  // Async Actions tích hợp API Client
  uploadTranscriptAction: (file: File) => Promise<void>;
  calculateMatchAction: () => Promise<void>;
  generateRoadmapAction: (semester?: number) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  uploadedFileName: null,
  isUploading: false,

  riasecScores: { R: 3, I: 4, A: 3, S: 3, E: 4, C: 4 },
  selectedCareerTags: ["ai_engineer"],

  analysisResult: null,
  selectedMajor: null,
  isAnalyzing: false,

  roadmap: null,
  isGeneratingRoadmap: false,
  completedItems: {},
  dynamicReadinessScore: 64.5,

  setProfile: (profile, fileName) => set({ profile, uploadedFileName: fileName }),
  setUploading: (isUploading) => set({ isUploading }),

  setRiasecScore: (group, score) =>
    set((state) => ({
      riasecScores: { ...state.riasecScores, [group]: score }
    })),

  toggleCareerTag: (tagId) =>
    set((state) => {
      const exists = state.selectedCareerTags.includes(tagId);
      if (exists) {
        return { selectedCareerTags: state.selectedCareerTags.filter((t) => t !== tagId) };
      }
      if (state.selectedCareerTags.length >= 5) return state; // Giới hạn 5 thẻ
      return { selectedCareerTags: [...state.selectedCareerTags, tagId] };
    }),

  setAnalysisResult: (res) =>
    set({
      analysisResult: res,
      selectedMajor: res.top_matches?.[0] || res.top_recommendations?.[0] || null
    }),

  setSelectedMajor: (major) => set({ selectedMajor: major }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setRoadmap: (roadmap) =>
    set({
      roadmap,
      dynamicReadinessScore: roadmap.readiness_score,
      completedItems: {}
    }),

  setGeneratingRoadmap: (isGeneratingRoadmap) => set({ isGeneratingRoadmap }),

  toggleCompletedItem: (itemId, itemType) =>
    set((state) => {
      const isCurrentlyCompleted = !!state.completedItems[itemId];
      const newCompleted = {
        ...state.completedItems,
        [itemId]: !isCurrentlyCompleted
      };

      // Đếm số lượng đầu việc đã hoàn thành
      const totalItemsCount =
        state.roadmap?.semesters.reduce(
          (acc, sem) => acc + sem.recommended_courses.length + sem.practical_projects.length,
          0
        ) || 1;

      const completedCount = Object.values(newCompleted).filter(Boolean).length;
      const baseScore = state.roadmap?.readiness_score || 60;
      const remainingPotential = 100 - baseScore;

      // Tính điểm động theo tỷ lệ hoàn thành
      const addedProgress = (completedCount / totalItemsCount) * remainingPotential;
      const calculatedScore = Math.min(100, Math.round((baseScore + addedProgress) * 10) / 10);

      // Cập nhật cả trục radar nếu chọn major
      let updatedSelectedMajor = state.selectedMajor;
      if (updatedSelectedMajor && updatedSelectedMajor.radar_data) {
        const bonusFactor = !isCurrentlyCompleted ? 0.3 : -0.3;
        const newRadarData = updatedSelectedMajor.radar_data.map((axis) => ({
          ...axis,
          user_score: Math.min(10, Math.max(0, Math.round((axis.user_score + bonusFactor) * 10) / 10))
        }));
        updatedSelectedMajor = {
          ...updatedSelectedMajor,
          radar_data: newRadarData,
          match_percentage: Math.min(100, Math.round((updatedSelectedMajor.match_percentage + bonusFactor * 2) * 10) / 10),
          match_score: Math.min(100, Math.round(((updatedSelectedMajor.match_score || updatedSelectedMajor.match_percentage) + bonusFactor * 2) * 10) / 10)
        };
      }

      return {
        completedItems: newCompleted,
        dynamicReadinessScore: calculatedScore,
        selectedMajor: updatedSelectedMajor
      };
    }),

  resetAll: () =>
    set({
      profile: null,
      uploadedFileName: null,
      analysisResult: null,
      selectedMajor: null,
      roadmap: null,
      completedItems: {},
      dynamicReadinessScore: 64.5
    }),

  // ===========================================================================
  // ASYNC API INTEGRATION ACTIONS (Long Nhật triển khai)
  // ===========================================================================

  uploadTranscriptAction: async (file: File) => {
    set({ isUploading: true });
    try {
      const res = await ApiService.parseTranscript(file);
      const profileData = res.profile_data || res.profile;
      set({
        profile: profileData,
        uploadedFileName: file.name,
        isUploading: false
      });
      // Tự động kích hoạt tính toán độ phù hợp chuyên ngành ngay sau khi upload
      await get().calculateMatchAction();
    } catch (err) {
      console.error("uploadTranscriptAction error:", err);
      set({ isUploading: false });
    }
  },

  calculateMatchAction: async () => {
    set({ isAnalyzing: true });
    try {
      const state = get();
      const hollandScores: HollandScores = {
        realistic: state.riasecScores.R || 3.0,
        investigative: state.riasecScores.I || 3.0,
        artistic: state.riasecScores.A || 3.0,
        social: state.riasecScores.S || 3.0,
        enterprising: state.riasecScores.E || 3.0,
        conventional: state.riasecScores.C || 3.0
      };

      const coursesInput: CourseInputAssessment[] = (state.profile?.courses || []).map((c) => ({
        course_code: c.course_code,
        grade_point: c.grade_point || c.point_grade || 3.0
      }));

      const payload: CalculateMatchRequest = {
        holland_scores: hollandScores,
        target_career_tags: state.selectedCareerTags.length > 0 ? state.selectedCareerTags : ["ai_engineer"],
        courses: coursesInput
      };

      const res = await ApiService.calculateMatch(payload);
      set({
        analysisResult: res,
        selectedMajor: res.top_matches?.[0] || res.top_recommendations?.[0] || null,
        isAnalyzing: false
      });
    } catch (err) {
      console.error("calculateMatchAction error:", err);
      set({ isAnalyzing: false });
    }
  },

  generateRoadmapAction: async (semester: number = 4) => {
    set({ isGeneratingRoadmap: true });
    try {
      const state = get();
      const targetMajorId = state.selectedMajor?.major_id || "CS_DATA_AI";
      const missingSkills = state.analysisResult?.skill_breakdown?.missing_skills || [];
      const completedCodes = (state.profile?.courses || []).map((c) => c.course_code);

      const res = await ApiService.generateRoadmap({
        target_major_id: targetMajorId,
        missing_skills: missingSkills,
        completed_course_codes: completedCodes,
        current_semester: semester,
        cumulative_gpa: state.profile?.cumulative_gpa || 3.2
      });

      set({
        roadmap: res,
        dynamicReadinessScore: res.readiness_score,
        isGeneratingRoadmap: false,
        completedItems: {}
      });
    } catch (err) {
      console.error("generateRoadmapAction error:", err);
      set({ isGeneratingRoadmap: false });
    }
  }
}));
