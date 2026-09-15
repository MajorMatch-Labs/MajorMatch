# Project Audit

**Audit scope:** MajorMatch monorepo at implementation baseline `03957c0`; the Week 4 documentation commits do not change product behavior.  
**Method:** Static repository inspection. No browser, deployment, usability study, security test, or automated product test was performed.  
**Evidence vocabulary:** VERIFIED, INFERRED, ASSUMPTION, MISSING, CONTRADICTION, HUMAN DECISION REQUIRED.

## 1. Executive Summary

**Overall maturity:** Specification-rich prototype with a visible end-to-end demo path, but not a functionally trustworthy integrated product. Core client/backend contracts disagree, failure paths become synthetic success, several UI claims exceed the evidence, and no executable test suite was found.

| Dimension | Score | Basis |
|---|---:|---|
| Product clarity | 6/10 | The problem and journey are documented, but three personas and several outcomes are not prioritized or validated. |
| Requirement quality | 6/10 | Detailed requirements and stories exist; critical policies remain implementation-defined or contradictory. |
| Requirement traceability | 5/10 | Chapter 3 documents connect many IDs, but implementation and executable tests are not consistently connected. |
| Functional completeness | 3/10 | Routes and components exist, but API mismatches and synthetic fallbacks break trustworthy live behavior. |
| UX / product logic | 3/10 | The primary journey is visible; gating, recovery, provenance, mobile navigation, and accessible control behavior are incomplete. |
| Data honesty | 2/10 | Mock results and health are presented as successful live results without persistent provenance. |
| Testability | 4/10 | Acceptance scenarios are detailed, but no client or backend test files or configured client test command were found. |
| Agent readiness | 6/10 | Documentation and ownership are unusually explicit; duplicated artifacts, conflicting rules, and no canonical `AGENTS.md` still invite drift. |
| AI-slop risk | HIGH | Decorative metrics, gradients, cards, badges, and unsupported certainty compete with the decision journey. |

Top five findings:

1. **P0 / CONTRADICTION:** Client routes and response shapes do not match the API specification or FastAPI implementation. Evidence: `src/services/api.ts: ApiService`; `../backend-hpc/main.py: upload_transcript, calculate_match, chat_stream`; `docs/03-specifications/API_SPEC.md: endpoint catalog`.
2. **P0 / DATA HONESTY:** Network, HTTP, and schema failures are converted into mock success. Result and roadmap routes also auto-load fixtures. Evidence: `src/services/api.ts: catch blocks`; `src/app/result/page.tsx: useEffect`; `src/app/roadmap/page.tsx: useEffect`.
3. **P1 / FUNCTIONAL:** Ten RIASEC questions are not independent because state is keyed by six groups. Evidence: `src/components/upload/RiasecSurvey.tsx: currentScore/onChange`; `src/stores/useProfileStore.ts: riasecScores/setRiasecScore`.
4. **P1 / TESTING:** Test plans and Gherkin exist, but no executable tests or client test script were found. Evidence: `docs/05-testing-and-rules/TESTING_PLAN.md`; `docs/03-specifications/user-stories-*.md`; `package.json: scripts`.
5. **P1 / UX-TRUST:** The UI makes unverified claims such as 100% PII removal, guaranteed prerequisite correctness, readiness percentages, and a ready HPC node. Evidence: `src/app/page.tsx`; `src/components/upload/FileDropzone.tsx`; `src/components/common/Navbar.tsx`; `src/components/common/Footer.tsx`.

## 2. Repository Understanding

