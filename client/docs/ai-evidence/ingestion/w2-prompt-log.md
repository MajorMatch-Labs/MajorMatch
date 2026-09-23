# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Nguyễn Văn Hoàng (`Nguyễn Văn Hoàng <hoangtungmy123@gmail.com>`) — Module Ingestion  
> **Tuần thực hiện**: Tuần 2 - Chương 2 (Kỹ thuật viết câu lệnh & Structured Outputs)  
> **Module liên quan**: ingestion  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Thiết kế mẫu Prompt Few-shot để trích xuất danh sách môn học, số tín chỉ và điểm chữ từ đoạn văn bản bảng điểm thô, định dạng đầu ra thành JSON có cấu trúc chuẩn xác để form Ingestion có thể hiển thị xem trước (preview).
* **Công cụ AI sử dụng**: ChatGPT-4o & Claude 3.5 Sonnet.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Trích xuất các môn học trong bảng điểm này ra định dạng JSON:
Toán rời rạc: 3 tín chỉ, điểm A
Lập trình C++: 4 tín chỉ, điểm B+
Cơ sở dữ liệu: 3 tín chỉ, điểm A
```
* **Kết quả nhận được từ AI**:
  * AI trả về đoạn JSON kèm văn bản giải thích dài dòng ở đầu và cuối ("Here is the extracted JSON for your request...").
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Vì có kèm văn bản hội thoại (conversational filler), hàm `JSON.parse()` ở Client sẽ bị văng lỗi crash ngay lập tức.
  * Chưa có ánh xạ từ điểm chữ (A, B+, B, C+, C, D+, D, F) sang thang điểm số hệ 4.0 chuẩn của Bộ Giáo dục & Đào tạo.

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là một AI Data Extraction Engine. Hãy bóc tách danh sách môn học từ văn bản bảng điểm đại học và trả về DUY NHẤT một chuỗi JSON hợp lệ, KHÔNG có markdown ```json, KHÔNG có văn bản giải thích mở đầu hay kết thúc.

QUY TẮC BẮT BUỘC:
1. Định dạng JSON tuân thủ:
{
  "courses": [
    {
      "course_name": string,
      "credits": number,
      "grade_letter": string,
      "grade_point": number // Ánh xạ: A/A+ -> 4.0, B+ -> 3.5, B -> 3.0, C+ -> 2.5, C -> 2.0, D+ -> 1.5, D -> 1.0, F -> 0.0
    }
  ]
}

FEW-SHOT EXAMPLE:
Input: "Nhập môn lập trình 3 tín chỉ đạt điểm B+"
Output: {"courses":[{"course_name":"Nhập môn lập trình","credits":3,"grade_letter":"B+","grade_point":3.5}]}

Văn bản cần xử lý:
[Văn bản bảng điểm thực tế]
```
* **Kết quả sau khi cải tiến**:
  * AI trả về chuỗi JSON thuần khiết $100\%$, parse được trực tiếp bằng `JSON.parse()`.
  * Toàn bộ điểm chữ được quy đổi chính xác sang thang điểm hệ 4.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Viết thêm hàm regex bóc tách JSON an toàn phòng trường hợp mô hình LLM vẫn lỡ chèn ký tự bao ngoài:
  ```typescript
  export function safeExtractJson<T>(rawText: string): T {
    const jsonMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Không tìm thấy cấu trúc JSON hợp lệ trong phản hồi");
    }
    return JSON.parse(jsonMatch[0]) as T;
  }
  ```
* **Bài học kinh nghiệm rút ra**: Kỹ thuật Few-shot kết hợp hướng dẫn ép kiểu tiêu cực (negative constraint: "KHÔNG có markdown") là phương pháp hữu hiệu nhất để có Structured Outputs sạch từ LLM.
