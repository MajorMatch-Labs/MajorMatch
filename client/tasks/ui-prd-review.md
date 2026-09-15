# Project Audit

Review owner: Văn Hoàng. Baseline: MajorMatch `9b260e2`; client tree `c92029d896e51e8cc0ff0c3e63a126f9f245a2f7` matched standalone client main at review start. Scope: quality and integration of the three Week 4 UI PRDs. Static review only; no product validation or design approval is implied.

Paths below are relative to `client/`; `../backend-hpc/` refers to the monorepo. This report supplements the module PRDs, preserves their ownership, and records requirements improvements separately from unapproved product policy.

## 1. Executive Summary

Overall maturity: detailed requirements for an implemented prototype; live integration and design approval remain incomplete. Numeric audit scores are UNKNOWN: no approved scoring rubric exists. This applies to product clarity, requirement quality/traceability, functional completeness, UX logic, data honesty, testability and agent readiness. AI-slop risk: MEDIUM (review judgment), driven by unsupported fallback success and promotional implementation copy, not a measured score.

Top five findings: conflicting fallback instructions; unresolved end-to-end context; acceptance criteria that silently choose open policies; inconsistent provenance terminology; missing cross-module acceptance evidence. Changes below clarify requirements and planned verification, not implementation completion.

## 2. Repository Understanding

Product: MajorMatch. Primary documented user: university learner exploring a computing specialization; secondary interest-only learner. Problem: understanding evidence, specialization fit and feasible learning actions. Journey: upload/survey → result → roadmap → chat. Outputs are recommendations and advice; improved decision quality is an intended outcome, not a verified result.

Evidence: `docs/01-overview/PRODUCT_DISCOVERY.md`, `PRD.md`; `src/app/{upload,result,roadmap,chat}/page.tsx`. Client uses Next.js 14/React 18, Zustand, Tailwind and Recharts (`package.json`). API adapters and fixtures are in `src/services/`; backend request schemas are in `../backend-hpc/schemas.py`. Mock success, incomplete state isolation and mismatched contracts remain implementation gaps. Deployment availability is UNKNOWN.

## 3. Product Discovery Audit

Problem/user clarity: PASS as documented intent. Outcome clarity: WARNING, outputs are specified more precisely than measured improvement. Evidence quality/validation strategy: WARNING, proposed discovery pilot is not completed user research. Alternative consideration: UNKNOWN in this review. Evidence: discovery document and all three PRDs' success metrics. Do not interpret merged documents as validated research.

## 4. Reconstructed PRD

Vision/problem: evidence-based exploration of computing directions. Users/needs: submit actual evidence, compare correctly scoped results, understand next learning actions. Goals: honest data, recoverable journey, accessible controls. Non-goals: guarantees of employment/admission, unapproved accounts/cloud history or new scoring. Major capabilities: ingestion, analytics, advisor. Constraints/dependencies: current API mismatches, missing per-major detail, prerequisite authority and readiness policy. Success thresholds: UNKNOWN. Risks/open questions appear in Section 20. Sources: the three module PRDs and product PRD.

## 5. Requirement Inventory

| Class | Shared expectation | Source |
|---|---|---|
| Functional | Validated evidence → selected-major analysis → correctly scoped roadmap/chat | Three module journeys |
| Business | Ranking, radar, RIASEC and readiness have distinct meanings | Analytics §9; Advisor §10 |
| UX | One next action, explicit blocked/retry/empty states | Three UI state matrices |
| Data | Missing evidence differs from zero; preserve baseline and provenance | ING-UI-FR-10; ANA-UI-FR-10; ADV-UI-FR-08 |
| Validation/errors | Reject invalid schema and late responses, no silent mock | All three recovery sections |
| Accessibility/responsive | Keyboard, labels, focus, announcements, reduced motion and narrow layouts | All three accessibility sections |
| Performance | Measure later; conflicting latency/timeout targets need approval | Analytics D08 |
| Security/privacy | Minimal context, no profile/PDF in URLs or evidence logs | All three technical sections |

## 6. Requirement Quality Problems

