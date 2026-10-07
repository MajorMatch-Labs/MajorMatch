/**
 * Curriculum Skill Mapper Utility
 * Phụ trách: Nguyễn Văn Hoàng (hoangtungmy123@gmail.com)
 * Module: Ingestion & Curriculum Integration
 * 
 * Ánh xạ mã học phần trong chương trình đào tạo CNTT sang các kỹ năng đầu ra cụ thể
 * và phân loại kỹ năng (AI/ML, Data, Systems, Software, Core Foundation).
 */

export type SkillCategory = "ai" | "data" | "infra" | "software" | "foundation";

export interface CourseSkillMapping {
  course_code: string;
  course_name: string;
  skills: string[];
  category: SkillCategory;
}

export const CURRICULUM_SKILL_CATALOG: Record<string, CourseSkillMapping> = {
  // 1. Khối Đại cương & Nền tảng
  MATH101: {
    course_code: "MATH101",
    course_name: "Toán rời rạc & Đại số tuyến tính",
    skills: ["Linear Algebra", "Discrete Math", "Probability & Statistics"],
    category: "foundation"
  },
  PHYS101: {
    course_code: "PHYS101",
    course_name: "Vật lý bán dẫn & Điện tử số",
    skills: ["Hardware Architecture", "Digital Electronics"],
    category: "foundation"
  },
  CS101: {
    course_code: "CS101",
    course_name: "Nhập môn Lập trình",
    skills: ["Python", "Algorithms", "Problem Solving", "Clean Code"],
    category: "software"
  },

  // 2. Khối Cơ sở Ngành
  CS201: {
    course_code: "CS201",
    course_name: "Cấu trúc dữ liệu & Giải thuật",
    skills: ["Data Structures", "Algorithms", "Complexity Theory", "C++"],
    category: "software"
  },
  CS202: {
    course_code: "CS202",
    course_name: "Kỹ nghệ Phần mềm",
    skills: ["Software Architecture", "Design Patterns", "Git", "OOP", "Unit Testing"],
    category: "software"
  },
  CS203: {
    course_code: "CS203",
    course_name: "Hệ điều hành",
    skills: ["Operating Systems", "Linux", "Concurrency", "Process Scheduling"],
    category: "infra"
  },
  CS204: {
    course_code: "CS204",
    course_name: "Mạng máy tính",
    skills: ["Computer Networks", "TCP/IP", "Network Security", "Socket Programming"],
    category: "infra"
  },
  CS205: {
    course_code: "CS205",
    course_name: "Kiến trúc máy tính & Vi xử lý",
    skills: ["Computer Architecture", "Assembly", "Memory Hierarchy"],
    category: "infra"
  },

  // 3. Khối Chuyên ngành & Nâng cao (Milestone Stages)
  CS308: {
    course_code: "CS308",
    course_name: "Hệ quản trị CSDL Nâng cao & Phân tích Dữ liệu lớn",
    skills: ["SQL", "Data Modeling", "ETL Pipelines", "PostgreSQL", "Pandas"],
    category: "data"
  },
  CS402: {
    course_code: "CS402",
    course_name: "Học sâu và Ứng dụng (Deep Learning)",
    skills: ["Deep Learning", "PyTorch", "Computer Vision", "Neural Networks"],
    category: "ai"
  },
  CS415: {
    course_code: "CS415",
    course_name: "Xử lý Ngôn ngữ Tự nhiên & Mô hình Ngôn ngữ Lớn",
    skills: ["NLP", "Transformers", "Large Language Models", "Prompt Engineering"],
    category: "ai"
  },
  CS420: {
    course_code: "CS420",
    course_name: "Kiến trúc Hệ thống Đám mây & MLOps",
    skills: ["Docker", "Kubernetes", "CI/CD", "Cloud Computing", "MLOps"],
    category: "infra"
  },
  CS499: {
    course_code: "CS499",
    course_name: "Đồ án Khóa luận Tốt nghiệp",
    skills: ["System Design", "Hybrid Cloud", "Research", "Project Management"],
    category: "software"
  }
};

/**
 * Trích xuất danh sách kỹ năng chuẩn mực tương ứng với mã học phần
 */
export function getSkillsForCourse(courseCode: string): string[] {
  const normalized = courseCode.trim().toUpperCase();
  const entry = CURRICULUM_SKILL_CATALOG[normalized];
  return entry ? entry.skills : [];
}

/**
 * Phân loại kỹ năng theo nhóm màu sắc giao diện
 */
export function categorizeSkill(skill: string): SkillCategory {
  const s = skill.toLowerCase();
  if (s.includes("ai") || s.includes("learning") || s.includes("nlp") || s.includes("transformer") || s.includes("vision")) {
    return "ai";
  }
  if (s.includes("data") || s.includes("sql") || s.includes("pandas") || s.includes("etl") || s.includes("database")) {
    return "data";
  }
  if (s.includes("cloud") || s.includes("network") || s.includes("system") || s.includes("docker") || s.includes("linux") || s.includes("ops")) {
    return "infra";
  }
  if (s.includes("math") || s.includes("algebra") || s.includes("discrete") || s.includes("logic")) {
    return "foundation";
  }
  return "software";
}
