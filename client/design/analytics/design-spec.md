# Analytics UI design

Owner/author: Nguyễn Thị Ánh Vy. Week 4, Task 2. Date: 2026-09-15.
Status: review prototype, not production implementation or policy approval.

## Source and scope

- [PRD](../../tasks/analytics/prd-analytics-ui.md), [cross-module review](../../tasks/ui-prd-review.md), [foundation](../../DESIGN.md), [guardrails](../../DESIGN-GUARDRAILS.md).
- User selected the first displayed Product Design image: [selected reference](references/selected-option-1.png).
- [Editable source](prototype/index.html). Start from monorepo root with `node client/design/shared/serve.cjs`; open `/design/analytics/prototype/` on port 4173.
- Plain HTML/CSS/ES modules follow the explicit repo prototype rule instead of bootstrapping another app/framework. Production `src/`, shared files, other modules, APIs and Figma remain untouched.

## Visual decisions

Context rail for three radio choices; selected-major detail with radar left and skill groups right. At 1100px the detail stacks; below 768px rail and content stack. No forced carousel. Shared 1120px content width, Segoe UI, dark neutral surfaces, indigo selection and primary CTA. Semantic green/amber/red carry group text rather than decoration. No new font or icon dependency.

The generated reference is conceptual, not a business specification. Remove its invented career tabs, decorative skill icons, nested panels and pretend evidence filenames. Preserve the existing MajorMatch wordmark treatment. Radar is data-driven canvas with an accessible HTML table and axis dialog, not a raster screenshot. Source labels remain visible. Noninteractive divider colors #273140/#334155 are module-only subdued separators; interactive controls use the shared border/focus tokens. Radar colors mirror shared brand/muted values. No animation or automatic progress percentages.

Differences from the image are intentional: shared content-width constraint; title above the whole comparison; content-height rail instead of an empty full-height panel; text disclosures in place of decorative icons; a separate reviewer inspector. This is not a pixel-identical clone. Typeface, selected-row treatment, region hierarchy and brand palette follow the chosen direction.

## Screen and state mapping

All scenarios are isolated synthetic fixtures. The inspector selects scenarios explicitly, and no network error silently turns into personal-looking results.

| Scenario / control | PRD coverage | Behavior / evidence |
|---|---|---|
| success, radio selection | ANA-US-01/04, AC01/04 | Stable IDs, maximum three fixture options, keyboard arrows update title/radar/skills together; `success-375/768/1280.png` |
| table, axis dialog | ANA-US-02, AC02/08 | Six rows, null displayed as missing, signed difference only when both operands exist, Escape and focus return; `table-1280.png` |
| skill sources, empty-skills | ANA-US-03, AC03 | Group counts and explicit fixture reasons; duplicate data rejected, empty groups not backfilled |
| no-session, empty | ANA-US-05, AC05 | Honest absence and ingestion link; demo requires explicit action in no-session variant |
| loading, error, timeout, rate, invalid | ANA-US-05, AC05 | Named status, explicit simulated completion/retry, no fake countdown, invalid polygon withheld |
| partial | ANA-US-02/03/06, AC02/06 | No learner polygon, no fabricated skills or GPA; benchmark explicitly synthetic; handoff blocked |
| unavailable | ANA-US-04, AC04; XUI-AC-03 | B remains selected, no A chart shown under B; handoff blocked in this scenario |
| missing-context | ANA-US-06, AC06; XUI-AC-04 | Missing semester/courses explained; no invented context collection workflow |
| stale / invalidate button | ANA-US-04/06, AC07; XUI-AC-01 | Version increments, pending request invalidated, old result visibly stale, handoff blocked |
| roadmap-error, pending, cancel, handoff | ANA-US-06, AC06 | One pending operation, lock selection, cancel rejects delayed completion, retry keeps selection, JSON preview contains selected major only |
| baseline switching | ANA-US-04, AC07; XUI-AC-05 | Baseline immutable A→B→A. No checklist-to-axis policy or readiness calculation implemented |
| all demo states | AC05; XUI-AC-02 | Persistent DEMO label; no live origin, uploads, external fetch, storage or backend requests |
| responsive / keyboard | AC08; XUI-AC-06 | Local Analytics coverage only; cross-module end-to-end journey remains NOT VERIFIED |

Screenshots live under [screenshots](screenshots/). Tests and real results: [verification](verification/results.json). Each screenshot basename identifies scenario and CSS viewport. Screenshots without a width suffix: forced-colors = 640×500 viewport; comparison combines source and 1487×1058-viewport render. Captures are full-page, so pixel height can exceed viewport height.

## Conditional policy and integration boundaries

| Decision | Prototype handling | Still pending |
|---|---|---|
| D01 | No automatic mock fallback | Production adapter change |
| D02 | Fixture order and 91.3/82.4/82.4 values are literal samples, not recalculated ranking | Ranking, tie/precision/model meaning |
| D03 | Six illustrative stable axis IDs and 0–10 domain; no implicit label translation | Actual taxonomy, benchmark authority and per-major API contract |
| D04 | Fixture categories supplied directly, no score threshold engine | Grade/project evidence policy |
| D05 | Immutable baseline; no preview increments | Approved per-major simulation and task-axis mapping |
| D06 / XD-01 | Missing context disables handoff; success only outputs synthetic JSON | DTO, semester/course collection and eligible-user scope |
| D07/08 | No KPI or performance claims. 1200ms is a visible local demo delay, not a timeout policy | Success measures, real timeout and latency targets |

The local handoff deliberately stops before Advisor; it does not navigate to an unrelated default roadmap or assert that a generated roadmap exists. Success uses a synthetic context-valid fixture flag, not real university records. No persistence: reload resets this isolated review prototype to the displayed demo fixture. The no-session variant models future live behavior; live refresh behavior is not implemented here.

## Verification limits

Five Node model tests and eleven browser-check groups executed. No browser page errors; requests remained local GETs. Responsive 375/768/1280 plus source-width 1487 tested. 640px test represents 200% reflow from 1280px, not an actual browser-zoom-setting test. Reduced motion/forced colors checked; screen reader with a human, real touch hardware, live API and complete Ingestion→Analytics→Advisor journey NOT VERIFIED. No WCAG certification or product approval claimed.
