/**
 * Dữ liệu Mock chuẩn mực theo API_SPEC.md phục vụ Offline Demo & Fallback
 */

import {
  TranscriptParsingResponse,
  SkillGapAnalysisResponse,
  RoadmapGenerationResponse,
  HealthCheckResponse
} from "../types/api";

export const MOCK_TRANSCRIPT_PARSING: TranscriptParsingResponse = {
  status: "success",
  file_id: "demo-pdf-trans-2026-xyz",
  processing_time_ms: 685,
  profile: {
    full_name: "Nguyễn Văn An (Đã khử định danh PII)",
    student_id: "21020000",
    cumulative_gpa: 3.42,
    total_credits: 76,
    courses: [
      { course_code: "INT1001", course_name: "Nhập môn Lập trình", credits: 3, letter_grade: "A", point_grade: 4.0 },
      { course_code: "INT1002", course_name: "Lập trình Hướng đối tượng", credits: 4, letter_grade: "A-", point_grade: 3.7 },
      { course_code: "INT2003", course_name: "Cấu trúc dữ liệu và Giải thuật", credits: 4, letter_grade: "B+", point_grade: 3.5 },
      { course_code: "INT2005", course_name: "Cơ sở dữ liệu", credits: 3, letter_grade: "B", point_grade: 3.0 },
      { course_code: "INT2010", course_name: "Mạng máy tính", credits: 3, letter_grade: "B+", point_grade: 3.5 },
      { course_code: "INT3012", course_name: "Học máy cơ bản", credits: 3, letter_grade: "A", point_grade: 4.0 },
      { course_code: "INT3015", course_name: "Phát triển ứng dụng Web", credits: 3, letter_grade: "A", point_grade: 4.0 }
    ],
    detected_skills: [
      "Python", "C++", "Java", "SQL", "Data Structures", "Algorithms",
      "Machine Learning", "Scikit-learn", "Web Development", "Git", "Docker"
    ],
    experience_summary: "Sinh viên có nền tảng lập trình tốt, GPA 3.42, có thiên hướng nghiên cứu Khoa học Dữ liệu và Trí tuệ Nhân tạo."
  }
};

export const MOCK_SKILL_GAP_ANALYSIS: SkillGapAnalysisResponse = {
  target_career: "AI & Data Science Specialist",
  total_analyzed_majors: 3,
  top_recommendations: [
    {
      rank: 1,
      major_name: "AI & Data Science Specialist",
      match_score: 84.5,
      description: "Chuyên ngành tập trung vào thuật toán học máy, thị giác máy tính, xử lý ngôn ngữ tự nhiên và xây dựng hệ thống dữ liệu lớn.",
      radar_data: [
        { axis: "Toán & Thống kê", user_score: 8.5, benchmark_score: 9.0 },
        { axis: "Thuật toán & CTDL", user_score: 8.0, benchmark_score: 8.5 },
        { axis: "Học máy & Deep Learning", user_score: 7.5, benchmark_score: 9.5 },
        { axis: "Kỹ thuật Dữ liệu (SQL/BigData)", user_score: 7.0, benchmark_score: 8.5 },
        { axis: "Lập trình ứng dụng (Python/Web)", user_score: 9.0, benchmark_score: 8.0 },
        { axis: "DevOps & MLOps cơ bản", user_score: 6.0, benchmark_score: 8.0 }
      ],
      skill_gap: {
        mastered_skills: [
          "Python", "Data Structures", "Algorithms", "Linear Algebra", "Calculus", "Basic Machine Learning", "SQL"
        ],
        developing_skills: [
          "Deep Learning", "PyTorch", "Data Modeling", "Docker", "Feature Engineering"
        ],
        missing_skills: [
          "Transformers & LLM Tuning", "Distributed Big Data (Spark)", "MLOps Pipeline", "Vector DB & RAG Architecture"
        ]
      }
    },
    {
      rank: 2,
      major_name: "Fullstack Software Engineer",
      match_score: 78.0,
      description: "Phát triển toàn diện từ giao diện Web 2.0 hiện đại đến hệ thống kiến trúc microservices và cơ sở dữ liệu phân tán.",
      radar_data: [
        { axis: "Toán & Thống kê", user_score: 8.5, benchmark_score: 7.0 },
        { axis: "Thuật toán & CTDL", user_score: 8.0, benchmark_score: 8.0 },
        { axis: "Học máy & Deep Learning", user_score: 7.5, benchmark_score: 6.0 },
        { axis: "Kỹ thuật Dữ liệu (SQL/BigData)", user_score: 7.0, benchmark_score: 8.0 },
        { axis: "Lập trình ứng dụng (Python/Web)", user_score: 9.0, benchmark_score: 9.5 },
        { axis: "DevOps & MLOps cơ bản", user_score: 6.0, benchmark_score: 8.5 }
      ],
      skill_gap: {
        mastered_skills: ["Python", "JavaScript", "OOP", "Database Design", "Git"],
        developing_skills: ["React", "TypeScript", "RESTful API", "Docker"],
        missing_skills: ["Next.js App Router", "Kubernetes", "Redis Caching", "CI/CD Pipeline"]
      }
    },
    {
      rank: 3,
      major_name: "Cloud & DevOps Solutions Architect",
      match_score: 68.2,
      description: "Quy hoạch và vận hành hạ tầng đám mây phân tán, đảm bảo tính sẵn sàng cao, bảo mật và khả năng mở rộng quy mô lớn.",
      radar_data: [
        { axis: "Toán & Thống kê", user_score: 8.5, benchmark_score: 6.5 },
        { axis: "Thuật toán & CTDL", user_score: 8.0, benchmark_score: 7.5 },
        { axis: "Học máy & Deep Learning", user_score: 7.5, benchmark_score: 5.0 },
        { axis: "Kỹ thuật Dữ liệu (SQL/BigData)", user_score: 7.0, benchmark_score: 7.5 },
        { axis: "Lập trình ứng dụng (Python/Web)", user_score: 9.0, benchmark_score: 8.0 },
        { axis: "DevOps & MLOps cơ bản", user_score: 6.0, benchmark_score: 9.5 }
      ],
      skill_gap: {
        mastered_skills: ["Linux Basics", "Networking Protocols", "Python Scripting"],
        developing_skills: ["Docker Containerization", "Git Flow", "Bash Automation"],
        missing_skills: ["Terraform IaC", "AWS Cloud Solutions", "Kubernetes Clustering", "Zero-Trust Security"]
      }
    }
  ]
};

