# PRD: MajorMatch Ingestion UI

## Document control

| Field | Value |
|---|---|
| Owner | Văn Hoàng (`ingestion`) |
| Week / task | Week 4 / Task 1 — UI PRD |
| Status | Draft — ready for human review, not approved for design |
| Implementation baseline | Monorepo commit `03957c0` |
| Design task | Week 4 / Task 2 — blocked until the PRD and listed human decisions are approved |

## 1. Repository understanding

### Product, user problem, and outcome

**VERIFIED:** MajorMatch is intended to help university and high-school learners connect academic evidence and interests to computing-major recommendations and a learning roadmap. The primary documented persona is a university student choosing a specialization; a high-school learner without a university transcript is secondary. Evidence: `docs/01-overview/PRD.md: vision, personas, journey`.

**System output:** a parsed profile and validated interest payload passed to later recommendation stages.

**Intended user outcome:** the learner can provide only the evidence they actually have, understand what was accepted, and proceed without hidden fabricated data. The desired outcome is supported by the journey and Chapter 3 specifications, but a validated product-success threshold is **UNKNOWN — HUMAN DECISION REQUIRED**.

### Ingestion journey and boundary

The Week 4 ingestion UI owns:

1. Selecting a path that reflects available evidence.
2. Selecting or dropping one PDF and validating it before upload.
3. Showing parse progress, recoverable errors, and a reviewable result summary.
4. Capturing ten independent RIASEC answers.
5. Capturing one to five career-interest tags.
6. Enabling analysis only when the selected path is valid.
7. Offering a separately labeled demo flow after a live failure.

It does not own ranking, radar rendering, roadmap generation, chat, PDF extraction accuracy, or final scoring policy.

### Current implementation

| Area | Evidence | Status |
|---|---|---|
| Route | `src/app/upload/page.tsx: UploadPage` | Implemented prototype |
| PDF UI | `src/components/upload/FileDropzone.tsx: FileDropzone` | Partial |
| Survey/tags | `src/components/upload/RiasecSurvey.tsx: RiasecSurvey` | Contradictory state model |
| State | `src/stores/useProfileStore.ts: ProfileState` | Prototype with defaults |
| Static catalog | `src/types/survey.ts` | Six computing career tags and ten questions |
| API | `src/services/api.ts: ApiService` | Legacy paths and silent mock fallback |
| Canonical backend | `../backend-hpc/main.py`; `docs/03-specifications/API_SPEC.md` | Paths/shapes contradict client |
| Tests | `package.json`; repository test-file search | NOT FOUND |

The prerequisite audit is [project-audit-pre-ui-prd.md](../project-audit-pre-ui-prd.md). Existing detailed behavioral sources are `docs/03-specifications/user-stories-ingestion.md`, `docs/03-specifications/FEATURE_SPECIFICATION.md`, and `docs/01-overview/REQUIREMENTS_ANALYSIS.md`.

## 2. Introduction / overview

The ingestion UI must let a learner submit a supported PDF when available, or complete a survey-only path when no university transcript exists. It must make required information, validation, processing state, data source, and recovery explicit. The UI must not convert a failed live request into a personal-looking synthetic result.

The main decision on this screen is: **“Which real evidence can I provide, and is it complete enough to request analysis?”** Technical architecture is secondary and should not compete with this decision.

## 3. Goals

- Provide a single understandable ingestion journey for the two documented learner situations without inventing missing GPA, courses, skills, or career intent.
- Make the exact PDF boundary, validation result, upload state, and replacement behavior visible and testable.
- Preserve ten independent question answers and derive six RIASEC group means only after validation.
- Require one to five unique career tags and make selection count/state perceivable without color alone.
- Distinguish `LIVE`, `DEMO`, and `ERROR` across the transition to analysis.
- Support keyboard and screen-reader operation and a usable 375px layout.
- Produce an approved state-complete brief for Week 4 Task 2 design without implementing the UI in this task.

## 4. Non-goals

