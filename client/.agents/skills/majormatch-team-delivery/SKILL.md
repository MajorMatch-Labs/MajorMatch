---
name: majormatch-team-delivery
description: Execute MajorMatch client coursework for chapters 7, 8 or 9 across ingestion, analytics and advisor, with verifiable review, tests, evidence and matching subtree delivery.
---

# MajorMatch team delivery

Locate the MajorMatch checkout from the current workspace. The client root is `client/` in the monorepo, or the repository root in `majormatch-client`. Read applicable `AGENTS.md`, `tasks/TEAM_DELIVERY_PLAN.md` and `docs/WEEKLY_SYLLABUS_ROADMAP.md`. For frontend changes read the shared design guidance and the affected module PRD. Preserve ownership: ingestion = Văn Hoàng, analytics = Ánh Vy, advisor/core = Long Nhật.

Use the chapter and module scope supplied by the user. Refresh remote refs, inspect local changes, and establish a non-destructive base before starting. Choose work from actual code/evidence gaps rather than treating historic checkboxes as completion.

- Chapter 7: review the affected implementation, identify a reproducible defect or concrete code smell, make focused refactors and regression tests, and document the actual review/fix chain.
- Chapter 8: implement missing tests and suitable CI; distinguish isolated mocks from live system verification. Read the backend evidence guide before claiming database persistence.
- Chapter 9: synthesize actual code, PRs and test results into technical handover and presentation evidence; keep unresolved decisions and unverified claims explicit.

Write additive evidence under `docs/ai-evidence/<module>/` and link the chapter summary. Record who requested/implemented/reviewed separately; never infer human approval or bot review. Tests and screenshots require actual execution. Use synthetic learner data.

Make meaningful Conventional Commits in English. Determine the authenticated contributor and use matching Author/Committer; module ownership does not authorize impersonating its owner. No empty commits, backdating or invented contributions. Keep individual branches single-author. Coordinate shared changes without rewriting others' work.

If publishing is requested, follow the two-repository procedure in the delivery plan: client subtree first, same branch to monorepo second, verify tree equality and open cross-linked PRs into main. Stop on a divergent remote and resolve safely; do not force push or auto-merge. If a repo is missing from Codex, follow the GitHub review guide and report the actual access state. A local review is not a completed GitHub bot review.

Do not treat this skill as authorization to deploy, message people, or merge. Finish by reporting changes, executed checks, links and remaining work. If the chapter is unspecified, inspect progress and ask only if the next scope cannot be determined.
