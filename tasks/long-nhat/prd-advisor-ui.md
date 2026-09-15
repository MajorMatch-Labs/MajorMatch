# PRD: MajorMatch Advisor/Core UI

## Document control

| Field | Value |
|---|---|
| Owner | Long Nhật — Advisor and client core |
| Week / task | Week 4 / Task 1 — UI PRD |
| Status | Draft — human review required before design |
| Implementation baseline | MajorMatch `origin/main` at `03957c0` |
| Scope | `/roadmap`, `/chat`, Zustand state, and the result-to-roadmap-to-chat handoff |
| Excluded concurrent work | Analytics/Ingestion PRD review and consolidation |
| Next task | Week 4 / Task 2 — UI design on a separate branch after PRD approval |

## 1. Repository understanding and audit

### Product problem and intended outcome

**VERIFIED:** MajorMatch is intended to help a university student understand gaps between current evidence and a computing specialization, then turn those gaps into a feasible study plan with contextual guidance. Evidence: `docs/01-overview/PRD.md: personas, journey, FR-4 and FR-5`; `docs/03-specifications/user-stories-advisor.md`.

**System outputs:** a semester roadmap, a simulated completion state, a derived readiness indicator, and streamed advisor text.

**Intended user outcome:** the student can decide what to learn next, understand dependencies and limitations, explore a reversible plan, and ask a focused follow-up question. No validated outcome threshold was found; product success remains **UNKNOWN — HUMAN DECISION REQUIRED**.

### Implemented surfaces

| Surface | Evidence | Audit status |
|---|---|---|
| Roadmap route | `src/app/roadmap/page.tsx: RoadmapPage` | PARTIAL / CONTRADICTORY |
| Result handoff | `src/app/result/page.tsx: handleGenerateRoadmap` | PARTIAL / CONTRACT MISMATCH |
| Milestone presentation | `src/components/roadmap/MilestoneTree.tsx` | PARTIAL |
| Interactive tasks | `src/components/roadmap/InteractiveTask.tsx` | PARTIAL / ACCESSIBILITY GAP |
| Chat route | `src/app/chat/page.tsx: ChatPage` | PARTIAL |
| Streaming UI | `src/components/chat/StreamingChatBox.tsx` | PARTIAL / PROTOCOL GAP |
| Shared state | `src/stores/useProfileStore.ts` | CONTRADICTORY BUSINESS LOGIC |
| Client API | `src/services/api.ts` | CONTRACT MISMATCH / MOCK FALLBACK |
| Client types | `src/types/api.ts` | INCOMPLETE / CONTRACT MISMATCH |
| Canonical backend | `../backend-hpc/main.py`; `../backend-hpc/schemas.py` | Implemented API surface; deployed availability UNKNOWN |
| Tests | `package.json` and repository test inventory | NOT FOUND |

### Verified audit findings

