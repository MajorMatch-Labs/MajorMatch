# NHẬT KÝ SỬ DỤNG AI — TUẦN 5 (CHƯƠNG 5: KIẾN TRÚC & API CONSUMER)
## HỌC PHẦN: CS2028 - AI PRODUCT DEVELOPMENT: END TO END
* **Thành viên phụ trách:** Nguyễn Thị Ánh Vy (`Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`) — Module Analytics
* **Thời gian thực hiện:** 22/09/2026
* **Hạng mục:** Xây dựng Data Transformer cho biểu đồ Recharts Radar & Tính toán độ lệch kỹ năng

---

### 1. Mục tiêu công việc
1. Thiết kế `RadarTransformer` đóng vai trò tầng Data Adapter: chuyển đổi cấu trúc JSON từ backend (`RadarAxisItem[]` với `axis_name`, `user_score`, `benchmark_score`) sang mảng đối tượng phù hợp cho thư viện vẽ đồ thị Recharts (`RechartsRadarPoint[]`).
2. Tính toán các chỉ số phái sinh: độ lệch delta (`user_score - benchmark_score`), phân loại trạng thái (Vượt trội / Đạt chuẩn / Thiếu hụt), và tỷ lệ hoàn thành bộ kỹ năng `SkillBreakdown`.
3. Tích hợp Transformer vào Component `RadarComparison.tsx` để hiển thị động mượt mà khi người dùng đổi chuyên ngành.

---

### 2. Chi tiết Prompt và Nhật ký phản biện AI

#### Prompt 1: Thiết kế Data Adapter cho Recharts Radar Chart
* **Prompt đưa cho AI:**
  ```text
  Tôi phụ trách Module Analytics vẽ biểu đồ Radar Recharts trong Next.js 14.
  Backend FastAPI trả về dữ liệu trục như sau:
  interface RadarAxisItem {
    axis_name: string;
    user_score: number;
    benchmark_score: number;
  }
  Hãy viết class RadarTransformer bằng TypeScript có các hàm:
  1. transform(rawAxes): chuyển sang { axis, 'Năng lực sinh viên hiện tại', 'Chuẩn ngành yêu cầu', fullMark: 10, delta, status }.
  2. summarizeReadiness(rawAxes): tính điểm trung bình, % phù hợp, số trục đạt/thiếu.
  3. analyzeSkillGap(skillGap): tính % kỹ năng đã đạt (mastered) vs còn thiếu (missing).
  ```
* **Kết quả AI sinh ra:**
  - AI sinh ra lớp `RadarTransformer` với đầy đủ các hàm xử lý dữ liệu.
  - *Thiếu sót phát hiện qua review:* AI không kiểm tra trường hợp mảng rỗng `rawAxes = []` hoặc giá trị `undefined`, dễ gây crash `NaN` khi chia cho 0.
* **Cải tiến & Phản biện của sinh viên:**
  - Bổ sung fallback kiểm tra mảng rỗng, làm tròn số `Number(val.toFixed(1))` và gán giá trị mặc định 0 để đảm bảo đồ thị không bao giờ bị lỗi render.

#### Prompt 2: Kết nối Transformer vào RadarComparison.tsx
* **Prompt đưa cho AI:**
  ```text
  Cập nhật RadarComparison.tsx sử dụng RadarTransformer.transform(data).
  Nếu không có dữ liệu, hiển thị thông báo nhẹ nhàng thay vì để biểu đồ trắng.
  ```
* **Kết quả AI sinh ra:**
  - AI đã tích hợp an toàn, giữ nguyên toàn bộ giao diện dark-mode và hiệu ứng glassmorphism.

---

### 3. Đánh giá kết quả & Trách nhiệm cá nhân
- Biểu đồ Recharts Radar đã hoạt động linh hoạt với mọi nguồn dữ liệu từ Backend HPC cũng như Mock Data.
- Không còn tình trạng sai lệch tên thuộc tính giữa frontend và backend.
