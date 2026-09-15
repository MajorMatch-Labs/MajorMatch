# MajorMatch Client — Week 4 UI PRD Workspace

This directory is the shared Week 4 workspace for the three MajorMatch Client owners. Week 4 has two sequential tasks:

1. Produce an evidence-based UI PRD.
2. Produce a UI design from the approved PRD.

The second task must not begin until the module owner and Tech Lead approve the PRD and resolve every blocking human decision.

## Directory ownership

| Owner | Module | PRD directory | Week 4 branch prefix |
|---|---|---|---|
| Văn Hoàng | Ingestion | `tasks/van-hoang/` | `feat/vanhoang-w4-...` |
| Ánh Vy | Analytics | `tasks/anh-vy/` | `feat/anhvy-w4-...` |
| Long Nhật | Advisor and client core | `tasks/long-nhat/` | `feat/longnhat-w4-...` |

## Required sources

Every module PRD must inspect and cite, at minimum:

- `docs/01-overview/PRODUCT_DISCOVERY.md`
- `docs/01-overview/PRD.md`
- `docs/01-overview/REQUIREMENTS_ANALYSIS.md`
- `docs/03-specifications/FEATURE_SPECIFICATION.md`
- The module's existing user-story file under `docs/03-specifications/`
- The implemented routes, components, store, types, services, mock data, tests, and agent rules relevant to the module

Use [PRD_UI_BASE.md](PRD_UI_BASE.md) as the required structure. The project-local PRD skill is at `.agents/skills/prd/SKILL.md`.

## Evidence labels

Use these labels consistently:

- **VERIFIED:** Directly supported by a repository artifact.
- **INFERRED:** Strongly suggested but not explicitly approved.
- **ASSUMPTION:** Plausible but unsupported; do not convert it into a requirement.
- **MISSING:** Expected evidence or behavior was not found.
- **CONTRADICTION:** Two sources disagree.
- **HUMAN DECISION REQUIRED:** Product policy, scoring, success, target-user, or scope decision that an agent must not make.

## Definition of ready for design

Cross-module quality review: [ui-prd-review.md](ui-prd-review.md). Use its XUI-AC-01–06 integration scenarios, provenance vocabulary and XD decision register alongside each owner's PRD. These scenarios are planned, not executed tests. A merge is not design approval; record the approving owner/Tech Lead, date, decision evidence and affected requirement IDs before changing status to `Approved for design`.

A PRD is ready to drive UI design only when:

- The problem, user decision, primary action, and non-goals are explicit.
- Every important numeric claim has a source or is labeled unknown.
- Live, mock, static, derived, and AI-generated data are distinguishable.
- Default, loading, success, empty, error, disabled, retry, and narrow-screen states are specified where applicable.
- Keyboard, focus, semantic HTML, screen-reader announcements, contrast, and reduced-motion expectations are testable.
- The traceability matrix connects objective → story → acceptance criteria → implementation target → test.
- Blocking contradictions and human decisions are resolved or explicitly prevent design approval.

## Git and evidence workflow

1. Create a module-owner branch using the exact Week 4 naming convention.
2. Commit the PRD separately from the later design deliverable.
3. Update `docs/ai-evidence/<owner>/w4-prompt-log.md` with real prompts, critique, human decisions, and verification evidence.
4. Push the client subtree branch first, then the same branch to the MajorMatch monorepo.
5. Open Pull Requests; do not push a feature branch directly to `main`.

Do not claim a browser check, design review, usability test, or automated test occurred unless evidence is recorded.