- No implementation or component refactor in this PRD task.
- No visual mockup, Figma file, generated design, or design approval in Task 1.
- No new recommendation, ranking, radar, roadmap, or chat feature.
- No psychological diagnosis or claim that the ten-question survey is equivalent to a validated full Holland instrument.
- No guarantee of PII removal, extraction accuracy, major suitability, admission, graduation, or employment.
- No automatic fallback from a failed real request to mock success.
- No multiple-file upload, image/OCR upload, cloud history, SIS/LMS integration, or user account flow unless separately approved.

## 5. Target users and needs

### University student choosing a computing specialization

Has a university transcript or CV and needs to confirm that the correct record was accepted before using derived recommendations. Privacy and correction/retry behavior matter.

### High-school learner exploring computing directions

May not have a university transcript or technical skills. Needs a survey-only path that sends empty academic evidence rather than a fabricated profile.

### Advisor

An advisor is a documented persona but is not the primary operator of this Week 4 ingestion screen. Advisor-specific record management is out of scope.

## 6. User journey and information hierarchy

### Step 1 — Choose evidence path

- **Primary information:** Upload a transcript/CV if available; otherwise continue with interests only.
- **Primary action:** Choose `Có bảng điểm/CV` or `Chưa có bảng điểm đại học`.
- **Secondary information:** Supported PDF constraints and privacy-boundary explanation.
- **Recovery:** The learner can change path; changing path must not silently submit stale data.

### Step 2 — Provide and verify evidence

- **Primary information:** File name, validation/processing state, and parsed summary labeled by source.
- **Primary action:** Select file, retry, replace, or remove.
- **Secondary information:** GPA/credit/course/skill summary after parse; detail disclosure is allowed, but decorative metrics are not required.
- **Recovery:** Correct the file selection, retry a recoverable request, or switch to survey-only where applicable.

### Step 3 — Answer interests

- **Primary information:** Current question, answer value/meaning, completion count, and remaining questions.
- **Primary action:** Answer each question and select career tags.
- **Secondary information:** Provisional six-group summary, clearly described as a project-built exploration aid.
- **Recovery:** Change any answer/tag before submission without losing unrelated answers.

### Step 4 — Review and continue

- **Primary information:** Evidence source, completion summary, unresolved validation, and what will be sent.
- **Primary action:** `Phân tích lựa chọn của tôi`.
- **Recovery:** Return to the incomplete section, retry live processing, or explicitly choose a synthetic demo.

Only one primary CTA should compete for attention at each step. Architecture terms such as Web 2.0, Cosine Matrix, Scikit-learn, Private Node, and model names should appear only when they help trust or recovery.

## 7. User stories

### VH-W4-US-01: Choose an evidence path

**Description:** As a learner exploring a computing direction, I want to state whether I have a transcript or CV so that the system does not invent academic evidence I do not have.

**Acceptance Criteria:**

- [ ] The screen presents a record-backed path and a survey-only path in plain Vietnamese.
- [ ] The selected path is exposed programmatically and not indicated by color alone.
- [ ] Survey-only submission contains no invented GPA, course, or technical skill.
- [ ] Switching path invalidates data that must not carry forward and explains what changed.
- [ ] The layout and path controls remain usable at 375px and 1920px.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record viewport and evidence.

### VH-W4-US-02: Select and validate one PDF

**Description:** As a learner with an academic record, I want to select or drop a supported PDF and receive precise validation so that I can correct the file before sensitive data is uploaded.

**Acceptance Criteria:**

- [ ] A semantic file input and an operable select-file button support keyboard, pointer, and drag/drop input.
- [ ] Exactly one `.pdf` file is accepted case-insensitively when size is 1–10,485,760 bytes inclusive, MIME is `application/pdf`, and the first five bytes are `%PDF-`.
- [ ] Zero-byte, 10,485,761-byte, wrong-extension, wrong-MIME, empty-MIME, bad-header, and multiple-file attempts produce distinct actionable errors and no request.
- [ ] Error text is associated with the input and announced without stealing focus unexpectedly.
- [ ] Drag-over state does not use motion or color as its only cue.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record keyboard and 375px evidence.

### VH-W4-US-03: Understand parsing and review the result

**Description:** As a learner uploading a record, I want visible processing and a reviewable parse summary so that I know whether the correct evidence will inform analysis.

**Acceptance Criteria:**

