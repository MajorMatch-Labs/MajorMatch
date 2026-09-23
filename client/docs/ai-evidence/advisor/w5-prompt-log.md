# NHẬT KÝ SỬ DỤNG AI — TUẦN 5 (CHƯƠNG 5: KIẾN TRÚC & API CLIENT)
## HỌC PHẦN: CS2028 - AI PRODUCT DEVELOPMENT: END TO END
* **Thành viên phụ trách:** Long Nhật (`NhatPrv <torikun2005@gmail.com>`) — Tech Lead & Module Advisor
* **Thời gian thực hiện:** 22/09/2026
* **Hạng mục:** Thiết kế kiến trúc State toàn cục Zustand & Tầng API Service kết nối Backend HPC FastAPI

---

### 1. Mục tiêu công việc
1. Thiết kế tầng API Client chuẩn REST/SSE kết nối 4 endpoints của Backend HPC Private Compute Node (`/upload-transcript`, `/calculate-match`, `/roadmap/generate`, `/chat/stream`).
2. Xây dựng State Store toàn cục bằng Zustand (`useProfileStore.ts`), tích hợp các Async Actions tự động hóa luồng chuyển dữ liệu từ Bóc tách PDF $\rightarrow$ Tính điểm Phù hợp & Radar $\rightarrow$ Sinh Lộ trình Milestone.
3. Thiết lập cơ chế Fallback Mock Data đảm bảo ứng dụng chạy mượt mà ngay cả khi chạy demo offline không có mạng.

---

### 2. Chi tiết Prompt và Nhật ký phản biện AI

#### Prompt 1: Thiết kế TypeScript API Client tương thích Pydantic Backend
* **Prompt đưa cho AI:**
  ```text
  Bạn là Senior TypeScript Architect. Tôi có hệ thống backend FastAPI với các schema Pydantic:
  - TranscriptParsingResponse (request_id, status, parsing_duration_ms, profile_data)
  - CalculateMatchRequest (holland_scores, target_career_tags, courses)
  - CalculateMatchResponse (top_matches, radar_chart_data, skill_breakdown)
  - RoadmapGenerationResponse (status, target_major, readiness_score, semesters)
  Hãy viết lớp ApiService bằng TypeScript cho Next.js 14 có:
  1. Gọi đúng các endpoints của backend.
  2. Bắt lỗi timeout và tự động fallback về Mock Data chân thực nếu backend offline.
  3. Hỗ trợ Server-Sent Events (SSE) để stream token cho Chatbot.
  ```
* **Kết quả AI sinh ra:**
  - AI sinh ra lớp `ApiService` với `fetch` và `FormData`.
  - *Thiếu sót phát hiện qua review:* AI ban đầu sử dụng `axios` và quên xử lý AbortSignal timeout trên Fetch API bản địa của trình duyệt; ngoài ra định dạng `media_type="text/event-stream"` chưa giải mã triệt để ký tự UTF-8 tiếng Việt.
* **Cải tiến & Phản biện của sinh viên:**
  - Chuyển toàn bộ sang Native `fetch` của Next.js 14 với `AbortSignal.timeout(x)` để không phải cài thêm dependency thừa.
  - Tích hợp `TextDecoder("utf-8")` cho luồng ReadableStream để đảm bảo các token tiếng Việt có dấu không bị vỡ font.

#### Prompt 2: Kiến trúc Reactive State Store với Zustand
* **Prompt đưa cho AI:**
  ```text
  Viết Zustand Store (useProfileStore.ts) quản lý toàn bộ vòng đời người dùng:
  - State: profile, riasecScores, selectedCareerTags, analysisResult, selectedMajor, roadmap, completedItems, dynamicReadinessScore.
  - Actions: Tích hợp trực tiếp các hàm async uploadTranscriptAction, calculateMatchAction, generateRoadmapAction.
  - Logic tính toán động: Khi user tích chọn checkbox môn học/project trong lộ trình, tự động tăng dynamicReadinessScore và cộng điểm bonus cho trục radar tương ứng.
  ```
* **Kết quả AI sinh ra:**
  - AI sinh ra store đầy đủ.
  - *Thiếu sót phát hiện qua review:* AI viết mutate state trực tiếp trên `state.selectedMajor`, vi phạm tính bất biến (Immutability) của Zustand.
* **Cải tiến & Phản biện của sinh viên:**
  - Tái cấu trúc hàm `toggleCompletedItem` bằng shallow copy `{ ...state.selectedMajor, radar_data: newRadarData }` chuẩn phong cách Functional Programming.

---

### 3. Đánh giá chất lượng & Kết quả thực tế
- File `src/types/api.ts` đồng bộ $100\%$ với Pydantic schemas của backend.
- File `src/services/api.ts` và `src/stores/useProfileStore.ts` biên dịch thành công không có lỗi kiểu dữ liệu.