| Item | Finding | Status and evidence |
|---|---|---|
| Product | MajorMatch, a skill-gap and study-path advisory product | VERIFIED — `../README.md: project overview`; `docs/01-overview/PRD.md: vision`. |
| Primary users | University students choosing a computing specialization; high-school students without university records are secondary; advisors are a third persona | VERIFIED as documented, not validated — `docs/01-overview/PRD.md: personas`. |
| Core problem | Learners lack an evidence-based way to connect records/interests to a major and actionable learning plan while protecting sensitive records | VERIFIED as a documented proposition; user-research evidence is MISSING — `docs/01-overview/PRODUCT_DISCOVERY.md`; `docs/01-overview/PROJECT_ANALYSIS.md`. |
| Output | Parsed profile, ranked majors, radar/skill gaps, roadmap, and streaming advice | VERIFIED — application routes and `src/types/api.ts`. |
| Intended outcome | A learner can make a more informed specialization and learning-plan decision | INFERRED from the documented journey; an approved measurable outcome is UNKNOWN. |
| Core journey | Home → upload or survey → result → roadmap → chat | VERIFIED — `src/app/`; `src/components/common/Navbar.tsx: navLinks`. |
| Client architecture | Next.js 14 App Router, React 18, TypeScript strict, Tailwind, Zustand, Recharts | VERIFIED — `package.json`; `tsconfig.json`; `src/`. |
| Backend architecture | FastAPI, parser, deterministic ML, ChromaDB/Ollama adapter with fallbacks | VERIFIED in code; deployed availability UNKNOWN — `../backend-hpc/main.py`; `ml_engine.py`; `parser.py`; `rag_service.py`. |
| Gateway | Nginx proxy, rate limits, Cloudflare-oriented configuration | VERIFIED as configuration; deployed state UNKNOWN — `../gateway-infra/nginx/`. |
| Data sources | Uploaded PDF/CV, local RIASEC answers, static career-tag catalog, synthetic fixtures, generated student dataset, configured curriculum/vector stores | VERIFIED as repository artifacts; authority/version of career and curriculum benchmarks is UNKNOWN. |
| External integrations | Cloudflare Tunnel, ChromaDB, Ollama/Qwen, Vercel are intended | VERIFIED in docs/config; operating integration is NOT FOUND. |
| Current capabilities | UI scaffolds all five routes; backend exposes six endpoints; mock demo can show a complete path | VERIFIED. |
| Unfinished capabilities | Live contract integration, trustworthy provenance, correct survey state, prerequisite policy, persistence, accessible interactions, tests, validation evidence | VERIFIED gaps from code/docs. |

Major modules are product-oriented in documentation (`ingestion`, `analytics`, `advisor`) but the implemented components remain mainly under `src/components/`; the three `src/modules/*/index.ts` files are scaffolds. This is a **CONTRADICTION** between the ownership boundary and current implementation location.

## 3. Product Discovery Audit

### Problem

The documented problem is meaningful and connected to the implementation: learners are uncertain about majors and next courses, while transcript privacy matters. It is still broad because it combines high-school discovery, university specialization, advisor support, career matching, curriculum planning, and AI chat.

### Users

The university student is labeled primary, but the ingestion screen combines university transcript/CV upload and high-school survey behavior without selecting a persona-specific path. Evidence: `docs/01-overview/PRD.md: Persona 1–3`; `src/app/upload/page.tsx`.

### Outcomes

- **Output:** recommendations and a roadmap.
- **Outcome:** informed choice and a defensible next action.
- **MISSING:** approved measures for decision confidence, comprehension, or plan usefulness.

### Discovery findings

| Criterion | Result | Evidence |
|---|---|---|
| Problem clarity | PASS with scope warning | `PRODUCT_DISCOVERY.md`; `PRD.md`. |
| User clarity | WARNING | Three personas; no evidence identifying which Week 4 UI journey is primary. |
| Outcome clarity | WARNING | Outputs are detailed; measurable user outcome is UNKNOWN. |
| Evidence quality | FAIL | Proposed pilot exists, but completed interviews/usability evidence are NOT FOUND. |
| Alternative consideration | PASS at documentation level | `PRODUCT_DISCOVERY.md: comparison and MVP sections`. |
| Validation strategy | WARNING | A pilot is proposed; results and decision thresholds are NOT FOUND. |

Unsupported assumptions requiring validation include whether learners trust automated parsing, understand radar values, can distinguish a simulation from employability, and prefer AI chat over advisor review.

## 4. Reconstructed PRD