1. **CONTRADICTION — route provenance:** Direct access to `/roadmap` writes `MOCK_ROADMAP` into the shared store without a persistent demo label. Evidence: `src/app/roadmap/page.tsx:13-20`.
2. **CONTRADICTION — fabricated handoff input:** Result-to-roadmap uses GPA `3.42` when no profile exists. Evidence: `src/app/result/page.tsx:36-45`.
3. **CONTRADICTION — roadmap request/response:** The client sends `target_major`, `missing_skills`, and `cumulative_gpa`, while the backend requires `target_major_id`, `missing_skills`, `completed_course_codes`, and `current_semester`; the client expects `readiness_score`, while backend returns `job_readiness_percentage`. Evidence: `src/services/api.ts: generateRoadmap`; `backend-hpc/schemas.py: RoadmapGenerationRequest/RoadmapGenerationResponse`.
4. **MISSING — prerequisite graph:** Client types contain no stable roadmap/task IDs or prerequisite ID lists. A boolean `prerequisites_satisfied` in the backend response is insufficient to unlock, cascade-reset, or validate a DAG. Evidence: `src/types/api.ts`; `backend-hpc/schemas.py: RecommendedCourse`.
5. **IMPLEMENTATION-DEFINED BUSINESS RULE:** Zustand divides remaining readiness equally by displayed courses/projects, uses `roadmap.readiness_score || 60`, and therefore treats a valid zero as 60. Certificates can be toggled but are excluded from the denominator. Evidence: `src/stores/useProfileStore.ts: toggleCompletedItem`; `MilestoneTree.tsx: certification mapping`.
6. **CONTRADICTION — irreversible derived state:** Each toggle increments/decrements current radar axes and match score rather than recomputing from an immutable baseline. Saturation can prevent exact reversal. Evidence: `useProfileStore.ts: bonusFactor/newRadarData`.
7. **CONTRADICTION — chat API:** Client posts to `/api/v1/roadmap/chat` with `message` and `target_major`; backend exposes `/api/v1/chat/stream` and requires `conversation_id`, `message`, and optional `context`. Evidence: `src/services/api.ts: streamChat`; `backend-hpc/main.py: chat_stream`; `backend-hpc/schemas.py: ChatStreamRequest`.
8. **MISSING — SSE parser/control:** The client appends decoded network chunks directly, does not parse SSE fields/events, has no AbortController/Stop action, and treats EOF as completion. Evidence: `src/services/api.ts: streamChat`; `StreamingChatBox.tsx`.
9. **DATA HONESTY FAILURE:** Chat errors become a simulated typewriter response and complete successfully without a persistent synthetic-data label. Evidence: `src/services/api.ts: streamChat catch`.
10. **ACCESSIBILITY GAPS:** Interactive roadmap items are clickable `div` elements rather than semantic checkboxes/buttons; input/status labeling and focus behavior are incomplete; animation has no reduced-motion policy. Evidence: `InteractiveTask.tsx`; `StreamingChatBox.tsx`; `MilestoneTree.tsx`.
11. **UNTESTED:** Detailed Gherkin and proposed algorithms exist, but no executable client test suite or `test` script was found. Evidence: `docs/03-specifications/user-stories-advisor.md`; `package.json`.

## 2. Introduction / overview

The Advisor/Core UI must present a validated roadmap as a decision tool rather than an authoritative employment prediction. Students must see which learning action is available, why another action is blocked, what a checklist change simulates, and whether the underlying content is live, synthetic, deterministic, or AI-generated. The chat must explain the selected plan using a bounded context snapshot and an observable, stoppable SSE state machine.

The primary roadmap decision is: **“What feasible action should I take next, and what must come first?”**

The primary chat decision is: **“What part of this plan do I need explained before acting?”**

Model names, streaming protocol, Web 2.0 labels, GPU state, gradients, and decorative metrics are secondary unless they support trust or recovery.

## 3. Goals

- Guard roadmap/chat access so missing context never silently becomes a personal-looking mock result.
- Present roadmap order, prerequisite status, source/version, and limitations before simulation controls.
- Keep baseline analysis immutable while computing a reversible simulated state from an approved policy.
- Make incomplete, invalid, empty, loading, success, error, retry, stopped, and interrupted states explicit.
- Provide robust SSE parsing, Stop, user-initiated retry, and request/conversation isolation.
- Send the minimum approved chat context without PDF bytes, identity fields, or the complete client store.
- Support keyboard, screen-reader, reduced-motion, 375px mobile, tablet, and desktop use.
- Produce a state-complete PRD that can drive a separate Week 4 design task without adding product scope.

## 4. Non-goals

- No implementation, refactor, or UI design in this task.
- No review or consolidation of the Ingestion and Analytics PRDs while they are being produced concurrently.
- No automatic proof that a learner completed a course, project, or certificate.
- No employment probability, admission guarantee, graduation audit, or claim that “100% readiness” means job-ready.
- No automatic prerequisite graph inference from semester display order or course names.
- No agent-selected readiness weights, axis deltas, ranking changes, curriculum version, or reconnection policy.
- No automatic replay of a failed chat POST without an approved idempotency/resume contract.
- No cloud chat synchronization, multi-user advisor dashboard, account/authentication implementation, or LMS/SIS integration.
- No career-plan export in this Week 4 Advisor/Core UI PRD. It remains a separate story in the existing Chapter 3 document and requires separate scope approval.