- [ ] States are explicit: validating, uploading, processing, success, partial/unavailable, error, retrying, replacing, and cancelled/stale.
- [ ] Duplicate submission is disabled while one request is active.
- [ ] Replacing/removing a file cancels or invalidates the earlier request; a late response cannot overwrite the current selection.
- [ ] The success state shows file name and parsed summary with `LIVE` provenance, without claiming 100% PII removal.
- [ ] A malformed, password-protected, scanned-with-insufficient-data, or timed-out PDF produces specific recovery guidance where the backend supplies that distinction.
- [ ] Whether users may edit parsed fields before analysis is marked HUMAN DECISION REQUIRED and is not silently designed.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record loading, error, retry, and replacement evidence.

### VH-W4-US-04: Answer ten independent RIASEC questions

**Description:** As a learner, I want each interest answer to remain independent so that the six derived group scores reflect my ten actual responses.

**Acceptance Criteria:**

- [ ] Answer state is keyed by question ID, not by RIASEC group.
- [ ] Questions 1 and 2 can hold different values simultaneously.
- [ ] Each control has a visible prompt, programmatic label, 1–5 range, step 1, current value, and endpoint meanings.
- [ ] A displayed neutral value of 3 counts as answered only after explicit interaction or confirmation.
- [ ] Progress is `answered question count / 10`; incomplete answers prevent final analysis and identify the missing question(s).
- [ ] Final scores are group means using `R={1,2}`, `I={3,4,9}`, `A={5}`, `S={6}`, `E={7,10}`, `C={8}`; precision is preserved until display.
- [ ] The UI calls the tool an exploration survey and does not present psychometric validity as verified.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record keyboard, screen-reader label, and 375px evidence.

### VH-W4-US-05: Select career interests

**Description:** As a learner, I want to select the directions I want to explore so that later analysis reflects my declared interests rather than a hidden default.

**Acceptance Criteria:**

- [ ] The six current catalog items come from `AVAILABLE_CAREER_TAGS`; unknown IDs are rejected.
- [ ] One to five unique tags are required before analysis.
- [ ] At five tags, attempting a sixth keeps the existing selection and explains the limit.
- [ ] Selected state and count are announced and do not rely on color/check icon alone.
- [ ] Removing a tag makes another tag selectable immediately.
- [ ] All validated selected IDs are included in the request adapter; the UI must not silently use only the first or default to `ai_engineer`.
- [ ] The backend meaning of multiple tags is HUMAN DECISION REQUIRED before live integration is approved.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record 0-, 1-, 5-, and 6-tag attempts.

### VH-W4-US-06: Continue with honest source and recovery state

**Description:** As a learner requesting analysis, I want to know whether the result will be live or synthetic and recover from a failure so that I do not mistake a demonstration for personal advice.

**Acceptance Criteria:**

- [ ] The primary analysis CTA is enabled only when the selected path, ten answers, and one-to-five tags are valid and no request is active.
- [ ] The review area identifies the minimum payload that will be sent and its source.
- [ ] HTTP 400/413/415/422/429, timeout, network, 5xx, and response-schema errors end loading and preserve valid local input.
- [ ] A real failure never stores a mock profile or routes to an unlabeled mock result.
- [ ] Recoverable errors show retry; 429 respects an available retry delay.
- [ ] Demo is a separate explicit action, loads deterministic synthetic data, and causes a persistent `DEMO — synthetic data` label in downstream screens.
- [ ] Recovered connectivity does not silently relabel existing demo results as live.
- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record live failure, retry, demo opt-in, and source-label evidence.

## 8. Functional requirements

