# MajorMatch Client - Web 2.0 Interactive Frontend

Ứng dụng giao diện người dùng đa nền tảng (Web 2.0 SPA) của hệ sinh thái **MajorMatch** phục vụ cố vấn học tập, định lượng khoảng cách kỹ năng (Skill Gap) và cá nhân hóa lộ trình đại học.

* **Repository chính thức:** [https://github.com/MajorMatch-Labs/majormatch-client](https://github.com/MajorMatch-Labs/majormatch-client)
* **Tổ chức phát triển:** MajorMatch-Labs
* **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Zustand.

---

## 1. Tính năng Nổi bật (Features)

1. **Bóc tách Bảng điểm & Trắc nghiệm RIASEC (`/upload`):**
   * Kéo thả tệp PDF bảng điểm/CV, tự động khử định danh PII.
   * Khảo sát 10 câu trượt Holland Code nhận diện thiên hướng sở thích.
2. **Báo cáo Khoảng cách Kỹ năng & Biểu đồ Radar (`/result`):**
   * Xếp hạng Top 3 chuyên ngành đề xuất dựa trên điểm số Cosine Similarity.
   * Biểu đồ mạng nhện Recharts đa tầng: Năng lực hiện tại vs Chuẩn ngành yêu cầu.
   * Phân loại 3 tập kỹ năng: Mastered Skills, Developing Skills và Missing Skills.
3. **Không gian Lộ trình Tương tác Web 2.0 (`/roadmap`):**
   * Cây lộ trình phân bố theo từng học kỳ kèm môn tiên quyết và đồ án thực chiến.
   * **Interactive Checklist:** Tích chọn môn đã học $\rightarrow$ Chỉ số % Job Readiness tự động nhảy tiến độ tức thời mà không cần reload trang.
4. **Trợ lý Ảo Streaming Chatbot (`/chat`):**
   * Cố vấn học tập kết nối trực tiếp với mô hình Qwen 2.5 7B nội bộ qua giao thức Server-Sent Events (SSE) với hiệu ứng gõ chữ từng token.
5. **Cơ chế Tự động Fallback Dữ liệu (Mock Engine):**
   * Tự động chuyển đổi mượt mà giữa Backend HPC trực tiếp và Mock Data chuẩn mực, bảo đảm ứng dụng luôn trình diễn trơn tru khi chấm bài.

---

## 2. Hướng dẫn Cài đặt & Khởi chạy (Quick Start)

### Yêu cầu môi trường:
* Node.js >= 18.x
* Trình quản lý gói `npm` hoặc `pnpm`

### Cài đặt dependencies:
```bash
cd client
npm install
```

### Chạy máy chủ phát triển (Development Server):
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: [http://localhost:3000](http://localhost:3000)

### Kiểm tra build sản phẩm (Production Build):
```bash
npm run build
npm start
```

---

## 3. Kiến trúc 3 Feature Modules & Phân công Nhóm

Client được thiết kế theo kiến trúc Module hóa độc lập tại thư mục `src/modules/`:

| Module | Thư mục | Thành viên phụ trách | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| **Ingestion** | `src/modules/ingestion` | **Văn Hoàng** | Tiếp nhận CV/học bạ (`FileDropzone`), trắc nghiệm RIASEC (`RiasecSurvey`), validation dữ liệu đầu vào. |
| **Analytics** | `src/modules/analytics` | **Ánh Vy** | Trực quan hóa dữ liệu (`RadarComparison`), thẻ gợi ý ngành (`MajorCard`), phân rã kỹ năng (`SkillBreakdown`). |
| **Advisor** | `src/modules/advisor` | **Long Nhật (Lead)** | Cây lộ trình học tập (`MilestoneTree`), tương tác task checklist, Streaming Chatbot SSE (`StreamingChatBox`). |

---

## 4. Lộ trình 9 Tuần theo Đề cương CNTT2025 (Chuyên đề 4 - CS2028)

Dự án tuân thủ tiến độ 9 chương của học phần theo ma trận phân công hàng tuần, bảo đảm cả 3 thành viên đều có đóng góp liên tục:

Chi tiết xem tại: 📄 **[Lộ trình 9 Tuần Chi tiết (WEEKLY_SYLLABUS_ROADMAP.md)](./docs/WEEKLY_SYLLABUS_ROADMAP.md)**