## 5. Target user and needs

### Primary user

A university student who has selected a computing specialization and received a skill-gap result. The student needs to understand a feasible next learning sequence and inspect how hypothetical completion changes a clearly limited planning indicator.

### Secondary interaction

An academic advisor may review a student-shared plan, but advisor record management and multi-student features are out of scope.

### User needs

- Know whether the roadmap belongs to the selected major and which evidence/source/version produced it.
- Distinguish verified completion from self-declared simulation.
- Understand blocked tasks and prerequisite chains without guessing.
- Undo a simulation and return exactly to baseline.
- Know that readiness is a planning indicator, not an employment probability.
- Stop an AI response, retain partial text, and retry intentionally.
- Know whether advice is live AI, deterministic fallback, demo content, interrupted, or unverified.

## 6. Journey and information hierarchy

### Result → roadmap handoff

- **Primary information:** selected major, missing-skill inputs, evidence/source state, and whether roadmap generation is available.
- **Primary action:** generate a roadmap for the selected major.
- **Recovery:** correct missing context, retry a real failure, or explicitly choose demo.
- **Rule:** no default GPA, target major, or synthetic result may enter a live request silently.

### Roadmap

- **Primary information:** next available action, why it matters, prerequisite status, and source/version.
- **Secondary information:** semester grouping, rationale, credits, projects, and certificates.
- **Primary action:** simulate completion of one currently eligible task.
- **Recovery:** undo, review dependent resets, retry invalid/unavailable roadmap, or return to recommendation selection.
- **Progressive disclosure:** technical scoring details and all downstream semesters may be expandable; the next feasible actions remain prominent.

### Advisor chat

- **Primary information:** selected major/context, conversation status, response content, and limitations.
- **Primary action:** ask a focused question or Stop an active response.
- **Recovery:** retry an interrupted attempt as a new user-controlled request, edit the question, or return to roadmap.
- **Progressive disclosure:** model/protocol details and optional persistence settings are secondary.

## 7. User stories

### LN-W4-US-01: Enter a context-valid roadmap

**Description:** As a university student with a selected major, I want the roadmap screen to validate its context and source so that I do not mistake a generic demo plan for my personal plan.

**Acceptance Criteria:**

- [ ] A live roadmap requires a stable selected-major ID, validated missing skills, required current-semester context, and a successfully validated response.
- [ ] Missing context shows an empty/blocked state with a return action; it does not write a mock roadmap into the store.
- [ ] Live and demo plans show persistent, non-color-only provenance including curriculum source/version when available.
- [ ] A response-schema error does not overwrite the previous valid roadmap.
- [ ] No default GPA, major, source version, or synthetic course is inserted into a live request.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record direct navigation, loading, error, live, demo, 375px, and desktop evidence.

### LN-W4-US-02: Understand and enforce prerequisites

**Description:** As a university student, I want each roadmap action to explain and enforce its prerequisites so that I can explore a feasible sequence.

**Acceptance Criteria:**

- [ ] Each roadmap task has a stable ID, type, source reference, prerequisite ID list, and verified-versus-simulated completion state.
- [ ] A task with unmet prerequisites is disabled and names the unmet task(s) in text.
- [ ] Completing the final prerequisite makes the dependent task available without reloading.
- [ ] Unchecking a prerequisite removes every now-invalid dependent simulated completion in one consistent update and announces the reset list.
- [ ] Unknown prerequisite IDs, duplicate IDs, or cycles produce a roadmap data error and disable simulation.
- [ ] Semester order alone is never interpreted as a prerequisite graph.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record keyboard, screen-reader, cycle/error, unlock, and cascade-reset evidence.

