/**
 * Định nghĩa kiểu dữ liệu TypeScript khớp 100% với API_SPEC.md của MajorMatch
 */

export interface CourseItem {
  course_code: string;
  course_name: string;
  credits: number;
  letter_grade: string;
  point_grade: number;
}

export interface ProfileData {
  full_name?: string;
  student_id?: string;
  cumulative_gpa: number;
  total_credits: number;
  courses: CourseItem[];
  detected_skills: string[];
  experience_summary: string;
}

export interface TranscriptParsingResponse {
  status: string;
  file_id: string;
  processing_time_ms: number;
  profile: ProfileData;
}

export interface RadarAxisItem {
  axis: string;
  user_score: number;
  benchmark_score: number;
}

export interface SkillGapItem {
  mastered_skills: string[];
  developing_skills: string[];
  missing_skills: string[];
}

export interface MajorRecommendationItem {
  rank: number;
  major_name: string;
  match_score: number;
  description: string;
  radar_data: RadarAxisItem[];
  skill_gap: SkillGapItem;
}

export interface SkillGapAnalysisResponse {
  target_career: string;
  total_analyzed_majors: number;
  top_recommendations: MajorRecommendationItem[];
}

export interface RecommendedCourse {
  course_code: string;
  course_name: string;
  credits: number;
  rationale: string;
  completed?: boolean;
}

export interface PracticalProject {
  project_title: string;
  target_skills: string[];
  description: string;
  completed?: boolean;
}

export interface SemesterMilestone {
  semester_name: string;
  target_focus: string;
  recommended_courses: RecommendedCourse[];
  practical_projects: PracticalProject[];
  certifications: string[];
}

export interface RoadmapGenerationResponse {
  status: string;
  target_major: string;
  readiness_score: number;
  semesters: SemesterMilestone[];
  total_milestones: number;
}

export interface HealthCheckResponse {
  status: string;
  gateway_node: string;
  compute_node: string;
  gpu_model: string;
  vram_used_mb: number;
  vram_total_mb: number;
  active_llm_queue: number;
  timestamp: string;
}
