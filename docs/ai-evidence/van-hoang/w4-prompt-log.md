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
| `tasks/van-hoang/prd-ingestion-ui.md` | Hoàng's Week 4 Task 1 PRD | Resolve open decisions and approve |
| `tasks/anh-vy/README.md` | Copy-paste agent direction for analytics PRD | Vy owns final decisions/evidence |
| `tasks/long-nhat/README.md` | Copy-paste agent direction for advisor/core PRD | Nhật owns final decisions/evidence |
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