### Product vision

Provide private, evidence-oriented guidance that connects a learner's academic evidence and interests to computing-major options and a study plan. VERIFIED as documented; market leadership language is not evidence-backed.

### Problem statement

University and high-school learners face uncertainty when selecting majors and translating current preparation into next actions. Sharing records with public AI services introduces privacy concerns. VERIFIED as a repository claim; external validation is NOT FOUND.

### Target users

Primary: university students deciding among computing specializations. Secondary: high-school students exploring computing directions without a university transcript. Tertiary: academic advisors. Priority between secondary and tertiary for the MVP is HUMAN DECISION REQUIRED.

### User needs

- Submit or omit an academic record without fabricated profile data.
- Express interests independently and understand what the survey can and cannot conclude.
- Compare recommendations with source and confidence limitations.
- Understand missing evidence and next learning actions.
- Recover from invalid input, unavailable services, and partial results.
- Know whether displayed content is live, mock, derived, or AI-generated.

### Product goals

Convert input evidence into structured guidance, preserve sensitive data boundaries, provide an actionable roadmap, and support explanation. Performance and accuracy targets appear in `PRD.md`; achieved measurements are NOT FOUND.

### Non-goals

Documented non-goals include psychological diagnosis, guaranteed admission/employment, automatic transfer approval, SIS/LMS sync, and multi-student dashboards. Evidence: `PRODUCT_DISCOVERY.md: MVP/out of scope`.

### Success criteria

Repository targets include ≥95% transcript extraction, correct six-axis display, valid prerequisites, <50 ms checklist feedback, and streaming grounded to curriculum. Evidence of achievement is NOT FOUND. User-outcome success criteria are UNKNOWN — HUMAN DECISION REQUIRED.

### Major capabilities

Ingestion and interest capture; major/skill-gap analysis; roadmap simulation; advisor chat; edge/private processing; explicit demo mode as specified but not implemented.

### Constraints and dependencies

Private-node availability, API contract alignment, curriculum/benchmark authority, PDF safety, client accessibility, and limited GPU capacity. VERIFIED in docs/config.

### Risks

False certainty, mock/live confusion, invalid psychometric interpretation, sensitive-data exposure, stale curriculum, hallucinated advice, and over-scoped UI.

### Open questions

Source/version of benchmark and curriculum data, approval owner for scoring/tie-breaks, whether PDF is optional per persona, what “job readiness” legally/product-wise means, and which success metric controls launch. Some are proposed in Chapter 3 docs but not approved in runtime contracts.

### Principal discrepancies

| Expected | Observed | Evidence | Impact | Recommendation |
|---|---|---|---|---|
| Client uses canonical six endpoints | Four client calls use legacy paths/shapes | `src/services/api.ts`; `API_SPEC.md`; `backend-hpc/main.py` | Live journey fails or parses invalid data | P0 FIX: create validated adapters against one approved contract. |
| Errors remain errors | Catch blocks return success fixtures | `src/services/api.ts` | Users cannot trust results | P0 FIX: explicit demo action and persistent source label. |
| Ten independent answers | State keys by RIASEC group | `RiasecSurvey.tsx`; `useProfileStore.ts` | Answers overwrite each other | P1 FIX: state by question ID, derive group means. |
| 1–5 tags inform analysis | Only the first tag is sent; an AI tag is defaulted | `upload/page.tsx: handleStartAnalysis` | Intent is discarded/fabricated | P1 CLARIFY contract and send validated selection. |
| No fabricated profile | Missing profile inserts technical skills | `upload/page.tsx: userSkills` | False evidence enters ranking | P0 REMOVE fallback skills. |

## 5. Requirement Inventory

