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

  // Lộ trình học tập cá nhân hóa & Tương tác động Web 2.0 (Hỗ trợ đa chuyên ngành)
  roadmap: RoadmapGenerationResponse | null;
  roadmapsByMajor: Record<string, RoadmapGenerationResponse>;
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
  loadSavedAssessmentAction: (studentId?: string) => Promise<boolean>;
  loadAndSyncAllDataAction: (studentId?: string) => Promise<boolean>;

  // Hydration state
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
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
      roadmapsByMajor: {},
      isGeneratingRoadmap: false,
      completedItems: {},
      dynamicReadinessScore: 64.5,
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
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

      setSelectedMajor: (major) =>
        set((state) => {
          const majorId = major.major_id;
          // Tìm xem chuyên ngành này đã có lộ trình được lưu chưa
          const savedRoadmap =
            state.roadmapsByMajor?.[majorId] ||
            (state.roadmap?.target_major_id === majorId ? state.roadmap : null);

          if (savedRoadmap && savedRoadmap.semesters && savedRoadmap.semesters.length > 0) {
            return {
              selectedMajor: major,
              roadmap: savedRoadmap,
              completedItems: savedRoadmap.completed_items || {},
              dynamicReadinessScore:
                savedRoadmap.readiness_score ||
                savedRoadmap.job_readiness_percentage ||
                major.match_percentage ||
                45.6
            };
          }

          // Chuyên ngành chưa được tạo lộ trình: đặt roadmap = null, chỉ hiện % match hiện tại
          return {
            selectedMajor: major,
            roadmap: null,
            completedItems: {},
            dynamicReadinessScore: major.match_percentage || 40.0
          };
        }),

      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

      setRoadmap: (roadmap) =>
        set((state) => {
          const majorId = roadmap.target_major_id || state.selectedMajor?.major_id || "DEVOPS_CLOUD";
          return {
            roadmap,
            roadmapsByMajor: {
              ...(state.roadmapsByMajor || {}),
              [majorId]: roadmap
            },
            dynamicReadinessScore: roadmap.readiness_score || roadmap.job_readiness_percentage || 45.6,
            completedItems: roadmap.completed_items || {}
          };
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

            let newMastered: string[] = [];
            let newMissing: string[] = [];

            if (completedCount >= totalItemsCount && totalItemsCount > 0) {
              // Khi hoàn thành 100% lộ trình: 100% kỹ năng thiếu được chuyển sang làm chủ (Missing = 0)!
              const combinedAll = [...rawMastered, ...rawMissing];
              newMastered = Array.from(new Set(combinedAll));
              newMissing = [];
            } else {
              const progressFraction = totalItemsCount > 0 ? completedCount / totalItemsCount : 0;
              const masteredSkillsList = Array.from(masteredSkillsSet);
              const directCovered = rawMissing.filter((s) => {
                const sLower = s.toLowerCase().trim();
                for (let i = 0; i < masteredSkillsList.length; i++) {
                  const itemSkill = masteredSkillsList[i];
                  if (itemSkill.includes(sLower) || sLower.includes(itemSkill)) return true;
                }
                return false;
              });

              // Bù đắp tỷ lệ kỹ năng tương ứng với tỷ lệ phần trăm môn học đã hoàn thành
              const minSkillsResolved = Math.round(progressFraction * rawMissing.length);
              const extraCovered = rawMissing.slice(0, minSkillsResolved);
              const allCoveredList = Array.from(new Set([...directCovered, ...extraCovered]));
              const coveredMap: Record<string, boolean> = {};
              allCoveredList.forEach((s) => { coveredMap[s] = true; });

              newMastered = Array.from(new Set([...rawMastered, ...allCoveredList]));
              newMissing = rawMissing.filter((s) => !coveredMap[s]);
            }

            // Cập nhật Radar Data đa trục tiệm cận và vượt benchmark khi hoàn thành
            const newRadarData = (updatedSelectedMajor.radar_data || []).map((axis) => {
              const progressFraction = totalItemsCount > 0 ? completedCount / totalItemsCount : 0;
              const baseAxisScore = axis.user_score <= 4 ? 3.5 : axis.user_score;
              const bonus = progressFraction * (axis.benchmark_score - baseAxisScore + 0.5);
              return {
                ...axis,
                user_score: Math.min(10, Math.round((baseAxisScore + Math.max(0, bonus)) * 10) / 10)
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
          if (updatedAnalysisResult) {
            ApiService.saveAssessment(studentId, updatedAnalysisResult);
          }

          return {
            completedItems: newCompleted,
            dynamicReadinessScore: calculatedScore,
            selectedMajor: updatedSelectedMajor,
            analysisResult: updatedAnalysisResult
          };
        }),

      resetAll: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("majormatch-profile-storage");
          } catch (_) {}
        }
        set({
          profile: null,
          uploadedFileName: null,
          analysisResult: null,
          selectedMajor: null,
          roadmap: null,
          roadmapsByMajor: {},
          completedItems: {},
          dynamicReadinessScore: 0,
          isAnalyzing: false,
          isGeneratingRoadmap: false,
          isUploading: false,
          riasecScores: { r: 0, i: 0, a: 0, s: 0, e: 0, c: 0 },
          selectedCareerTags: []
        });
      },

      uploadTranscriptAction: async (file: File) => {
        set({ isUploading: true });
        try {
          const studentId = get().profile?.student_id || "SV-2025001";
          const res = await ApiService.parseTranscript(file, studentId);
          const profileData = res.profile_data || res.profile;

          if (profileData && studentId) {
            profileData.student_id = studentId;
            // Lưu vĩnh viễn hồ sơ vào SQLite trên Backend
            await ApiService.saveProfile(studentId, profileData);
          }

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
          const s = state.riasecScores || {};
          const hollandScores: HollandScores = {
            realistic: Number(s.r ?? s.R ?? 3.0) || 3.0,
            investigative: Number(s.i ?? s.I ?? 3.0) || 3.0,
            artistic: Number(s.a ?? s.A ?? 3.0) || 3.0,
            social: Number(s.s ?? s.S ?? 3.0) || 3.0,
            enterprising: Number(s.e ?? s.E ?? 3.0) || 3.0,
            conventional: Number(s.c ?? s.C ?? 3.0) || 3.0
          };

          const coursesInput: CourseInputAssessment[] = (state.profile?.courses || []).map((c) => ({
            course_code: c.course_code,
            grade_point: c.grade_point || c.point_grade || 3.0
          }));

          const studentId = state.profile?.student_id || "SV-2025001";

          const payload: CalculateMatchRequest & { student_id?: string; detected_skills?: string[] } = {
            student_id: studentId,
            holland_scores: hollandScores,
            target_career_tags: state.selectedCareerTags.length > 0 ? state.selectedCareerTags : ["ai_engineer"],
            courses: coursesInput,
            detected_skills: state.profile?.detected_skills || []
          };

          const res = await ApiService.calculateMatch(payload);
          const enrichedMatches = (res.top_matches || res.top_recommendations || []).map((m) => ({
            ...m,
            radar_data: m.radar_data || res.radar_chart_data,
            skill_gap: m.skill_gap || res.skill_breakdown,
            xai_explanation: m.xai_explanation
          }));

          const enrichedResult: CalculateMatchResponse = {
            ...res,
            top_matches: enrichedMatches,
            top_recommendations: enrichedMatches
          };

          const topMajor = enrichedMatches[0] || null;

          // Lưu vĩnh viễn kết quả phân tích mới vào CSDL SQLite
          ApiService.saveAssessment(studentId, enrichedResult);

          set({
            analysisResult: enrichedResult,
            selectedMajor: topMajor,
            roadmap: null,
            roadmapsByMajor: {},
            completedItems: {},
            dynamicReadinessScore: topMajor?.match_percentage || 45.0,
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

          const updatedRoadmaps = {
            ...(state.roadmapsByMajor || {}),
            [targetMajorId]: res
          };

          set({
            roadmap: res,
            roadmapsByMajor: updatedRoadmaps,
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
            const currentMajorId = state.selectedMajor?.major_id;
            const savedMajorId = saved.target_major_id || "DEVOPS_CLOUD";

            const updatedRoadmaps = {
              ...(state.roadmapsByMajor || {}),
              [savedMajorId]: saved
            };

            // Nếu ngành đang chọn trùng với ngành của lộ trình đã lưu, hoặc chưa có roadmap
            const shouldSetActive = !currentMajorId || currentMajorId === savedMajorId || !state.roadmap;

            const currentScore =
              saved.readiness_score ||
              saved.job_readiness_percentage ||
              state.selectedMajor?.match_percentage ||
              45.6;

            if (shouldSetActive) {
              set({
                roadmap: saved,
                roadmapsByMajor: updatedRoadmaps,
                dynamicReadinessScore: currentScore,
                completedItems: saved.completed_items || {},
                isGeneratingRoadmap: false
              });
            } else {
              set({
                roadmapsByMajor: updatedRoadmaps,
                isGeneratingRoadmap: false
              });
            }
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      loadSavedAssessmentAction: async (studentId: string = "SV-2025001") => {
        try {
          const saved = await ApiService.getSavedAssessment(studentId);
          if (saved && (saved.top_matches || saved.top_recommendations)) {
            const enrichedMatches = (saved.top_matches || saved.top_recommendations || []).map((m) => ({
              ...m,
              radar_data: m.radar_data || saved.radar_chart_data,
              skill_gap: m.skill_gap || saved.skill_breakdown
            }));

            const enrichedResult: CalculateMatchResponse = {
              ...saved,
              top_matches: enrichedMatches,
              top_recommendations: enrichedMatches
            };

            set((state) => ({
              analysisResult: enrichedResult,
              selectedMajor: state.selectedMajor || enrichedMatches[0] || null,
              isAnalyzing: false
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      loadAndSyncAllDataAction: async (studentId: string = "SV-2025001") => {
        try {
          const [savedProfile, savedRoadmap, savedAssessment] = await Promise.all([
            ApiService.getProfile(studentId),
            ApiService.getSavedRoadmap(studentId),
            ApiService.getSavedAssessment(studentId)
          ]);

          // 1. Phục hồi hồ sơ học tập thật từ SQLite nếu có
          if (savedProfile && savedProfile.profile) {
            set({
              profile: savedProfile.profile,
              uploadedFileName: `Học bạ_${studentId}.pdf`
            });
          }

          let currentRoadmap = savedRoadmap;
          let currentAssessment = savedAssessment;
          const currentCompleted = savedRoadmap?.completed_items || {};

          // Nếu sinh viên chưa có kết quả đánh giá trên hệ thống, xóa sạch mock data cũ
          if (!currentAssessment) {
            set({
              analysisResult: null,
              selectedMajor: null,
              roadmap: currentRoadmap || null,
              completedItems: currentCompleted,
              dynamicReadinessScore: 0,
              isAnalyzing: false,
              isGeneratingRoadmap: false
            });
            return false;
          }

          if (currentAssessment && (currentAssessment.top_matches || currentAssessment.top_recommendations)) {
            const enrichedMatches = (currentAssessment.top_matches || currentAssessment.top_recommendations || []).map((m) => ({
              ...m,
              radar_data: m.radar_data || currentAssessment?.radar_chart_data,
              skill_gap: m.skill_gap || currentAssessment?.skill_breakdown,
              xai_explanation: m.xai_explanation
            }));

            currentAssessment = {
              ...currentAssessment,
              top_matches: enrichedMatches,
              top_recommendations: enrichedMatches
            };
          }

          // Hòa trộn tiến độ Roadmap đã tick vào Assessment
          if (currentAssessment && currentRoadmap) {
            const allInteractiveIds: string[] = [];
            const itemSkillsMap: Record<string, string[]> = {};

            (currentRoadmap.semesters || []).forEach((sem) => {
              (sem.recommended_courses || []).forEach((c) => {
                allInteractiveIds.push(c.course_code);
                itemSkillsMap[c.course_code] = c.target_skills || [c.course_name];
              });
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
              (sem.certifications || []).forEach((cert) => {
                allInteractiveIds.push(cert);
                itemSkillsMap[cert] = [cert];
              });
            });

            const totalItemsCount = Math.max(allInteractiveIds.length, 1);
            const completedCount = allInteractiveIds.filter((id) => !!currentCompleted[id]).length;

            const baseScore =
              currentRoadmap.readiness_score ||
              currentRoadmap.job_readiness_percentage ||
              currentAssessment.top_matches?.[0]?.match_percentage ||
              45.6;
            const remainingPotential = 100 - baseScore;
            const addedProgress = (completedCount / totalItemsCount) * remainingPotential;
            const syncScore = Math.min(100, Math.round((baseScore + addedProgress) * 10) / 10);

            const masteredSkillsSet = new Set<string>();
            Object.keys(currentCompleted).forEach((id) => {
              if (currentCompleted[id] && itemSkillsMap[id]) {
                itemSkillsMap[id].forEach((s) => masteredSkillsSet.add(s.toLowerCase().trim()));
              }
            });

            const targetMajorIndex = (currentAssessment.top_matches || []).findIndex(
              (m) => m.major_id === currentRoadmap?.target_major_id
            );
            const matchedMajorIndex = targetMajorIndex !== -1 ? targetMajorIndex : 0;
            const targetMajor = currentAssessment.top_matches?.[matchedMajorIndex];

            let updatedTargetMajor = targetMajor;

            if (targetMajor) {
              const rawMissing = targetMajor.skill_gap?.missing_skills || [];
              const rawMastered = targetMajor.skill_gap?.mastered_skills || [];

              let finalMastered: string[] = [];
              let finalMissing: string[] = [];

              if (completedCount >= totalItemsCount && totalItemsCount > 0) {
                finalMastered = Array.from(new Set([...rawMastered, ...rawMissing]));
                finalMissing = [];
              } else {
                const progressFraction = totalItemsCount > 0 ? completedCount / totalItemsCount : 0;
                const masteredSkillsList = Array.from(masteredSkillsSet);
                const directCovered = rawMissing.filter((s) => {
                  const sLower = s.toLowerCase().trim();
                  for (let i = 0; i < masteredSkillsList.length; i++) {
                    if (masteredSkillsList[i].includes(sLower) || sLower.includes(masteredSkillsList[i])) return true;
                  }
                  return false;
                });
                const minSkillsResolved = Math.round(progressFraction * rawMissing.length);
                const extraCovered = rawMissing.slice(0, minSkillsResolved);
                const allCoveredList = Array.from(new Set([...directCovered, ...extraCovered]));
                const coveredMap: Record<string, boolean> = {};
                allCoveredList.forEach((s) => { coveredMap[s] = true; });

                finalMastered = Array.from(new Set([...rawMastered, ...allCoveredList]));
                finalMissing = rawMissing.filter((s) => !coveredMap[s]);
              }

              const newRadarData = (targetMajor.radar_data || []).map((axis) => {
                const progressFraction = totalItemsCount > 0 ? completedCount / totalItemsCount : 0;
                const baseAxisScore = axis.user_score <= 4 ? 3.5 : axis.user_score;
                const bonus = progressFraction * (axis.benchmark_score - baseAxisScore + 0.5);
                return {
                  ...axis,
                  user_score: Math.min(10, Math.round((baseAxisScore + Math.max(0, bonus)) * 10) / 10)
                };
              });

              updatedTargetMajor = {
                ...targetMajor,
                match_percentage: syncScore,
                match_score: syncScore,
                radar_data: newRadarData,
                skill_gap: {
                  mastered_skills: finalMastered,
                  developing_skills: targetMajor.skill_gap?.developing_skills || [],
                  missing_skills: finalMissing
                },
                xai_explanation: targetMajor.xai_explanation
              };

              const updatedTopMatches = (currentAssessment.top_matches || []).map((m, idx) =>
                idx === matchedMajorIndex ? updatedTargetMajor! : m
              );

              currentAssessment = {
                ...currentAssessment,
                top_matches: updatedTopMatches,
                top_recommendations: updatedTopMatches,
                skill_breakdown: updatedTargetMajor.skill_gap || currentAssessment.skill_breakdown,
                radar_chart_data: newRadarData
              };
            }

            set({
              roadmap: currentRoadmap || null,
              analysisResult: currentAssessment || null,
              selectedMajor: updatedTargetMajor || currentAssessment?.top_matches?.[0] || null,
              completedItems: currentCompleted,
              dynamicReadinessScore: syncScore,
              isAnalyzing: false,
              isGeneratingRoadmap: false
            });

            // Lưu lại kết quả đồng bộ vào CSDL
            if (currentAssessment) {
              ApiService.saveAssessment(studentId, currentAssessment);
            }
            return true;
          }

          if (currentAssessment || currentRoadmap) {
            set({
              roadmap: currentRoadmap || null,
              analysisResult: currentAssessment || null,
              selectedMajor: currentAssessment?.top_matches?.[0] || null,
              completedItems: currentCompleted,
              dynamicReadinessScore: currentRoadmap?.readiness_score || 0,
              isAnalyzing: false,
              isGeneratingRoadmap: false
            });
            return true;
          }
          return false;
        } catch (err) {
          console.error("loadAndSyncAllDataAction error:", err);
          return false;
        }
      }
    }),
    {
      name: "majormatch-profile-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        profile: state.profile,
        uploadedFileName: state.uploadedFileName,
        riasecScores: state.riasecScores,
        selectedCareerTags: state.selectedCareerTags,
        analysisResult: state.analysisResult,
        selectedMajor: state.selectedMajor,
        roadmap: state.roadmap,
        roadmapsByMajor: state.roadmapsByMajor,
        completedItems: state.completedItems,
        dynamicReadinessScore: state.dynamicReadinessScore
      })
    }
  )
);
