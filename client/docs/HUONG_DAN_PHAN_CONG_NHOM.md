# HƯỚNG DẪN PHÂN CÔNG CÔNG VIỆC & QUY TRÌNH LÀM VIỆC NHÓM
## MÔN HỌC: CHUYÊN ĐỀ 4 - AI PRODUCT DEVELOPMENT: END TO END (MÃ HP: CS2028)
* **Giảng viên phụ trách:** ThS. Lê Thành Công  
* **Đơn vị:** Khoa Khoa học máy tính - Trường ĐH CNTT&TT Việt - Hàn (VKU)  
* **Dự án:** MajorMatch (Nền tảng AI Định hướng Chuyên ngành & Lộ trình Đại học)  
* **Repository nộp bài & chấm tự động:** [https://github.com/MajorMatch-Labs/majormatch-client](https://github.com/MajorMatch-Labs/majormatch-client)

---

## 1. THÔNG TIN CHUNG & NGUYÊN TẮC BẮT BUỘC
Thầy chấm điểm đồ án dựa trên **lịch sử commit và hoạt động GitHub thực tế** của từng cá nhân trên repository `majormatch-client`:
1. **Mỗi tuần làm 1 chương**: Học phần có 9 chương tương ứng 9 tuần học. **Cả 3 người đều phải có commit và Pull Request trong mỗi tuần**. Tuyệt đối không để xảy ra tình trạng có tuần một thành viên không có hoạt động.
2. **Không commit đè trực tiếp lên nhánh `main`**: Mọi công việc đều phải làm trên nhánh riêng (branch), sau đó tạo Pull Request (PR) để Tech Lead (Long Nhật) review và merge.
3. **Lưu minh chứng dùng AI (Bắt buộc theo Rubric để đạt điểm 8.5 - 10)**: Mỗi tuần khi dùng AI (ChatGPT, Claude, Gemini, Copilot,...) để viết code, viết prompt hay tài liệu, phải ghi lại lịch sử vào thư mục `docs/ai-evidence/`.
4. **Cấm tuyệt đối**: Không bao giờ thêm hoặc push các file tài liệu gốc định dạng `.docx` lên GitHub.

---

## 2. PHÂN CHIA MODULE & TRÁCH NHIỆM

Hệ thống Client đã được chia thành 3 thư mục độc lập tại `src/modules/`. Mỗi bạn có một khu vực làm việc riêng để không bao giờ bị trùng lặp (conflict) code:

```
client/src/modules/
├── ingestion/    --> VĂN HOÀNG phụ trách
├── analytics/    --> ÁNH VY phụ trách
└── advisor/      --> LONG NHẬT phụ trách
```

### 🧑‍💻 Văn Hoàng - Module `ingestion`
* **Vị trí thư mục:** `src/modules/ingestion/`
* **Chức năng phụ trách:**
  * Kéo thả tệp bảng điểm/CV PDF (`FileDropzone.tsx`).
  * Khảo sát trắc nghiệm 10 câu hỏi tính cách Holland RIASEC (`RiasecSurvey.tsx`).
  * Kiểm tra tính hợp lệ của file (dung lượng, định dạng) và thuật toán tính điểm RIASEC tại Client.
* **Thư mục minh chứng AI:** `client/docs/ai-evidence/van-hoang/`

### 👩‍💻 Ánh Vy - Module `analytics`
* **Vị trí thư mục:** `src/modules/analytics/`
* **Chức năng phụ trách:**
  * Biểu đồ mạng nhện Recharts 6 chiều so sánh năng lực (`RadarComparison.tsx`).
  * Bộ thẻ đề xuất top 3 ngành học (`MajorCard.tsx`).
  * Bảng phân rã kỹ năng Đạt / Đang phát triển / Còn thiếu (`SkillBreakdown.tsx`).
  * Tinh chỉnh giao diện, animation, màu sắc và độ tương thích di động (Mobile Responsive).
* **Thư mục minh chứng AI:** `client/docs/ai-evidence/anh-vy/`

### 🧑‍💻 Long Nhật - Tech Lead & Module `advisor`
* **Vị trí thư mục:** `src/modules/advisor/` & Toàn bộ kiến trúc Core
* **Chức năng phụ trách:**
  * Quản lý State toàn cục Zustand (`useProfileStore.ts`), tính toán tức thời % Job Readiness.
  * Cây lộ trình học tương tác (`MilestoneTree.tsx`).
  * Khung chat cố vấn học tập Streaming SSE thời gian thực (`StreamingChatBox.tsx`).
  * Review PRs, duy trì CI/CD và kiến trúc API kết nối Backend HPC.
* **Thư mục minh chứng AI:** `client/docs/ai-evidence/long-nhat/`

---

## 3. LỘ TRÌNH CHI TIẾT 9 TUẦN (9 CHƯƠNG)

| Tuần / Chương | Văn Hoàng (`ingestion`) | Ánh Vy (`analytics`) | Long Nhật (Lead / `advisor`) |
| :--- | :--- | :--- | :--- |
| **Tuần 1**<br>(SDLC & Foundation Models) | Lập tài liệu phân tích dữ liệu đầu vào CV/học bạ & giới hạn ngữ cảnh (Context Window). | Thiết kế bảng màu Design Tokens, Typography, Dark mode trong `tailwind.config.ts`. | Thiết lập kiến trúc Next.js 14, cấu trúc 3 modules độc lập và luồng dữ liệu chính. |
| **Tuần 2**<br>(Prompt Engineering) | Thiết kế bộ Prompt trích xuất điểm học tập từ CV text; lưu file prompt và mẫu kết quả JSON. | Thiết kế bộ Prompt định dạng JSON phân tích khoảng cách kỹ năng (Skill Gap) cho biểu đồ. | Định nghĩa Zod Schemas chuẩn hóa Structured Output (`schema.ts`) cho toàn bộ Client. |
| **Tuần 3**<br>(PRD & User Stories) | Viết User Stories & Acceptance Criteria cho tính năng Drag-Drop CV & Khảo sát RIASEC. | Viết User Stories & Acceptance Criteria cho Biểu đồ Radar 6 chiều & Thẻ gợi ý ngành. | Viết User Stories & Acceptance Criteria cho Cây lộ trình tương tác & AI Chat Advisor. |
| **Tuần 4**<br>(UI Prototyping) | Code giao diện UI Prototype hoàn chỉnh cho `FileDropzone.tsx` và `RiasecSurvey.tsx`. | Code giao diện UI Prototype hoàn chỉnh cho `RadarComparison`, `MajorCard`, `SkillBreakdown`. | Tích hợp giao diện Dashboard tổng quan, kết nối prototype luồng trải nghiệm người dùng. |
| **Tuần 5**<br>(Architecture & API) | Viết hàm gửi dữ liệu khảo sát và xử lý Mock Data offline khi không có mạng trong `ingestion`. | Viết bộ chuyển đổi dữ liệu (Data Transformer) từ JSON sang định dạng Recharts Radar. | Hoàn thiện State Store (`useProfileStore.ts`), kết nối API client `services/api.ts`. |
| **Tuần 6**<br>(AI Coding & Logic) | Dùng AI sinh thuật toán tính điểm Holland Code cục bộ và kiểm tra tính hợp lệ của file. | Tối ưu hóa hiệu năng render biểu đồ Recharts (`useMemo`, `React.memo`), chống giật lag. | Lập trình logic kết nối Server-Sent Events (SSE) gõ chữ từng token cho Chatbot Advisor. |
| **Tuần 7**<br>(Refactoring & Review) | Dùng AI rà soát Code Smells, tách logic ra custom hooks (`useFileUpload`, `useRiasec`). | Dùng AI tái cấu trúc CSS, loại bỏ inline styles, chuyển sang Tailwind classes sạch sẽ. | AI Code Review toàn bộ PRs của nhóm, dọn dẹp TypeScript types, tối ưu bundle size. |
| **Tuần 8**<br>(Software Testing) | Dùng AI sinh Unit Tests kiểm tra validation upload file và thuật toán tính điểm RIASEC. | Dùng AI sinh Component Tests kiểm tra hiển thị đúng số trục Radar và tương tác thẻ ngành. | Cấu hình Vitest, viết Integration Tests kiểm thử đồng bộ trạng thái giữa các trang. |
| **Tuần 9**<br>(Documentation & Defense) | Viết tài liệu kỹ thuật Module Ingestion + Tổng hợp Nhật ký tiến hóa Prompt (Prompt Log). | Viết tài liệu Design System, trích xuất báo cáo đo lường trải nghiệm (Lighthouse metrics). | Tổng hợp Báo cáo Kỹ thuật Cuối kỳ (Final Report), chuẩn bị slide và kịch bản bảo vệ. |

---

## 4. QUY TRÌNH LÀM VIỆC VỚI GIT (DÀNH CHO HOÀNG VÀ VY)

### Bước 1: Clone repository về máy
```bash
git clone https://github.com/MajorMatch-Labs/majormatch-client.git
cd majormatch-client
npm install
```

### Bước 2: Tạo nhánh làm việc cho tuần mới
Tên nhánh đặt theo quy tắc: `<loại>/<tên>-w<tuần>-<tính-năng>`
* **Ví dụ của Hoàng (Tuần 4):**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feat/vanhoang-w4-ingestion-ui
  ```
* **Ví dụ của Vy (Tuần 4):**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feat/anhvy-w4-radar-ui
  ```

### Bước 3: Code và Commit đúng chuẩn
Commit message phải viết bằng **tiếng Anh** theo chuẩn Conventional Commits:
* `feat`: Khi làm tính năng mới (Ví dụ: `feat(ingestion): implement drag and drop dropzone UI`)
* `fix`: Khi sửa lỗi (Ví dụ: `fix(analytics): fix radar chart tooltip overflow on mobile`)
* `docs`: Khi viết tài liệu hoặc nhật ký AI (Ví dụ: `docs(ai-log): add prompt engineering log for week 2`)
* `test`: Khi viết kiểm thử (Ví dụ: `test(ingestion): add unit tests for riasec scoring algorithm`)

Lệnh commit:
```bash
git add .
git commit -m "feat(analytics): build responsive radar comparison component"
```

### Bước 4: Đẩy nhánh lên GitHub và tạo Pull Request
```bash
git push -u origin <tên-nhánh-của-bạn>
```
Sau đó, truy cập vào link GitHub được hiển thị ở terminal để ấn **Create Pull Request** gửi cho Nhật merge.

---

## 5. HƯỚNG DẪN LƯU MINH CHỨNG SỬ DỤNG AI (ĐẠT ĐIỂM A 8.5 - 10)
Khi làm bất kỳ bài nào có dùng AI hỗ trợ:
1. Mở thư mục của mình: `docs/ai-evidence/<tên-bạn>/`.
2. Tạo file ghi chép theo mẫu `docs/ai-evidence/PROMPT_LOG_TEMPLATE.md`.
3. Ghi rõ:
   * **Prompt bạn đưa cho AI là gì?**
   * **Kết quả AI trả về có lỗi hay thiếu sót gì không?**
   * **Bạn đã chỉnh sửa hoặc cải tiến prompt/code như thế nào trước khi đưa vào dự án?**
*(Đây là tiêu chí sống còn trong Rubric của thầy Công: sinh viên có tư duy phản biện và cải tiến kết quả do AI tạo ra hay không).*

---
*Chúc cả nhóm phối hợp hiệu quả và đạt điểm A môn Chuyên đề 4!*