### LN-W4-US-03: Explore a reversible planning simulation

**Description:** As a university student, I want checklist changes to update a clearly labeled planning simulation and reverse exactly so that I can compare possible learning choices without changing my verified baseline.

**Acceptance Criteria:**

- [ ] Baseline match score, radar values, profile evidence, and verified completions remain immutable.
- [ ] Simulated readiness is recomputed from the immutable baseline and a unique valid completion set, never from the previously rounded display value.
- [ ] Repeating the same set operation is idempotent; unknown task IDs are rejected.
- [ ] Check then uncheck returns all simulated values exactly to their baseline, including after a displayed cap.
- [ ] A valid baseline of 0 remains 0 before contributions and is not replaced by a truthy fallback.
- [ ] The UI labels the value as a simulation/planning indicator and explains that it is not employment probability.
- [ ] The weight and optional radar-delta policies remain `HUMAN DECISION REQUIRED` until approved and versioned.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record baseline 0, duplicate set, cap/reversal, unknown ID, reduced-motion, and 375px evidence.

### LN-W4-US-04: Move from roadmap to a scoped advisor conversation

**Description:** As a university student reviewing a roadmap, I want the advisor to receive a minimal snapshot of the selected plan so that the explanation addresses the decision I am making.

**Acceptance Criteria:**

- [ ] The transition states the selected major and the limited context that will be sent.
- [ ] Each request uses an immutable snapshot containing only approved major, missing-skill, curriculum-version, and relevant roadmap identifiers.
- [ ] No PDF bytes, full name, student ID, complete store serialization, or unrelated conversation is sent.
- [ ] Changing major or roadmap while streaming stops/invalidates the old request; late tokens cannot enter the new conversation.
- [ ] Missing roadmap context leaves chat usable for general questions only if that mode is explicitly approved; otherwise it shows a return action.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record context disclosure, major switch, stale-token rejection, and narrow-screen evidence.

### LN-W4-US-05: Read and control a robust SSE response

**Description:** As a university student, I want to see an advisor response arrive progressively and stop it when needed so that I retain control without receiving duplicated or corrupted text.

**Acceptance Criteria:**

- [ ] Chat uses the approved `/api/v1/chat/stream` request schema with a stable conversation and attempt/message identity.
- [ ] States are explicit: idle, connecting, streaming, complete, stopped, interrupted, rate-limited, protocol error, and service error.
- [ ] UTF-8 decoding and SSE parsing handle LF/CRLF/CR, multibyte splits, multiple events per chunk, multi-line data, comments, and a final `done` event.
- [ ] Stop cancels fetch/reader/timers, keeps partial text labeled `stopped`, and prevents late completion callbacks.
- [ ] EOF before an approved `done` event is `interrupted`, not complete.
- [ ] Without an approved idempotent resume contract, the client performs zero automatic POST replays; retry is explicit and creates a new attempt.
- [ ] A real error never becomes an unlabeled simulated assistant success.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record Stop, retry, 429, malformed event, EOF-before-done, and reduced-motion evidence.

### LN-W4-US-06: Revisit advice without unsafe persistence or rendering

**Description:** As a university student, I want safe formatting and an optional local history choice so that I can revisit advice without silently retaining sensitive context.

**Acceptance Criteria:**

- [ ] Default history is in memory and is not restored after reload.
- [ ] Any local persistence is explicit opt-in and remains `HUMAN DECISION REQUIRED` until retention/consent policy is approved.
- [ ] Persisted content, if approved, excludes profile, PDF, survey answers, raw API context, and secrets; storage failure returns to usable memory-only state.
- [ ] Markdown rendering disables raw HTML/script execution and unsafe URL schemes.
- [ ] Course references become authoritative UI elements only when validated against the active curriculum version; unknown IDs display as unverified text.
- [ ] Clear-history semantics are specified before implementation; this PRD does not authorize cloud deletion or synchronization.
- [ ] Input length and context bounds are validated with an actionable message rather than silent truncation.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record opt-in/out, malformed storage, safe Markdown, focus, and 375px evidence.