| ID / priority | Expected | Observed / evidence | Impact | Recommendation |
|---|---|---|---|---|
| R01 / P1 | One fallback instruction | Coding standards §2.3 required automatic mock; all PRDs require explicit demo | Agent can implement the opposite behavior | FIX instruction to match Week 4 user direction |
| R02 / P1 | AC must not decide open policy | Ingestion US-01/04 versus questions 1/6; Advisor US-02/FR-07/AC-03 versus question 5 | False impression that product decision is approved | CLARIFY conditional AC and decision references |
| R03 / P1 | One valid context across modules | Ingestion supports survey-only; Advisor requires semester; backend RoadmapGenerationRequest requires semester 1–10 | User reaches an unexplained dead end or fabricated context | DOCUMENT handoff and blocked recovery; owner decision for interest-only roadmap |
| R04 / P1 | Consistent provenance | Ingestion LIVE/DEMO, Analytics REAL/MOCK, Advisor mixes origin and computation | Live computed/model output may look verified | CLARIFY independent origin and derivation labels |
| R05 / P1 | Inputs invalidate dependent results | Store setProfile/setRiasecScore/toggleCareerTag do not invalidate analysis/roadmap | Mixed old/new evidence | TEST a shared stale-result scenario; specify responsibility |
| R06 / P2 | Traceable cross-module verification | Each PRD has local AC, but no single journey gate | Locally passing screens can fail together | DOCUMENT integration AC and explicit planned status |
| R07 / P2 | Merge and design approval are distinct | All three PRDs remain Draft with unchecked approval | Premature design task | DOCUMENT approval record and gate |

## 7. Gap Analysis

| Gap | Current evidence / risk | Proposed handling | Human approval |
|---|---|---|---|
| Interest-only → roadmap | No semester acquisition contract in the journey; P1 | Keep valid analysis available; explain missing roadmap context; do not invent semester | YES: eligible users and acquisition owner |
| Multiple interests | Backend accepts 1–5 tags; client takes one target string; P1 | Preserve all selected IDs; approve meaning before live handoff | YES: aggregation/ranking semantics |
| Prerequisite reset | Immediate reset and confirmation both appear; P1 | Conditional AC with explicit alternatives | YES: reset interaction |
| Partial parse/correction | Review exists but editing policy open; P2 | Distinguish missing evidence from invalid extraction | YES: editable fields and provenance |
| Persistence | Memory-only baseline; P2 | Refresh requires context recovery; no promise of restore | YES: retention/consent changes |
| Success/performance | Targets unapproved or inconsistent; P2 | Record measurement method and pending target | YES: owners approve targets |

## 8. Epic Map

Evidence intake → trustworthy input (Hoàng); compare directions → informed choice (Vy); plan learning → feasible action (Nhật); contextual explanation → controlled advice (Nhật). Shared dependency: validated evidence and stable selected-major context. Sources: module journeys/stories. All are PARTIAL/UNTESTED in implementation. No new epic is introduced.

## 9. User Story Audit

All three PRDs have six outcome-oriented stories. They are useful coverage groups, but parsing/recovery and SSE/history stories span several implementation concerns: split into linked implementation tasks when approved; retain story IDs. Missing integration coverage is supplied by XUI-AC-01–06 below. Mock fallback has no justification as unlabeled personal success.

## 10. Acceptance Criteria Audit

All scenarios below are PLANNED / UNTESTED. They supplement existing happy-path, validation, loading, empty, retry and accessible-state AC. Logical context names describe requirements, not a new backend DTO or endpoint.

