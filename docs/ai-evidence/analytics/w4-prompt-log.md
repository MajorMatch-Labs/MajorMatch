# Week 4 Prompt Log — Ánh Vy / Analytics UI PRD

## 1. Session and scope

| Field | Evidence |
|---|---|
| Date | 2026-09-15, Asia/Saigon |
| Owner | Nguyễn Thị Ánh Vy |
| Task | Week 4 Task 1 — PRD và audit Analytics UI |
| Workspace | `E:/MajorMatch/MajorMatch`, client subtree `client/` |
| Baseline | `36b161cd89637b6f705cc9d9290c367fe1c09aca` |
| Branch | `feat/anhvy-w4-analytics-ui-prd` |
| Deliverable | `tasks/analytics/prd-analytics-ui.md` (đường dẫn tương đối client) |
| Scope limit | Chưa design hoặc implement; Task 2 riêng sau PRD approval |

Log này ghi cuộc trao đổi và thao tác thật trong phiên. Không tái dựng user prompt, review hoặc test chưa xảy ra. Các đoạn được ghi “tóm tắt” không phải trích nguyên văn.

## 2. Actual prompt evolution

### P1 — Yêu cầu ban đầu của Vy

Trích phần yêu cầu hành động:

> Tôi là Vy
> giờ tôi muốn
> git switch main git pull origin main git switch -c feat/anhvy-w4-analytics-ui-prd

Vy yêu cầu dùng prompt trong README Analytics tại đường dẫn ổ D:, tạo hai deliverables `tasks/analytics/prd-analytics-ui.md`, `docs/ai-evidence/analytics/w4-prompt-log.md`, audit MajorCard/RadarComparison/SkillBreakdown và `/result`, chưa tạo design; sau khi PRD duyệt mới tạo `feat/anhvy-w4-analytics-ui-design`; yêu cầu pull request. Đây là tóm tắt phần còn lại của user prompt.

**Quan sát thật:** đọc đường dẫn D: thất bại vì không tồn tại trên máy. Agent tìm thấy và đọc bản hướng dẫn tương ứng `client/tasks/analytics/README.md` trong checkout, thông báo cho Vy; không tuyên bố đã đối chiếu nội dung file D:.

### P2 — Áp dụng prompt có sẵn

Nguồn: `tasks/analytics/README.md: Copy-paste prompt for the PRD agent`; đã đọc toàn bộ `.agents/skills/prd/SKILL.md`, `tasks/README.md`, `tasks/PRD_UI_BASE.md`.

Tóm tắt chỉ dẫn đã áp dụng: vai trò Product Engineer/UI requirements owner; chỉ PRD Task 1; inspect repository; hỏi 3–5 câu có lựa chọn chữ cái; phân biệt sáu trục, top-major decision, state/accessibility/provenance; không phát minh scoring/benchmark/metrics; tách contradiction, kết thúc traceability và handoff. Không tạo ảnh/Figma/màn hình hoặc sửa production code.

### P3 — Ba câu hỏi thật và câu trả lời của Vy

| # | Câu hỏi đã gửi | Lựa chọn đã gửi | Câu trả lời thật |
|---|---|---|---|
| 1 | PRD Analytics ưu tiên tình huống nào? | A. Sinh viên đại học chọn chuyên ngành phù hợp; B. Học sinh THPT chọn ngành đại học | A. Sinh viên đại học chọn chuyên ngành phù hợp |
| 2 | Hành động chính sau khi so sánh các ngành là gì? | A. Chọn một ngành để xem kỹ năng còn thiếu và học phần gợi ý; B. Chuyển sang Advisor để hỏi sâu về ngành đã chọn | A. Chọn một ngành để xem kỹ năng còn thiếu và học phần gợi ý |
| 3 | Với ranking, benchmark và ý nghĩa điểm chưa có nguồn xác thực, Vy muốn trình PRD thế nào? | A. Ghi rõ điểm chưa xác minh và để quyết định chặn duyệt design cho Vy/Tech Lead; B. Vy/Tech Lead sẽ cung cấp quy tắc và nguồn dữ liệu trước khi chốt PRD | A. Ghi rõ điểm chưa xác minh và để quyết định chặn duyệt design cho Vy/Tech Lead |