## 8. Functional requirements

- **ADV-UI-FR-01:** The result-to-roadmap transition must validate stable selected-major and request context without inserting synthetic defaults.
- **ADV-UI-FR-02:** The roadmap route must render empty, loading, success, invalid-data, service-error, retry, and explicit-demo states.
- **ADV-UI-FR-03:** Every result-bearing state must expose `LIVE`, `DEMO`, `DERIVED`, or `AI-GENERATED` provenance and available source/version.
- **ADV-UI-FR-04:** The client must validate stable roadmap/task IDs and an explicit prerequisite graph before enabling simulation.
- **ADV-UI-FR-05:** The client must model verified completion separately from simulated completion.
- **ADV-UI-FR-06:** Simulation must recompute from immutable baseline data and an approved versioned policy.
- **ADV-UI-FR-07:** Removing a prerequisite must atomically remove invalid simulated descendants and report the change.
- **ADV-UI-FR-08:** The client must not modify the original match score or baseline radar through checklist interaction.
- **ADV-UI-FR-09:** The roadmap-to-chat handoff must create an immutable, minimal, major-scoped context snapshot.
- **ADV-UI-FR-10:** Chat must implement a validated SSE event parser rather than append raw network chunks.
- **ADV-UI-FR-11:** Chat must offer Stop and explicit retry with request/attempt isolation and no unsafe automatic POST replay.
- **ADV-UI-FR-12:** Real chat/roadmap errors must remain errors and must never silently become synthetic success.
- **ADV-UI-FR-13:** Roadmap and chat controls/status must meet the accessibility and responsive requirements below.
- **ADV-UI-FR-14:** Task 2 design must represent every approved state and must not add a feature without a story and acceptance criteria.

## 9. UI state matrix

| Feature | Default/empty | Loading | Success | Error/retry | Disabled/stopped | Provenance |
|---|---|---|---|---|---|---|
| Roadmap handoff | No selected context | Generating | Validated roadmap | Contract/network/429 with retry | Generate disabled with reason | USER EVIDENCE + LIVE/DEMO |
| Roadmap tree | Missing context guidance | Skeleton preserving page structure | Tasks grouped with dependencies | Invalid DAG/source unavailable | Blocked tasks name prerequisites | LIVE/DEMO/AI-GENERATED |
| Simulation | Immutable baseline, no simulated tasks | Local computation should not need network loading | Reversible derived state | Invalid ID/policy/data error | Ineligible task disabled | DERIVED SIMULATION |
| Chat | Context summary and composer | Connecting then streaming | Complete after valid done | Rate limit/protocol/interrupted/service retry | Stop available while active | LIVE AI / DEMO / UNKNOWN blocked |
| History | In-memory default | Hydration only after approved opt-in | Validated same-context messages | Storage error → memory-only | Persistence unavailable explained | LOCAL USER DATA |

## 10. Business rules and approval status

| Rule | Repository source | Status | Required evidence/test |
|---|---|---|---|
| Readiness is 0–100 and not employment probability | PRD/feature specification | PROPOSED — HUMAN DECISION REQUIRED | Approved term, formula/version, user-comprehension test |
| Each eligible task has non-negative readiness weight | Feature specification | PROPOSED — HUMAN DECISION REQUIRED | Domain-owner approval and boundary tests |
| Uniform fallback weights when backend omits weights | Feature specification | PROPOSED — HUMAN DECISION REQUIRED | Approval whether fallback may appear outside demo |
| Checklist uses unique stable task IDs | Advisor stories/spec | REQUIRED for correctness | Duplicate/unknown/idempotency tests |
| Prerequisite graph must be acyclic and complete | PRD/advisor stories/spec | REQUIRED; source authority UNKNOWN | DAG validation and curriculum version |
| Uncheck cascades through invalid descendants | Advisor stories/spec | PROPOSED — HUMAN DECISION REQUIRED for UX policy | Atomic reset and announcement tests |
| No automatic POST replay without idempotency/resume | Feature specification/API gap | REQUIRED for safety | Disconnect/retry tests |
| Chat connect/idle timeout 15 seconds | Feature specification | PROPOSED — HUMAN DECISION REQUIRED | Approved service SLO and timer tests |
| Optional history TTL/limits | Existing advisor story/spec | PROPOSED — HUMAN DECISION REQUIRED | Consent/retention approval and storage tests |

