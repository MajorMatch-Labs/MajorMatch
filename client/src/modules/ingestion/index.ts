/**
 * Module 1: Profile Ingestion & RIASEC Assessment
 * Phụ trách: VĂN HOÀNG
 * Đặc tả giáo trình: Chương 3 (PRD & Structured Data) + Chương 5 (Architecture & API Consumer)
 */

export { FileDropzone } from "@/components/upload/FileDropzone";
export { RiasecSurvey } from "@/components/upload/RiasecSurvey";
export { IngestionService } from "./services/ingestionService";
export type { FileValidationResult } from "./services/ingestionService";
export { getSkillsForCourse, categorizeSkill, CURRICULUM_SKILL_CATALOG } from "./utils/curriculumSkillMapper";
export type { SkillCategory, CourseSkillMapping } from "./utils/curriculumSkillMapper";
