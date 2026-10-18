# Week 42 roadmap UI review

Source: MajorMatch `origin/main` at `8e52a75`; implementation branch `feat/nhat-w42-ui-clarity`. Scope: handoff from analysis to roadmap.

The result page previously sent a hard-coded current semester of 4 to roadmap generation. It now asks the learner to select a semester and blocks creation without academic courses. The direct roadmap page no longer loads the shared fallback student ID for a guest, and creation links back to the result page for semester input. This supports XUI-AC-04 and the advisor prerequisite-context requirement without deciding an alternate survey-only roadmap policy.

Verification: `npm run build` passed; `npm test` passed (52 tests). Authenticated roadmap generation and persisted-history recovery were not exercised because no real student account or PDF was used in this review. The existing readiness computation is outside this change and still requires an approved policy.
