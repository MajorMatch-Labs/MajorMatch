# BẬT NHẬT KÝ TIẾN HÓA CÂU LỆNH AI (AI PROMPT EVOLUTION LOG) - TUẦN 8
## HỌC PHẦN: CHUYÊN ĐỀ 4 - PHÁT TRIỂN SẢN PHẨM AI (CS2028)
* **Thành viên phụ trách**: Đặng Long Nhật (`NhatPrv <torikun2005@gmail.com>`)
* **Vai trò**: Tech Lead / Architecture / Module `advisor`
* **Nhiệm vụ tuần 8**: AI trong Kiểm thử Phần mềm (Testing & Automation) - Khung kiểm thử Vitest và Integration Test cho Zustand State Store.

---

### 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT
- **Bài toán**: Ứng dụng Client Next.js 14 có luồng state quản lý qua Zustand (`useProfileStore.ts`), liên kết giữa hồ sơ bảng điểm, phân tích độ lệch năng lực và cây lộ trình học tập 4 kỳ. Cần xây dựng kịch bản kiểm thử tích hợp (Integration Tests) chạy trên Vitest để tự động xác thực:
  1. Trạng thái khởi tạo mặc định.
  2. Đồng bộ hóa khóa học, GPA tích lũy, tổng tín chỉ.
  3. Nạp và giải phóng kết quả phân tích AI (`MOCK_ANALYSIS`).
  4. Cơ chế toggle hoàn thành nhiệm vụ (`toggleTaskCompletion`) và tính điểm tương tác.
  5. Đảm bảo khôi phục nguyên trạng khi người dùng nộp lại hồ sơ mới (`resetProfile`).

---

### 2. TIẾN HÓA CÂU LỆNH (PROMPT ITERATIONS)

#### Vòng 1: Yêu cầu AI sinh Integration Test Suite cơ bản
* **Prompt ban đầu**:
  ```text
  Tôi đang dùng Zustand cho store useProfileStore trong dự án Next.js 14 và muốn viết Integration Test bằng Vitest.
  Hãy viết file tests/integration/profileStore.test.ts kiểm tra các hàm trong store.
  ```
* **Kết quả từ AI**:
  AI sinh ra file test nhưng gặp vấn đề: Store không được reset giữa các ca kiểm thử (`it`), dẫn đến rò rỉ state (state pollution) giữa các test case, gây lỗi ngẫu nhiên khi chạy song song.

#### Vòng 2: Tinh chỉnh Prompt với Nguyên tắc Isolation & Mock Data
* **Prompt cải tiến (Human-in-the-loop)**:
  ```text
  Hãy viết lại Integration Test cho useProfileStore với các yêu cầu nghiêm ngặt sau:
  1. Sử dụng hook beforeEach() của Vitest để gọi useProfileStore.getState().resetProfile(), đảm bảo tính cô lập hoàn toàn giữa các ca test.
  2. Sử dụng MOCK_ROADMAP và MOCK_ANALYSIS thực tế từ '@/services/mockData' để mô phỏng tải trọng thật.
  3. Kiểm tra kiểm thử chu trình: nạp hồ sơ -> tính GPA/credits -> nạp phân tích -> nạp lộ trình -> toggle hoàn thành task -> resetProfile.
  ```
* **Kết quả thu được**:
  Mã nguồn sinh ra đạt độ tin cậy cao, 6 ca kiểm thử bao phủ toàn bộ vòng đời của Store, chạy qua hoàn toàn 100% trong vòng vài mili-giây.

---

### 3. ĐÁNH GIÁ CHẤT LƯỢNG & ĐIỂM CHẤM TỰ ĐỘNG
- **Tập tin bàn giao**: `client/tests/integration/profileStore.test.ts`, `client/vitest.config.ts`, `client/package.json`.
- **Kết quả thực thi**: 6/6 test cases đạt trạng thái `PASSED`.
- **Đóng góp**: Thiết lập thành công nền tảng kiểm thử tự động Vitest cho toàn bộ nhóm phát triển Frontend.
