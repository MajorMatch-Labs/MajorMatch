# Long Nhật — Advisor and Core UI PRD Direction

## Copy-paste prompt for the PRD agent

```text
Act as the Product Engineer, client-core owner, and UI requirements owner for MajorMatch Client's advisor module. This is Week 4 Task 1: create the UI PRD only; do not implement or design screens yet.

First read .agents/skills/prd/SKILL.md, tasks/README.md, and tasks/PRD_UI_BASE.md completely. Inspect the repository before writing. Use docs/01-overview/PRODUCT_DISCOVERY.md, PRD.md, REQUIREMENTS_ANALYSIS.md, docs/03-specifications/FEATURE_SPECIFICATION.md, user-stories-advisor.md, the current roadmap/chat routes, MilestoneTree, InteractiveTask, StreamingChatBox, Zustand store, API types/services, mock data, tests, and relevant agent rules.

Ask 3-5 essential lettered clarification questions. Then create tasks/advisor/prd-advisor-ui.md from the base. Focus on the student's decisions about next learning actions and when to ask the advisor. Specify roadmap prerequisites, reversible checklist simulation, baseline versus simulated readiness, loading/empty/error/retry states, streaming state machine and Stop/retry behavior, refresh/back behavior, 375px mobile behavior, keyboard and screen-reader access, and explicit REAL/MOCK/DERIVED/AI-GENERATED labels.

Do not invent prerequisite graphs, task weights, scoring effects, curriculum versions, AI accuracy, employment outcomes, or completed tests. Report implementation contradictions separately, including mock roadmap auto-loading, mutation-based score changes, missing prerequisite IDs, unsupported certificate handling, SSE endpoint/schema mismatch, or synthetic health claims. Use VERIFIED / INFERRED / ASSUMPTION / MISSING / CONTRADICTION / HUMAN DECISION REQUIRED. Finish with a traceability matrix and a design-handoff checklist. Record actual prompt evolution and verification in docs/ai-evidence/advisor/w4-prompt-log.md.
```

## Expected deliverables

- `tasks/advisor/prd-advisor-ui.md`
- `docs/ai-evidence/advisor/w4-prompt-log.md`
- A later, separate design commit after PRD approval
