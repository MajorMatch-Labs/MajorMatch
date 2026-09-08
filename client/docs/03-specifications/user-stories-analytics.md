# USER STORIES & ACCEPTANCE CRITERIA — ANALYTICS

**Mục:** 3.4. **Chủ sở hữu:** Ánh Vy. **Ngày:** 08/09/2026.  
**Component:** `src/components/analysis/RadarComparison.tsx`, `MajorCard.tsx`, `SkillBreakdown.tsx`.  
**Căn cứ:** [PRD FR-3, FR-5](../01-overview/PRD.md), [RTM](../01-overview/REQUIREMENTS_ANALYSIS.md), [FEATURE_SPECIFICATION](FEATURE_SPECIFICATION.md). Test dưới đây chưa được chạy trong phiên soạn tài liệu.

## US-ANA-01 — 6-Axis Interactive Competence Radar Chart Rendering

As a college student, I want to compare my current competence with a major benchmark on six axes, So that I can locate the largest evidence-based skill gaps.

**Ưu tiên:** Must / FR-C06 / UC-03 / T-ANA-01. Radar năng lực không phải radar RIASEC; hai hệ có ý nghĩa và thang khác nhau. Miền năng lực 0–10; thiếu evidence không tự quy về 0 như một kết quả đo.

```gherkin
Feature: US-ANA-01 Dual-polygon competence radar
  Scenario: T-ANA-01 Render exactly six aligned axes
    Given the selected major has six unique competence axis IDs
    And current scores are "8.5,8,7.5,7,9,6"
    And benchmark scores are "9,8.5,9.5,8.5,8,8"
    When the radar is rendered
    Then exactly six axes use the shared domain 0 to 10
    And separate labeled polygons represent current competence and benchmark
    And the legend differentiates the polygons by text and line style as well as color
    And the same exact values are available in a companion data table

  Scenario: T-ANA-01 Reject invalid geometry
    Given the analysis contains a duplicate axis ID or only five axes or a non-finite score
    When the view model is validated
    Then an analysis data error is shown
    And no misleading student polygon is drawn

  Scenario: T-ANA-01 Show missing evidence honestly
    Given the selected recommendation was calculated from interests only
    And no academic competence vector is available
    When the student opens the radar section
    Then the section explains that academic evidence is insufficient
    And benchmark values may be inspected separately
    And a mock competence vector is not inserted
```

**Hiện trạng:** hai polygon và domain đã có; chưa có runtime validation hoặc bảng truy cập thay thế. Phụ thuộc API cung cấp đúng per-major benchmark và evidence; không lấy RIASEC nhân hai để thay vector năng lực.

## US-ANA-02 — Top 3 Recommended Majors Card Deck

As a high school student, I want a ranked set of up to three recommended majors with clear match percentages, So that I can compare alternatives before selecting a direction.

**Ưu tiên:** Must / FR-C07 / UC-03 / T-ANA-02. Match Score là chỉ số đối sánh của mô hình có phiên bản, không phải xác suất trúng tuyển hoặc được tuyển dụng. Hiển thị một chữ số thập phân; sắp xếp bằng điểm gốc.

```gherkin
Feature: US-ANA-02 Ranked recommendation cards
  Scenario: T-ANA-02 Rank and limit recommendations deterministically
    Given valid majors A, B, C and D have scores 82.44, 91.25, 82.44 and 60
    When recommendation cards are built
    Then the displayed order is B, A and C
    And exactly three cards have ranks 1, 2 and 3
    And equal scores use ascending major ID as the tie breaker
    And each card includes its name, percentage, explanation and selection action

  Scenario: T-ANA-02 Handle fewer than three recommendations
    Given the service returns two valid recommendations
    When the results page opens
    Then exactly two cards are displayed
    And the interface explains that only two recommendations are available
    And no recommendation is duplicated to fill the deck

  Scenario: T-ANA-02 Validate scores and support keyboard selection
    Given a recommendation has a score of 101 or minus 1
    When the response is validated
    Then the invalid result is rejected with a data error
    When a valid card receives focus and the student presses Enter
    Then that major becomes selected and exposes its selected state
```

**Hiện trạng:** MajorCard nhận `major`, `isSelected`, `onSelect`; result page map toàn bộ response, chưa ép tối đa ba. Cần stable major ID thay so sánh bằng tên; không dùng rank làm danh tính bền vững.

## US-ANA-03 — Detailed Skill Categorization Matrix

As an academic advisor, I want a transparent skill matrix with evidence and non-overlapping categories, So that I can explain what the student has demonstrated and what still needs attention.

**Ưu tiên:** Must / FR-C08 / UC-03 / T-ANA-03. Ngưỡng hệ 4.0: Mastered ≥3.0; Developing 2.0≤x<3.0; Missing khi thiếu minh chứng hoặc x<2.0, kèm lý do riêng. Minh chứng dự án chỉ có thể nâng lên Mastered khi đã được xác thực, không chỉ vì có chữ trong CV.