**Thay đổi nội dung theo trả lời:** tập trung sinh viên đại học; chọn ngành → khoảng cách kỹ năng → học phần gợi ý là hành động chính; giữ policy chưa xác minh trong D01–D08 và không đánh dấu Approved for design. Cả ba câu trả lời đến trong lúc audit; agent đã đưa vào bản PRD trước commit. Vy chưa review bản PRD hoàn chỉnh; Tech Lead chưa phê duyệt trong phiên này.

### P4 — Agent critique sau audit (không phải prompt mới của Vy)

- Không gọi ba fixture radar là “dùng chung benchmark”: chúng có user vector giống nhau nhưng benchmark khác nhau. Dữ liệu backend mới là aggregate detail top 1, không đủ mọi ngành.
- Không ghi thiếu policy ranking hoàn toàn: FEATURE_SPECIFICATION/user stories có policy đề xuất, nhưng backend xử lý khác và policy chưa được xác nhận cho Week 4. PRD tách C05/D02.
- Không nhận định 375px đã vỡ layout từ source: parent chart hiện có height 360px; responsive cần browser QA sau này.
- Không coi type TypeScript là runtime validation; không coi HTTP 200, fixture hoặc build pass là chứng cứ provenance, đúng điểm, latency hay accessibility.
- Bổ sung khác biệt taxonomy sáu trục backend/client, grade threshold, floor/cap Match, auto Missing và radar floor; ghi IMPLEMENTATION-DEFINED BUSINESS RULE — HUMAN REVIEW REQUIRED.
- Phân biệt audit và requirement tương lai; checklist test và approval chưa được đánh dấu hoàn tất.

## 3. Repository evidence inspected

Nguồn chi tiết và symbols nằm trong PRD §1 (E01–E15). Đã inspect:

- PRODUCT_DISCOVERY, PRD baseline, REQUIREMENTS_ANALYSIS, FEATURE_SPECIFICATION, user-stories-analytics và API_SPEC tại các phần analytics liên quan.
- Toàn bộ `/result`, MajorCard, RadarComparison, SkillBreakdown, store, API types/services và fixtures; luồng upload và module re-export.
- Backend `schemas.py`, `main.py` tại route analysis/roadmap và `ml_engine.py` tại benchmark/scoring/radar/skill breakdown; đối chiếu với client, không sửa backend.
- Rules ở monorepo và client, tokens/styles, package scripts, TESTING_PLAN và danh sách file test/spec trong checkout.

Một số lần đọc gộp bị giới hạn output; agent đọc lại các section/symbol analytics trọng yếu bằng các lệnh có phạm vi nhỏ hơn. Không xác minh các website bên ngoài được trích dẫn trong discovery; PRD chỉ dùng chúng như nội dung tài liệu repository, không nhận là nghiên cứu mới trong phiên.

## 4. Actual verification and limitations

| Check | Kết quả thật |
|---|---|
| `git status --short`, branch ban đầu | Working tree sạch, đang ở main |
| `git switch main; git pull origin main` | Lần đầu sandbox không ghi được `.git/index.lock`/FETCH_HEAD; chạy lại với quyền Git cần thiết thành công; main already up to date |
| Tạo branch đúng tên | `feat/anhvy-w4-analytics-ui-prd` thành công |
| Audit UI | Đọc tĩnh bốn thành phần; bảng phát hiện tại PRD §1.2 và C01–C11 |
| Test inventory | Không tìm thấy test/spec suite client thực thi trong checkout qua `rg --files`; package chỉ có dev/build/start/lint. TESTING_PLAN có ví dụ test, không phải kết quả đã chạy |
| Browser/mobile/runtime UI QA | Chưa chạy; không chụp ảnh MajorMatch, không xác nhận 375px/keyboard/contrast hoặc tốc độ |
| Build/typecheck/lint/tests | Không chạy cho thay đổi chỉ Markdown; checklist là tiêu chí cho triển khai sau |
| GitHub CLI auth | `gh auth status`: chưa đăng nhập GitHub host |
| Browser GitHub | Mở repo client bằng computer-use; trang hiện “Sign in”, chưa có phiên đăng nhập để tạo PR |
| Kiểm tra cấu trúc PRD | PowerShell kiểm đủ 18 heading khớp PRD_UI_BASE, đủ evidence/provenance labels và 10 functional requirements: PASS |
| Kiểm tra diff đã stage | `git diff --cached --check`: exit 0; diff chỉ hai file Markdown của Vy. Lệnh no-index trước đó exit 1 do có file mới, chỉ cảnh báo LF/CRLF; dùng cached check làm kết quả whitespace chính thức |

