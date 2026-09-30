# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Nguyễn Văn Hoàng (`Nguyễn Văn Hoàng <hoangtungmy123@gmail.com>`) — Module Ingestion  
> **Tuần thực hiện**: Tuần 6 - Chương 6 (AI Lập trình: Code Generation & Logic Phức tạp)  
> **Module liên quan**: ingestion  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Sử dụng AI Code Generation để hiện thực hóa thuật toán tính điểm Holland RIASEC cục bộ (`calculateHollandScores`), xếp hạng thiên hướng nghề nghiệp nổi trội (`rankRiasecTraits`) và xây dựng bộ kiểm định tệp PDF nâng cao (kích thước tối đa 10MB, kiểm tra magic bytes nhị phân `%PDF-`) ở tầng Client.
* **Công cụ AI sử dụng**: ChatGPT-4o & Claude 3.5 Sonnet.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Viết hàm TypeScript tính điểm 6 nhóm RIASEC từ 10 câu hỏi trắc nghiệm (mỗi câu từ 1 đến 5 điểm). Trả về nhóm cao điểm nhất.
```
* **Kết quả nhận được từ AI**:
  * AI sinh ra một hàm đơn giản tính tổng điểm bằng cách chia dư `id % 6`.
  * Hàm chỉ trả về một nhóm duy nhất có điểm cao nhất mà không xét đến trường hợp hai nhóm bằng điểm nhau (tie-breaker) hoặc trọng số câu hỏi.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Phương pháp chia dư không phản ánh đúng cấu trúc 10 câu hỏi thực tế của bộ trắc nghiệm Holland (vốn có nhóm có 2 câu, có nhóm có 1 câu).
  * Chưa chuẩn hóa thang điểm về khoảng [1.0, 5.0] theo đúng định dạng đầu vào của mô hình Machine Learning ở Backend HPC.
  * Thiếu mã Holland 2 chữ cái nổi trội (Primary & Secondary Trait).

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là Senior TypeScript Engineer. Hãy viết module tính điểm RIASEC chuyên nghiệp trong `src/modules/ingestion/utils/riasecScoring.ts`:
1. Nhận vào mảng 10 câu hỏi có cấu trúc: { id, questionText, category: 'R'|'I'|'A'|'S'|'E'|'C', weight: number }.
2. Hàm `calculateHollandScores(answers)`: Tính trung bình có trọng số cho từng nhóm trait, chuẩn hóa giá trị trong khoảng [1.0, 5.0] và làm tròn 1 chữ số thập phân.
3. Hàm `rankRiasecTraits(scores)`: Xếp hạng 6 nhóm từ cao xuống thấp kèm tỷ lệ phần trăm (1.0 = 20%, 5.0 = 100%).
4. Hàm `getDominantHollandCode(scores)`: Trả về mã Holland 2 ký tự (ví dụ: 'IE', 'RA') đại diện cho 2 nhóm sở thích chiếm ưu thế nhất.
5. Viết kèm unit test kiểm thử các trường hợp biên: tất cả điểm 5, tất cả điểm 1, bỏ sót câu hỏi.
```
* **Kết quả sau khi cải tiến**:
  * AI sinh mã nguồn chuẩn xác với đầy đủ kiểu dữ liệu TypeScript, thuật toán trung bình trọng số và logic xếp hạng rõ ràng.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Tinh chỉnh lại hàm kiểm tra Magic Bytes nhị phân `%PDF-` để không bị lỗi bộ nhớ khi đọc tệp lớn:
  ```typescript
  // Chỉ cắt 4 bytes đầu tiên thay vì nạp toàn bộ file vào RAM
  const slice = file.slice(0, 4);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isMatch = [0x25, 0x50, 0x44, 0x46].every((b, i) => bytes[i] === b);
  ```
  * Tích hợp khung hiển thị mã Holland nổi trội trực tiếp lên `RiasecSurvey.tsx` để người dùng có phản hồi thị giác ngay lập tức khi kéo thanh trượt.
* **Bài học kinh nghiệm rút ra**: Thuật toán tính điểm cục bộ tại Client giúp giảm tải request tính toán không cần thiết lên máy chủ và tăng trải nghiệm phản hồi tức thì cho người dùng.
