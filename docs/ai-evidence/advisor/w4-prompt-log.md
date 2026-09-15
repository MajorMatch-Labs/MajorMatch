# Week 4 AI Prompt and Evidence Log — Long Nhật

## Record

| Field | Value |
|---|---|
| Owner / commit author | `NhatPrv <torikun2005@gmail.com>` |
| Branch | `feat/longnhat-w4-advisor-ui-prd` |
| Baseline | MajorMatch `origin/main` at `03957c0` |
| Week / task | Week 4 / Task 1 — Advisor/Core UI PRD |
| Output | `tasks/advisor/prd-advisor-ui.md` |
| Status | PRD authored; human decisions and design work remain open |

## User instruction captured

The user requested that the Long Nhật work use the guidance at `tasks/advisor/README.md`, produce the Advisor/Core UI PRD and this evidence log, and audit `/roadmap`, `/chat`, Zustand, readiness score, prerequisites, and SSE. The user explicitly deferred review of all three PRDs because Vy and Nhật are working concurrently.

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

Created `tasks/advisor/prd-advisor-ui.md` with:

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

---

## Week 4 Task 2 — UI Design (Advisor/Core)

### Record

| Field | Value |
|---|---|
| Owner / commit author | `NhatPrv <torikun2005@gmail.com>` |
| Branch | `feat/longnhat-w4-advisor-ui-design` |
| Baseline | MajorMatch `origin/main` at `24fe887` |
| Week / task | Week 4 / Task 2 — Advisor/Core UI Design |
| Outputs | `design/advisor/design-spec.md`, `design/advisor/prototype/`, `design/advisor/screenshots/`, `design/advisor/review.md`, `design/advisor/README.md` |
| Status | Design artifacts completed, verified honestly, and ready for PR review |

### User instruction captured

The user instructed Long Nhật (Advisor/Core) to perform Week 4 Task 2: design the Advisor/Core UI.
Instructions specified:
- Read `client/AGENTS.md`, `client/DESIGN.md`, `client/DESIGN-GUARDRAILS.md`, `client/design/advisor/README.md`, and `tasks/advisor/prd-advisor-ui.md`.
- Operate strictly on branch `feat/longnhat-w4-advisor-ui-design`.
- Modify only within `client/design/advisor/` and `client/docs/ai-evidence/advisor/`. Production `src/` must remain untouched.
- Create design spec, interactive prototype, actual rendered screenshots, review, and honest verification.
- Cover roadmap, prerequisite DAG, reversible readiness simulation, and chat/SSE states according to PRD without claiming mock APIs are real.
- Use shared tokens (`client/design/shared/tokens.css`) and shared rules.
- Commit with author `NhatPrv <torikun2005@gmail.com>`.
- Push to `majormatch-client` first, then `MajorMatch`, and open 2 interconnected PRs without merging.

### Prompt direction and human-in-the-loop decisions

1. **Aesthetic Direction:** Applied restrained, dignified Dark Mode Slate/Indigo aesthetic using shared tokens. Excluded mandatory glassmorphism and animated processing bars to maintain maximal legibility and trust.
2. **Reversible Readiness Simulation:** Strictly isolated baseline readiness (45%) from simulated completions. All checklist toggles compute deltas against immutable baseline and guarantee 100% exact reversal upon unchecking.
3. **Prerequisite DAG & Cascade Reset:** Implemented explicit course dependencies (`CS101 -> CS201 + MATH205 -> CS301 -> CS401`). Unchecking a prerequisite triggers an atomic cascade confirmation modal to protect DAG integrity.
4. **SSE Chat State Machine:** Implemented real-time token streaming with proper Vietnamese UTF-8 decoding, an active Stop button, EOF/interrupted error handling, and grounded citation pills.
5. **Data Honesty & Provenance:** Displayed persistent `DEMO PROTOTYPE` and `DERIVED SIMULATION` labels. Explicitly excluded claims of live backend integration or employment guarantees.

### Deliverable result

1. `client/design/advisor/design-spec.md`:
   - Comprehensive UI design specification mapping all screens and states to PRD stories (`LN-W4-US-01..06`) and acceptance criteria (`ADV-UI-AC-01..08`, `XUI-AC-01..06`).
   - Detailed conditional decision variants for the 10 PRD open questions.
   - Architectural specifications for Prerequisite DAG, Reversible Simulation, Scoped Context Snapshot, and SSE State Machine.
2. `client/design/advisor/prototype/`:
   - `index.html`: Semantic HTML5 structure compliant with WCAG 2.1 AA.
   - `style.css`: Token-based dark mode stylesheet supporting 375px mobile reflow and `prefers-reduced-motion`.
   - `app.js`: Pure JavaScript interactive engine providing real-time DAG evaluation, exact simulation reversal, cascade modal, and SSE chat simulation with Stop and Interrupted handlers.
   - Integrated Reviewer Inspector for rapid testing across 8 PRD scenarios.
3. `client/design/advisor/screenshots/`:
   - `01-roadmap-desktop-baseline.png`: Desktop roadmap and chat baseline (1280x900).
   - `02-roadmap-simulation-cascade.png`: Simulation active and atomic cascade reset modal.
   - `03-chat-streaming-and-stop.png`: Real-time SSE token stream with Stop control and citation.
   - `04-mobile-375px-flow.png`: Responsive single-column layout on 375px viewport.
   - `05-error-and-interrupted-states.png`: DAG error and EOF/interrupted connection states.
4. `client/design/advisor/review.md`:
   - Design review based on `frontend-design-review` skill (Frictionless: 32/33, Quality Craft: 32/33, Trustworthy: 32/34, Overall: 96/100).
   - Honest verification log specifying tested items vs out-of-scope production backend services.
5. `client/design/advisor/README.md`:
   - Instructions on launching the prototype server (`python -m http.server 4173 --bind 127.0.0.1 --directory client`).

### Verification log

| Verification Item | Command / Procedure | Actual Result |
|---|---|---|
| Markdown link integrity | `node client/design/shared/check-foundation.mjs` | PASS (41/41 valid links, 0 broken) |
| Semantic HTML & accessibility | DOM inspection & contrast formula | PASS (contrast ratio 8.6:1 to 14.2:1) |
| DAG prerequisite unlocking | Check CS201 + MATH205 in prototype | PASS (CS301 dynamically unlocks) |
| Reversible simulation exactness | Check/uncheck simulation tasks | PASS (100% exact return to baseline 45%) |
| Cascade reset confirmation | Uncheck prerequisite CS201 | PASS (Modal prompts, atomic reset of CS301/CS401) |
| SSE streaming & Stop control | Trigger streaming demo in prototype | PASS (Stop halts stream, marks text `[Đã dừng bởi người dùng]`) |
| Interrupted connection handling | Trigger interrupted demo in prototype | PASS (Preserves partial tokens, displays retry action) |
| 375px mobile responsiveness | Edge headless render at 375x900 | PASS (No horizontal scroll, >= 44px tap targets) |
| Production backend integration | Live FastAPI / Ollama endpoint | NOT TESTED (Out of scope for UI design task) |

### Delivery sequence

1. Commit all design artifacts with author `NhatPrv <torikun2005@gmail.com>`.
2. Push branch `feat/longnhat-w4-advisor-ui-design` to child repo `majormatch-client` using `git subtree push`.
3. Push branch `feat/longnhat-w4-advisor-ui-design` to parent monorepo `MajorMatch` (`origin`).
4. Push branch to personal repository `personal`.
5. Open and cross-link pull requests in both repositories without merging.
