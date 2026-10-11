/**
 * Zustand Global Reactive Store cho MajorMatch Client
 * Quản lý State toàn cục, tích hợp trực tiếp API Service & tính toán động Web 2.0
 * Phụ trách: LONG NHẬT (Tech Lead & Architecture Core)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  loadSavedRoadmapAction: (studentId?: string) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
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

      setAnalysisResult: (res) => {
        const enrichedMatches = (res.top_matches || res.top_recommendations || []).map((m) => ({
          ...m,
          radar_data: m.radar_data || res.radar_chart_data,
          skill_gap: m.skill_gap || res.skill_breakdown
        }));
        set({
          analysisResult: {
            ...res,
            top_matches: enrichedMatches,
            top_recommendations: enrichedMatches
          },
          selectedMajor: enrichedMatches[0] || null
        });
      },

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

          // 1. Thu thập toàn bộ ID có thể tích chọn và Map kỹ năng tương ứng
          const allInteractiveIds: string[] = [];
          const itemSkillsMap: Record<string, string[]> = {};

          (state.roadmap?.semesters || []).forEach((sem) => {
            // Môn học
            (sem.recommended_courses || []).forEach((c) => {
              allInteractiveIds.push(c.course_code);
              itemSkillsMap[c.course_code] = c.target_skills || [c.course_name];
            });
            // Đồ án
            if (sem.practical_project) {
              allInteractiveIds.push(sem.practical_project.project_title);
              itemSkillsMap[sem.practical_project.project_title] = sem.practical_project.target_skills || [];
            }
            if (sem.practical_projects) {
              sem.practical_projects.forEach((p) => {
                allInteractiveIds.push(p.project_title);
                itemSkillsMap[p.project_title] = p.target_skills || [];
              });
            }
            // Chứng chỉ
            (sem.certifications || []).forEach((cert) => {
              allInteractiveIds.push(cert);
              itemSkillsMap[cert] = [cert];
            });
          });

          const totalItemsCount = Math.max(allInteractiveIds.length, 1);
          const completedCount = allInteractiveIds.filter((id) => !!newCompleted[id]).length;

          // 2. Điểm xuất phát chuẩn từ lộ trình hoặc chuyên ngành đang chọn
          const baseScore =
            state.roadmap?.readiness_score ||
            state.roadmap?.job_readiness_percentage ||
            state.selectedMajor?.match_percentage ||
            45.6;
          const remainingPotential = 100 - baseScore;

          // 3. Tiến độ tăng mượt mà theo đúng tỷ lệ đầu việc của cả 3 giai đoạn
          const addedProgress = (completedCount / totalItemsCount) * remainingPotential;
          const calculatedScore = Math.min(100, Math.round((baseScore + addedProgress) * 10) / 10);

          // 4. Thu thập toàn bộ kỹ năng đã tích lũy từ các đầu việc đã hoàn thành
          const masteredSkillsSet = new Set<string>();
          Object.keys(newCompleted).forEach((id) => {
            if (newCompleted[id] && itemSkillsMap[id]) {
              itemSkillsMap[id].forEach((s) => masteredSkillsSet.add(s.toLowerCase().trim()));
            }
          });

          // 5. Đồng bộ ngược sang SelectedMajor và AnalysisResult
          let updatedSelectedMajor = state.selectedMajor;
          let updatedAnalysisResult = state.analysisResult;

          if (updatedSelectedMajor) {
            const rawMissing =
              updatedSelectedMajor.skill_gap?.missing_skills ||
              state.analysisResult?.skill_breakdown?.missing_skills ||
              [];
            const rawMastered = updatedSelectedMajor.skill_gap?.mastered_skills || [];

            // Chuyển kỹ năng từ missing sang mastered nếu đã tích chọn
            const newMastered = Array.from(
              new Set([
                ...rawMastered,
                ...rawMissing.filter((s) => masteredSkillsSet.has(s.toLowerCase().trim()))
              ])
            );
            const newMissing = rawMissing.filter(
              (s) => !masteredSkillsSet.has(s.toLowerCase().trim())
            );

            // Cập nhật Radar Data đa trục
            const newRadarData = (updatedSelectedMajor.radar_data || []).map((axis) => {
              const bonus = (completedCount / totalItemsCount) * 2.5;
              const originalScore = axis.user_score <= 4 ? 3.0 : axis.user_score;
              return {
                ...axis,
                user_score: Math.min(10, Math.round((originalScore + bonus) * 10) / 10)
              };
            });

            updatedSelectedMajor = {
              ...updatedSelectedMajor,
              match_percentage: calculatedScore,
              match_score: calculatedScore,
              radar_data: newRadarData,
              skill_gap: {
                mastered_skills: newMastered,
                developing_skills: updatedSelectedMajor.skill_gap?.developing_skills || [],
                missing_skills: newMissing
              }
            };

            // Cập nhật thẻ chuyên ngành trong danh sách top_matches
            if (updatedAnalysisResult) {
              const updatedTopMatches = (updatedAnalysisResult.top_matches || []).map((m) =>
                m.major_id === updatedSelectedMajor?.major_id
                  ? {
                      ...m,
                      match_percentage: calculatedScore,
                      match_score: calculatedScore,
                      radar_data: newRadarData,
                      skill_gap: updatedSelectedMajor?.skill_gap
                    }
                  : m
              );

              updatedAnalysisResult = {
                ...updatedAnalysisResult,
                top_matches: updatedTopMatches,
                top_recommendations: updatedTopMatches,
                skill_breakdown: updatedSelectedMajor.skill_gap || updatedAnalysisResult.skill_breakdown,
                radar_chart_data: newRadarData
              };
            }
          }

          // 6. Lưu vĩnh viễn tiến độ vào CSDL Backend
          const studentId = state.profile?.student_id || "SV-2025001";
          ApiService.saveRoadmapProgress(studentId, newCompleted, calculatedScore);

          return {
            completedItems: newCompleted,
            dynamicReadinessScore: calculatedScore,
            selectedMajor: updatedSelectedMajor,
            analysisResult: updatedAnalysisResult
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
          const enrichedMatches = (res.top_matches || res.top_recommendations || []).map((m) => ({
            ...m,
            radar_data: m.radar_data || res.radar_chart_data,
            skill_gap: m.skill_gap || res.skill_breakdown
          }));

          const enrichedResult: CalculateMatchResponse = {
            ...res,
            top_matches: enrichedMatches,
            top_recommendations: enrichedMatches
          };

          set({
            analysisResult: enrichedResult,
            selectedMajor: enrichedMatches[0] || null,
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
          const studentId = state.profile?.student_id || "SV-2025001";
          const targetMajorId = state.selectedMajor?.major_id || "DEVOPS_CLOUD";
          const missingSkills =
            state.selectedMajor?.skill_gap?.missing_skills ||
            state.analysisResult?.skill_breakdown?.missing_skills ||
            [];
          const completedCodes = (state.profile?.courses || []).map((c) => c.course_code);
          const initialReadiness =
            state.selectedMajor?.match_percentage ||
            state.selectedMajor?.match_score ||
            45.6;

          const res = await ApiService.generateRoadmap({
            student_id: studentId,
            target_major_id: targetMajorId,
            missing_skills: missingSkills,
            completed_course_codes: completedCodes,
            current_semester: semester,
            cumulative_gpa: state.profile?.cumulative_gpa || 3.2,
            initial_readiness_score: initialReadiness
          });

          const startingScore = res.readiness_score || res.job_readiness_percentage || initialReadiness;

          set({
            roadmap: res,
            dynamicReadinessScore: startingScore,
            isGeneratingRoadmap: false,
            completedItems: res.completed_items || {}
          });
        } catch (err) {
          console.error("generateRoadmapAction error:", err);
          set({ isGeneratingRoadmap: false });
        }
      },

      loadSavedRoadmapAction: async (studentId: string = "SV-2025001") => {
        try {
          const saved = await ApiService.getSavedRoadmap(studentId);
          if (saved && saved.semesters && saved.semesters.length > 0) {
            const state = get();
            const currentScore =
              saved.readiness_score ||
              saved.job_readiness_percentage ||
              state.selectedMajor?.match_percentage ||
              45.6;

            set({
              roadmap: saved,
              dynamicReadinessScore: currentScore,
              completedItems: saved.completed_items || {},
              isGeneratingRoadmap: false
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
    }),
    {
      name: "majormatch-profile-storage",
      partialize: (state) => ({
        profile: state.profile,
        uploadedFileName: state.uploadedFileName,
        riasecScores: state.riasecScores,
        selectedCareerTags: state.selectedCareerTags,
        analysisResult: state.analysisResult,
        selectedMajor: state.selectedMajor,
        roadmap: state.roadmap,
        completedItems: state.completedItems,
        dynamicReadinessScore: state.dynamicReadinessScore
      })
    }
  )
);
