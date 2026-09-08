# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Văn Hoàng — vai trò Ingestion theo phân công; chưa xác nhận trực tiếp thực hiện các lượt prompt minh họa dưới đây.  
> **Tuần thực hiện**: Tuần 3 - Chương 3.  
> **Module liên quan**: ingestion.

**Nguồn gốc:** bản tái dựng có gắn nhãn, soạn ngày 08/09/2026 theo [PROMPT_LOG_TEMPLATE](../PROMPT_LOG_TEMPLATE.md). Không có transcript chat, screenshot hoặc commit cá nhân chứng minh hai lượt prompt lịch sử; không trình bày nội dung này như minh chứng thực nghiệm đã hoàn tất của Văn Hoàng. Phát hiện code là kết quả đọc tĩnh trong phiên soạn tài liệu; đoạn chỉnh sửa là đề xuất để người học review, chưa áp dụng vào source.

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Phân rã FR-1 thành năm user stories có Gherkin; xác định biên PDF 10 MiB, preview, RIASEC độc lập theo câu và demo minh bạch. Liên kết US-ING-01–05 tới FR-C01–05 và T-ING-01–05.
* **Công cụ AI sử dụng**: Codex trong phiên soạn bộ tài liệu này. Hai lượt bên dưới là ví dụ prompt evolution được tái dựng theo đề bài, không phải bản trích xuất lịch sử sử dụng công cụ của thành viên.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
You are a product analyst for MajorMatch's ingestion module.
Write user stories and acceptance criteria for FileDropzone.tsx and
RiasecSurvey.tsx. Include PDF upload, a ten-question Holland survey,
career interest tags and an offline demonstration flow.
Use professional Vietnamese explanations and English Gherkin.
```
* **Kết quả nhận được từ AI**:
  * **Đầu ra minh họa tái dựng:** “Given a PDF transcript, When the student uploads it, Then show a successful profile”; mô tả slider 1–5 và nút chọn tags nhưng không có size ceiling trong Gherkin, không phân biệt mock với kết quả thật.
  * Output này thể hiện một happy path, chưa đủ để QA quyết định file ngay biên có hợp lệ hay không. Không có bằng chứng đây là phản hồi lịch sử của một model cụ thể.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * **ING-D01 — thiếu AC dung lượng:** “valid PDF” mơ hồ; cần 10.485.760 byte hợp lệ và 10.485.761 byte bị từ chối, cộng 0 byte. Nếu chỉ viết “10MB” mà không thống nhất byte, frontend/backend có thể lệch ngưỡng.
  * **ING-D02 — code thực tế:** `FileDropzone.handleFile` có extension và `file.size > 10 * 1024 * 1024`; chưa kiểm MIME hoặc `%PDF-`. Vì vậy không được nói code quên size hoàn toàn; lỗi size trong đề bài thuộc output Gherkin minh họa.
  * **ING-D03 — code thực tế:** `RiasecSurvey` đọc/ghi theo q.group; q1/q2 nhóm R không độc lập. Cần answers theo question ID, final mean theo nhóm, progress theo câu đã xác nhận.
  * **ING-D04 — code thực tế:** service catch lỗi upload và trả fixture, nên có nguy cơ success giả dù endpoint sai. Cần tách lỗi thật và demo do người dùng chọn.

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Act as the ingestion owner preparing Chapter 3 for CS2028.
Use PRD.md FR-1.1 through FR-1.4 as the baseline. Inspect the current
FileDropzone, RiasecSurvey, survey data, API service and Zustand store.
Produce US-ING-01 through US-ING-05, each with the exact As a / I want /
So that structure and English Scenario, Given, When, Then steps.
Every story must have both a success path and a negative or boundary path.

Define the existing 10MB policy as 10485760 file bytes, inclusive.
Require .pdf case-insensitively, MIME application/pdf, nonempty content
and the first five bytes %PDF-. An empty MIME is a validation failure
with guidance, not an implicit bypass. The server validates independently.

Few-shot:
Scenario: Reject a file one byte above the ceiling
  Given a PDF file contains 10485761 bytes
  When client validation runs
  Then FILE_TOO_LARGE is shown
  And no upload request is sent

Add the accepted boundary, zero bytes, MIME spoofing, bad header,
multiple files, keyboard selection, preview page count and cancelled
request races. Local preview reads metadata; HPC extracts grades.
Keep each survey answer independent. Map R={1,2}, I={3,4,9}, A={5},
S={6}, E={7,10}, C={8}; use group means, not sums.
Require 1-5 unique catalog tags and send all selected IDs.
Timeout business requests at 15 seconds. Do not hide 4xx errors with
mock data. Demo requires an explicit action and persistent source labels.
Report current-code gaps separately from proposed acceptance criteria.
Do not claim any browser test or manual edit was performed without evidence.
```
* **Kết quả sau khi cải tiến**:
  * **Đầu ra cuối đã soạn trong phiên này:** [user-stories-ingestion.md](../../03-specifications/user-stories-ingestion.md), đủ 5 stories với T-ING-01–05; [FEATURE_SPECIFICATION](../../03-specifications/FEATURE_SPECIFICATION.md) định nghĩa byte ceiling, preview, group mean và timeout.
  * Review tài liệu đối chiếu được hai biên 10.485.760/10.485.761, progress 2/10, fixture RIASEC ra `[3,3,5,1,4,4]`, tối đa năm tags và lỗi API không thành mock success. Đây là xác minh nội dung đặc tả, không chứng minh implementation đã pass.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do bạn tự sửa lại bằng tay**:
  * Chưa có bằng chứng chỉnh source thủ công của Văn Hoàng trong phiên này. Đề xuất dưới đây dành cho bước review/áp dụng của thành viên, không phải code đã commit:
  ```typescript
  const MAX_PDF_BYTES = 10 * 1024 * 1024;

  async function validatePdf(file: File): Promise<string | null> {
    if (!file.name.toLowerCase().endsWith(".pdf")) return "INVALID_EXTENSION";
    if (file.size === 0) return "EMPTY_FILE";
    if (file.size > MAX_PDF_BYTES) return "FILE_TOO_LARGE";
    if (file.type === "") return "UNVERIFIED_MIME";
    if (file.type !== "application/pdf") return "INVALID_MIME";
    try {
      const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      const signature = [0x25, 0x50, 0x44, 0x46, 0x2d];
      return bytes.length === 5 && signature.every((b, i) => bytes[i] === b)
        ? null : "INVALID_PDF_HEADER";
    } catch {
      return "FILE_READ_ERROR";
    }
  }
  ```
  * Review cần nối validator với kiểm tra một file, request generation, PDF worker structural preview và backend validation; snippet không tự cung cấp tất cả lớp bảo vệ này.

