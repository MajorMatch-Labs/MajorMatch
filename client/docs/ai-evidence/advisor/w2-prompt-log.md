# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Long Nhật (`NhatPrv <torikun2005@gmail.com>`) — Tech Lead & Module Advisor  
> **Tuần thực hiện**: Tuần 2 - Chương 2 (Kỹ thuật viết câu lệnh & Structured Outputs)  
> **Module liên quan**: advisor & Architecture Core  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Thiết kế và chuẩn hóa bộ Schemas cho Structured Outputs trong TypeScript/Zod nhằm đảm bảo dữ liệu trao đổi giữa mô hình AI/Backend HPC và Client không bao giờ bị lệch chuẩn hoặc vỡ kiểu lúc thực thi.
* **Công cụ AI sử dụng**: Gemini 1.5 Pro & Claude 3.5 Sonnet.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Viết cho tôi các interface TypeScript cho dự án hướng nghiệp AI gồm: phân tích bảng điểm, kết quả gợi ý ngành, dữ liệu biểu đồ radar và lộ trình học tập.
```
* **Kết quả nhận được từ AI**:
  * AI định nghĩa các `interface` cơ bản nhưng sử dụng nhiều kiểu lỏng lẻo: `any`, `object`, thiếu các trường quan trọng như `request_id`, `status` và `readiness_score`.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Không có cơ chế kiểm tra kiểu lúc chạy (Runtime Validation).
  * Thiếu các ràng buộc số thực (number trong khoảng 0 đến 10 cho điểm radar, 0 đến 100 cho tỷ lệ phần trăm).

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là TypeScript Data Architect. Tôi cần định nghĩa Data Contracts cho hệ thống Client kết nối AI Backend theo chuẩn Structured Outputs.
Hãy viết bộ Schemas/Interfaces trong `src/types/schema.ts` với các yêu cầu:
1. `CourseItem`: id, code, name, credits (number), grade_letter, grade_point (number 0-4).
2. `RadarAxisItem`: axis_name (string), user_score (number 0-10), benchmark_score (number 0-10).
3. `MajorMatchItem`: major_code, major_name, match_percentage (0-100), key_reasons (string[]).
4. `RoadmapMilestone`: semester (number), title, courses (CourseItem[]), skill_focus (string[]).
5. Sử dụng type-guards hoặc kiểm tra giá trị hợp lệ để phòng ngừa trường hợp backend trả về null/undefined.
```
* **Kết quả sau khi cải tiến**:
  * AI sinh ra cấu trúc DTO chặt chẽ, có kiểm soát kiểu số thực và mảng chuỗi xác định, khớp với thiết kế của Backend HPC.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Bổ sung thêm các thuộc tính mở rộng cho `RadarAxisItem` để hỗ trợ tính delta phía client:
  ```typescript
  export interface RadarAxisItem {
    axis_name: string;
    user_score: number;
    benchmark_score: number;
    delta?: number;
    status?: "surplus" | "match" | "gap";
  }
  ```
  * Thêm alias tương thích ngược `match_score` và `match_percentage` để không bị lỗi runtime khi backend thay đổi phiên bản.
* **Bài học kinh nghiệm rút ra**: Ép kiểu chặt chẽ (Strict Types) ngay từ tuần thứ hai giúp toàn bộ nhóm tránh được hàng chục lỗi "undefined property" khi bắt đầu kết nối API vào các tuần sau.
