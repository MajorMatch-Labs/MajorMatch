# Week 4 AI Prompt and Evidence Log — Long Nhật

## Record

| Field | Value |
|---|---|
| Owner / commit author | `NhatPrv <torikun2005@gmail.com>` |
| Branch | `feat/longnhat-w4-advisor-ui-prd` |
| Baseline | MajorMatch `origin/main` at `03957c0` |
| Week / task | Week 4 / Task 1 — Advisor/Core UI PRD |
| Output | `tasks/long-nhat/prd-advisor-ui.md` |
| Status | PRD authored; human decisions and design work remain open |

## User instruction captured

The user requested that the Long Nhật work use the guidance at `tasks/long-nhat/README.md`, produce the Advisor/Core UI PRD and this evidence log, and audit `/roadmap`, `/chat`, Zustand, readiness score, prerequisites, and SSE. The user explicitly deferred review of all three PRDs because Vy and Nhật are working concurrently.

The user also required:

- an independent feature branch from `origin/main`;
- two focused commits authored by Long Nhật, not by Văn Hoàng;
- push the `client` subtree to `majormatch-client` first;
- only after that succeeds, push the feature branch to the MajorMatch monorepo;
- open and cross-link one pull request in each repository;
- do not implement Week 4 Task 2 design in this branch.

## Clarification decisions

The four user selections were `1A 2A 3A 4A`. They were applied as follows:

1. **A — branch strategy:** create an independent Long Nhật branch from `origin/main`.
2. **A — product scope:** cover only `/roadmap`, `/chat`, Zustand, and the result-to-roadmap-to-chat handoff.
3. **A — policy status:** leave proposed readiness, prerequisite, and SSE policies as `HUMAN DECISION REQUIRED`; do not present them as approved facts.
4. **A — delivery:** create two commits, push client first and monorepo second, then create and cross-link both PRs.

## Prompt direction used

Act as a senior Product Manager and Requirements Engineer for MajorMatch. Audit the repository before writing requirements. Separate verified behavior, contradictions, missing evidence, proposals, and decisions that require a human owner. Produce a design-ready UI PRD for the Advisor/Core journey only: result handoff, roadmap provenance and states, prerequisite behavior, reversible readiness simulation, roadmap-to-chat context, and controllable SSE chat. Do not fabricate policy, API behavior, validation results, or success thresholds. Mark unresolved product rules `HUMAN DECISION REQUIRED`. Include user stories, testable acceptance criteria, functional requirements, state/error/accessibility requirements, Gherkin scenarios, traceability, open decisions, and a Week 4 Task 2 handoff checklist. Exclude implementation, visual design artifacts, export, analytics/ingestion ownership, and three-PRD consolidation.

## Repository evidence reviewed

### Product and requirements sources

- `docs/01-overview/PRD.md`
- `docs/01-overview/REQUIREMENTS_ANALYSIS.md`
- `docs/03-specifications/FEATURE_SPECIFICATION.md`
- `docs/03-specifications/user-stories-advisor.md`
- `docs/03-specifications/API_SPECIFICATION.md`

### Client implementation sources

- `src/app/result/page.tsx`
- `src/app/roadmap/page.tsx`
- `src/app/chat/page.tsx`
- `src/components/roadmap/MilestoneTree.tsx`
- `src/components/roadmap/InteractiveTask.tsx`
- `src/components/chat/StreamingChatBox.tsx`
- `src/stores/useProfileStore.ts`
- `src/services/api.ts`
- `src/types/api.ts`
- `package.json` and repository test inventory

### Backend contract sources

- `../backend-hpc/main.py`
- `../backend-hpc/schemas.py`

## Material audit findings carried into the PRD

- Direct `/roadmap` access silently installs mock roadmap data.
- The result handoff supplies a fabricated fallback GPA when profile data is missing.
- Roadmap request and response names differ between the client and backend schemas.
- Client types do not encode a prerequisite graph or stable task identifiers.
- Readiness calculation is implementation-defined; `|| 60` also replaces a valid zero score, and certificate scoring uses inconsistent denominators.
- Toggling tasks mutates the current radar/readiness state, so clamping can prevent exact reversal.
- The client chat URL and payload do not match the documented/backend streaming contract.
- Raw response chunks are appended without an SSE parser, abort control, or explicit terminal-event verification.
- A chat failure is replaced by simulated advisor copy, which can be mistaken for a successful AI response.
- Keyboard semantics, announcements, mobile overflow handling, and executable tests were not evidenced.

These observations were converted into traceable requirements or open decisions. Proposed rules were not upgraded to verified requirements.

## Deliverable result

Created `tasks/long-nhat/prd-advisor-ui.md` with:

- repository audit and evidence labels;
- scope, goals, non-goals, target user, and journey;
- six user stories with acceptance criteria and browser-verification notes;
- fourteen functional requirements and a UI state matrix;
- readiness, prerequisite, persistence, and SSE decisions explicitly awaiting human approval;
- integrity, accessibility, responsive, recovery, and design-handoff requirements;
- eight Gherkin scenarios and a requirements traceability matrix;
- success-measurement placeholders without invented targets;
- ten open human decisions for approval before design or implementation.

## Verification log

| Check | Result |
|---|---|
| `git diff --check origin/main...HEAD` | PASS — no whitespace errors reported |
| PRD structure and required-topic scan | PASS — roadmap, chat, Zustand, readiness, prerequisites, SSE, acceptance scenarios, traceability, and human-decision markers present |
| `npm run build` in `client` | NOT VERIFIED — environment has no installed `next` executable (`'next' is not recognized...`) |
| Browser/product/usability validation | NOT PERFORMED — this branch creates requirements, not implementation or Task 2 design |
| Three-PRD review/consolidation | NOT PERFORMED — explicitly deferred by the user |

No dependency installation was performed because it is outside this documentation-only task. Build success, deployed API behavior, policy approval, and user-validation outcomes must not be inferred from this log.

## Delivery sequence

1. Commit the PRD with Long Nhật as author.
2. Commit this evidence log with Long Nhật as author.
3. Push the `client` subtree branch to `MajorMatch-Labs/majormatch-client`.
4. After client push succeeds, push the branch to `MajorMatch-Labs/MajorMatch`.
5. Open and cross-link the two PRs without merging them.
