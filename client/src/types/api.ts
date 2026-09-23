/**
 * Định nghĩa kiểu dữ liệu TypeScript cho MajorMatch Client
 * Đồng bộ 100% với Pydantic Schemas (FastAPI Backend HPC) & OpenAPI 3.1
 * Phụ trách: LONG NHẬT (Tech Lead & Module Advisor)
 */

// =============================================================================
// 1. TRANSCRIPT & PROFILE SCHEMAS (Khớp backend-hpc/schemas.py)
// =============================================================================

export interface CourseItem {
  course_code: string;
  course_name: string;
  credits: number;
  letter_grade: string;
  point_grade: number;
}

export interface CourseParsedItem {
  course_code: string;
  course_name: string;
  credits: number;
  grade_letter: string;
  grade_point: number;
  letter_grade?: string;
  point_grade?: number;
}

export interface ProfileData {
  full_name?: string;
  student_id?: string;
  cumulative_gpa: number;
  total_credits: number;
  courses: CourseParsedItem[];
  detected_skills: string[];
  experience_summary?: string;
}

export interface TranscriptParsingResponse {
  request_id: string;
  status: string;
  parsing_duration_ms: number;
  profile_data: ProfileData;
  // Aliases để tương thích ngược với các UI prototype
  file_id?: string;
  processing_time_ms?: number;
  profile?: ProfileData;
}

// =============================================================================
// 2. ASSESSMENT & SKILL GAP QUANTIFICATION SCHEMAS
// =============================================================================

export interface HollandScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface CourseInputAssessment {
  course_code: string;
  grade_point: number;
}

export interface CalculateMatchRequest {
  holland_scores: HollandScores;
  target_career_tags: string[];
  courses?: CourseInputAssessment[];
}

export interface MajorMatchRankItem {
  major_id: string;
  major_name: string;
  match_percentage: number;
  rank: number;
  description?: string;
  // Aliases tương thích ngược
  match_score?: number;
  radar_data?: RadarAxisItem[];
  skill_gap?: SkillGapItem;
}

export interface RadarAxisItem {
  axis_name: string;
  user_score: number;
  benchmark_score: number;
  // Alias tương thích ngược
  axis?: string;
}

export interface SkillBreakdown {
  mastered_skills: string[];
  developing_skills: string[];
  missing_skills: string[];
}

export interface CalculateMatchResponse {
  top_matches: MajorMatchRankItem[];
  radar_chart_data: RadarAxisItem[];
  skill_breakdown: SkillBreakdown;
  target_career?: string;
  total_analyzed_majors?: number;
  top_recommendations?: MajorMatchRankItem[];
}

// Aliases cho cấu trúc cũ
export type SkillGapItem = SkillBreakdown;
export type MajorRecommendationItem = MajorMatchRankItem;
export type SkillGapAnalysisResponse = CalculateMatchResponse;

// =============================================================================
// 3. ROADMAP & RAG SCHEMAS
// =============================================================================

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

export interface RoadmapGenerationRequest {
  target_major_id: string;
  missing_skills?: string[];
  completed_course_codes?: string[];
  current_semester: number;
  cumulative_gpa?: number;
}

export interface RoadmapGenerationResponse {
  status: string;
  target_major: string;
  readiness_score: number;
  semesters: SemesterMilestone[];
  total_milestones: number;
}

// =============================================================================
// 4. CHAT STREAMING & SYSTEM SCHEMAS
// =============================================================================

export interface ChatStreamRequest {
  message: string;
  student_profile_context?: string;
  major_focus?: string;
}

export interface GatewayNodeStatus {
  device: string;
  os: string;
  sqlite_cache_size_kb: number;
}

export interface PrivateComputeNodeStatus {
  device: string;
  gpu_status: string;
  vram_used_mb: number;
  vram_total_mb: number;
  ollama_status: string;
  active_model: string;
}

export interface HealthCheckResponse {
  status: string;
  gateway_node?: GatewayNodeStatus | string;
  private_compute_node?: PrivateComputeNodeStatus;
  compute_node?: string;
  gpu_model?: string;
  vram_used_mb?: number;
  vram_total_mb?: number;
  active_llm_queue?: number;
  timestamp?: string;
}
