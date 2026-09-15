# MajorMatch UI PRD Base

Copy this file into the owner's directory and rename it `prd-[module]-ui.md`.

## Document control

| Field | Value |
|---|---|
| Owner | `[name]` |
| Module | `[ingestion / analytics / advisor]` |
| Week / task | `Week 4 / Task 1 — UI PRD` |
| Status | `Draft / In review / Approved for design` |
| Evidence baseline | `[commit hash]` |
| Design task | `Week 4 / Task 2 — starts only after PRD approval` |

## 1. Repository understanding

- Product and intended user.
- User problem and desired outcome, separated from system output.
- Main journey and this module's boundary.
- Current capabilities and unfinished capabilities.
- Relevant routes, components, state, services, types, data sources, integrations, and tests.
- Evidence for every major statement using `path: symbol or section`.

## 2. Introduction / overview

State what user problem this UI solves and which user decision it supports. Mark unsupported claims as `UNKNOWN`.

## 3. Goals and non-goals

List measurable quality or outcome goals. Do not invent a baseline. Put excluded behavior under non-goals.

## 4. Target users and user needs

Use a specific user situation. Do not use only “user” or “student.” Identify differences between university students, high-school students, and advisors when relevant.

## 5. User journey and information hierarchy

For each screen state state:

- The decision the user is making.
- Primary information.
- Secondary or progressively disclosed information.
- Primary next action.
- Recovery action.

## 6. User stories

Use `As a [specific user], I want [capability], so that [outcome].` Keep each story implementable in one focused session.

Every UI story must include verifiable criteria for happy path, invalid input, loading, empty, error, retry, responsive behavior, accessibility, and data provenance where relevant. Include:

- [ ] Typecheck and lint pass.
- [ ] Verify in browser using dev-browser skill or the repository-approved browser automation equivalent; record viewport and evidence.

## 7. Functional requirements

Number requirements as `[MODULE]-UI-FR-01`. Requirements must be clear, feasible, testable, necessary, non-contradictory, and traceable.

## 8. UI state matrix

| Feature | Default / empty | Loading | Success | Error / retry | Disabled | Data provenance |
|---|---|---|---|---|---|---|
| `[feature]` | | | | | | `REAL / MOCK / STATIC / DERIVED / AI-GENERATED / UNKNOWN` |

## 9. Business, validation, and data rules

For each rule document its source, implementation target, edge cases, and test. Mark a code-only rule `IMPLEMENTATION-DEFINED BUSINESS RULE — HUMAN REVIEW REQUIRED`.

## 10. Accessibility and responsive requirements

Specify semantic elements, keyboard operation, visible focus, labels and descriptions, announcement behavior, contrast, reduced motion, and layouts for 375px mobile, tablet, and desktop.

## 11. Error and recovery behavior

Cover invalid input, missing data, timeout, network and API errors, duplicate submission, stale response, refresh/back navigation, empty result, and explicit retry. Never silently replace failed real analysis with mock success.

## 12. Design considerations

Define hierarchy and reusable patterns before visual effects. Every card, badge, metric, gradient, animation, and secondary CTA must have a user-purpose statement or be removed. The design deliverable must represent all states in Section 8.

## 13. Technical considerations

List only repository-supported constraints and integration points. Do not invent an API, database, scoring policy, or backend capability.

## 14. Acceptance criteria

Use critical `GIVEN / WHEN / THEN` scenarios and stable IDs. Avoid dozens of cosmetic tests.

## 15. Traceability matrix

| Objective | Epic | Story | Acceptance criteria | Feature / UI state | Implementation target | Test | Status |
|---|---|---|---|---|---|---|---|

Allowed statuses: `CONNECTED`, `PARTIAL`, `ORPHAN IMPLEMENTATION`, `MISSING IMPLEMENTATION`, `UNTESTED`, `CONTRADICTORY`.

## 16. Success metrics

Use approved metrics only. If the baseline or target is absent, write `UNKNOWN — HUMAN DECISION REQUIRED` and propose a validation method separately.

## 17. Open questions and human decisions

List unresolved target-user, scope, product-policy, scoring, privacy, ranking, and success decisions. An AI agent may present alternatives but must not silently choose one.

## 18. Design handoff checklist

- [ ] PRD approved by module owner and Tech Lead.
- [ ] Blocking contradictions resolved.
- [ ] Mobile and desktop information hierarchy approved.
- [ ] All UI states and recovery paths included in the design brief.
- [ ] Mock/real/AI labels included in the design.
- [ ] Design uses existing tokens where justified and introduces no unapproved product feature.
- [ ] Design output, source file, screenshots, and review evidence will be committed in a separate Week 4 commit.