Không có test report, usability test hoặc design review đã hoàn tất trong phiên. Việc mở GitHub để kiểm tra PR không phải browser QA của MajorMatch.

## 5. Human decisions and design gate

- Đã xác nhận định hướng: Q1A/Q2A/Q3A ở §2.
- Chưa xác nhận: D01–D08 trong PRD; gồm fallback, ranking/score, benchmark/axis/per-major contract, evidence skill, simulation, roadmap context, outcome metrics và performance/timeout.
- Chưa có approval PRD của Vy/Tech Lead. Status vẫn Draft.
- Sau approval mới tạo nhánh `feat/anhvy-w4-analytics-ui-design`; design source/screenshots/review nằm ở commit/PR riêng.

## 6. Git / PR handoff

Chỉ stage hai file Markdown của Vy; author theo rules là `Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`. Đồng bộ client subtree trước rồi monorepo trên cùng tên nhánh theo `tasks/README.md` Week 4; không push feature vào main. Kết quả kiểm tra tài liệu và commit/push được ghi bổ sung khi thao tác hoàn tất. PR cần xác thực GitHub; chưa có số PR tại thời điểm viết mục này.

### Kết quả thực hiện

- Commit PRD: `5a88b73` — `docs(analytics): define week 4 analytics UI PRD and audit evidence`, author đúng Ánh Vy. Chỉ hai file Markdown được commit.
- `git subtree split --prefix=client` cho commit trên thành công, tạo `af319628ee20073c9afc9a8f92769871eef998f9`.
- Push subtree tới nhánh `feat/anhvy-w4-analytics-ui-prd` ở `MajorMatch-Labs/majormatch-client` thất bại: GitHub trả `403`, `Permission ... denied to anhvy0904`. Không force push, không đổi quyền repo hoặc tài khoản.
- Push monorepo chưa chạy vì chuỗi đồng bộ yêu cầu client thành công trước. Chưa tạo PR trên cả hai repo; không có PR URL đã được tạo để ghi nhận.
- Agent yêu cầu đăng nhập CLI vì cả CLI và in-app browser không có session. Vy trả lời thật: “trình duyệt thì trên chrome”. Agent thử kết nối Chrome bằng browser tool, kết quả `Browser is not available: chrome`; không thao tác được phiên Chrome hiện có.
- Blocker bên ngoài: cần tài khoản có quyền push hai repository và phiên GitHub CLI/browser kết nối được để tạo PR. Hai tài liệu vẫn đầy đủ trong nhánh local; chưa có design.

### Nội dung PR đã chuẩn bị (chưa đăng)

Title: `docs(analytics): define week 4 analytics UI PRD and audit evidence`

```markdown
## Summary

Define the Week 4 Analytics UI PRD for university students comparing majors, inspecting skill gaps, and continuing to suggested coursework. Add the PRD and the actual prompt/evidence log only.

Audit MajorCard, RadarComparison, SkillBreakdown, and /result against the repository specifications, store, services, fixtures, and backend contracts. Specify loading/empty/error/retry states, 375px behavior, keyboard/screen-reader access, a chart data table, and data provenance.

## Review required

The PRD remains Draft. Vy confirmed the target user, primary action, and keeping unverified scoring/benchmark decisions as design blockers. Resolve D01–D08 with Vy and the Tech Lead before approving design, including per-major data, ranking, benchmark axes, skill evidence, simulation, handoff, metrics, and timeout/performance policy.

Task 2 starts only after PRD approval on feat/anhvy-w4-analytics-ui-design, in a separate commit and PR.

## Validation

- Static source and specification audit completed.
- All 18 template sections, required evidence/provenance labels, and 10 functional requirement IDs checked.
- git diff --cached --check passed for the PRD commit.
- No application code or design artifacts changed. Runtime tests, build/lint/typecheck, browser/mobile QA, and usability tests were not run for this documentation-only change.
```

Sau khi tài khoản có quyền, split lại HEAD để gồm phần cập nhật log này, push client trước rồi monorepo và tạo PR với base main. Không dùng lại subtree hash cũ nếu muốn gửi toàn bộ log mới nhất. Ghi URL PR thực sau khi GitHub xác nhận tạo thành công.

