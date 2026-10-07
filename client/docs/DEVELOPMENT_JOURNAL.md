# NHẬT KÝ PHÁT TRIỂN CLIENT (DEVELOPMENT JOURNAL)
## DỰ ÁN: MAJORMATCH - AI PRODUCT DEVELOPMENT: END TO END (CS2028)
* **Giảng viên phụ trách:** ThS. Lê Thành Công | Khoa Khoa học máy tính - VKU
* **Repository:** [MajorMatch-Labs/majormatch-client](https://github.com/MajorMatch-Labs/majormatch-client)
* **Nhóm phát triển:**
  - **Long Nhật** (`NhatPrv <torikun2005@gmail.com>`): Tech Lead, Architecture, Module `advisor`, State Management.
  - **Văn Hoàng** (`Nguyễn Văn Hoàng <hoangtungmy123@gmail.com>`): Module `ingestion`, Input Validation, RIASEC Survey.
  - **Ánh Vy** (`Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`): Module `analytics`, Recharts Radar, Design Tokens, UI/UX.

---

## 1. TỔNG QUAN TIẾN ĐỘ THEO CHƯƠNG TRÌNH ĐÀO TẠO (W1 - W5)

| Tuần / Chương | Chủ đề chương trình | Long Nhật (`advisor` / Lead) | Văn Hoàng (`ingestion`) | Ánh Vy (`analytics`) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tuần 1** | SDLC & Foundation Models | Khởi tạo Next.js 14 App Router, TypeScript strict, cấu trúc modular `src/modules/`. | Phân tích giới hạn Context Window khi nộp học bạ nhiều trang. | Thiết lập Design Tokens (Tailwind colors, glassmorphism, Inter font). | **Đã hoàn thành ✅** |
| **Tuần 2** | Prompt Engineering & Structured Outputs | Xây dựng Zod Schemas chuẩn hóa DTO cho toàn bộ luồng dữ liệu Client. | Thiết kế bộ Prompt Few-shot trích xuất điểm môn học từ CV text. | Thiết kế Prompt cấu trúc JSON cho phân tích khoảng cách kỹ năng (Skill Gap). | **Đã hoàn thành ✅** |
| **Tuần 3** | PRD & User Stories (AC / Gherkin) | Đặc tả User Stories cho Cây lộ trình (Milestone) & Streaming Chatbot Advisor. | Đặc tả User Stories cho Drag-and-Drop file và Khảo sát RIASEC. | Đặc tả User Stories cho Biểu đồ Radar 6 chiều và Thẻ ngành học đề xuất. | **Đã hoàn thành ✅** |
| **Tuần 4** | UI Prototyping & AI Design Review | Code UI Prototype `MilestoneTree.tsx`, `StreamingChatBox.tsx` & Dashboard. | Code UI Prototype `FileDropzone.tsx` & `RiasecSurvey.tsx`. | Code UI Prototype `RadarComparison.tsx`, `MajorCard.tsx`, `SkillBreakdown.tsx`. | **Đã hoàn thành ✅** |
| **Tuần 5** | Architecture Patterns & API State Integration | Xây dựng Reactive Zustand Store (`useProfileStore.ts`) & Native API Client. | Xây dựng `IngestionService` Adapter, File Validation $\le 10\text{MB}$ & Offline Mock Loader. | Xây dựng `RadarTransformer` Adapter, chuyển đổi dữ liệu Recharts & Type-safe. | **Đã hoàn thành ✅** |
| **Tuần 6** | AI Lập trình (Code Generation & Streaming) | Tích hợp SSE Stream Parser, Chat Controller và Markdown Renderer. | Chuẩn hóa RIASEC 10 câu, Magic Bytes Validation & Ingestion Tests. | Tối ưu hóa hiệu năng Recharts Radar (React.memo, delta tooltip). | **Đã hoàn thành ✅** |
| **Tuần 7** | Lộ trình Milestone & Chuẩn hóa Kỹ năng Giai đoạn | Tích hợp hiển thị kỹ năng đầu ra cho từng môn và từng kỳ trong MilestoneTree, đồng bộ RAG Schemas. | Xây dựng `curriculumSkillMapper.ts`, chuẩn hóa mã môn sang kỹ năng và unit tests. | Thiết kế component `MilestoneSkillBadges.tsx`, highlight trực quan kỹ năng bù đắp Gap. | **Đã hoàn thành ✅** |

---

## 2. CHI TIẾT NHẬT KÝ THEO TỪNG TUẦN

### TUẦN 1 - CHƯƠNG 1: TỔNG QUAN AI TRONG SDLC & FOUNDATION MODELS
* **Mục tiêu**: Thiết lập nền móng dự án Client chuẩn AI-Native, phân chia ranh giới module rõ ràng để 3 thành viên làm việc song song không conflict.
* **Đóng góp của từng thành viên**:
  - **Long Nhật**:
    - Khởi tạo khung dự án Next.js 14 (App Router), bật TypeScript strict mode.
    - Phân chia 3 module độc lập tại `src/modules/{ingestion,analytics,advisor}` với file điều phối `index.ts`.
    - Thiết lập quy chuẩn Git Workflow, Conventional Commits và script đồng bộ đa kho lưu trữ.
  - **Văn Hoàng**:
    - Soạn thảo tài liệu phân tích dữ liệu đầu vào: khảo sát cấu trúc bảng điểm PDF, đánh giá dung lượng và số lượng tokens khi trích xuất text sang LLM.
    - Xác định giới hạn xử lý cục bộ tại Client trước khi gửi lên máy chủ HPC.
  - **Ánh Vy**:
    - Cấu hình hệ thống Design System trong `tailwind.config.ts` và `globals.css`.
    - Lựa chọn bảng màu hiện đại với tone Slate / Indigo / Violet theo phong cách Sleek Dark Mode và Glassmorphism.
* **Minh chứng AI tương ứng**:
  - `docs/ai-evidence/advisor/w1-prompt-log.md`
  - `docs/ai-evidence/ingestion/w1-prompt-log.md`
  - `docs/ai-evidence/analytics/w1-prompt-log.md`

---

### TUẦN 2 - CHƯƠNG 2: KỸ THUẬT VIẾT CÂU LỆNH (PROMPT ENGINEERING & STRUCTURED OUTPUTS)
* **Mục tiêu**: Làm chủ kỹ thuật Prompting, đảm bảo các kết quả trả về từ mô hình ngôn ngữ luôn tuân thủ cấu trúc dữ liệu JSON xác định (Structured Outputs).
* **Đóng góp của từng thành viên**:
  - **Long Nhật**:
    - Thiết kế bộ Schemas validation bằng Zod / TypeScript (`src/types/schema.ts`) cho toàn bộ thực thể: Hồ sơ sinh viên, Kết quả phân tích độ phù hợp, Cột mốc lộ trình, Gói tin Stream Chat.
  - **Văn Hoàng**:
    - Thiết kế bộ Prompt Few-shot trích xuất bảng điểm: cung cấp ví dụ mẫu bảng điểm VKU thực tế để AI học cấu trúc bảng điểm và ánh xạ điểm chữ (A, B, C, D) sang hệ 4.
  - **Ánh Vy**:
    - Thiết kế bộ Prompt định dạng JSON cho việc phân tích độ lệch kỹ năng 6 chiều (Skill Gap Analysis) tương ứng với 6 nhóm Holland RIASEC.
* **Minh chứng AI tương ứng**:
  - `docs/ai-evidence/advisor/w2-prompt-log.md`
  - `docs/ai-evidence/ingestion/w2-prompt-log.md`
  - `docs/ai-evidence/analytics/w2-prompt-log.md`

---

### TUẦN 3 - CHƯƠNG 3: AI TRONG PHÂN TÍCH YÊU CẦU & SẢN PHẨM (PRD & USER STORIES)
* **Mục tiêu**: Áp dụng AI phân tích yêu cầu nghiệp vụ, chuyển hóa PRD tổng thành các User Stories kèm tiêu chí nghiệm thu (Acceptance Criteria) viết bằng cú pháp Gherkin (Given-When-Then).
* **Đóng góp của từng thành viên**:
  - **Long Nhật**: Hoàn thành `docs/03-specifications/user-stories-advisor.md` (6 stories: US-ADV-01 đến US-ADV-06 bao gồm cây lộ trình, tính điểm readiness động và xuất báo cáo).
  - **Văn Hoàng**: Hoàn thành `docs/03-specifications/user-stories-ingestion.md` (5 stories: US-ING-01 đến US-ING-05 về tải file bảng điểm, khảo sát RIASEC, kiểm tra lỗi file).
  - **Ánh Vy**: Hoàn thành `docs/03-specifications/user-stories-analytics.md` (5 stories: US-ANA-01 đến US-ANA-05 về biểu đồ Radar 6 trục, phân nhóm kỹ năng, thẻ ngành).
* **Minh chứng AI tương ứng**:
  - `docs/ai-evidence/advisor/w3-prompt-log.md`
  - `docs/ai-evidence/ingestion/w3-prompt-log.md`
  - `docs/ai-evidence/analytics/w3-prompt-log.md`

---

### TUẦN 4 - CHƯƠNG 4: AI TRONG THIẾT KẾ SẢN PHẨM (WIREFRAMING & PROTOTYPING)
* **Mục tiêu**: Hiện thực hóa giao diện người dùng mẫu (UI Prototyping) tương tác mượt mà, phản hồi responsive trên cả Desktop và Di động.
* **Đóng góp của từng thành viên**:
  - **Long Nhật**:
    - Tích hợp khung Dashboard tổng quan (`src/app/page.tsx`), liên kết luồng chuyển đổi trạng thái giữa các bước Ingestion $\rightarrow$ Analytics $\rightarrow$ Advisor.
    - Viết UI Prototype `MilestoneTree.tsx` và `StreamingChatBox.tsx` với bong bóng chat hiển thị token mượt mà.
  - **Văn Hoàng**:
    - Viết UI Prototype `FileDropzone.tsx` với hiệu ứng kéo thả tập tin trực quan, hiển thị preview thông tin tệp.
    - Viết UI Prototype `RiasecSurvey.tsx` với thang điểm Likert 5 mức độ và thanh tiến trình trả lời câu hỏi trực quan.
  - **Ánh Vy**:
    - Viết UI Prototype `RadarComparison.tsx` tích hợp Recharts Radar với 2 lớp dữ liệu: Năng lực sinh viên vs Chuẩn chuyên ngành.
    - Viết `MajorCard.tsx` hiển thị thẻ top 3 ngành học kèm huy hiệu % Match và `SkillBreakdown.tsx`.
* **Minh chứng AI tương ứng**:
  - `docs/ai-evidence/advisor/w4-prompt-log.md`
  - `docs/ai-evidence/ingestion/w4-prompt-log.md`
  - `docs/ai-evidence/analytics/w4-prompt-log.md`

---

### TUẦN 5 - CHƯƠNG 5: AI TRONG THIẾT KẾ & KIẾN TRÚC PHẦN MỀM (ARCH & STATE)
* **Mục tiêu**: Xây dựng kiến trúc tầng dữ liệu Client, quản lý State tập trung bằng Zustand, kết nối chuẩn hóa API Backend FastAPI và bảo đảm chạy độc lập offline bằng Mock Fallback.
* **Đóng góp của từng thành viên**:
  - **Long Nhật** (Commit `f913a7c`):
    - Chuẩn hóa [src/types/api.ts](../src/types/api.ts) khớp 100% với Pydantic schemas của Backend HPC.
    - Xây dựng [src/services/api.ts](../src/services/api.ts) kết nối các REST endpoints và SSE Stream, tích hợp fallback timeout an toàn.
    - Phát triển State Store [src/stores/useProfileStore.ts](../src/stores/useProfileStore.ts) bằng Zustand, quản lý luồng dữ liệu bất biến và tính điểm Job Readiness tức thì.
  - **Văn Hoàng** (Commit `9dabb5b`):
    - Xây dựng lớp dịch vụ [src/modules/ingestion/services/ingestionService.ts](../src/modules/ingestion/services/ingestionService.ts) tiền kiểm soát file PDF (kích thước $\le 10\text{MB}$, định dạng MIME type).
    - Tích hợp cơ chế tải dữ liệu mẫu thử nghiệm một chạm (`loadOfflineDemoData`) trên `FileDropzone.tsx`.
  - **Ánh Vy** (Commit `135dd5f`):
    - Xây dựng lớp chuyển đổi dữ liệu [src/modules/analytics/utils/radarTransformer.ts](../src/modules/analytics/utils/radarTransformer.ts) biến đổi mảng trục từ backend thành dữ liệu tương thích Recharts.
    - Tự động tính toán độ lệch delta năng lực, phân loại trạng thái (Vượt trội / Đạt chuẩn / Thiếu hụt) và bảo vệ an toàn kiểu dữ liệu hiển thị trên `RadarComparison.tsx`, `MajorCard.tsx` và trang kết quả `/result`.
* **Minh chứng AI tương ứng**:
  - `docs/ai-evidence/advisor/w5-prompt-log.md`
  - `docs/ai-evidence/ingestion/w5-prompt-log.md`
  - `docs/ai-evidence/analytics/w5-prompt-log.md`

---

### TUẦN 6 - CHƯƠNG 6: AI LẬP TRÌNH (CODE GENERATION & STREAMING SSE)
* **Mục tiêu**: Vận dụng AI Code Generation để hiện thực hóa các thuật toán phức tạp, xử lý dữ liệu streaming thời gian thực Server-Sent Events và tối ưu hóa hiệu năng render giao diện không giật lag.
* **Đóng góp của từng thành viên**:
  - **Văn Hoàng** (11 Commits nhánh `feat/vanhoang-w6-riasec-and-validation`):
    - Xây dựng thuật toán tính điểm tâm lý học sở thích [riasecScoring.ts](../src/modules/ingestion/utils/riasecScoring.ts) chuẩn hóa theo thang 1.0 - 5.0 và xếp hạng mã Holland 2 chữ cái nổi trội.
    - Xây dựng tiện ích kiểm tra tệp PDF nâng cao [fileValidation.ts](../src/modules/ingestion/utils/fileValidation.ts) kiểm tra dung lượng $\le 10\text{MB}$ và magic bytes nhị phân `%PDF-`.
    - Nâng cấp `RiasecSurvey.tsx` với thanh tiến trình trực quan và xem trước thiên hướng nhận diện thời gian thực.
    - Viết bộ kiểm thử tự động [ingestionAlgorithm.test.ts](../../tests/unit/ingestionAlgorithm.test.ts).
    - Lập hồ sơ minh chứng AI `docs/ai-evidence/ingestion/w6-prompt-log.md`.
  - **Ánh Vy** (11 Commits nhánh `feat/anhvy-w6-radar-optimization`):
    - Xây dựng custom hook [useRadarMetrics.ts](../src/modules/analytics/hooks/useRadarMetrics.ts) ứng dụng `useMemo` chống tính toán lại dữ liệu trục.
    - Bọc `RadarComparison.tsx` bằng `React.memo` kết hợp hàm so sánh sâu `areRadarPropsEqual` chống re-render thừa khi chuyển ngành.
    - Xây dựng Custom Tooltip [RadarTooltip.tsx](../src/modules/analytics/components/RadarTooltip.tsx) hiển thị trực quan độ lệch delta năng lực (+/-).
    - Thêm bộ lọc đa danh mục kỹ năng (All / Mastered / Developing / Missing) trong `SkillBreakdown.tsx`.
    - Viết bộ kiểm thử [radarOptimization.test.ts](../../tests/unit/radarOptimization.test.ts).
    - Lập hồ sơ minh chứng AI `docs/ai-evidence/analytics/w6-prompt-log.md`.
  - **Long Nhật** (11 Commits nhánh `feat/longnhat-w6-advisor-sse-streaming`):
    - Xây dựng bộ giải mã luồng sự kiện [sseParser.ts](../src/modules/advisor/utils/sseParser.ts) xử lý ghép chunk UTF-8, lọc heartbeat ping và bóc tách token.
    - Xây dựng bộ điều khiển luồng [sseStreamController.ts](../src/modules/advisor/services/sseStreamController.ts) với AbortSignal ngắt tức thì và idle timeout guard 15s.
    - Xây dựng bộ hiển thị [MarkdownMessage.tsx](../src/modules/advisor/components/MarkdownMessage.tsx) định dạng an toàn cho tin nhắn AI.
    - Tích hợp Smart Auto-Scroll phát hiện người dùng cuộn chuột và bổ sung nút Dừng phản hồi / Thử lại trong `StreamingChatBox.tsx`.
    - Viết bộ kiểm thử [sseParser.test.ts](../../tests/unit/sseParser.test.ts).
    - Lập hồ sơ minh chứng AI `docs/ai-evidence/advisor/w6-prompt-log.md`.

---

### TUẦN 7 - CHƯƠNG 7: LỘ TRÌNH HỌC TẬP TƯƠNG TÁC & PHÂN BỔ KỸ NĂNG THEO GIAI ĐOẠN
* **Mục tiêu**: Chuẩn hóa toàn bộ danh mục kỹ năng đầu ra cho từng môn học và từng giai đoạn học kỳ (Milestone Stages) trên lộ trình học tập, liên kết động với phân rã kỹ năng thiếu để sinh viên thấy rõ giá trị thực tế của từng đề xuất.
* **Đóng góp của từng thành viên**:
  - **Văn Hoàng** (Nhánh `feat/vanhoang-w7-curriculum-skills-mapping`):
    - Mở rộng hợp đồng dữ liệu Client DTO: thêm `target_skills` cho `RecommendedCourse` và `milestone_skills` cho `SemesterMilestone`.
    - Xây dựng tiện ích chuẩn hóa [curriculumSkillMapper.ts](../src/modules/ingestion/utils/curriculumSkillMapper.ts) ánh xạ toàn bộ mã học phần sang danh mục kỹ năng chuẩn và phân loại danh mục (AI, Data, Infra, Software, Foundation).
    - Viết bộ kiểm thử tự động [curriculumSkillMapper.test.ts](../../tests/unit/curriculumSkillMapper.test.ts).
    - Lập hồ sơ minh chứng AI `docs/ai-evidence/ingestion/w7-prompt-log.md`.
  - **Ánh Vy** (Nhánh `feat/anhvy-w7-milestone-skills-badges`):
    - Thiết kế component [MilestoneSkillBadges.tsx](../src/modules/analytics/components/MilestoneSkillBadges.tsx) hiển thị dải huy hiệu kỹ năng trọng tâm của từng giai đoạn học kỳ.
    - Nâng cấp `InteractiveTask.tsx` phát hiện và highlight trực quan các kỹ năng giúp bù đắp trực tiếp khoảng trống năng lực hiện tại (`Bù đắp Gap`).
    - Viết bộ kiểm thử tự động [milestoneSkillBadges.test.ts](../../tests/unit/milestoneSkillBadges.test.ts).
    - Lập hồ sơ minh chứng AI `docs/ai-evidence/analytics/w7-prompt-log.md`.
  - **Long Nhật** (Nhánh `feat/longnhat-w7-roadmap-skill-tree-integration`):
    - Tích hợp dải kỹ năng chuẩn đầu ra giai đoạn và truyền `skills` cho từng môn học trong [MilestoneTree.tsx](../src/components/roadmap/MilestoneTree.tsx).
    - Bổ sung dữ liệu kỹ năng chi tiết cho cả 3 giai đoạn (Kỳ 5, 6, 7 & 8) trong [mockData.ts](../src/services/mockData.ts).
    - Đồng bộ hóa cấu trúc Pydantic Schema và bộ sinh lộ trình dự phòng tại `backend-hpc/schemas.py` và `backend-hpc/rag_service.py`.
    - Viết bộ kiểm thử [roadmapSkills.test.ts](../../tests/unit/roadmapSkills.test.ts).
    - Lập hồ sơ minh chứng AI `docs/ai-evidence/advisor/w7-prompt-log.md`.

---

## 3. BẢNG TỔNG KẾT BẰNG CHỨNG HỌC PHẦN (AUDIT CHECKLIST)

- [x] Đầy đủ commit riêng biệt cho từng thành viên theo từng tuần học.
- [x] Tác giả Git (Author Name & Email) được gắn chính xác cho từng phần phụ trách.
- [x] $100\%$ nhật ký sử dụng AI có ghi rõ Prompt ban đầu, Đánh giá phát hiện lỗi của AI và Bước cải tiến phản biện của sinh viên (Human-in-the-loop).
- [x] Dự án biên dịch thành công (`npm run build` exit code 0) không có cảnh báo hay lỗi kiểu dữ liệu.
- [x] Toàn bộ code và tài liệu đã được đồng bộ tự động lên cả 5 kho lưu trữ trong hệ sinh thái MajorMatch.
