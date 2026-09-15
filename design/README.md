# Week 4 design workspace
Source of truth: [DESIGN.md](../DESIGN.md) and [guardrails](../DESIGN-GUARDRAILS.md).

| Module | Owner | Branch | PRD |
|---|---|---|---|
| ingestion | Văn Hoàng | feat/vanhoang-w4-ingestion-ui-design | [PRD](../tasks/ingestion/prd-ingestion-ui.md) |
| analytics | Ánh Vy | feat/anhvy-w4-analytics-ui-design | [PRD](../tasks/analytics/prd-analytics-ui.md) |
| advisor | Long Nhật | feat/longnhat-w4-advisor-ui-design | [PRD](../tasks/advisor/prd-advisor-ui.md) |

Folder names describe modules; branch owner naming retains the existing Git convention. Members start from main after the foundation pair merges. Work independently inside their module and module evidence log. Shared patterns and integration decisions require coordinated review.

Each module supplies README/source link, design-spec.md (story/AC/state/viewport mapping and conditional decisions), editable source under prototype/ or an actual Figma link, screenshots/, review.md and its Week 4 evidence update. Do not fabricate an empty screenshot or Figma export to satisfy a directory list.

Run repo-native prototypes with `node client/design/shared/serve.cjs` from the monorepo; standalone client uses `node design/shared/serve.cjs`. Open http://127.0.0.1:4173/design/<module>/prototype/. This read-only, local server supplies explicit JavaScript module MIME types (Windows Python can serve .mjs as text/plain); it is not an API backend.

## Delivery
Use separate commits for design source, specification and verification evidence when useful. Author is the member in .agents/rules/git-push-sync-rules.md. Review contributions add the affected member as Co-authored-by.
Push client subtree before monorepo, identical branch names; open and cross-link both PRs, list checks and unresolved decisions. Merge is not product approval. No concurrent module should overwrite shared tokens casually.