| ID | GIVEN / WHEN / THEN | Owners / existing links |
|---|---|---|
| XUI-AC-01 | GIVEN validated analysis for evidence A; WHEN profile, answer or tag changes to B; THEN old analysis/roadmap is stale, handoff is blocked, old requests/tokens cannot update B, and valid current input remains available for explicit reanalysis | Hoàng + Vy + Nhật; ING-UI-FR-04, ANA-UI-FR-10, ADV-UI-FR-09 |
| XUI-AC-02 | GIVEN a live request fails; WHEN the learner chooses demo; THEN every downstream screen identifies synthetic origin, no selected real PDF is mixed into demo, and reconnect does not relabel demo as live | All; ING-UI-AC-06, Analytics AC05, ADV-UI-AC-07 |
| XUI-AC-03 | GIVEN B is selected but only A has valid details; WHEN opening B or requesting its roadmap; THEN B remains selected with unavailable detail, no detail from A is renamed as B, and no B request is built from A | Vy + Nhật; Analytics AC04/06, ADV-UI-FR-01 |
| XUI-AC-04 | GIVEN valid interest-only analysis and no university semester/course context; WHEN roadmap is requested; THEN missing context is explained without invented values; valid analysis remains readable; any input-collection or alternate roadmap flow waits for the scope decision | All; Ingestion US-01, Analytics D06, Advisor US-01 |
| XUI-AC-05 | GIVEN baseline A and a simulation for A; WHEN navigating A→B→A or changing the evidence version; THEN baseline Match/radar remain unchanged, B never receives A's simulation, and a simulation is restored only for its matching context and approved policy | Vy + Nhật; Analytics AC07, ADV-UI-AC-04 |
| XUI-AC-06 | GIVEN a synthetic fixture at 375, 768 and 1280px, keyboard-only input and reduced motion; WHEN traversing upload→result→roadmap→chat→back, including retry and Stop; THEN focus/status/selected context remain coherent, all primary actions are reachable and no page-wide horizontal overflow occurs | All; each PRD's accessibility AC |

## 11. Business Rules

RIASEC group means and file bounds are documented in ingestion, but neutral-answer interaction remains open. Ranking/radar taxonomy/skill thresholds remain Analytics D02–D04. Readiness weights/cascade remain Advisor questions 1–5. Rules implemented only in `useProfileStore.toggleCompletedItem` (`|| 60`, radar increments) are not approved policy. Executable coverage for these requirements: NOT FOUND in client package scripts/test inventory; scenarios are future test specifications.

## 12. Feature Specifications

| Feature | Trigger / precondition | Flow / output | Alternative/error and state | Rules / dependencies / AC / status |
|---|---|---|---|---|
| Intake | Select evidence path; valid answers/tags | Validate/parse/review → analysis input | Survey-only, partial parse, retry, explicit demo | Ingestion §7–12; XUI-01/02/04; PARTIAL |
| Compare | Valid analysis snapshot | Choose major → its chart/table/skills | No-session, missing detail, stale, retry | Analytics §7–11; XUI-03/05; CONTRADICTORY contracts |
| Plan | Selected major and required context | Validate roadmap → simulate eligible action | Missing context, invalid DAG, errors | Advisor §7–13; XUI-04/05; PARTIAL |
| Explain | Approved scoped context | Connect/stream → complete or Stop | Interrupted/protocol error/explicit retry | Advisor US-04–06; XUI-01/06; PARTIAL |

Implementation targets are the existing routes/components, API adapter and store, not new services. No browser result is claimed.

## 13. Traceability Matrix

| Objective → epic | Story → AC | Implementation target | Planned test / status |
|---|---|---|---|
| Honest evidence → intake | VH-W4-US-06 → XUI-01/02 | upload, api, store | Integration/fault injection; CONTRADICTORY / UNTESTED |
| Coherent choice → compare | ANA-US-04/06 → XUI-03/04 | result, api, store | Per-major handoff; PARTIAL / UNTESTED |
| Reversible plan → learning | LN-W4-US-01/03 → XUI-04/05 | roadmap, store | State-transition checks; PARTIAL / UNTESTED |
| Controlled explanation → advice | LN-W4-US-04/05 → XUI-01/06 | chat, StreamingChatBox, api | Stream cancellation + browser; PARTIAL / UNTESTED |

## 14. UI / UX Product Logic Audit

Shared hierarchy: evidence/source → decision content → next action → secondary details. Each module keeps its own information architecture. Technical promotion, repeated badges, nested cards or metrics require a user purpose (module design-consideration sections). This is a static requirements review: actual contrast, overflow, focus and visual quality are NOT VERIFIED. Do not prescribe identical page layouts to achieve consistency.