| Hạng mục kiểm chứng | Bằng chứng hiện có | Trạng thái |
|---|---|---|
| Size validation trong source | `src/components/upload/FileDropzone.tsx`, phép so sánh `>` | Đã đọc tĩnh; inclusive ceiling có trong code |
| MIME/header | Không có kiểm tra tương ứng trong handleFile | Gap được ghi nhận; chưa sửa source |
| Survey independence | q.group được dùng làm state key | Lỗi thiết kế được xác định từ code |
| Gherkin refinement | T-ING-01–05 trong tệp đã soạn | Đã viết và đối chiếu nội dung |
| Runtime upload/worker/keyboard | Không có test run hoặc screenshot | Chưa xác minh runtime |
| Chỉnh sửa cá nhân | Không có commit/diff của Văn Hoàng cho các sửa trên | Chưa xác nhận; không dùng như minh chứng đã hoàn tất |

* **Bài học kinh nghiệm rút ra**: AI cần giá trị biên và oracle rõ, không chỉ từ “validate”. Human review phải phân biệt lỗi của câu trả lời AI với lỗi source có thật. Log chấm CLO2/CLO3 cần transcript và kết quả chạy của chính thành viên; bản tái dựng này là tài liệu chuẩn bị review có nguồn gốc minh bạch.