```gherkin
Feature: US-ANA-03 Explainable skill categories
  Scenario: T-ANA-03 Apply exact four-point boundaries
    Given required skills have validated grade evidence
      | skill | grade |
      | A     | 3.0   |
      | B     | 2.99  |
      | C     | 2.0   |
      | D     | 1.99  |
      | E     | 0.0   |
    When the skill matrix is constructed
    Then A appears only in Mastered
    And B and C appear only in Developing
    And D and E appear only in Missing with reason "Below foundational threshold"

  Scenario: T-ANA-03 Distinguish absent evidence and verified projects
    Given required skill F has no evidence
    And required skill G has a verified project assessment
    And required skill H has only an unverified CV claim
    When the skill matrix is constructed
    Then F and H appear in Missing with reason "No verified evidence"
    And G appears in Mastered with its project evidence reference
    And no skill appears in more than one category

  Scenario: T-ANA-03 Preserve genuinely empty categories
    Given no required skill is missing according to the validated evidence
    When the matrix is rendered
    Then Missing displays a count of 0 and an explanatory empty state
    And the client does not invent missing skills
    And scores outside 0 to 4 are reported as invalid evidence
```

**Phụ thuộc / khoảng cách:** API hiện trả ba mảng string, không đủ evidence để client tự xác minh ngưỡng. Backend hiện cũng có cách phân loại khác PRD. Cần hợp đồng evidence ở FEATURE_SPECIFICATION; không tuyên bố bảng hiện có đã đạt T-ANA-03.

## US-ANA-04 — Dynamic Hover Tooltips & Mobile Touch Adaptation

As a student using a phone or keyboard, I want precise radar values through touch, focus and hover, So that chart information is accessible without a desktop mouse.

**Ưu tiên:** Must / FR-C09 / UC-03 / T-ANA-04 và T-A11Y-01. Dùng `ResponsiveContainer` với parent `w-full min-w-0 h-[320px] sm:h-[360px]`; đây là cấu trúc đề xuất, phải kiểm tra text thật ở 375px.

```gherkin
Feature: US-ANA-04 Accessible responsive radar inspection
  Scenario: T-ANA-04 Inspect an axis using hover
    Given the algorithm axis has current score 8 and benchmark score 8.5
    When the student hovers the corresponding interactive axis control
    Then the tooltip shows the full axis label and both scores
    And the displayed gap is 0.5

  Scenario: T-ANA-04 Inspect at a 375-pixel viewport using touch
    Given the viewport is 375 pixels wide with Vietnamese axis labels
    When the chart and card deck are rendered
    Then the page has no horizontal overflow
    And no label is required to be read only from a clipped chart tick
    When the student taps an axis selection button
    Then a readable detail panel shows both scores and the full label
    And the panel can be dismissed with its close action

  Scenario: T-ANA-04 Inspect with keyboard and assistive technology
    Given focus reaches the named axis controls
    When the student activates a control using Enter or Space
    Then the same values as the hover tooltip are exposed
    And Escape dismisses the detail panel and returns focus to its control
    And the companion table remains accessible at 200 percent zoom
```

**Hiện trạng:** code đã có `ResponsiveContainer` và `Tooltip`. Chưa thực hiện browser QA nên không ghi “mobile đã pass” hoặc “375px đã lỗi”. Giải pháp truy cập không phụ thuộc khả năng focus tự động của SVG Recharts.

## US-ANA-05 — Major Selection Switching & Instant Graph Re-rendering

As a college student, I want to switch between cached major analyses immediately, So that I can compare skill gaps without waiting for repeated inference.

**Ưu tiên:** Must / FR-C10 / UC-03 / T-ANA-05 và T-PERF-01. “Zero latency” được vận hành hóa thành 0 request và p95 event-to-paint <50ms khi dữ liệu đã cache; không cam kết 0ms hoặc áp dụng cho fetch chưa hoàn tất.

```gherkin
Feature: US-ANA-05 Consistent local major switching
  Scenario: T-ANA-05 Switch cached major details atomically
    Given majors A and B have fully validated cached details
    And A is currently selected
    When the student selects B
    Then the selected card, heading, radar and skill matrix all refer to B
    And no network request or page reload occurs
    And the current academic evidence is unchanged
    And the p95 event-to-paint duration is below 50 milliseconds under T-PERF-01

  Scenario: T-ANA-05 Prevent a stale detail response from winning
    Given a detail request for B is in progress
    When the student selects cached major C
    And the response for B arrives later
    Then C remains selected with C data
    And B may only update its own cache entry

  Scenario: T-ANA-05 Preserve the distinction between original and simulated data
    Given A has a simulated course completion and B has none
    When the student switches to B and then back to A
    Then each major shows its own simulation state
    And neither major changes the immutable original analysis
    And a simulation label is displayed for A
```

**Điều kiện nghiệm thu module:** API per-major đủ dữ liệu; tất cả scenario và responsive/keyboard checks có kết quả lưu. Store hiện mutation selectedMajor và dùng tên ngành; cần tách snapshot/danh tính để đáp ứng story. Không dùng build thành công làm bằng chứng latency hoặc mobile layout.