| Class | Repository-supported requirements | Main gaps |
|---|---|---|
| Functional | PDF/CV intake, RIASEC, career tags, match/radar, roadmap, chat | Contract integration and per-major detail are incomplete. |
| Business | Maximum five tags; grade bands; ranking; readiness and prerequisite behavior | Several rules exist only in code/docs proposals; authority/version is unclear. |
| UX | Dynamic no-reload updates, explicit states, mobile/desktop, demo resilience | Current UI lacks consistent empty/error/retry/gating and provenance. |
| Data | Academic records, survey answers, career catalog, curriculum, skill benchmarks | Curriculum/benchmark sources and freshness are UNKNOWN. |
| Validation | PDF extension/size documented; MIME/magic-byte and schema validation required | Client checks only extension and upper size. |
| Errors | 4xx/429/timeout/retry behaviors specified in Chapter 3 | Current client collapses them into mocks or console errors. |
| Accessibility | WCAG 2.1 AA, keyboard, alerts, accessible chart alternative | Semantic and screen-reader behavior is mostly MISSING. |
| Responsive | Mobile and 1920×1080 documented; 375px used in detailed specs | Mobile nav and browser evidence are MISSING. |
| Performance | PDF, ML, TTFT, TTI, Lighthouse, <50 ms dynamic update targets | Measurement methodology/results are NOT FOUND. |
| Security/privacy | Private processing, TLS, ephemeral cleanup, no public AI for PII | Deployed proof, access control, strict CORS/CSP, and secret hygiene need work. |

## 6. Requirement Quality Problems

| Requirement/problem | Quality failure | Evidence | Better form after approval |
|---|---|---|---|
| “Top ngành nghề tối ưu nhất” | Not testable; “optimal” has no criterion | `upload/page.tsx` copy | Rank approved candidates with disclosed inputs, formula version, and explanation. |
| “100% PII” / “xóa sạch” | Absolute security claim unsupported | `FileDropzone.tsx`; `Footer.tsx`; home page | State the processing boundary and limitations; verify a defined redaction test set. |
| “100% prerequisite logic” | Contradicted by missing dependency IDs | Home copy; roadmap types | Validate a versioned prerequisite graph and reject invalid DAGs. |
| Automatic mock fallback | Necessary for demo but contradicts data honesty | coding rule vs Chapter 3 specs/code | Require explicit demo selection and persistent provenance. |
| Dark glassmorphism mandate | Visual implementation detail conflicts with anti-slop/user-purpose rule | `.agents/rules/client-coding-standards.md`; supplied audit rulebook | Treat tokens as a constraint, not a requirement to wrap every section. |
| “Good recommendations” outcome | Necessity is clear; accuracy/utility oracle is missing | PRD/discovery | Define comprehension and decision-support validation with a human-approved threshold. |

## 7. Gap Analysis

| ID | Area | Missing decision/current behavior | Risk | Severity | Suggested decision | Human approval required? |
|---|---|---|---|---|---|---|
| GAP-01 | API | Canonical path/schema and migration policy | Live failure | P0 | Approve one contract and typed adapters | YES |
| GAP-02 | Provenance | Failures and direct navigation auto-load mock success | Misleading advice | P0 | Explicit demo mode with persistent label | YES |
| GAP-03 | Input evidence | No profile inserts default skills | Fabricated ranking input | P0 | Empty courses/skills, or block with explanation | YES |
| GAP-04 | Survey | Question answer/confirmation and score interpretation | Invalid vector | P1 | Per-question state and group means | YES for scoring policy |
| GAP-05 | Upload | Empty, MIME, header, password, scan, page count, replacement race | Unsafe or stale result | P1 | Implement documented validation/error matrix | NO after policy approval |
| GAP-06 | Tags | Zero selection, sixth selection feedback, multi-tag backend meaning | Lost user intent | P1 | Enforce 1–5 and define analysis semantics | YES |
| GAP-07 | Ranking | Ties, fewer than three, per-major detail | Incorrect comparison | P1 | Approve deterministic ranking/detail contract | YES |
| GAP-08 | Roadmap | Prerequisite IDs, weights, certificate behavior | False plan/readiness | P0 | Versioned DAG and simulation policy | YES |
| GAP-09 | Refresh/back | Zustand is memory-only and routes are directly accessible | Context loss/synthetic reset | P1 | Define guarded navigation and persistence boundary | YES |
| GAP-10 | Accessibility | Upload div, sliders, clickable cards/tasks, charts | Excludes keyboard/AT users | P1 | Semantic controls, labels, focus, table alternative | NO |
| GAP-11 | Mobile | Desktop nav is hidden without mobile replacement | Journey blocked at narrow width | P1 | Approved compact navigation | YES for IA |
| GAP-12 | Testing | No executable suite | No release evidence | P1 | Configure unit/component/integration/E2E gates | NO |