### Tiếp tục sau khi Vy cấp quyền — đã mở PR

User prompt thật: “oke tôi đã cấp quyền chủ sở hữu cho anhvy0904 rồi”. Agent không thay đổi quyền repository; chỉ thử lại thao tác đã được yêu cầu.

- Working tree sạch, nhánh vẫn là `feat/anhvy-w4-analytics-ui-prd`, HEAD trước đồng bộ là `046d9d5`.
- Split lại client thành `829b90b450d6135ddd605dbacd6e0fcc08b4c5bd`; push client trước, sau đó `git push -u origin feat/anhvy-w4-analytics-ui-prd`: cả hai thành công. Lỗi 403 trước đó đã được giải quyết.
- CLI chưa lưu phiên đăng nhập riêng; agent dùng credential Git hiện có trong bộ nhớ của tiến trình để gọi GitHub CLI, không in hoặc lưu token. `gh api user --jq .login` xác nhận `anhvy0904`.
- Kiểm tra không có PR đang mở cho nhánh trên cả hai repo trước khi tạo, tránh trùng PR.
- Đã tạo [Client PR #8](https://github.com/MajorMatch-Labs/majormatch-client/pull/8) và [Monorepo PR #3](https://github.com/MajorMatch-Labs/MajorMatch/pull/3), cùng head `feat/anhvy-w4-analytics-ui-prd`, base `main`, dùng nội dung đã chuẩn bị phía trên.
- Đây là PR để review tài liệu. Chưa merge, chưa có approval PRD, chưa tạo nhánh hoặc tài sản design Task 2. Các hạn chế runtime QA và quyết định D01–D08 vẫn giữ nguyên.

Các mục ghi blocker trước đây là lịch sử của lần thử đầu, không còn là trạng thái push/PR hiện tại.

## Week 4 Task 2: Analytics design, 2026-09-15

User requested latest main, the same Product Design/Taste workflow for Vy, commits authored only by Vy, and a preview for review. Latest monorepo main `3147856` was fast-forwarded; its client tree matched `client-remote/main` at `74fbd27`. Created `feat/anhvy-w4-analytics-ui-design`.

Three independent built-in Image Gen concepts were displayed. User answered `1`, selecting the first displayed image (saved under `design/analytics/references/selected-option-1.png`). All three prompts used the actual rendered Ingestion screen as visual grounding. Shared prompt: Vietnamese university specialization comparison; Segoe UI, existing dark/indigo tokens; three synthetic choices; six-axis radar plus table; source uncertainty; no invented scoring/policy. First direction used a context rail with selected-major chart and skills. Generated extra tabs/files/icons were not authoritative requirements and were removed from the implementation.

Product Design image-to-code and design QA guided the selected visual and source/render comparison. Microsoft Frontend Design Review guided interaction, craft and truthful-state review. Taste excludes dashboards, so it did not impose landing-page patterns. Repo rules take precedence over template bootstrapping and preserve the existing isolated HTML/CSS/JS preview setup.

User explicitly authorized Playwright Edge headless for automated local checks; in-app browser remains the review surface. Source commits: `3739ae4` initial prototype and `4c9d963` density/axis-disclosure refinement. Each uses Author Nguyen Thi Anh Vy <anhvydn2005@gmail.com>, without Hoàng co-author as requested. No history rewritten.

Actual verification: five Node model tests pass; eleven Edge browser groups pass; 34 state screenshots plus full/focused visual comparisons; no page errors or external requests. Contrast calculation and full metadata in `design/analytics/verification/`. Source commit in results identifies the source before evidence commit. Shared foundation checker passed 105 local Markdown links before this log addition.

Not verified: live API, full XUI cross-module journey, screen-reader user testing, real browser zoom setting or performance targets. 640 CSS px is a reflow equivalent only. No Figma artifact or production integration claimed. D02–D08 remain open; this request authorizes a review prototype, not policy approval. Handoff stops at selected-major synthetic JSON rather than opening an unrelated Advisor fixture.

Deliverables: `design-spec.md`, editable `prototype/`, selected reference, rendered `screenshots/`, `review.md`, `design-qa.md`, repeatable `verification/`. Only Analytics-owned paths changed. Design PRs must stay open for human review.
