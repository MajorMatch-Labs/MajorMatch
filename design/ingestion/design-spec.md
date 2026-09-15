# Ingestion — Week 4 UI design specification

Owner: Văn Hoàng (`Vcoch27`). Status: **conditional review prototype**, not an approved PRD or production implementation. Baseline: monorepo `24fe887` after foundation PRs client #10 / monorepo #6 were merged. Editable source: [prototype](prototype/index.html); visual evidence: [screenshots](screenshots/intake-1280.png).

## Scope and design direction

Translate [the Ingestion PRD](../../tasks/ingestion/prd-ingestion-ui.md) into an inspectable evidence → survey → interests → review journey. Follow [DESIGN.md](../../DESIGN.md), [guardrails](../../DESIGN-GUARDRAILS.md) and [shared tokens](../shared/tokens.css). Do not alter Analytics, Advisor, scoring policy or production routes.

Use the existing dark/indigo identity, solid surfaces, one primary action and a persistent workflow rail. System sans typography keeps Vietnamese readable without remote font requests. At widths below 700px, use a compact progress row and one column; retain the full task rather than hiding required inputs. Fieldsets and native radio/checkbox/file controls preserve keyboard semantics. Ten survey answers are split into two pages of five; nothing defaults to neutral. Optional technical detail is collapsed beneath the review summary.

The banner labels every screen as a design/demo. Journey labels for Analytics and Advisor are context, not functional navigation. No real Figma file was authored; editable HTML/CSS/ES modules are the design source, PNGs are review evidence, JSON is generated verification output.

## Screen, state and requirement mapping

Story identifiers below abbreviate `VH-W4-US-*`; acceptance identifiers abbreviate `ING-UI-AC-*`. These mappings describe prototype coverage, **not passing production acceptance tests**.

| Screen/state | Story / acceptance | Fixture or interaction | Evidence |
| --- | --- | --- | --- |
| Empty intake / explicit path | US-01, AC-04/08 | No selected path; Next disabled; choose record or survey-only | [Desktop](screenshots/intake-1280.png), [tablet](screenshots/intake-768.png), [mobile](screenshots/intake-375.png) |
| PDF preflight | US-02, AC-01/02 | Exactly 10,485,760 bytes accepted; max+1, zero, MIME, extension and header rejected | [Model tests](verification/model.test.mjs), [browser checks](verification/browser-check.cjs) |
| Processing / success illustration | US-03, AC-07 | Explicit synthetic-file action, cancellable generation; no real extraction | [Processing](screenshots/processing-1280.png), [success](screenshots/success-375.png) |
| Missing/partial academic evidence | US-01/03, AC-04 | No inferred GPA, courses or skills; choose another file or survey-only | [Partial](screenshots/partial-375.png) |
| File error, timeout, rate limit, schema mismatch | US-03/06, AC-06/07 | Inspector fixtures; retry is explicit; 429 waits 5 seconds, no autoretry | [415](screenshots/error-375.png), [timeout](screenshots/timeout-1280.png), [429](screenshots/rate-1280.png), [schema](screenshots/schema-1280.png) |
| Cancel / replace | US-03, AC-07 | Cancel then late sample completion; replace while processing | [Cancelled](screenshots/cancelled-1280.png), browser assertions |
| Ten independent answers | US-04, AC-03/08 | q1=1 and q2=5 retained independently; unanswered is not 3 | [Survey](screenshots/survey-375.png), model group-mean fixture |
| One to five unique interests | US-05, AC-05 | Reject sixth selection; removing one permits another | [Interests](screenshots/interests-375.png) |
| Review and error recovery | US-06, AC-04/06 | Preserve all selected tags; error stays error; explicit demo action | [Review](screenshots/review-1280.png), [error](screenshots/analysis-error-375.png) |
| Handoff boundary | US-06, XUI-AC-01/02/04 | Immutable local snapshot, DEMO origin, profile null, no automatic roadmap | [Handoff](screenshots/handoff-1280.png), model/browser assertions |
| Reflow / focus / preferences | AC-08, XUI-AC-06 | 375/768/1280, skip link, focus on stage heading, 200% CSS zoom, forced colors, reduced motion | [Zoom](screenshots/zoom-200.png), [forced colors](screenshots/forced-colors-375.png), [results](verification/results.json) |

400/413/422/5xx should reuse the actionable error layout with the actual server reason, preserved input and explicit retry; they are not separately rendered server-response fixtures here. Local oversize rejection is tested, but is not a live HTTP 413 test. Field errors use text as well as color; dynamic file errors are alerts and stage updates are status messages. Actual screen-reader speech and live error-focus behavior require integration review.

## Conditional decisions — PRD §18 remains authoritative

The numbers below reference the existing questions; no owner approval is implied.

| Question | Review variant illustrated | Decision still required |
| --- | --- | --- |
| Q1 evidence path | Explicit two-radio choice; no silent default | Owner/Tech Lead may instead approve optional PDF within one flow |
| Q2 document type | Combined transcript/CV entry | Confirm whether backend requires a separate `document_type` choice before implementing the adapter |
| Q3 parsed-field correction | Synthetic success/partial status, no editable course/GPA fields | Decide fields and correction provenance before designing an authoritative editor |
| Q4 privacy wording | Exact prototype fact: no upload; local metadata/header validation only | Approve production wording after verifying actual processing/retention boundaries; do not reuse the prototype promise for production |
| Q5 multiple tags | Preserve all selected IDs without calculating a ranking | Approve combined ranking versus separate comparisons; downstream owners must not collapse to the first tag |
| Q6 neutral answers | Five native radio values, initially unanswered | Approve this alternative to sliders; explicit selection of 3 is distinguishable from no answer |
| Q7 survey/version | Existing questions/group means, exploration disclaimer | Domain owner approves scoring version and disclaimer; this is not a validated psychological test |
| Q8 persistence | In-memory only; back within the prototype retains inputs; refresh clears them | Approve storage/expiry before production persistence; no localStorage added |
| Q9 outcome measure | No fabricated success rate or research result | Owner defines metric and evaluation plan |

## State and cross-module contract

- File generation increments on cancellation, replacement or path change; old asynchronous sample callbacks cannot commit. Analysis generation increments on edits/back/cancel. Only the current local snapshot may finish.
- Real file handling reads five header bytes plus metadata, not PDF contents for extraction. The browser validator is a UX preflight, not a security boundary; server validation remains required.
- Every payload is explicitly `prototype: true`, `origin: DEMO`. `profile` is null even on the record-backed review path because no real academic extraction takes place. Synthetic success is an illustration, not an extracted record.
- The handoff object is a review fixture, **not an approved API DTO**. It preserves answers, derived interest groups and all selected tag IDs. It must not be wired directly into the live store/API.
- Analytics owns partial evidence and ranking presentation; Advisor owns prerequisites, semester/course readiness and SSE behavior. Interest-only entry does not automatically satisfy Advisor context (XD-01). No readiness score, roadmap or chat is fabricated here.
- Live/prototype provenance, shared invalidation and downstream routing are specified boundaries only. This isolated design cannot verify Zustand, live API/SSE or cross-route cache behavior.

## Handoff and remaining gates

See [review](review.md) and [verification instructions](verification/README.md). Approve the conditional choices with module owners before production implementation; retain PRD status until that approval is recorded. Then map tokens/components to the actual app, implement the agreed DTO and run integration/accessibility tests. This branch is for paired design PR review, not automatic merge.
