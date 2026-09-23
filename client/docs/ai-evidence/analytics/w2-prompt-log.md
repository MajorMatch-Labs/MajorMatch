# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Nguyễn Thị Ánh Vy (`Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`) — Module Analytics  
> **Tuần thực hiện**: Tuần 2 - Chương 2 (Kỹ thuật viết câu lệnh & Structured Outputs)  
> **Module liên quan**: analytics  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Thiết kế mẫu Prompt yêu cầu mô hình AI sinh cấu trúc dữ liệu JSON để phân tích khoảng cách kỹ năng (Skill Gap Analysis) và các tham số vẽ biểu đồ mạng nhện Recharts Radar 6 trục so sánh giữa Năng lực thực tế của sinh viên và Yêu cầu chuẩn của chuyên ngành.
* **Công cụ AI sử dụng**: Claude 3.5 Sonnet & ChatGPT-4o.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Hãy phân tích xem sinh viên này có điểm mạnh và điểm yếu gì so với ngành Kỹ thuật dữ liệu & AI, viết ra dạng JSON để đưa lên biểu đồ radar.
```
* **Kết quả nhận được từ AI**:
  * AI trả về văn bản tự do kèm một đoạn JSON với tên các trục ngẫu hứng ("Toán học": 8, "Lập trình": 7, "Tiếng Anh": 6).
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Số lượng trục và tên trục không cố định, gây lỗi khi Recharts render biểu đồ Radar cố định 6 trục.
  * Thiếu điểm chuẩn (benchmark benchmark_score) để so sánh 2 lớp dữ liệu đối sánh (Sinh viên vs Ngành).

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là AI Analytics Engine cho hệ thống MajorMatch. Hãy phân tích hồ sơ sinh viên và trả về cấu trúc JSON nghiêm ngặt theo đúng Schema:

RÀNG BUỘC CẤU TRÚC:
Phải có chính xác 6 trục đại diện cho 6 nhóm năng lực cốt lõi:
1. "Nền tảng Toán & Giải thuật"
2. "Kỹ thuật Lập trình & Cấu trúc dữ liệu"
3. "Hệ thống máy tính & Đám mây"
4. "Khoa học Dữ liệu & Học máy"
5. "Tư duy Thiết kế & Sản phẩm"
6. "Kỹ năng Mềm & Ngoại ngữ"

Định dạng JSON yêu cầu:
{
  "radar_axes": [
    {
      "axis_name": string,
      "user_score": number,      // Thang điểm 0 - 10
      "benchmark_score": number  // Thang điểm 0 - 10
    }
  ],
  "skill_breakdown": {
    "mastered": string[],
    "developing": string[],
    "missing": string[]
  }
}
```
* **Kết quả sau khi cải tiến**:
  * AI trả về cấu trúc chuẩn xác 6 phần tử mảng cố định, đồng nhất về thang điểm 10.
  * Phân rã kỹ năng thành 3 danh mục rõ ràng (Mastered / Developing / Missing).

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Viết hàm chuyển đổi dữ liệu để đảm bảo điểm số luôn nằm trong đoạn [0, 10] và không bị lỗi `NaN`:
  ```typescript
  export function sanitizeRadarScore(val: number): number {
    if (typeof val !== 'number' || isNaN(val)) return 0;
    return Math.max(0, Math.min(10, Number(val.toFixed(1))));
  }
  ```
* **Bài học kinh nghiệm rút ra**: Biểu đồ hình học yêu cầu số lượng trục và phạm vi giá trị tuyệt đối ổn định; việc định nghĩa cứng tên trục trong System Prompt là chìa khóa để frontend không bị vỡ giao diện.
