# BẬT NHẬT KÝ TIẾN HÓA CÂU LỆNH AI (AI PROMPT EVOLUTION LOG) - TUẦN 8
## HỌC PHẦN: CHUYÊN ĐỀ 4 - PHÁT TRIỂN SẢN PHẨM AI (CS2028)
* **Thành viên phụ trách**: Nguyễn Thị Ánh Vy (`Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`)
* **Vai trò**: Module `analytics` (Recharts Radar, Skill Gap, Design System)
* **Nhiệm vụ tuần 8**: AI trong Kiểm thử Phần mềm (Testing & Automation) - Thiết kế Unit Test cho bộ chuyển đổi dữ liệu Recharts và ma trận kỹ năng.

---

### 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT
- **Bài toán**: Biểu đồ Radar và khối phân rã kỹ năng (Skill Breakdown) yêu cầu dữ liệu hiển thị phải cực kỳ chuẩn xác và phòng ngừa tối đa lỗi runtime:
  1. Chuyển đổi dữ liệu từ API Backend sang RechartsRadarPoint với tính toán delta và gắn nhãn phân loại (`surplus`, `match`, `gap`).
  2. Tính toán điểm chuẩn hóa `summarizeReadiness` không được phép rơi vào lỗi `NaN` hoặc chia cho 0 khi dữ liệu rỗng.
  3. Phân tích ma trận kỹ năng `analyzeSkillGap` với tỷ lệ phần trăm phân bố chính xác $100\%$.
  4. Cần bộ Unit Tests tự động hóa trên Vitest chứng minh sự ổn định của tầng chuyển đổi dữ liệu.

---

### 2. TIẾN HÓA CÂU LỆNH (PROMPT ITERATIONS)

#### Vòng 1: Yêu cầu AI viết Unit Test cho RadarTransformer
* **Prompt ban đầu**:
  ```text
  Tôi có class RadarTransformer trong src/modules/analytics/utils/radarTransformer.ts. Hãy viết unit test bằng Vitest để test các hàm trong class này.
  ```
* **Kết quả từ AI**:
  AI sinh code kiểm thử các trường hợp dữ liệu lý tưởng (happy path), nhưng bỏ quên các trường hợp biên quan trọng: mảng rỗng `[]`, `null`, `undefined`, và trường hợp delta nằm đúng ranh giới ngưỡng $\pm 0.5$.

#### Vòng 2: Bổ sung ca kiểm thử Edge Cases (Human-in-the-loop)
* **Prompt cải tiến**:
  ```text
  Hãy bổ sung vào file analytics.test.ts các ca kiểm thử biên (Edge Cases):
  1. Kiểm tra đầu vào `[]` và `undefined` đối với cả 3 phương thức `transform`, `summarizeReadiness`, `analyzeSkillGap`, đảm bảo không bao giờ ném ra exception hay trả về NaN.
  2. Kiểm tra chính xác 3 trạng thái của delta:
     - delta > 0.5 -> 'surplus'
     - delta < -0.5 -> 'gap'
     - -0.5 <= delta <= 0.5 -> 'match'
  3. Kiểm tra tính toán tỷ lệ phần trăm phân bố kỹ năng (masteredPercentage, gapPercentage) với dữ liệu thực tế.
  ```
* **Kết quả thu được**:
  Tập tin `analytics.test.ts` hoàn chỉnh, kiểm thử thành công 6 kịch bản toàn diện, bảo vệ giao diện Recharts khỏi mọi sự cố dữ liệu bất thường.

---

### 3. KẾT QUẢ ĐẠT ĐƯỢC
- **Tập tin bàn giao**: `client/tests/unit/analytics.test.ts`.
- **Trạng thái**: Tất cả ca kiểm thử đạt `PASSED`.
- **Hiệu năng**: Thời gian thực thi toàn bộ test suite dưới $10\text{ms}$.