- **ING-UI-FR-01:** The UI must let the learner explicitly select record-backed or survey-only ingestion.
- **ING-UI-FR-02:** The UI must validate one PDF against the approved extension, byte, MIME, and signature rules before upload.
- **ING-UI-FR-03:** The UI must model file validation and asynchronous processing as explicit, mutually understandable states.
- **ING-UI-FR-04:** The UI must prevent duplicate requests and reject stale responses after replacement, removal, navigation, or unmount.
- **ING-UI-FR-05:** The UI must retain ten answers by question ID and derive the RIASEC vector from approved group means.
- **ING-UI-FR-06:** The UI must require one to five unique catalog career tags and submit every selected ID.
- **ING-UI-FR-07:** The analysis CTA must expose why it is disabled and focus/scroll to the first unresolved section when requested.
- **ING-UI-FR-08:** The UI must preserve valid input on recoverable API failure and show a meaningful retry.
- **ING-UI-FR-09:** Live, demo, and error states must never share an indistinguishable success presentation.
- **ING-UI-FR-10:** The route must not insert default career intent, GPA, courses, or skills into a real request.
- **ING-UI-FR-11:** All critical controls and status changes must satisfy the accessibility and responsive requirements below.
- **ING-UI-FR-12:** The Week 4 design must include every approved state in this PRD and must not add a new feature without a traceable story.

## 9. UI state matrix

| Feature | Default / empty | Loading | Success | Error / retry | Disabled | Provenance |
|---|---|---|---|---|---|---|
| Evidence path | No silent choice | N/A | Selected path stated | Invalidated path explains reset | Continue unavailable | USER-PROVIDED |
| PDF | No file; constraints visible | Validating/uploading/processing | File and parse summary | Specific error, retry/replace/remove | Duplicate action blocked | LIVE |
| Survey | 0/10 explicitly confirmed | Local calculation has no network loading | 10/10 and six derived means | Invalid/stale value rejected | Analysis gated until complete | USER-PROVIDED + DERIVED |
| Career tags | 0/5 | N/A | 1–5 selected | Unknown/sixth tag explained | Analysis gated at 0 | STATIC CATALOG + USER-PROVIDED |
| Analysis transition | Review payload/source | One active request | Route only after valid response | Preserve input; retry or explicit demo | Reasons visible | LIVE or DEMO, never UNKNOWN |

## 10. Business, validation, and data rules

| Rule | Source | Implementation target | Edge cases/test | Confidence |
|---|---|---|---|---|
| One PDF, 1–10,485,760 bytes inclusive | Existing PRD/spec/stories | Ingestion validator | 0, max, max+1, multiple | High |
| `.pdf`, MIME, `%PDF-` all required | Existing PRD/spec/stories | Async preflight + server validation | uppercase extension, empty/spoofed MIME/header | High |
| Ten answer values are integers 1–5 | PRD/types/spec | Per-question survey state | neutral confirmation, invalid programmatic value | High |
| Six scores are group means | Feature specification | Pure scoring function | `[1,5,2,4,5,1,3,4,3,5] → [3,3,5,1,4,4]` | High as documented; instrument validity UNKNOWN |
| One to five unique catalog tags | Stories/store | Selector + request adapter | 0, 5, 6, unknown, duplicate | High |
| Multiple-tag analysis meaning | NOT FOUND in canonical backend contract | Do not invent | One ranking request vs separate comparisons | HUMAN DECISION REQUIRED |
| Explicit demo only | Chapter 3 stories/spec | Request state and provenance | 4xx, timeout, recovered network | High |
| Parsed-field correction policy | NOT FOUND | Design blocked for this detail | partial/incorrect extraction | HUMAN DECISION REQUIRED |

Any rule inferred only from current fallback/default code is not approved product policy.

## 11. Accessibility and responsive requirements

- Use semantic `button`, `input type="file"`, `fieldset`, `legend`, `label`, and status/error regions; a clickable `div` is not an equivalent control.
- Support Tab/Shift+Tab, Enter/Space activation, arrow-key slider changes, and visible focus that is not removed by `focus:outline-none` without replacement.
- Associate every validation message with its control. Use controlled `role="alert"` for actionable errors and `aria-live="polite"` for progress/success; do not announce every drag event.
- Expose selected path/tag state using native state or `aria-pressed`/equivalent, plus text and count.
- Provide value text for 1–5 survey semantics and keep target sizes usable on touch.
- Respect reduced motion for spinner/pulse/scale transitions and do not use animation as status proof.
- At 375px: no horizontal scrolling; content order follows the task; controls and errors do not truncate; the primary CTA remains reachable; navigation has an approved mobile alternative.
- At tablet/desktop: whitespace may increase, but the content order and single-primary-action hierarchy must remain stable.
- Contrast must meet WCAG 2.1 AA for text and controls in all states; actual measurements must be recorded during design/browser verification.