## 15. Data & AI Integrity Audit

Shared vocabulary: origin LIVE (real session) / DEMO (synthetic); transformation USER-PROVIDED / STATIC / DERIVED / AI-GENERATED / UNKNOWN. LIVE is not proof of correctness, and DERIVED or AI-GENERATED may coexist with either origin. Analytics REAL maps to real-session origin; MOCK maps to DEMO. UI copy may be Vietnamese and need not expose enum names. Preserve field-level unknowns and available source versions; do not invent metadata. HTTP success alone cannot verify a benchmark or inference.

## 16. Architecture Audit

Material issues: API DTO mismatch, mutable baseline and insufficient invalidation in the shared store. Evidence: `src/services/api.ts`, `src/types/api.ts`, `src/stores/useProfileStore.ts`, backend schemas. Prefer explicit validation and scoped state updates; no framework migration or component relocation is justified by this review.

## 17. Agent Readiness Audit

The three PRDs use this report for shared integration AC, provenance terminology and decision discipline. Keep existing story/FR IDs stable; cite local AC with file/module to avoid collisions. Proposed policy must be conditional everywhere it affects an AC. Historical logs remain historical. Record future approval with owner, decision, affected IDs and evidence; do not mark design approved merely because a PR merges.

## 18. Priority Issues

P0: none newly established by this static PRD quality review. P1: R01–R05 before live journey acceptance. P2: R06–R07 and performance/retention decisions. P3: wording/layout polish after decision consistency. Documentation fixes do not close the associated implementation defects.

## 19. Recommended Next Actions

| Action / why | Evidence | Expected result / affected files | Human approval |
|---|---|---|---|
| FIX fallback instruction to prevent conflicting agent behavior | R01 | client coding standards aligned with explicit demo | Existing user direction suffices |
| CLARIFY conditional policy AC to prevent accidental policy choices | R02 | Ingestion/Advisor PRDs reference unresolved decisions | Editorial fix now; policy later |
| DOCUMENT shared handoff and verification | R03–06 | Three PRDs + this report link XUI cases | Engineering clarification now; eligibility later |
| VALIDATE API contract with backend owner | API/schema mismatch | Approved payload/response, per-major detail and stable IDs | YES |
| CLARIFY scope, scoring and prerequisite choices | Section 20 | Decision record linked from affected AC | YES |
| TEST approved journey during implementation | XUI-01–06 | Fixtures, browser/state tests and truthful evidence | Future implementation task |
| DOCUMENT design approval after review | R07 | Module approval records before Task 2 | YES: module owner + Tech Lead |

## 20. Human Decisions Required

| ID | Decision / owners | Linked open decisions |
|---|---|---|
| XD-01 | Interest-only roadmap eligibility, semester/course acquisition and multi-tag semantics — Hoàng, Vy, Nhật, backend owner | Ingestion Q2/5; Analytics D06; Advisor Q4/6 |
| XD-02 | Ranking/axis taxonomy/skill evidence/source — Vy, domain/backend owner, Tech Lead | Analytics D02–04 |
| XD-03 | Readiness term/weights, per-major simulation and prerequisite reset confirmation — Nhật, Vy, domain owner | Analytics D05; Advisor Q1–5 |
| XD-04 | Evidence-path interaction, neutral answers, parsed correction and survey disclosure — Hoàng, domain owner, Tech Lead | Ingestion Q1/3/6/7 |
| XD-05 | Privacy copy, retention and allowed chat context — module owners, Tech Lead | Ingestion Q4/8; Advisor Q6/9 |
| XD-06 | Timeout/performance targets, SSE terminal/resume contract — Nhật, backend owner, Tech Lead | Analytics D08; Advisor Q7/8 |
| XD-07 | Outcome measures and design approval — module owners, Tech Lead | All success metrics/approval checklists |

Status of XD-01–07: OPEN / HUMAN DECISION REQUIRED. Conditional alternatives may be annotated for review; final design must not silently choose one. Review contribution is not approval on behalf of another author.
