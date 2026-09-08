# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: [Điền tên bạn vào đây: Văn Hoàng / Ánh Vy / Long Nhật]  
> **Tuần thực hiện**: Tuần [1..9] - Chương [1..9]  
> **Module liên quan**: [ingestion / analytics / advisor]

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: (Ví dụ: Thiết kế prompt trích xuất điểm từ CV / Viết thuật toán tính điểm RIASEC / Tối ưu component Recharts Radar).
* **Công cụ AI sử dụng**: (Ví dụ: ChatGPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro / GitHub Copilot).

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
[Dán câu prompt đầu tiên bạn đã hỏi AI vào đây]
```
* **Kết quả nhận được từ AI**:
  * [Mô tả tóm tắt kết quả AI sinh ra]
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * [Chỉ ra lỗi: Ví dụ code bị thiếu import, logic bị sai trường hợp điểm 0, layout bị vỡ trên mobile, hoặc output không đúng định dạng JSON yêu cầu].

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
[Dán câu prompt bạn đã điều chỉnh (thêm ràng buộc context, few-shot examples, JSON schema) vào đây]
```
* **Kết quả sau khi cải tiến**:
  * [Mô tả kết quả đã khắc phục được lỗi như thế nào]

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do bạn tự sửa lại bằng tay**:
  ```typescript
  // Trích đoạn code bạn đã chỉnh sửa lại cho khớp với chuẩn dự án
  ```
* **Bài học kinh nghiệm rút ra**: (Ví dụ: Cần ép kiểu JSON Schema chặt chẽ hơn để tránh AI sinh ảo giác).