## 8. Epic Map

| Epic | User outcome | Included features | Dependencies | Status | Scope-creep risk |
|---|---|---|---|---|---|
| Evidence intake | Learner provides relevant evidence safely | PDF/CV, preview, RIASEC, tags, demo choice | File policy, survey policy, API | PARTIAL | Treating a short survey as diagnosis |
| Recommendation understanding | Learner compares options and reasons | Major cards, radar, skill groups | Benchmark source, ranking contract | PARTIAL | Decorative precision and fake analytics |
| Action planning | Learner identifies feasible next steps | Roadmap, prerequisites, checklist simulation, export | Curriculum version, DAG, weights | PARTIAL | “Job readiness” as an employment guarantee |
| Guided explanation | Learner asks contextual follow-ups | SSE chat, stop/retry, provenance | Stable contract, privacy, RAG source | PARTIAL | Chat duplicating information without new value |
| Trust and resilience | Learner knows source/state and can recover | errors, retry, demo labels, privacy, accessibility | Cross-cutting conventions/tests | MISSING/PARTIAL | Health/decorative status presented as assurance |

## 9. User Story Audit

Valid or substantially valid stories are present for ingestion, analytics, and advisor in `docs/03-specifications/user-stories-*.md`. They include specific users, outcomes, and Gherkin.

Weak or missing stories:

- MISSING: mobile navigation and guarded direct-route access.
- MISSING: user review/correction of parsed transcript fields before analysis.
- MISSING: benchmark/curriculum provenance comprehension.
- MISSING: consent/retention behavior for sensitive records and chat.
- WEAK: “offline demo” is justified for grading continuity, not necessarily learner value.
- WEAK: health status badge has no clear learner decision.

Orphan implementations:

- System metric strip on home (`<1.0s`, `100%`) lacks measured evidence and does not advance the primary decision.
- Public HPC “Ready” badge is backed by a mock fallback and can be false.
- Multiple architectural labels (“Web 2.0,” “Hybrid Cloud,” “Qwen 2.5”) are exposed as product copy without a learner task.

## 10. Acceptance Criteria Audit

Chapter 3 Gherkin covers many critical happy, invalid, boundary, and recovery cases. Implementation coverage is **UNTESTED** because executable tests are absent.

Critical scenarios that must gate Week 4 design:

```gherkin
GIVEN a PDF has 10485761 bytes
WHEN client validation runs
THEN no upload request is sent
AND a specific size error is associated with the upload control

GIVEN questions 1 and 2 both belong to Realistic
WHEN the learner sets question 1 to 1 and question 2 to 5
THEN both independent answers remain visible
AND the derived Realistic score is 3

GIVEN a live upload returns HTTP 415
WHEN the response is handled
THEN the user sees the server validation error and retry guidance
AND no mock profile is stored

GIVEN no transcript exists and the high-school survey is complete
WHEN analysis starts
THEN the request contains no invented GPA, course, or skill evidence

GIVEN the viewport is 375px wide
WHEN the learner enters the ingestion journey using keyboard controls
THEN navigation, file selection, ten questions, tags, errors, and the primary action remain reachable and visibly focused
```

## 11. Business Rules

