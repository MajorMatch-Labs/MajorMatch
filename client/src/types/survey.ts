/**
 * Kiểu dữ liệu và cấu trúc câu hỏi trắc nghiệm Holland Code RIASEC
 */

export interface RiasecQuestion {
  id: number;
  group: "R" | "I" | "A" | "S" | "E" | "C";
  group_name: string;
  text: string;
  score: number; // 1 -> 5
}

export interface CareerTag {
  id: string;
  label: string;
  category: string;
}

export const HOLLAND_QUESTIONS: RiasecQuestion[] = [
  { id: 1, group: "R", group_name: "Thực tế (Realistic)", text: "Tôi thích sửa chữa, lắp ráp phần cứng máy tính hoặc các thiết bị công nghệ.", score: 3 },
  { id: 2, group: "R", group_name: "Thực tế (Realistic)", text: "Tôi có xu hướng làm việc với các hệ thống máy chủ vật lý, thiết bị mạng hoặc mạch IoT.", score: 3 },
  { id: 3, group: "I", group_name: "Nghiên cứu (Investigative)", text: "Tôi thích tìm hiểu nguyên lý thuật toán, giải toán tư duy và nghiên cứu mô hình toán học.", score: 4 },
  { id: 4, group: "I", group_name: "Nghiên cứu (Investigative)", text: "Tôi đam mê việc bóc tách số liệu, phân tích dữ liệu lớn và tìm ra quy luật ẩn sau dữ liệu.", score: 5 },
  { id: 5, group: "A", group_name: "Nghệ thuật (Artistic)", text: "Tôi thích thiết kế giao diện sáng tạo, phối màu UI/UX và tạo chuyển động hình ảnh thu hút.", score: 3 },
  { id: 6, group: "S", group_name: "Xã hội (Social)", text: "Tôi sẵn sàng hướng dẫn, giảng dạy công nghệ cho người mới và tham gia các hội thảo cộng đồng.", score: 3 },
  { id: 7, group: "E", group_name: "Quản lý (Enterprising)", text: "Tôi tự tin thuyết trình giải pháp công nghệ, dẫn dắt nhóm dự án hoặc mơ ước khởi nghiệp công nghệ.", score: 4 },
  { id: 8, group: "C", group_name: "Quy củ (Conventional)", text: "Tôi là người tỉ mỉ, thích quản trị cơ sở dữ liệu có cấu trúc và tuân thủ quy trình kiểm thử nghiêm ngặt.", score: 4 },
  { id: 9, group: "I", group_name: "Nghiên cứu (Investigative)", text: "Tôi bị cuốn hút bởi Trí tuệ nhân tạo (AI), học máy (Machine Learning) và mô hình ngôn ngữ lớn (LLM).", score: 5 },
  { id: 10, group: "E", group_name: "Quản lý (Enterprising)", text: "Tôi thích đóng vai trò Product Owner hoặc Scrum Master điều phối tiến độ sản phẩm phần mềm.", score: 3 }
];

export const AVAILABLE_CAREER_TAGS: CareerTag[] = [
  { id: "ai_engineer", label: "AI & Data Science Specialist", category: "Data / AI" },
  { id: "fullstack_dev", label: "Fullstack Web Engineer", category: "Software" },
  { id: "devops_cloud", label: "Cloud & DevOps Solutions Architect", category: "Infrastructure" },
  { id: "cyber_sec", label: "Information Security Analyst", category: "Security" },
  { id: "mobile_dev", label: "Mobile Application Developer", category: "Software" },
  { id: "embedded_iot", label: "IoT & Embedded Systems Engineer", category: "Hardware / IoT" }
];
