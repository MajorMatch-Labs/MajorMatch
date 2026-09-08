# USER STORIES & ACCEPTANCE CRITERIA — INGESTION

**Mục:** 3.4. **Chủ sở hữu:** Văn Hoàng. **Ngày:** 08/09/2026.  
**Component:** `src/components/upload/FileDropzone.tsx`, `RiasecSurvey.tsx`; phối hợp `src/types/survey.ts`, `src/stores/useProfileStore.ts`, `src/services/api.ts`.  
**Baseline:** [PRD FR-1](../01-overview/PRD.md); [RTM](../01-overview/REQUIREMENTS_ANALYSIS.md); [hợp đồng chung](FEATURE_SPECIFICATION.md). Đây là tiêu chí mục tiêu, không phải test đã chạy.

## US-ING-01 — Drag and Drop PDF Transcript Upload with Instant File Validation

As a college student, I want to drop or select a validated PDF transcript, So that I can submit academic evidence without uploading an unsupported file.

**Ưu tiên:** Must / FR-C01 / UC-01 / T-ING-01. **Giá trị:** phát hiện lỗi trước network, tiết kiệm thời gian và bảo vệ đường tiếp nhận. “10MB” được định nghĩa là 10.485.760 byte để khớp code hiện có. Magic bytes không chứng minh PDF an toàn hoàn toàn; backend vẫn xác thực độc lập.

```gherkin
Feature: US-ING-01 PDF validation
  Scenario: T-ING-01 Accept a PDF exactly at the size ceiling
    Given live mode is active
    And one structurally valid file named "transcript.PDF" has MIME type "application/pdf"
    And the file contains 10485760 bytes and starts with "%PDF-"
    When the student drops the file onto the dropzone
    Then client validation succeeds
    And the file enters local preview before upload confirmation

  Scenario Outline: T-ING-01 Reject an invalid file before any upload
    Given a selected file has name "<name>" and MIME type "<mime>"
    And its byte size is <bytes> and its first five decoded bytes are "<header>"
    When client validation runs
    Then the validation banner displays "<reason>"
    And no upload request is sent
    Examples:
      | name           | mime               | bytes    | header | reason              |
      | transcript.pdf | application/pdf    | 10485761 | %PDF-  | FILE_TOO_LARGE      |
      | transcript.pdf | application/pdf    | 0        |        | EMPTY_FILE          |
      | transcript.exe | application/pdf    | 2048     | %PDF-  | INVALID_EXTENSION   |
      | transcript.pdf | application/x-msdownload | 2048 | MZ123 | INVALID_MIME        |
      | transcript.pdf | application/pdf    | 2048     | MZ123  | INVALID_PDF_HEADER  |
      | transcript.pdf |                    | 2048     | %PDF-  | UNVERIFIED_MIME     |

  Scenario: T-ING-01 Support keyboard selection and reject multiple files
    Given keyboard focus is on the visible file selection button
    When the student presses Enter and selects one valid PDF
    Then the same validation pipeline as drag and drop runs
    When the student drops two files in a later attempt
    Then a single-file validation message is announced
    And neither file is uploaded
```

**Phụ thuộc / hiện trạng:** code đã kiểm extension/size, chưa có MIME/header. Dùng input có label và nút thật; lỗi có `role="alert"`; không chỉ dùng click trên div. Tên file render như text; lỗi chứa mã và hướng sửa, không hiển thị stack trace.

## US-ING-02 — Visual Upload State & Client-side PDF Parsing Preview

As a college student, I want to preview my PDF page count and see each processing state, So that I can confirm the intended document and know whether processing succeeded.

**Ưu tiên:** Must / FR-C02 / UC-01 / T-ING-02. Preview chỉ đọc metadata local; GPA/môn học được backend trích xuất, không được gọi là kết quả local parser.

```gherkin
Feature: US-ING-02 PDF processing feedback
  Scenario: T-ING-02 Preview and upload a three-page transcript
    Given a valid unlocked three-page PDF has passed file validation
    When the local PDF worker reads the file
    Then a parsing spinner and accessible status are visible
    And after parsing the preview shows the file name and page count 3
    When the student confirms upload
    Then an uploading state prevents a second upload
    When the API returns a valid profile for the active request
    Then a success checkmark and profile summary are displayed
    And old analysis and roadmap data are invalidated

  Scenario: T-ING-02 Handle an encrypted or malformed PDF
    Given the PDF header is valid but the parser reports an encrypted or malformed document
    When local preview ends
    Then an actionable validation banner replaces the spinner
    And no success checkmark or fabricated page count is displayed
    And the student can replace the file

  Scenario: T-ING-02 Ignore a response from a replaced file
    Given file A has an active processing request
    When the student cancels A and selects file B
    And the response for A arrives after B becomes active
    Then the response for A cannot update the current profile
    And the worker and object URL for A are released

  Scenario: T-ING-02 Reject an invalid API profile
    Given upload confirmation has sent a valid PDF
    When the API returns a cumulative GPA of 5 on a four-point scale
    Then a data-contract error is displayed
    And the profile is not committed to the store
```

**Phụ thuộc / hiện trạng:** cần PDF worker và validator runtime; `package.json` chưa có PDF parser. Giới hạn đề xuất 100 trang và preview timeout 15 giây; scanned PDF có thể preview được nhưng extraction trả thiếu môn, phải cho kiểm tra hoặc chuyển khảo sát.

## US-ING-03 — Interactive 10-Question Holland RIASEC Assessment

As a high school student, I want to answer ten independent interest questions using accessible sliders, So that I can explore computing-related majors without inventing a university transcript.

**Ưu tiên:** Must / FR-C03 / UC-02 / T-ING-03. Lưu theo question ID, không theo group. Điểm mặc định hiển thị 3 nhưng chỉ tính answered khi người dùng tương tác hoặc xác nhận mức 3; progress không tự bắt đầu 100%.

