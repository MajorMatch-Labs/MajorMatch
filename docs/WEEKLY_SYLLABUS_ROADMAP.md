# LỘ TRÌNH 9 TUẦN PHÁT TRIỂN SẢN PHẨM CLIENT - DỰ ÁN MAJORMATCH
## MÔN HỌC: CHUYÊN ĐỀ 4 - AI PRODUCT DEVELOPMENT: END TO END (MÃ HP: CS2028)
**Giảng viên phụ trách**: ThS. Lê Thành Công | **Đơn vị**: Khoa Khoa học máy tính - VKU  
**Repository chấm tự động**: [MajorMatch-Labs/majormatch-client](https://github.com/MajorMatch-Labs/majormatch-client)

---

## 1. NGUYÊN TẮC HOẠT ĐỘNG & ĐÁNH GIÁ TỰ ĐỘNG
1. **Tiến độ hàng tuần**: Mỗi tuần học bám sát 1 chương trong đề cương học phần (từ Chương 1 đến Chương 9).
2. **Đóng góp bắt buộc cho cả 3 thành viên**: Mọi tuần, **tất cả 3 thành viên** đều phải có commit, branch riêng và mở Pull Request (PR) gắn tag chương tương ứng.
3. **Minh chứng AI (Rubric CLO2, CLO3)**: Mỗi thành viên lưu lại prompt mẫu hoặc log AI code generation / AI code review trong phần mô tả của PR hoặc thư mục `docs/`.
4. **Quy tắc đặt tên Branch & Commit (Conventional Commits)**:
   - Branch: `<type>/<member>-w<week>-<feature-name>` (Ví dụ: `feat/vanhoang-w2-ingestion-prompts`, `feat/anhvy-w4-radar-ui`, `feat/longnhat-w6-sse-stream`).
   - Commit message: `<type>(<scope>): <clear description in English>`.

---

## 2. MA TRẬN PHÂN CÔNG CHI TIẾT TỪNG TUẦN (9 CHƯƠNG)

### TUẦN 1 - CHƯƠNG 1: TỔNG QUAN AI TRONG SDLC & FOUNDATION MODELS
> **Mục tiêu học phần**: Hiểu vòng đời phát triển phần mềm có AI hỗ trợ, phân biệt AI-Assisted vs AI-Native, cửa sổ ngữ cảnh (Context Window).

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | Architecture / Lead | Khởi tạo cấu trúc dự án Next.js 14 App Router, TypeScript strict, thiết lập cấu trúc `src/modules/{ingestion,analytics,advisor}`. | Commit kiến trúc module nền tảng, file `modules/index.ts`. |
| **Văn Hoàng** | `ingestion` | Nghiên cứu tài liệu yêu cầu, đặc tả ranh giới Context Window khi người dùng nộp CV/học bạ nhiều trang. | File tài liệu phân tích đầu vào `docs/ingestion-context-limits.md`. |
| **Ánh Vy** | `analytics` | Thiết lập bộ Design Tokens (Tailwind colors, typography Inter, dark mode glassmorphism) chuẩn hóa AI-Native UX. | Cấu hình `tailwind.config.ts`, `globals.css` chuẩn giao diện cao cấp. |

---

### TUẦN 2 - CHƯƠNG 2: KỸ THUẬT VIẾT CÂU LỆNH (PROMPT ENGINEERING & STRUCTURED OUTPUTS)
> **Mục tiêu học phần**: Nắm vững kỹ thuật Prompting, quản trị ngữ cảnh (Context Engineering) và ép kiểu đầu ra có cấu trúc (Structured Outputs).

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | Architecture / Core | Xây dựng Zod schemas cho Structured Outputs (`AnalysisResult`, `RoadmapMilestone`, `ChatStreamChunk`). | File `src/types/schema.ts` hoặc Zod validation guards. |
| **Văn Hoàng** | `ingestion` | Thiết kế mẫu prompt Few-shot trích xuất thông tin học bạ/kỹ năng; cấu hình format JSON trả về cho form Ingestion. | Bộ prompt mẫu `src/modules/ingestion/prompts.ts` + tài liệu minh chứng. |
| **Ánh Vy** | `analytics` | Thiết kế prompt định dạng structured output cho phân tích khoảng cách kỹ năng (Skill Gap) hiển thị trên biểu đồ. | Định nghĩa interface và prompt schemas cho radar metrics trong `analytics`. |

---

### TUẦN 3 - CHƯƠNG 3: AI TRONG PHÂN TÍCH YÊU CẦU & SẢN PHẨM (PRD & USER STORIES)
> **Mục tiêu học phần**: Vận dụng AI để viết PRD, User Stories kèm Acceptance Criteria (AC) và đặc tả tính năng phần mềm.

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | `advisor` | Viết User Stories & Acceptance Criteria cho tính năng Lộ trình học tương tác (Interactive Milestones) & AI Advisor Chat. | File đặc tả `docs/user-stories-advisor.md`. |
| **Văn Hoàng** | `ingestion` | Viết User Stories & Acceptance Criteria cho tính năng Drag-and-Drop file và Khảo sát định hướng tính cách RIASEC. | File đặc tả `docs/user-stories-ingestion.md`. |
| **Ánh Vy** | `analytics` | Viết User Stories & Acceptance Criteria cho tính năng Biểu đồ Radar 6 chiều và Bộ thẻ ngành học đề xuất. | File đặc tả `docs/user-stories-analytics.md`. |

---

### TUẦN 4 - CHƯƠNG 4: AI TRONG THIẾT KẾ SẢN PHẨM (WIREFRAMING & PROTOTYPING)
> **Mục tiêu học phần**: Xây dựng nguyên mẫu giao diện (Prototyping), User Flow và thực hiện AI Design Review.

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Ánh Vy** *(Chủ lực)* | `analytics` | Code giao diện UI Prototype cho `RadarComparison.tsx`, `MajorCard.tsx`, `SkillBreakdown.tsx` với hiệu ứng Micro-animation. | Bộ component hoàn chỉnh trong `src/modules/analytics/`. |
| **Văn Hoàng** | `ingestion` | Code giao diện UI Prototype cho `FileDropzone.tsx` (drag/drop visual) và `RiasecSurvey.tsx` (interactive questions). | Bộ component hoàn chỉnh trong `src/modules/ingestion/`. |
| **Long Nhật** | `advisor` | Tích hợp layout Dashboard chính, code UI Prototype cho `MilestoneTree.tsx` và khung chat `StreamingChatBox.tsx`. | Tích hợp Dashboard tại `src/app/page.tsx` và `src/modules/advisor/`. |

---

### TUẦN 5 - CHƯƠNG 5: AI TRONG THIẾT KẾ & KIẾN TRÚC PHẦN MỀM (ARCH & STATE)
> **Mục tiêu học phần**: Thiết kế kiến trúc Client-Server, Architecture Patterns, API Contract (REST/SSE) và State Management.

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | Architecture / Store | Xây dựng Global Reactive State với Zustand (`useProfileStore.ts`), tính toán tức thì chỉ số % Job Readiness. | File `src/stores/useProfileStore.ts` + API client `src/services/api.ts`. |
| **Văn Hoàng** | `ingestion` | Xây dựng API Client Adapter cho Ingestion (xử lý upload FormData, đóng gói payload khảo sát) + Fallback offline demo. | Tích hợp API handler trong `src/modules/ingestion/` & `mockData.ts`. |
| **Ánh Vy** | `analytics` | Xây dựng Data Adapter chuyển đổi JSON từ API backend thành cấu trúc chuẩn của Recharts (Data mapping layers). | Tích hợp adapter mapping trong `src/modules/analytics/`. |

---

### TUẦN 6 - CHƯƠNG 6: AI LẬP TRÌNH (CODE GENERATION & STREAMING SSE)
> **Mục tiêu học phần**: Áp dụng AI Code Generation, AI Pair Programming để hiện thực hóa các giải thuật phức tạp và xử lý luồng dữ liệu thời gian thực.

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | `advisor` | Lập trình logic kết nối Server-Sent Events (SSE), giải mã streaming text chunk và hiển thị markdown động cho AI Advisor. | Hoàn thiện logic streaming trong `StreamingChatBox.tsx`. |
| **Văn Hoàng** | `ingestion` | Dùng AI Code Generation hiện thực thuật toán tính điểm Holland RIASEC cục bộ và xác thực định dạng file client-side. | Hoàn thiện logic xử lý trong `RiasecSurvey.tsx` và validation file. |
| **Ánh Vy** | `analytics` | Tối ưu hóa hiệu năng render Recharts bằng `useMemo`/`React.memo`, chống giật lag khi chuyển đổi ngành học. | Hoàn thiện logic tương tác mượt mà trong `RadarComparison.tsx`. |

---

### TUẦN 7 - CHƯƠNG 7: TÁI CẤU TRÚC & REVIEW MÃ NGUỒN CÙNG AI
> **Mục tiêu học phần**: Sử dụng AI để phát hiện Code Smells, tái cấu trúc mã nguồn (Refactoring) và thực hiện AI Code Review trên PRs.

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | Architecture / Review | Sử dụng AI thực hiện Code Review trên các PRs, tối ưu bundle Next.js, loại bỏ duplicate code và types. | Báo cáo review trên PR GitHub + code clean-up commits. |
| **Văn Hoàng** | `ingestion` | Dùng AI refactor module Ingestion: Tách custom hooks `useFileUpload` và `useRiasecSurvey`, cô lập logic khỏi UI. | Tách hooks sạch trong `src/modules/ingestion/hooks/`. |
| **Ánh Vy** | `analytics` | Dùng AI tái cấu trúc CSS & layout: chuyển toàn bộ inline styling sang utility classes, chuẩn hóa theme variables. | Clean-up styles trong `src/modules/analytics/` và `globals.css`. |

---

### TUẦN 8 - CHƯƠNG 8: AI TRONG KIỂM THỬ PHẦN MỀM (TESTING & AUTOMATION)
> **Mục tiêu học phần**: Thiết kế ca kiểm thử có AI hỗ trợ, sinh Unit Tests, Integration Tests và tự động hóa kiểm thử Client.

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | Architecture / Tests | Cấu hình khung kiểm thử Vitest/Testing Library, viết Integration Test cho State Store và luồng cập nhật lộ trình học. | File cấu hình test + `tests/integration/profileStore.test.ts`. |
| **Văn Hoàng** | `ingestion` | Dùng AI sinh bộ Unit Tests kiểm thử validation file upload (file quá dung lượng, sai định dạng) và thuật toán RIASEC. | Bộ test `tests/unit/ingestion.test.ts`. |
| **Ánh Vy** | `analytics` | Dùng AI sinh Component Tests kiểm thử hiển thị biểu đồ Radar, lọc ngành học và hiển thị đúng % Job Readiness. | Bộ test `tests/unit/analytics.test.ts`. |

---

### TUẦN 9 - CHƯƠNG 9: AI TRONG SINH TÀI LIỆU KỸ THUẬT & BÁO CÁO TỔNG KẾT
> **Mục tiêu học phần**: Sử dụng AI để sinh tài liệu kỹ thuật, chuyển giao tri thức, chuẩn bị Slide thuyết trình và bảo vệ đồ án (CLO4).

| Thành viên | Module / Phạm vi | Nhiệm vụ cụ thể trên repo Client | Kết quả bàn giao (Deliverables) |
| :--- | :--- | :--- | :--- |
| **Long Nhật** | Báo cáo chung / Lead | Sử dụng AI tổng hợp Báo cáo Kỹ thuật Cuối kỳ (Final Technical Report), sơ đồ kiến trúc hệ thống, tổng kết điểm Rubric nhóm. | Báo cáo tổng thể `docs/FINAL_TECHNICAL_REPORT.md` + Slide deck. |
| **Văn Hoàng** | `ingestion` | Viết tài liệu kỹ thuật Module Ingestion (API integration guide, Prompt Evolution Log chứng minh cải tiến prompt). | File tài liệu `docs/ingestion-specification.md`. |
| **Ánh Vy** | `analytics` | Viết tài liệu Thiết kế UI/UX & Design System Catalogue, báo cáo đo lường trải nghiệm người dùng (Lighthouse metrics). | File tài liệu `docs/ui-ux-design-system.md`. |

---

## 3. CHECKLIST KIỂM TRA ĐIỂM CHẤM TỰ ĐỘNG CỦA GIẢNG VIÊN
- [ ] **Mỗi tuần có tối thiểu 3 commits/PRs** từ 3 tài khoản GitHub khác nhau (Long Nhật, Văn Hoàng, Ánh Vy).
- [ ] Không có commit nào chứa các file tài liệu định dạng `.docx` (đã cấu hình `.gitignore`).
- [ ] Toàn bộ commit message tuân thủ chuẩn Conventional Commits tiếng Anh.
- [ ] Lệnh `npm run build` trên nhánh `main` luôn biên dịch thành công mà không có lỗi TypeScript hay Lint.