## 12. Error and recovery behavior

| Failure | Required behavior |
|---|---|
| Invalid local file | Do not request; focus/associate a specific correction message. |
| Parser rejects/cannot read | Preserve path/survey/tags; allow replace or retry as appropriate. |
| Timeout/network/5xx | End loading, preserve input, offer explicit retry and separately labeled demo. |
| 400/413/415/422 | Preserve server problem type/message where safe; no auto retry or mock. |
| 429 | Show retry timing when valid; do not resend before the deadline. |
| Response schema invalid | Do not partially write store; show data-contract error and retry path. |
| User selects twice | Only the current request may commit state. |
| User replaces/removes/navigates | Abort or invalidate current request and ignore late response. |
| Refresh/back | Current persistence behavior is memory-only; desired retention is HUMAN DECISION REQUIRED. Do not imply recovery exists. |
| Demo selected | Load a fresh versioned fixture, label downstream state, and never mix it with the selected PDF. |

## 13. Design considerations for Week 4 Task 2

The design deliverable must be based on the approved PRD and include mobile and desktop frames for all critical states. It must prioritize the task over architecture promotion.

- Prefer a progressive four-step flow or an equivalently clear hierarchy; the exact layout is a design decision, not approved by this PRD.
- Reuse existing dark tokens where contrast passes, but do not wrap every group in another glass card.
- Remove decorative metrics and badges unless they answer a user question.
- Use one primary CTA; secondary actions are retry, replace/remove, back, and explicit demo where applicable.
- Replace claims such as “100% PII,” “optimal,” or guaranteed processing with accurate scope and limitations.
- Do not show a health “Ready” indicator based on synthetic health as evidence that a personal request is safe or available.
- Include annotations mapping each frame/state to story and acceptance-criteria IDs.

## 14. Technical considerations

- Next.js 14 App Router, strict TypeScript, Tailwind, and Zustand are current constraints: `package.json`, `tsconfig.json`, and agent rules.
- Current module folders are scaffolds; component movement is not part of this PRD and requires a separate architecture decision.
- The client currently calls legacy upload/analysis paths and shapes. Live UI acceptance is blocked until an approved adapter matches `backend-hpc/main.py` and `docs/03-specifications/API_SPEC.md`.
- PDF structural preview requires a parser/worker not present in `package.json`; do not depict it as implemented.
- A pure survey scoring function and an explicit request state machine are testability needs derived from observed defects; no framework change is required.
- Client logging must not include file contents, parsed PII, or secrets. Sensitive data must not appear in URL/query parameters.
- The absolute claim that the client type file matches the API “100%” is contradicted by code and must not be reused in design copy.

## 15. Critical acceptance scenarios

### ING-UI-AC-01 — Accepted byte boundary

```gherkin
GIVEN a file has a case-insensitive .pdf extension, application/pdf MIME, a %PDF- header, and 10485760 bytes
WHEN validation completes
THEN the file is accepted for one upload request
```

### ING-UI-AC-02 — Rejected byte boundary

```gherkin
GIVEN a PDF contains 10485761 bytes
WHEN validation completes
THEN FILE_TOO_LARGE is announced
AND no upload request is sent
```

### ING-UI-AC-03 — Independent answers

```gherkin
GIVEN questions 1 and 2 are unanswered
WHEN the learner sets question 1 to 1 and question 2 to 5
THEN question 1 remains 1
AND question 2 remains 5
AND the provisional Realistic mean is 3
```

### ING-UI-AC-04 — Survey-only evidence honesty

```gherkin
GIVEN the learner selected the survey-only path, completed ten answers, and selected one valid tag
WHEN analysis is requested
THEN no fabricated GPA, course, or technical skill is included
AND the evidence source is recorded as survey-only
```

### ING-UI-AC-05 — Multi-tag integrity

```gherkin
GIVEN two valid tags are selected
WHEN the request adapter prepares the payload
THEN both IDs are present exactly once
AND no hidden default tag is added
```

### ING-UI-AC-06 — Live failure is not demo success