Current equal-count readiness logic, `|| 60`, `+0.3` every radar axis, and `+0.6` match score are **IMPLEMENTATION-DEFINED BUSINESS RULES**. They are not accepted product policy.

## 11. Data and AI integrity requirements

- **REAL:** validated selected-major/profile inputs and live backend responses.
- **MOCK/DEMO:** deterministic synthetic fixtures selected explicitly by the user; labels persist through roadmap and chat.
- **DERIVED:** simulated readiness and any approved projected radar; formula/policy version and baseline must be available.
- **AI-GENERATED:** roadmap rationale and advisor text produced by the configured model/RAG path; never treated as curriculum truth without structured validation.
- **UNKNOWN:** curriculum/benchmark authority or model/source version absent from the response; UI must say unavailable rather than fabricate it.

Structured curriculum facts, prerequisite IDs, course IDs, and verified completion must come from approved data, not free-form model output. Assistant content must not silently alter roadmap state. The browser must treat user/document text as data, not a system instruction.

## 12. Accessibility and responsive requirements

- Use semantic checkbox/button/form controls for roadmap tasks, Stop, retry, suggested prompts, and send.
- Each roadmap task exposes name, type, checked state, availability, prerequisite description, and provenance to assistive technology.
- Blocked state must not rely on opacity or color alone; focus remains visible and does not land on inoperable decorative elements.
- Chat input has a programmatic label, send button has an accessible name, and status changes use controlled live regions.
- Do not announce every token. Announce connecting, streaming start, stopped, interrupted, error, and completion at useful boundaries.
- When cascade reset occurs, announce a concise summary and provide visible details.
- Respect reduced motion for progress, spinners, pulsing status, transitions, and streaming caret.
- At 375px, preserve task order, readable prerequisite explanations, a reachable sticky/non-obscuring composer, and no horizontal page scrolling.
- At tablet/desktop, progressive disclosure may use additional columns but must not hide source/status or the next feasible action.
- Validate WCAG 2.1 AA contrast in all states and record actual design/browser measurements.

## 13. Error and recovery behavior

| Condition | Required behavior |
|---|---|
| Direct `/roadmap` without context | Empty/blocked state and return action; no automatic fixture write |
| Roadmap API 400/422 | Preserve valid inputs; show actionable request error; no mock |
| Roadmap API 429 | Show valid retry timing; prevent early replay |
| Timeout/network/5xx | End loading, preserve prior valid snapshot, offer retry and separately labeled demo |
| Roadmap schema/DAG invalid | Do not enable simulation or overwrite prior valid plan |
| Unknown/duplicate task ID | Reject update; retain prior state; explain data error |
| Uncheck prerequisite | Recompute atomically; disclose dependent resets |
| Chat malformed SSE | Keep partial content, label protocol error, offer explicit retry |
| Chat EOF before done/idle | Label interrupted, retain partial content, no automatic POST replay |
| User Stop/major switch/unmount | Abort reader/fetch/timers; reject late updates |
| Storage malformed/expired/unavailable | Discard invalid persisted data and continue memory-only |
| Refresh/back | Current store is memory-only; approved persistence boundary is HUMAN DECISION REQUIRED |

## 14. Design considerations for Week 4 Task 2

