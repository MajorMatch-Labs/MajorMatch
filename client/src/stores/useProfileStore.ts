import { create } from "zustand";
import {
  ProfileData,
  SkillGapAnalysisResponse,
  MajorRecommendationItem,
  RoadmapGenerationResponse
} from "../types/api";
import { HOLLAND_QUESTIONS, AVAILABLE_CAREER_TAGS } from "../types/survey";

interface ProfileState {
  // Dữ liệu hồ sơ học tập
  profile: ProfileData | null;
  uploadedFileName: string | null;
  isUploading: boolean;

  // Trắc nghiệm Holland RIASEC & Định hướng nghề nghiệp
  riasecScores: Record<string, number>;
  selectedCareerTags: string[];

  // Kết quả phân tích Skill Gap & Ngành đề xuất
  analysisResult: SkillGapAnalysisResponse | null;
  selectedMajor: MajorRecommendationItem | null;
  isAnalyzing: boolean;

  // Lộ trình học tập cá nhân hóa & Tương tác động Web 2.0
  roadmap: RoadmapGenerationResponse | null;
  isGeneratingRoadmap: boolean;
  completedItems: Record<string, boolean>; // key: course_code hoặc project_title
  dynamicReadinessScore: number;

  // Actions
  setProfile: (profile: ProfileData, fileName: string) => void;
  setUploading: (val: boolean) => void;
  setRiasecScore: (group: string, score: number) => void;
  toggleCareerTag: (tagId: string) => void;
  setAnalysisResult: (res: SkillGapAnalysisResponse) => void;
  setSelectedMajor: (major: MajorRecommendationItem) => void;
  setAnalyzing: (val: boolean) => void;
  setRoadmap: (roadmap: RoadmapGenerationResponse) => void;
  setGeneratingRoadmap: (val: boolean) => void;

  // Web 2.0 Dynamic State: Toggle checkbox môn học / đồ án và tính toán lại điểm tức thì
  toggleCompletedItem: (itemId: string, itemType: "course" | "project") => void;
  resetAll: () => void;
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
      selectedMajor: res.top_recommendations[0] || null
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
      if (updatedSelectedMajor) {
        const bonusFactor = !isCurrentlyCompleted ? 0.3 : -0.3;
        const newRadarData = updatedSelectedMajor.radar_data.map((axis) => ({
          ...axis,
          user_score: Math.min(10, Math.max(0, Math.round((axis.user_score + bonusFactor) * 10) / 10))
        }));
        updatedSelectedMajor = {
          ...updatedSelectedMajor,
          radar_data: newRadarData,
          match_score: Math.min(100, Math.round((updatedSelectedMajor.match_score + bonusFactor * 2) * 10) / 10)
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
    })
}));
