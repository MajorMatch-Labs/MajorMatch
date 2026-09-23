# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Nguyễn Văn Hoàng (`Nguyễn Văn Hoàng <hoangtungmy123@gmail.com>`) — Module Ingestion  
> **Tuần thực hiện**: Tuần 1 - Chương 1 (Tổng quan AI trong SDLC & Foundation Models)  
> **Module liên quan**: ingestion  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Phân tích đặc tính dữ liệu đầu vào (tệp bảng điểm PDF đại học và phiếu khảo sát sở thích), xác định ranh giới cửa sổ ngữ cảnh (Context Window) và thiết lập cơ chế lọc trước (pre-validation) ở phía Client trước khi gửi request tới AI Backend.
* **Công cụ AI sử dụng**: ChatGPT-4o & Gemini 1.5 Pro.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Sinh viên gửi file bảng điểm PDF lên để AI phân tích. Cần lưu ý những gì về kích thước file và độ dài token của mô hình ngôn ngữ lớn?
```
* **Kết quả nhận được từ AI**:
  * AI trả lời lý thuyết chung về dung lượng token của GPT-4 (8k, 32k, 128k context), khuyên dùng thư viện parse PDF trên server mà không đưa ra giải pháp cụ thể cho phía Client.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Không giải quyết bài toán kiểm soát tài nguyên thực tế của Client: Người dùng có thể upload nhầm file dung lượng lớn (>50MB) hoặc file scan hình ảnh làm nghẽn mạng và lãng phí GPU server.
  * Thiếu tiêu chuẩn giới hạn kỹ thuật cụ thể.

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Tôi đang xây dựng module Ingestion cho web app định hướng nghề nghiệp bằng Next.js 14. Hệ thống backend dùng Local LLM (Qwen 2.5 7B, 32k context).
Hãy giúp tôi phân tích và xác lập các ràng buộc kỹ thuật cụ thể cho Client:
1. Giới hạn dung lượng file PDF tối đa được phép upload là bao nhiêu để vừa đủ cho bảng điểm 4-8 trang đại học mà không gây tràn bộ nhớ?
2. Có cần kiểm tra MIME type hay magic bytes ở client không?
3. Cách ước lượng số lượng token văn bản bóc tách từ 1 trang bảng điểm để không vượt quá context window khi gửi prompt cho LLM?
```
* **Kết quả sau khi cải tiến**:
  * AI phân tích rõ: 1 bảng điểm đại học trung bình chứa 30-50 môn học, văn bản thuần khoảng 1.500 - 3.000 tokens (rất an toàn trong ngưỡng context 8k-32k).
  * Đề xuất ngưỡng kích thước tối ưu là **10MB** và bắt buộc kiểm tra `application/pdf` ngay tại Client để từ chối file sai sớm nhất.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Thiết lập các hằng số cấu hình ranh giới trong module Ingestion:
  ```typescript
  export const INGESTION_LIMITS = {
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
    ALLOWED_MIME_TYPES: ["application/pdf"],
    MAX_SURVEY_QUESTIONS: 10,
    SCORE_RANGE: { MIN: 1, MAX: 5 },
  } as const;
  ```
* **Bài học kinh nghiệm rút ra**: Hiểu rõ giới hạn Context Window của LLM giúp nhóm tối ưu hóa được chi phí tính toán và chủ động chặn các lỗi định dạng ngay tại tầng giao diện Client.