- Design the next feasible action and prerequisite explanation before decorative semester timelines.
- Separate baseline from simulation visually and textually; do not make a progress bar imply verified employability.
- Use one primary roadmap action at a time. “Ask advisor” is secondary until a plan/context exists.
- Keep technical labels such as SSE, Web 2.0, Qwen, GPU, and ChromaDB out of primary hierarchy unless needed for source disclosure or recovery.
- Reduce nested glass cards, gradients, badges, and always-on metrics when they do not answer a student question.
- Include annotated frames for every state in Section 9 at 375px and desktop widths.
- Map every frame and interaction to story/acceptance-criteria IDs.
- Do not depict prerequisite unlocking, persistence, export, source versions, or reconnection as implemented without evidence.

## 15. Technical considerations

- The current client uses Next.js 14, strict TypeScript, Zustand 4, and Tailwind; no new framework is justified by this PRD.
- Use atomic Zustand selectors for independent subscribers; current whole-store subscriptions are an observed rerender risk, not proof of performance failure.
- Network DTOs must be validated and mapped into view models before store writes. Current types are not aligned with the backend despite their header claim.
- Simulation logic should be pure and independently testable; the PRD does not approve a specific state library abstraction.
- SSE parsing must retain TextDecoder streaming state and event framing across arbitrary chunks. Parser behavior must be tested independently from React.
- Stop/retry requires AbortController, reader cancellation, request identity, and timer cleanup; exact implementation remains an engineering decision.
- Safe Markdown/history capabilities require dependencies and policies not present in `package.json`; design must mark them future/proposed until approved.
- No secret, PDF content, full profile, or complete store snapshot may appear in chat requests, URLs, client logs, or persisted history.

## 16. Critical acceptance scenarios

### ADV-UI-AC-01 — No synthetic direct-route success

```gherkin
GIVEN no validated roadmap or explicit demo selection exists
WHEN the student opens /roadmap directly
THEN the route shows a context-required state
AND no mock roadmap is written to the store
```

### ADV-UI-AC-02 — Invalid DAG blocks simulation

```gherkin
GIVEN a roadmap contains a cycle or an unknown prerequisite ID
WHEN the client validates the roadmap
THEN a roadmap data error is shown
AND completion controls remain disabled
AND a previous valid roadmap is not overwritten
```

### ADV-UI-AC-03 — Cascade and exact reversal

```gherkin
GIVEN B depends on A and C depends on B
AND A, B, and C are simulated complete
WHEN A is unchecked
THEN B and C are removed in the same update
AND the reset items are announced
AND simulated values equal a fresh calculation from the remaining valid set
```

### ADV-UI-AC-04 — Baseline immutability

```gherkin
GIVEN baseline readiness is 0 and a valid task contribution is 20
WHEN the task is set complete twice and then set incomplete
THEN simulated readiness is first 20 and finally 0
AND baseline radar and match score never change
```

### ADV-UI-AC-05 — Fragmented Vietnamese SSE

```gherkin
GIVEN valid SSE events are split across line delimiters and inside a UTF-8 Vietnamese character
WHEN the stream parser receives the chunks
THEN each validated token is appended exactly once
AND the message contains no replacement character or SSE field prefix
AND completion occurs only after the valid done event
```

### ADV-UI-AC-06 — Stop and stale response isolation

```gherkin
GIVEN a response for major A is streaming
WHEN the student activates Stop or switches to major B
THEN the request and reader for A are cancelled
AND partial text for A remains labeled stopped
AND late tokens for A cannot update the conversation for B
```

### ADV-UI-AC-07 — Real failure remains an error

```gherkin
GIVEN live chat returns HTTP 429 or loses the stream before done
WHEN the response is handled
THEN the attempt is rate-limited or interrupted
AND no synthetic assistant message is presented as live success
AND retry remains a user-controlled action
```

### ADV-UI-AC-08 — Accessible mobile decision path

```gherkin
GIVEN a 375px viewport, keyboard-only input, and reduced motion
WHEN the student reviews prerequisites, simulates an eligible task, opens chat, and stops a response
THEN every action is reachable in decision order with visible focus
AND source and system states are announced without announcing every token
AND no control or prerequisite explanation is hidden by horizontal overflow
```