```gherkin
GIVEN a live upload receives HTTP 415
WHEN the response is handled
THEN the validation error and recovery action are displayed
AND no mock profile is stored
AND navigation to a personal result does not occur
```

### ING-UI-AC-07 — Stale request protection

```gherkin
GIVEN file A is uploading
WHEN the learner replaces it with valid file B
AND the response for file A arrives after file B
THEN only file B may update the current ingestion state
```

### ING-UI-AC-08 — Accessible narrow-screen journey

```gherkin
GIVEN a 375px viewport and keyboard-only input
WHEN the learner completes the survey-only path
THEN every control is reachable in task order with visible focus
AND errors and progress are announced
AND the primary action is reachable without horizontal scrolling
```

## 16. Traceability matrix

| Objective | Epic | Story | Acceptance criteria | Implementation target | Test | Status |
|---|---|---|---|---|---|---|
| Honest input path | Evidence intake | VH-W4-US-01 | AC-04 | Upload route/store/request adapter | Component + integration | MISSING IMPLEMENTATION |
| Safe PDF selection | Evidence intake | VH-W4-US-02 | AC-01/02 | File validator/dropzone | Unit + component | PARTIAL, UNTESTED |
| Review/recovery | Evidence intake | VH-W4-US-03 | AC-06/07 | Request state/dropzone/API adapter | Component + integration | PARTIAL, UNTESTED |
| Correct interest vector | Evidence intake | VH-W4-US-04 | AC-03/08 | Survey state/scoring/UI | Unit + component | CONTRADICTORY, UNTESTED |
| Preserve career intent | Evidence intake | VH-W4-US-05 | AC-05 | Tag selector/request adapter | Unit + integration | PARTIAL, UNTESTED |
| Trustworthy transition | Trust/resilience | VH-W4-US-06 | AC-04/06/08 | Upload route/API/store/provenance | Integration + E2E | CONTRADICTORY, UNTESTED |

## 17. Success metrics

### Week 4 PRD/design readiness gates

- Every story maps to at least one critical acceptance scenario, implementation target, and proposed executable test.
- The approved design represents the full state matrix at 375px and desktop widths.
- Browser verification records keyboard completion of the survey-only path and PDF validation boundaries.
- Live errors cannot be mistaken for demo success in any approved frame.
- Typecheck, lint, and later configured tests pass before implementation acceptance.

### Product outcome metrics

- Task completion, comprehension of provenance, correction rate, confidence change, and time-to-complete baselines/targets are **UNKNOWN — HUMAN DECISION REQUIRED**.
- The proposed discovery pilot in `docs/01-overview/PRODUCT_DISCOVERY.md` may collect these measures; no completed result was found.

## 18. Open questions and human decisions

1. Must the learner choose a path explicitly, or may the PDF section simply remain optional?
2. Is `transcript` versus `cv` a required user choice for the backend `document_type` field?
3. Can users inspect and correct parsed course/GPA fields before analysis? If so, how is correction provenance recorded?
4. What approved product copy describes the privacy boundary without guaranteeing perfect PII removal?
5. What is the approved meaning of multiple selected career tags: one combined ranking or separate comparisons?
6. Is explicit confirmation required for a neutral slider value of 3, or will an alternative control avoid the ambiguity?
7. Which RIASEC disclaimer and scoring version are approved by the domain owner?
8. What state, if any, survives refresh/back, and for how long?
9. Which product-outcome metric determines whether this UI is successful?

## 19. Design handoff checklist

- [ ] Module owner and Tech Lead approve this PRD.
- [ ] Questions 1–9 above have owners; blocking answers are recorded.
- [ ] The canonical API and multiple-tag semantics are approved.
- [ ] All live/demo/error provenance states are included.
- [ ] Both record-backed and survey-only journeys are included.
- [ ] Mobile, desktop, keyboard, focus, announcement, contrast, and reduced-motion behavior are annotated.
- [ ] Each design frame maps to story/AC IDs.
- [ ] No unrequested feature, fake metric, unsupported guarantee, or decorative status is introduced.
- [ ] Task 2 design files and verification evidence will use a separate commit from this PRD.
