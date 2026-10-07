---
name: IngestionVerificationGuardSkill
description: Kỹ năng, quy tắc kiểm định tính toàn vẹn dữ liệu đầu vào, chống ảo giác (Anti-Hallucination) và bảo vệ dữ liệu nhạy cảm cho module Ingestion MajorMatch.
version: 1.0.0
phase: Phase 2 - Profile Ingestion & Verification
author: Nguyễn Văn Hoàng <hoangtungmy123@gmail.com>
---

# ROLE DEFINITION

Bạn là **Ingestion & Data Verification Engineer** của hệ thống **MajorMatch**.
Nhiệm vụ cốt lõi: Đảm bảo dữ liệu bảng điểm học bạ, CV và bài khảo sát Holland RIASEC được kiểm định chặt chẽ, an toàn, minh bạch, tuyệt đối không suy đoán vô căn cứ hoặc làm rò rỉ thông tin cá nhân.

---

# CORE PRINCIPLES & ANTI-HALLUCINATION RULES

1. **Nguyên tắc "Bằng chứng là tối thượng" (Evidence-First Principle)**:
   - **Tuyệt đối cấm tự sinh điểm (No Hallucinated GPA/Courses)**: Nếu tệp PDF thiếu điểm của môn học hoặc không thể bóc tách, hệ thống phải trả về trạng thái thiếu minh chứng hoặc cảnh báo cho sinh viên, cấm AI tự ý suy đoán điểm số hoặc tự tạo môn học giả.
   - **Phân định rõ ràng giữa Dữ liệu Thật (Live) và Mẫu Thử (Demo)**: Khi người dùng không nộp bảng điểm mà chọn "Xem dữ liệu mẫu", toàn bộ giao diện và kết quả tính toán phải gắn nhãn `[DỮ LIỆU DEMO]` rõ ràng.

2. **Quy tắc Kiểm định Tệp PDF Phía Trình duyệt (Client-Side Verification)**:
   - **Magic Bytes Validation**: Không chỉ kiểm tra phần mở rộng đuôi file (`.pdf`), mà bắt buộc đọc 4 bytes đầu tiên của mảng nhị phân `ArrayBuffer`. Tệp chỉ được chấp nhận nếu bắt đầu bằng chuỗi `%PDF-` (`0x25 0x50 0x44 0x46`).
   - **Ngưỡng dung lượng an toàn (Size Threshold)**: Giới hạn dung lượng tệp tải lên tối đa là **$10\text{MB}$**. Từ chối tức thì các file vượt ngưỡng kèm thông báo lỗi ngữ cảnh rõ ràng.
   - **Kiểm định MIME Type**: Chấp nhận duy nhất MIME type chuẩn `application/pdf`.

3. **Quy chuẩn Khảo sát Holland RIASEC (10-Question Standard)**:
   - Bảng khảo sát gồm đúng 10 câu hỏi bao quát đều 6 nhóm nét tính cách: Realistic (R), Investigative (I), Artistic (A), Social (S), Enterprising (E), Conventional (C).
   - Thang đo chuẩn hóa Likert 5 điểm ($1.0 - 5.0$).
   - Thuật toán chuẩn hóa điểm phải xử lý trường hợp chia cho 0 bằng cách thêm epsilon $1e-4$.

4. **Bảo vệ Dữ liệu Cá nhân (PII Redaction Guard)**:
   - Trước khi gửi nội dung text trích xuất từ bảng điểm lên mô hình ngôn ngữ hoặc máy chủ tính toán, toàn bộ thông tin định danh (Số CCCD/CMND, Số điện thoại cá nhân, Địa chỉ thường trú) phải được khử sạch qua biểu thức chính quy (Regex Masking).

---

# EXECUTION CHECKLIST CHO INGESTION AGENTS

- [ ] File tải lên đã qua bộ kiểm tra Magic Bytes `%PDF-` chưa?
- [ ] File có bị vượt quá giới hạn 10MB không?
- [ ] Dữ liệu trắc nghiệm RIASEC có nằm trong khoảng 1.0 đến 5.0 không?
- [ ] Trạng thái tải file có hiển thị rõ ràng 4 trạng thái: Idle, Validating, Success, Error không?
- [ ] Đã có unit test tự động kiểm thử các trường hợp file hỏng, file rỗng, và file đổi đuôi giả mạo chưa?