| Rule | Source | Implementation | Tests | Risk/confidence |
|---|---|---|---|---|
| PDF ≤10 MiB | PRD/feature spec | Extension + size check in `FileDropzone` | NOT FOUND | Medium; exact byte boundary is documented. |
| MIME and `%PDF-` validation | PRD/feature spec | MISSING client-side | NOT FOUND | High. |
| Ten 1–5 RIASEC answers mapped to six groups | PRD/types/feature spec | CONTRADICTORY shared group state | NOT FOUND | High; psychometric validity UNKNOWN. |
| 1–5 unique career tags | User stories/store | Maximum implemented; minimum/feedback/multi-tag request incomplete | NOT FOUND | Medium; backend semantics need approval. |
| Grade ≥3 mastered; 2–<3 developing | PRD | Backend/client mapping needs validation | NOT FOUND | IMPLEMENTATION-DEFINED BUSINESS RULE requiring human review. |
| Top three sort/tie policy | PRD/feature spec | Mock ranks; canonical tie handling not evidenced in client | NOT FOUND | HUMAN DECISION REQUIRED. |
| Readiness increases by completed items | PRD | Equal completion fraction in store; default base uses `|| 60` | NOT FOUND | IMPLEMENTATION-DEFINED and misleading without approval. |
| Prerequisites must be valid | PRD | Dependency IDs absent from client schema | NOT FOUND | P0. |
| Ten requests/minute for heavy endpoints | PRD/Nginx | Config route names partly disagree with backend | NOT FOUND | Medium. |

## 12. Feature Specifications

### Ingestion and survey — PARTIAL / CONTRADICTORY

- **Objective/user/trigger:** Capture academic evidence and interests when a learner starts the journey.
- **Preconditions:** Application loaded; PDF is optional for the high-school path according to Chapter 3.
- **Main flow:** Select/drag PDF, validate, parse, review summary; answer ten questions; select tags; start analysis.
- **Alternative:** Survey-only path; explicit demo after recoverable service failure.
- **Error flow:** Invalid/empty/oversized/spoofed PDF, timeout, 4xx/5xx, stale replacement.
- **UI states:** Default, drag-over, validating, uploading, parsed, invalid, service error, retry, explicit demo, survey incomplete/complete.
- **Evidence:** `upload/page.tsx`; `FileDropzone.tsx`; `RiasecSurvey.tsx`; ingestion stories/spec.
- **Coverage:** Gherkin documented; executable tests NOT FOUND.

### Recommendation comparison — PARTIAL

Cards, radar, and skill groups exist, but direct navigation auto-loads mock data, source/version is hidden, cards are non-semantic, and per-major detail validity is not guaranteed. Evidence: `result/page.tsx`; analytics components; `mockData.ts`.

### Roadmap simulation — CONTRADICTORY

The checklist renders and updates instantly, but the store applies equal weights, modifies every radar axis, mutates match score, and lacks prerequisite IDs. The behavior cannot substantiate “readiness” or prerequisite claims. Evidence: `useProfileStore.ts: toggleCompletedItem`; roadmap types/components.

### Streaming advisor — PARTIAL / CONTRADICTORY

A streaming component and service exist, but client and backend endpoints/contracts differ and robust SSE framing/recovery is not evidenced by tests. Evidence: `StreamingChatBox.tsx`; `services/api.ts`; `backend-hpc/main.py`; feature specification.

## 13. Traceability Matrix

| Objective | Epic | Story / AC | Implementation | Test | Status |
|---|---|---|---|---|---|
| Capture evidence safely | Evidence intake | US-ING-01/02 | Upload page/`FileDropzone` | T-ING-01/02 documented only | PARTIAL, UNTESTED |
| Capture interests | Evidence intake | US-ING-03/04 | `RiasecSurvey`, store | T-ING-03/04 documented only | CONTRADICTORY, UNTESTED |
| Preserve demo honesty | Trust/resilience | US-ING-05 | API service/result/roadmap | T-ING-05 documented only | CONTRADICTORY |
| Compare majors | Recommendation | Analytics stories | Result page/components | T-ANA documented only | PARTIAL, UNTESTED |
| Build feasible plan | Action planning | Advisor roadmap stories | Roadmap page/components/store | T-ADV documented only | CONTRADICTORY |
| Explain plan | Guided explanation | Advisor chat stories | Chat component/service/backend | T-ADV documented only | PARTIAL, UNTESTED |
| Private processing | Trust/resilience | NFR-2 | Architecture/config/parser | Security tests NOT FOUND | PARTIAL |