export const MOCK_ROADMAP: RoadmapGenerationResponse = {
  status: "success",
  target_major: "AI & Data Science Specialist",
  readiness_score: 64.5,
  total_milestones: 3,
  semesters: [
    {
      semester_name: "Học kỳ 5 (Học kỳ đề xuất tiếp theo)",
      target_focus: "Hoàn thiện nền tảng Học sâu & Kỹ thuật Dữ liệu nâng cao",
      recommended_courses: [
        {
          course_code: "CS402",
          course_name: "Học sâu và Ứng dụng (Deep Learning)",
          credits: 3,
          rationale: "Bù đắp khoảng trống kỹ năng PyTorch, mạng tích chập (CNN) và kiến trúc Transformer.",
          completed: false
        },
        {
          course_code: "CS308",
          course_name: "Hệ quản trị CSDL Nâng cao & Phân tích Dữ liệu lớn",
          credits: 3,
          rationale: "Bù đắp kỹ năng xử lý dữ liệu lớn với Spark và tối ưu hóa truy vấn SQL phân tán.",
          completed: false
        }
      ],
      practical_projects: [
        {
          project_title: "Xây dựng mô hình phân loại ảnh y tế với ResNet/Vision Transformer",
          target_skills: ["PyTorch", "Computer Vision", "Model Evaluation"],
          description: "Ứng dụng transfer learning huấn luyện trên tập dữ liệu ảnh chụp X-quang, sinh báo cáo đánh giá F1-score.",
          completed: false
        }
      ],
      certifications: ["TensorFlow Developer Certificate (Google)", "DeepLearning.AI Deep Learning Specialization"]
    },
    {
      semester_name: "Học kỳ 6 (Học kỳ chuyên sâu)",
      target_focus: "Xử lý Ngôn ngữ Tự nhiên (NLP), Vector DB và Kiến trúc RAG",
      recommended_courses: [
        {
          course_code: "CS415",
          course_name: "Xử lý Ngôn ngữ Tự nhiên & Mô hình Ngôn ngữ Lớn",
          credits: 3,
          rationale: "Giúp nắm vững kỹ thuật Embedding, Fine-tuning mô hình ngôn ngữ và xây dựng Agentic Workflows.",
          completed: false
        },
        {
          course_code: "CS420",
          course_name: "Kiến trúc Hệ thống Đám mây & MLOps",
          credits: 3,
          rationale: "Bù đắp kỹ năng triển khai mô hình AI lên production, đóng gói Docker và giám sát độ trễ suy luận.",
          completed: false
        }
      ],
      practical_projects: [
        {
          project_title: "Hệ thống Cố vấn Pháp lý thông minh sử dụng RAG & ChromaDB",
          target_skills: ["ChromaDB", "FastAPI", "Ollama Qwen 2.5", "Docker"],
          description: "Triển khai pipeline truy xuất văn bản luật thời gian thực kết hợp kiểm tra tính logic và xác thực trích dẫn.",
          completed: false
        }
      ],
      certifications: ["AWS Certified Machine Learning - Specialty"]
    },
    {
      semester_name: "Học kỳ 7 & 8 (Tốt nghiệp & Thực chiến Doanh nghiệp)",
      target_focus: "Khóa luận tốt nghiệp AI & Thực tập kỹ sư dữ liệu tại doanh nghiệp",
      recommended_courses: [
        {
          course_code: "CS499",
          course_name: "Đồ án Khóa luận Tốt nghiệp Ngành Khoa học Dữ liệu",
          credits: 6,
          rationale: "Đóng gói toàn bộ kiến thức thành một sản phẩm công nghệ hoàn chỉnh công bố báo cáo kỹ thuật.",
          completed: false
        }
      ],
      practical_projects: [
        {
          project_title: "Hệ sinh thái MajorMatch - Nền tảng phân tích kỹ năng sinh viên tự động",
          target_skills: ["End-to-End System", "Hybrid Cloud", "Fullstack & AI"],
          description: "Đóng gói giải pháp Multi-tier hoàn chỉnh, phục vụ hàng ngàn sinh viên hướng nghiệp mỗi năm.",
          completed: false
        }
      ],
      certifications: ["Google Cloud Professional Data Engineer"]
    }
  ]
};

export const MOCK_HEALTH_CHECK: HealthCheckResponse = {
  status: "healthy",
  gateway_node: "Linux Edge Gateway Node",
  compute_node: "Private HPC Compute Node",
  gpu_model: "NVIDIA CUDA GPU (Dedicated Server)",
  vram_used_mb: 5214,
  vram_total_mb: 8188,
  active_llm_queue: 0,
  timestamp: new Date().toISOString()
};
