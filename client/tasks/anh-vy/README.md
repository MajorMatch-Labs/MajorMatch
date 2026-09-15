# Ánh Vy — Analytics UI PRD Direction

## Copy-paste prompt for the PRD agent

```text
Act as the Product Engineer and UI requirements owner for MajorMatch Client's analytics module. This is Week 4 Task 1: create the UI PRD only; do not implement or design screens yet.

First read .agents/skills/prd/SKILL.md, tasks/README.md, and tasks/PRD_UI_BASE.md completely. Inspect the repository before writing. Use docs/01-overview/PRODUCT_DISCOVERY.md, PRD.md, REQUIREMENTS_ANALYSIS.md, docs/03-specifications/FEATURE_SPECIFICATION.md, user-stories-analytics.md, the current result route, MajorCard, RadarComparison, SkillBreakdown, Zustand store, API types/services, mock data, tests, and relevant agent rules.

Ask 3-5 essential lettered clarification questions. Then create tasks/anh-vy/prd-analytics-ui.md from the base. Focus on the specific student decision supported by the top-major comparison, six-axis radar, and skill breakdown. Specify hierarchy, selection behavior, per-major data consistency, loading/empty/error/retry states, 375px mobile behavior, keyboard and screen-reader access, an accessible data-table alternative to the chart, and explicit REAL/MOCK/DERIVED/AI-GENERATED labels.

Do not invent ranking policy, benchmark sources, confidence, salary, precision, market evidence, or completed tests. Report implementation contradictions separately, including any result page that auto-loads mock data, shared radar data, clickable non-semantic cards, inline styles, or undocumented scores. Use VERIFIED / INFERRED / ASSUMPTION / MISSING / CONTRADICTION / HUMAN DECISION REQUIRED. Finish with a traceability matrix and a design-handoff checklist. Record actual prompt evolution and verification in docs/ai-evidence/anh-vy/w4-prompt-log.md.
```

## Expected deliverables

- `tasks/anh-vy/prd-analytics-ui.md`
- `docs/ai-evidence/anh-vy/w4-prompt-log.md`
- A later, separate design commit after PRD approval