## 14. UI / UX Product Logic Audit

- **Hierarchy:** Ingestion has one final primary action, but technical labels and multiple glass containers increase cognitive load. Parsed summary metrics appear before users can verify raw data.
- **Error prevention:** Only extension and maximum size are prevented client-side. MIME, signature, empty file, duplicate submission, and stale response protection are missing.
- **Recovery:** Upload error is rarely reachable because service catches become mock success. Analysis errors only reach the console.
- **Navigation:** All stages are exposed globally even when prerequisites are missing; desktop nav disappears on mobile without a replacement.
- **Accessibility:** Clickable `div` dropzone lacks semantic keyboard operation; sliders lack explicit labels/values; errors lack `role="alert"`; clickable cards/tasks are not buttons; reduced-motion handling is absent.
- **AI-slop symptoms:** Excessive cards, gradients, badges, architectural jargon, metric strips, pulsing health, and multiple simultaneous emphasis styles. Remove or simplify elements that do not support the current learner decision.
- **Product-logic mismatch:** The user is deciding what evidence to provide and what interests to declare; the screen instead emphasizes implementation technology and guaranteed processing claims.
- **Missing UI states:** Validating, explicit live/demo selection, server validation error, timeout countdown, retry, survey progress, incomplete state, zero-tag state, replacement confirmation, stale-response discard, and persistent provenance.

## 15. Data & AI Integrity Audit

| Display/data | Classification | Integrity finding |
|---|---|---|
| Career tags and questions | STATIC | Repository-defined, computing-focused, not proven equivalent to a validated instrument. |
| Mock profile/recommendations/roadmap/health | MOCK | Automatically substituted and not persistently labeled. |
| Match score/radar/skill groups | DERIVED or MOCK | Formula/source/version not exposed; client can mutate them through checklist simulation. |
| Readiness | DERIVED | Policy is implementation-defined and can imply employability without evidence. |
| Roadmap/chat text | AI-GENERATED or deterministic fallback | Provenance, validation, and fallback disclosure are incomplete. |
| Homepage performance/privacy numbers | UNKNOWN | No benchmark/security evidence found. |

AI adds plausible value when explaining structured evidence or composing a plan from an approved curriculum. It must not be the source of truth for curriculum prerequisites, grades, benchmark scores, or employment readiness. Prompt grounding, output schema, validators, failure behavior, and privacy intent exist in documents/backend code; runtime evaluation and hallucination evidence are NOT FOUND.

## 16. Architecture Audit

- Business rules are embedded in Zustand UI state (`toggleCompletedItem`) and API failure handling, making them difficult to validate independently.
- Types claim 100% API alignment while contradicting backend schemas. Evidence: `src/types/api.ts` header and backend schemas.
- Module ownership folders are scaffolds while implementation remains in shared component directories.
- Direct browser calls rely on a `NEXT_PUBLIC_API_URL` default while environment docs name `NEXT_PUBLIC_API_GATEWAY_URL`.
- Root/client documentation duplication can drift; the current repository already contains parallel PRD/API/architecture copies.
- Gateway routes reference legacy analysis/chat paths and a permissive CSP contains `'unsafe-inline'` and `'unsafe-eval'`.
- Backend CORS defaults to wildcard. Authentication/session enforcement was NOT FOUND.
- The environment guide contains a token-shaped literal example. It should be replaced by an unmistakable placeholder even if non-production.

No new architectural framework is recommended. The observed need is a small, explicit domain adapter/validator boundary and pure business-rule functions with tests.

## 17. Agent Readiness Audit

Agents currently have strong context in the PRD, product discovery, requirements analysis, feature specification, user stories, ownership rules, and prompt-log templates. The new `tasks/` base makes Week 4 deliverables consistent.

Ambiguities likely to cause agent error:

- No canonical root `AGENTS.md`; rules are under `.agents/rules/` and may not be auto-loaded by every tool.
- Project-local skill output convention and member directory convention require an explicit bridge.
- Root and client copies of documents may diverge.
- Coding standards mandate glassmorphism while the product rulebook rejects unjustified glass/gradients.
- Mock fallback is mandated by a coding rule but contradicted by data-honesty specifications.
- No test command, browser-verification tool standard, branch CI, or PR checklist is configured.
- Business-rule owners and approval records are absent.

Recommended guardrails: designate canonical documents, add contract/schema tests, require provenance fields, require a decision log for scoring/privacy policies, and prohibit “verified/100%/ready” copy without evidence.

## 18. Priority Issues

### P0

- FIX client/backend API paths and schemas.
- REMOVE fabricated skills/default targets from real analysis.
- FIX silent mock-success fallback and direct-route fixture injection.
- CLARIFY/VALIDATE roadmap prerequisite and readiness policies before exposing them as facts.

### P1

- FIX per-question RIASEC state and tag request semantics.
- FIX upload validation, cancellation, and recovery states.
- FIX semantic accessibility and mobile navigation.
- TEST the critical path with executable suites.
- DOCUMENT and display data/AI provenance.

### P2

- SIMPLIFY decorative metrics, cards, gradients, and technical jargon.
- DOCUMENT canonical ownership and source-of-truth files.
- FIX environment/config naming and security defaults.

### P3

- DEFER animation and visual polish until correctness, evidence, and task hierarchy pass review.

## 19. Recommended Next Actions

| Priority/action | Why | Evidence | Expected result | Files likely affected | Human approval required? |
|---|---|---|---|---|---|
| 1. Approve canonical API contract and provenance envelope | The live journey is currently incompatible and untrustworthy | API client/backend/spec | Typed live integration with explicit source | API spec, client types/service, backend schemas | YES |
| 2. Separate live, demo, and error state | Prevent synthetic advice being read as personal analysis | Catch blocks and route fixture injection | Honest recovery and demo | service, store, all result-bearing routes | YES |
| 3. Remove fabricated input and correct ingestion state | Recommendations must use user evidence | Upload page/store/survey | Independent answers and evidence-safe payload | ingestion components/store/types | YES for scoring |
| 4. Approve ranking/readiness/prerequisite policies | These are consequential business decisions | PRD vs store/schema | Versioned, explainable deterministic policies | feature spec, schemas, pure domain logic | YES |
| 5. Implement validation/schema adapters | Reject malformed or stale data before store writes | Missing client validation | Stable UI states and errors | ingestion module, API adapters | NO after contracts approved |
| 6. Establish executable quality gates | Current acceptance evidence is prose only | package scripts/test search | Repeatable unit/component/E2E evidence | package/config/tests/CI | NO |
| 7. Redesign information hierarchy from approved PRDs | Current visuals compete with the task and overclaim | Home/upload/common components | Fewer, clearer, provenance-aware screens | Week 4 design artifacts, later UI components | YES |
| 8. Harden configuration and agent sources of truth | Reduce security and AI-agent drift | CORS/CSP/env/duplicated docs | Safer defaults and deterministic agent work | config, rules, canonical doc index | YES for canonical ownership |

## 20. Human Decisions Required

1. Which persona and decision is primary for the MVP and for each Week 4 screen?
2. Is transcript upload optional for all users or only the high-school path?
3. What validated interpretation, disclaimer, and scoring policy apply to the ten-question RIASEC tool?
4. How do multiple career tags affect one analysis request and ranking?
5. Which benchmark/curriculum sources and versions are authoritative?
6. What ranking, tie-breaking, per-major detail, and explanation policies are approved?
7. What does “Job Readiness” mean, and should that term remain in the UI?
8. Which prerequisite graph and task-weight policy may affect the simulation?
9. What user-outcome metric and threshold determine a successful pilot or launch?
10. What data retention, consent, authentication, and advisor-escalation policies apply?

Until these decisions are recorded, agents may identify alternatives and build non-consequential prototypes, but must not present one option as approved product truth.