```gherkin
Feature: US-ING-03 Independent RIASEC answers
  Scenario: T-ING-03 Keep answers in the same group independent
    Given none of the ten questions has been answered
    When the student sets question 1 to 1 and question 2 to 5
    Then question 1 remains 1 and question 2 remains 5
    And the progress indicator shows 2 of 10 and 20 percent
    And the provisional Realistic score is 3
    And final submission remains unavailable

  Scenario: T-ING-03 Calculate the final six-dimensional mean vector
    Given the answers from question 1 to question 10 are "1,5,2,4,5,1,3,4,3,5"
    And all ten answers have been explicitly confirmed
    When local scoring runs
    Then the vector in R I A S E C order is "3,3,5,1,4,4"
    And all scores are within 1 and 5
    And the progress indicator shows 100 percent
    And no network request is needed to calculate the vector

  Scenario: T-ING-03 Validate bounds and support the neutral answer
    Given question 5 has an accessible label and a slider with step 1
    When the student confirms the displayed neutral answer 3
    Then question 5 is counted as answered once
    When an action attempts to set question 5 to 0 or 6 or 2.5
    Then the invalid action is rejected
    And the previous answer remains 3

  Scenario: T-ING-03 Continue without a university transcript
    Given all answers are confirmed and at least one valid career tag is selected
    And no transcript has been uploaded
    When the student requests recommendations
    Then the payload contains an empty courses array
    And no fabricated GPA or technical skill is included
    And the results identify their interest-only evidence source
```

**Rủi ro / hiện trạng:** nhiều câu đang bind chung group là lỗi logic đọc được từ code. Bộ 10 câu dự án chưa được kiểm định tâm trắc; UI gọi là khám phá sở thích, không kết luận tính cách cố định hay loại trừ nghề nghiệp.

## US-ING-04 — Career Interest Tag Picker

As a high school student, I want to select up to five career interests from the catalog, So that recommendations reflect the directions I actually want to explore.

**Ưu tiên:** Must / FR-C04 / UC-02 / T-ING-04. Catalog hiện có sáu ID: `ai_engineer`, `fullstack_dev`, `devops_cloud`, `cyber_sec`, `mobile_dev`, `embedded_iot`. Backend mapping phải được đối chiếu catalog, không tự chuyển hoa và giả định ID tương đương.

```gherkin
Feature: US-ING-04 Career tags
  Scenario: T-ING-04 Enforce a five-tag maximum without duplicates
    Given five distinct catalog tags are selected
    When the student selects a sixth unselected tag
    Then the selected tag count remains 5
    And a visible accessible message explains the limit
    When the student deselects one tag and selects the sixth tag
    Then the selected tag count is 5 with no duplicate ID

  Scenario: T-ING-04 Require a meaningful selection before analysis
    Given all ten survey answers are complete and no tag is selected
    When the student reviews the analysis action
    Then the action is disabled with a request to select at least one tag
    When the student selects "ai_engineer" and "fullstack_dev"
    Then both IDs are present in the validated analysis request
    And the client does not silently discard the second tag

  Scenario: T-ING-04 Reject unknown IDs and expose selection state
    Given the catalog contains six valid tags
    When an action attempts to select "unknown_career"
    Then the selection remains unchanged
    And every catalog button exposes its selected state to assistive technology
```

**Hiện trạng:** store đã giới hạn 5 nhưng không thông báo khi đạt trần; trang upload chỉ sử dụng tag đầu tiên. T-ING-04 phải kiểm tra payload, không chỉ số lượng nút được tô màu.

## US-ING-05 — Offline Fallback & Mock Data Generation for Demo

As a student demonstrating MajorMatch, I want an explicit offline demonstration mode with deterministic synthetic data, So that I can demonstrate the workflow without presenting mock results as real analysis.

**Ưu tiên:** Must / FR-C05 / T-ING-05; bổ sung T-DEMO-01 và T-NET-01. Fixture tạo từ bộ dữ liệu tổng hợp cố định phiên bản `demo-v1`, deep clone mỗi phiên; không suy luận kết quả từ PDF người dùng rồi gắn nhãn demo.

```gherkin
Feature: US-ING-05 Transparent demo fallback
  Scenario: T-ING-05 Offer demo after a network timeout
    Given the application is already loaded in live mode
    And the backend does not respond to a business request
    When 15 seconds have elapsed
    Then the active request is aborted and the loading state ends
    And the student sees retry and explicit demo actions
    When the student chooses demo
    Then synthetic fixture data is loaded without sending the selected PDF
    And a "Demo - synthetic data" label appears on results, roadmap, chat and export

  Scenario: T-ING-05 Preserve real validation errors
    Given live mode is active
    When the backend responds with HTTP 413 or 415 or 422 or 429
    Then the corresponding error is displayed
    And mock data is not substituted for the failed response
    And HTTP 429 respects the displayed retry delay

  Scenario: T-ING-05 Keep repeated demonstrations deterministic
    Given demo fixture version "demo-v1" is selected
    When one session changes a checklist and then resets the demo
    Then a fresh copy of the original fixture is restored
    And no mutation from the previous session remains

  Scenario: T-ING-05 Recover connectivity without silently changing data source
    Given demo mode is active and the backend becomes reachable
    When the health check succeeds
    Then the current result remains labeled as demo
    And an explicit action is required to start a new live analysis
```

**Điều kiện nghiệm thu module:** tất cả scenario đạt trên implementation, người kiểm tra lưu kết quả cùng fixture và môi trường. Không khẳng định cold-load offline vì chưa có app-shell cache/service worker; LAN private mode là một phép kiểm tra khác.
