# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Long Nhật (`NhatPrv <torikun2005@gmail.com>`) — Tech Lead & Module Advisor  
> **Tuần thực hiện**: Tuần 1 - Chương 1 (Tổng quan AI trong SDLC & Foundation Models)  
> **Module liên quan**: advisor & Architecture Core  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Thiết lập kiến trúc khung dự án Client bằng Next.js 14 App Router, áp dụng TypeScript strict mode, cấu trúc modular hóa 3 phân hệ độc lập (`ingestion`, `analytics`, `advisor`) để tránh xung đột mã nguồn khi 3 thành viên cùng đóng góp.
* **Công cụ AI sử dụng**: Gemini 1.5 Pro & Claude 3.5 Sonnet.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Tôi muốn tạo một dự án Next.js 14 cho 3 người cùng làm đồ án hướng nghiệp có tích hợp AI. Hãy gợi ý cấu trúc thư mục tối ưu nhất để không bị conflict git khi mỗi người làm một module khác nhau.
```
* **Kết quả nhận được từ AI**:
  * AI đưa ra cấu trúc dạng truyền thống: gom tất cả components vào `src/components/`, tất cả hooks vào `src/hooks/`, và chia pages theo đường dẫn URL thông thường.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Cấu trúc này khiến cả 3 thành viên cùng chỉnh sửa chung một thư mục `components/` và `hooks/`, nguy cơ gây xung đột Git merge conflict rất cao.
  * Chưa áp dụng mô hình kiến trúc theo miền (Domain-Driven / Feature-Sliced Modular Architecture).

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là Software Architect cho dự án Next.js 14 App Router với TypeScript strict. Dự án gồm 3 phân hệ độc lập: Ingestion (tải bảng điểm, khảo sát), Analytics (biểu đồ radar, so sánh kỹ năng), Advisor (lộ trình học tập, chatbot cố vấn).
Hãy thiết kế cấu trúc thư mục tuân thủ nguyên tắc Feature-Driven Modular Architecture:
1. Mỗi module có thư mục riêng trong `src/modules/<module-name>/` gồm components, services, types và hooks riêng.
2. Có file index.ts làm ranh giới công khai (Public API) cho từng module.
3. Thư mục `src/stores/` và `src/services/` dùng cho logic dùng chung toàn cục.
```
* **Kết quả sau khi cải tiến**:
  * AI đề xuất cấu trúc phân tầng sạch sẽ:
    `src/modules/{ingestion, analytics, advisor}/` với `index.ts` đóng gói.
  * Các thành viên chỉ thao tác bên trong thư mục module được phân công, đảm bảo cô lập phạm vi trách nhiệm.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Khởi tạo file điều phối chính `src/modules/index.ts` để re-export an toàn:
  ```typescript
  // src/modules/index.ts - Re-export các module đại diện cho 3 phân hệ
  export * from "./ingestion";
  export * from "./analytics";
  export * from "./advisor";
  ```
  * Cấu hình `tsconfig.json` với `"strict": true`, `"noImplicitAny": true` để đảm bảo an toàn kiểu dữ liệu ngay từ tuần đầu tiên.
* **Bài học kinh nghiệm rút ra**: Khi giao tiếp với AI về kiến trúc phần mềm, cần định nghĩa rõ quy mô nhóm và ranh giới trách nhiệm giữa các module thì AI mới đưa ra cấu trúc thư mục phù hợp với thực tế làm việc nhóm.
