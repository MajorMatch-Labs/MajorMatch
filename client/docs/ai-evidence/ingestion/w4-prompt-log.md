# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI — TUẦN 4

> **Thành viên:** Văn Hoàng (`ingestion`)  
> **Công việc:** Task 1 — tạo UI PRD và base PRD cho nhóm; Task 2 — design từ PRD chưa thực hiện  
> **Ngày:** 15/09/2026  
> **Nhánh:** `feat/vanhoang-w4-ingestion-ui-prd`

## 1. Mục tiêu và nguồn gốc

Văn Hoàng yêu cầu Codex cài skill PRD từ `snarktank/ralph`, thêm bản project-local vào `majormatch-client`, tạo cấu trúc PRD cho cả ba thành viên, tạo PRD UI ingestion của Hoàng, chia nhiều commit và đồng bộ cùng tên nhánh sang client trước rồi monorepo.

Đây là log của cuộc trao đổi hiện tại. Nó không tuyên bố Task 2 design, browser review, usability test, hoặc implementation đã hoàn thành.

## 2. Prompt ban đầu và phát hiện thiếu quyết định

### Prompt của người thực hiện

```text
Thêm vào monorepo client trước; tuân theo product/requirement audit rulebook; cài skill PRD từ snarktank/ralph; tạo file PRD cho UI; chia nhiều commit trên nhánh mới; push majormatch-client trước rồi MajorMatch; hướng dẫn hai thành viên còn lại chạy agent tạo PRD tương ứng.
```

### Phản hồi/critique của agent

Prompt chưa xác định phạm vi PRD, tuần/nhánh, vị trí project-local của skill, cách xử lý ba thay đổi đang chưa commit, và danh tính hai thành viên còn lại. Skill PRD yêu cầu hỏi các câu làm rõ thay vì tự chọn.

## 3. Human-in-the-loop refinement

Văn Hoàng xác nhận:

1. Tạo base thư mục PRD cho cả ba thành viên và PRD cho Văn Hoàng.
2. Đây là Tuần 4; Task 1 là UI PRD, Task 2 là design từ PRD; dùng nhánh riêng mang tên Văn Hoàng.
3. Giữ skill toàn cục và thêm bản project-local.
4. Đưa ba thay đổi Markdown rule hiện có vào commit.
5. Hai thành viên còn lại là Ánh Vy và Long Nhật.

Các quyết định này được dùng để tạo `tasks/`, nhưng không được diễn giải thành phê duyệt cho scoring, ranking, privacy claim, hay design cụ thể.

## 4. Repository audit và prompt cải tiến

### Bằng chứng agent đã đối chiếu

- Product baseline: `docs/01-overview/PRODUCT_DISCOVERY.md`, `PRD.md`, `REQUIREMENTS_ANALYSIS.md`.
- Feature baseline: `docs/03-specifications/FEATURE_SPECIFICATION.md`, `user-stories-ingestion.md`.
- Implementation: upload route, `FileDropzone`, `RiasecSurvey`, Zustand store, API service, API types, survey catalog, mock data.
- Cross-tier contract: `backend-hpc/main.py`, backend schemas, API specification, gateway routes.
- Quality/process: package scripts, testing plan, agent rules, assignment guide, prompt-log template.

### Refined agent direction

```text
Create an evidence-based Week 4 ingestion UI PRD, not implementation or a visual design. Make the user decision and outcome primary. Specify record-backed and survey-only paths, one PDF with exact validation boundaries, ten independent RIASEC answers, one-to-five career tags, full UI states, accessibility at 375px, and explicit live/demo/error provenance.

Do not repeat current defects as requirements: group-keyed question state, first-tag-only submission, default ai_engineer, fabricated skills without a profile, legacy API routes, silent mock success, or unsupported 100% privacy/prerequisite claims. Mark ranking, scoring, privacy, and success decisions HUMAN DECISION REQUIRED. Connect objectives to stories, Given/When/Then criteria, implementation targets, and proposed tests. Leave Task 2 design blocked until review.
```

## 5. Output and critique

| Output | Purpose | Human review needed |
|---|---|---|
| `tasks/README.md` | Three-owner workflow and definition of ready for design | Confirm ownership/process |
| `tasks/PRD_UI_BASE.md` | Shared evidence-first UI PRD structure | Confirm as team standard |
| `tasks/ingestion/prd-ingestion-ui.md` | Hoàng's Week 4 Task 1 PRD | Resolve open decisions and approve |
| `tasks/analytics/README.md` | Copy-paste agent direction for analytics PRD | Vy owns final decisions/evidence |
| `tasks/advisor/README.md` | Copy-paste agent direction for advisor/core PRD | Nhật owns final decisions/evidence |
| `tasks/project-audit-pre-ui-prd.md` | Rulebook-required audit before new feature/design work | Tech Lead prioritization |

The PRD deliberately does not provide a mockup. It exposes current contradictions instead of claiming the existing UI behavior is the approved requirement.

## 6. Verification record