## 17. Traceability matrix

| Objective | Epic | Story | Acceptance criteria | Implementation target | Proposed test | Status |
|---|---|---|---|---|---|---|
| Honest roadmap entry | Action planning/trust | LN-W4-US-01 | AC-01 | Result/roadmap routes, API adapter, store | Integration + E2E | CONTRADICTORY / UNTESTED |
| Feasible sequence | Action planning | LN-W4-US-02 | AC-02/03 | Roadmap schema/validator/tree/tasks | Unit + component | MISSING IMPLEMENTATION |
| Reversible simulation | Action planning | LN-W4-US-03 | AC-03/04 | Pure simulation policy + Zustand selectors | Unit + component/perf | CONTRADICTORY / UNTESTED |
| Scoped context | Guided explanation/trust | LN-W4-US-04 | AC-06 | Roadmap-chat handoff/request DTO | Integration | PARTIAL / UNTESTED |
| Controlled stream | Guided explanation | LN-W4-US-05 | AC-05/06/07 | SSE parser/service/chat state | Unit + component + integration | CONTRADICTORY / UNTESTED |
| Safe revisit | Guided explanation/privacy | LN-W4-US-06 | AC-08 plus storage/Markdown cases | Chat render/persistence policy | Unit + component | MISSING IMPLEMENTATION |
| Accessible narrow flow | Cross-cutting trust | All | AC-08 | Roadmap/chat components/styles | Browser/E2E/a11y | PARTIAL / UNTESTED |

## 18. Success metrics

### Week 4 PRD/design readiness gates

- Every in-scope objective maps to a story, critical acceptance scenario, implementation target, and proposed executable test.
- The design represents the complete state matrix at 375px and desktop widths.
- No approved frame presents demo, derived, or AI-generated content as verified live fact.
- Browser evidence later demonstrates keyboard review/simulation and Stop/retry without horizontal overflow.
- Unit tests later cover DAG validation, exact simulation reversal, SSE chunk boundaries, Stop, and stale response rejection.
- Typecheck, lint, configured tests, and production build must pass before implementation acceptance.

### Product outcome metrics

Comprehension of prerequisites/provenance, ability to identify a feasible next action, task completion, time-to-answer, and trust calibration baselines/targets are **UNKNOWN — HUMAN DECISION REQUIRED**. The repository contains a proposed pilot but no completed validation result.

## 19. Open questions and human decisions

1. Should the UI retain the term “Job Readiness,” replace it with a planning-progress term, or remove the numeric indicator?
2. Which authority approves the readiness formula, task weights, cap, and any radar deltas?
3. Are project and certificate actions eligible for simulation, and how do they differ from courses?
4. Which curriculum source/version provides stable task and prerequisite IDs?
5. Should unchecking a prerequisite automatically reset all dependents or request confirmation first?
6. Is a general chat mode allowed without a selected validated roadmap?
7. What idempotency/resume capability, if any, will the backend guarantee for chat?
8. Are the proposed 15-second connection/idle timers approved service policies?
9. Is local chat persistence part of the Week 4 design, and what consent/TTL/storage limits are approved?
10. What product outcome metric and threshold determine Advisor/Core UI success?

## 20. Design handoff checklist

- [ ] Long Nhật and the required product/domain owner approve this PRD.
- [ ] Blocking questions 1–10 have named owners and recorded decisions.
- [ ] Canonical roadmap and chat contracts are approved.
- [ ] Readiness terminology/policy and prerequisite source are approved.
- [ ] All provenance, empty, loading, invalid, error, retry, stopped, interrupted, and success states are included.
- [ ] 375px, desktop, keyboard, screen-reader, contrast, focus, and reduced-motion behavior are annotated.
- [ ] Each frame maps to a story and acceptance-criteria ID.
- [ ] Export and three-PRD review remain outside this branch.
- [ ] Task 2 uses a separate `feat/longnhat-w4-advisor-ui-design` branch and separate commits.
