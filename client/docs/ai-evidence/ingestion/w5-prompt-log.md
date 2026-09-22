# NHẬT KÝ SỬ DỤNG AI — TUẦN 5 (CHƯƠNG 5: KIẾN TRÚC & API CONSUMER)
## HỌC PHẦN: CS2028 - AI PRODUCT DEVELOPMENT: END TO END
* **Thành viên phụ trách:** Nguyễn Văn Hoàng (`Vcoch27 <hoangtungmy123@gmail.com>`) — Module Ingestion
* **Thời gian thực hiện:** 22/09/2026
* **Hạng mục:** Xây dựng IngestionService Client Adapter, Tiền kiểm tra tệp PDF và Fallback Mock Data

---

### 1. Mục tiêu công việc
1. Thiết kế `IngestionService` đóng vai trò tầng trung gian (Adapter) giữa Giao diện người dùng (`FileDropzone`, `RiasecSurvey`) và Backend HPC.
2. Thiết lập quy chuẩn kiểm tra tính hợp lệ của tệp phía Client (kích thước tối đa 10MB, định dạng PDF) để giảm tải các request lỗi lên máy chủ tính toán.
3. Hiện thực hóa cơ chế nạp Mock Data nhanh (`loadOfflineDemoData`) giúp kiểm thử toàn diện giao diện mà không phụ thuộc trạng thái server.

---

### 2. Chi tiết Prompt và Nhật ký phản biện AI

#### Prompt 1: Thiết kế Ingestion Adapter và Tiền kiểm định File
* **Prompt đưa cho AI:**
  ```text
  Tôi đang phụ trách Module Ingestion của dự án MajorMatch (Next.js 14 / TypeScript).
  Hãy viết class IngestionService để:
  1. Hàm validateTranscriptFile(file: File): kiểm tra đuôi .pdf, size <= 10MB, file rỗng.
  2. Hàm uploadTranscript(file: File): gọi store uploadTranscriptAction an toàn.
  3. Hàm submitRiasecSurvey: nhận điểm 6 nhóm RIASEC và thẻ chuyên ngành, cập nhật store và kích hoạt tính toán match score.
  4. Hàm loadOfflineDemoData: nạp mock data khi chạy demo offline.
  ```
* **Kết quả AI sinh ra:**
  - AI sinh ra lớp `IngestionService` với đầy đủ các hàm static.
  - *Thiếu sót phát hiện qua review:* AI dùng `window.location.reload()` để reset giao diện khi tải mock data, làm mất trạng thái SPA mượt mà của Next.js.
* **Cải tiến & Phản biện của sinh viên:**
  - Loại bỏ hoàn toàn reload trang, thay thế bằng hàm cập nhật trực tiếp `store.setProfile(...)` và gọi `store.calculateMatchAction()` bất đồng bộ để UI chuyển động liền mạch.

#### Prompt 2: Tích hợp Service vào FileDropzone và RiasecSurvey
* **Prompt đưa cho AI:**
  ```text
  Kết nối FileDropzone.tsx với IngestionService. Thêm nút bấm 'Sử dụng bảng điểm mẫu thử nghiệm' dưới dropzone khi người dùng chưa có file PDF sẵn để demo nhanh tính năng.
  ```
* **Kết quả AI sinh ra:**
  - AI đưa ra component tích hợp tốt, có hiển thị spinner loading và badge trạng thái GPA/Số tín chỉ.

---

### 3. Đánh giá kết quả & Trách nhiệm cá nhân
- Module Ingestion đã có tầng Service riêng (`src/modules/ingestion/services/ingestionService.ts`), phân tách rõ ràng trách nhiệm giữa Logic nghiệp vụ và Giao diện hiển thị (Separation of Concerns).
- Giảm thiểu hoàn toàn nguy cơ lỗi người dùng khi upload file sai định dạng lên FastAPI backend.
