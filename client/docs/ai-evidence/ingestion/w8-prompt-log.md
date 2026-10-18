# BẬT NHẬT KÝ TIẾN HÓA CÂU LỆNH AI (AI PROMPT EVOLUTION LOG) - TUẦN 8
## HỌC PHẦN: CHUYÊN ĐỀ 4 - PHÁT TRIỂN SẢN PHẨM AI (CS2028)
* **Thành viên phụ trách**: Nguyễn Văn Hoàng (`Nguyễn Văn Hoàng <hoangtungmy123@gmail.com>`)
* **Vai trò**: Module `ingestion` (Input Validation, Magic Bytes, RIASEC)
* **Nhiệm vụ tuần 8**: AI trong Kiểm thử Phần mềm (Testing & Automation) - Thiết kế Unit Test kiểm soát an toàn tập tin bảng điểm và Magic Bytes nhị phân.

---

### 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT
- **Bài toán**: Module Ingestion tiếp nhận tệp bảng điểm từ sinh viên. Để bảo vệ máy chủ AI và ngăn chặn mã độc giả mạo đuôi `.pdf` (như file `.exe`, `.bat` hoặc `.png` đổi tên thành `.pdf`), client-side cần một bộ tiền kiểm tra chặt chẽ:
  1. Kiểm tra dung lượng rỗng (0 bytes) và quá tải ($>10\text{MB}$).
  2. Kiểm tra phần mở rộng tệp (`.pdf`) và chuẩn MIME (`application/pdf`).
  3. Đọc mảng nhị phân `ArrayBuffer` để xác thực Magic Bytes `%PDF-` (`0x25 0x50 0x44 0x46`).
  4. Cần bộ Unit Tests tự động hóa trên Vitest chứng minh khả năng chặn đứng các cuộc tấn công giả mạo định dạng.

---

### 2. TIẾN HÓA CÂU LỆNH (PROMPT ITERATIONS)

#### Vòng 1: Yêu cầu AI viết Unit Test cho File Validation
* **Prompt ban đầu**:
  ```text
  Tôi có file fileValidation.ts kiểm tra file PDF bảng điểm. Hãy viết file unit test bằng Vitest kiểm tra tất cả các hàm.
  ```
* **Kết quả từ AI**:
  AI sinh code nhưng sử dụng `new File()` mặc định của trình duyệt không tạo được `arrayBuffer()` hợp lệ trong môi trường kiểm thử Node.js, khiến bài test `validatePdfMagicBytes` bị treo hoặc báo lỗi `slice is not a function`.

#### Vòng 2: Phản biện & Chuẩn hóa Mocking nhị phân (Human-in-the-loop)
* **Prompt cải tiến**:
  ```text
  Trong môi trường Vitest (Node 20), hãy viết helper function `createMockFile(name, sizeBytes, type, contentBytes)` sử dụng Uint8Array để tạo buffer nhị phân thực sự, có hỗ trợ phương thức `.slice()` và `.arrayBuffer()`.
  Sau đó viết các ca test chi tiết cho:
  - formatFileSize (0 bytes, KB, MB)
  - validatePdfMimeAndExtension (chặn 0 bytes, chặn đuôi .docx, chặn file đổi đuôi nhưng sai MIME)
  - validatePdfFileSize (cho phép <10MB, chặn >10MB)
  - validatePdfMagicBytes (chấp nhận %PDF-, từ chối header PNG/khác)
  - validateTranscriptPdfFull (chạy xuyên suốt pipeline)
  ```
* **Kết quả thu được**:
  Tập tin `fileValidation.test.ts` hoàn chỉnh, kiểm thử thành công 10 ca kiểm tra bảo mật, không phụ thuộc vào trình duyệt thật.

---

### 3. KẾT QUẢ ĐẠT ĐƯỢC
- **Tập tin bàn giao**: `client/tests/unit/fileValidation.test.ts`.
- **Độ bao phủ**: $100\%$ các hàm kiểm soát tính hợp lệ của tệp bảng điểm.
- **Trạng thái**: Tất cả ca kiểm thử đạt `PASSED`.