- Static repository inspection: completed for the product, client routes/components/state/services/types/data, backend routes/schemas, gateway configuration, documentation, rules, environment examples, and test inventory.
- `git diff --check`: run after document creation; no whitespace error was reported.
- Client production build: attempted with `npm run build` on 15/09/2026 and stopped before compilation because `node_modules` is absent and the `next` executable is not available. Dependencies were not installed during this documentation task. Result: **NOT VERIFIED**, not a product failure or a pass.
- Browser/design/usability verification: **NOT PERFORMED** because Task 2 and implementation are out of scope.
- Executable product tests: **NOT FOUND** in the audited baseline.

## 7. Human decisions still required

The ingestion PRD lists unresolved path selection, document type, parsed-field correction, privacy copy, multi-tag semantics, neutral-answer confirmation, survey disclaimer/version, refresh persistence, and product-success metric. No AI agent should silently decide these items.

## 8. Cross-module quality review — Văn Hoàng

User direction: synchronize the quality of all three UI PRDs, make direct improvements where useful, and credit the module author as well as the reviewer when changing their PRD. This supersedes the earlier deferral of cross-module review, but is not approval of scoring, privacy or design policies.

Baseline: `9b260e2`; the `client/` tree matched standalone client main (`c92029d896e51e8cc0ff0c3e63a126f9f245a2f7`). Branch: `feat/vanhoang-w4-ui-prd-review`.

Review inputs: all three merged UI PRDs, shared base/README, client coding and Git rules, current store/API adapter, upload handoff and backend schemas. Findings and rationale: `tasks/ui-prd-review.md`. Important weaknesses: mandatory AC contradicted open decisions, incompatible provenance terms, missing cross-module context tests, and an auto-mock coding instruction opposite to the Week 4 direction.

Contribution plan: shared review/rule alignment; Hoàng's ingestion corrections; Vy's analytics integration criteria; Nhật's advisor decision/stream criteria. Each owner's changes are isolated into a focused commit. Hoàng is the primary Author; commits editing Vy/Nhật PRDs include the corresponding `Co-authored-by` identity from repository rules. These trailers credit collaboration at the user's request; they do not claim the owners have approved the review.

Verification for this review: static evidence inspection performed. Link/ID/whitespace checks are recorded after execution below. No browser, automated product test, build, design or usability result is claimed for these documentation changes. Open policy decisions remain open; prior log entries describe their original sessions.

Executed documentation checks: 10 local Markdown links and referenced anchors resolved; the shared report has the rulebook's 20 numbered sections; the module PRDs retain their six story IDs and now contain 13 Ingestion, 11 Analytics and 15 Advisor functional IDs. `git diff --check` passed. Diffs were read for decision contradictions and ownership boundaries. Browser/build/product checks were not run because no implementation changed; XUI scenarios remain PLANNED / UNTESTED.

## 9. Module-based design foundation and Ingestion prototype — 2026-09-15

User authorization: migrate member-named PRD/evidence folders to modules, establish shared design rules and prompts for Analytics/Advisor, install only Taste and Microsoft Frontend Design Review in client while preserving Product Design/Figma, then create a separate Hoàng design branch. Foundation PRs were explicitly authorized for automatic merge; the subsequent design PRs are to remain open.

Foundation completed and merged client first: [client #10](https://github.com/MajorMatch-Labs/majormatch-client/pull/10), then [monorepo #6](https://github.com/MajorMatch-Labs/MajorMatch/pull/6). Client tree parity was verified. The foundation has multiple focused commits; changes to other members' material carry their coauthor credits. Skill provenance/licenses are in `.agents/skills/SOURCES.md`; no extra Product Design or third-party Figma skill was added.

Design branch: `feat/vanhoang-w4-ingestion-ui-design`, baseline `24fe887`. Author: `Vcoch27 <hoangtungmy123@gmail.com>`. Inputs: Ingestion PRD, shared PRD review, shared design rules/tokens, existing survey questions/tags. Microsoft Frontend Design Review guided the review format and quality checks. Taste's scope excludes multi-step product forms, so it was not used to override the workflow. Output is editable HTML/CSS/ES modules, not a claimed Figma file or production React implementation.

Artifacts: `design/ingestion/design-spec.md`, `prototype/`, `review.md`, `verification/` and 24 rendered PNGs. Decisions Q1–Q9 remain conditional. No live API, PDF extraction, invented GPA/skills, automatic error-to-demo conversion or unapproved ranking semantics were introduced. The local handoff is explicitly a DEMO fixture, not an approved API DTO.

Verification: four Node tests passed; ten browser groups passed on Edge 153.0.4234.32. Tested source `62c38af926aac90cb3f916bb53da54daf716d316`; generated report records date/revision/limits. Actual captures include 375/768/1280 layouts, survey, review, failures, partial/success samples, 200% CSS zoom and forced colors. Human visual inspection covered desktop intake/review and mobile intake/survey/error; fixed a run-together upload label and duplicate survey counter before regenerating evidence. Initial browser startup failed because the Windows Python server returned `.mjs` as `text/plain`; the shared Node loopback server fixes the MIME issue. This corrective shared change is committed separately.

Token contrast checks passed (text 16.96, muted 9.96, button 7.90, error 10.13, border 3.73, focus 12.84). Browser observed no external requests or backend POST. Foundation checker passed 72 local Markdown links; `git diff --check` passed. Screen-reader speech, real keyboard-only end-to-end completion, live API/SSE/Zustand, production build, Figma fidelity and human policy approval remain unverified. Prototype checks do not close production acceptance criteria.
