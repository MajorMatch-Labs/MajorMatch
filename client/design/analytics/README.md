# analytics UI design
Owner: Ánh Vy. PRD: [prd-analytics-ui.md](../../tasks/analytics/prd-analytics-ui.md).
Branch: `feat/anhvy-w4-analytics-ui-design`. Git Author: `Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`.

## Start
After the foundation is merged in both repos, fetch origin/main and create the branch above from it. In a standalone client checkout, use its own origin/main and coordinate the matching monorepo branch. Read ../../DESIGN.md and ../../DESIGN-GUARDRAILS.md relative to this document.

## Copy-paste agent prompt
```text
Work as the analytics design owner for MajorMatch Week 4. This is design Task 2, not a production API implementation.
Read AGENTS.md, DESIGN.md, DESIGN-GUARDRAILS.md, tasks/analytics/prd-analytics-ui.md, tasks/ui-prd-review.md and design/shared/tokens.css from client root.
Use .agents/skills/frontend-design-review/SKILL.md for quality review. Taste is installed but does not govern multi-step product forms. Keep the existing Product Design/Figma plugins; do not install extra design skills or change frameworks.
Create an editable, responsive review prototype and design specification for: result/major selection, six-axis radar with a numeric table alternative, skill breakdown, stale/partial data and selected-major roadmap handoff.
Work only in design/analytics/ and docs/ai-evidence/analytics/ unless a shared change is explicitly coordinated. Reuse the shared tokens/shell conventions. Do not overwrite another module or introduce new shared policy.
Cover Analytics AC01–08; XUI-AC-01–06. Record every designed state and its PRD ID; include error, empty, loading, retry, missing evidence, keyboard focus and mobile reflow. Use synthetic fixtures with persistent DEMO labeling. No real personal data, backend POSTs or invented performance/research results.
Unresolved product choices must appear as conditional design variants/annotations linked to the existing question IDs. Do not mark the PRD Approved for design on another person's behalf. The current request allows a review prototype, not approval of scoring/privacy policies.
Deliver design/analytics/design-spec.md, editable prototype/ source or actual Figma file/node links, screenshots from the rendered source, review.md and a truthful module evidence log. No empty placeholders passed off as finished output.
Verify 375/768/1280px, keyboard, reduced motion and contrast. Record what was not tested. Separate source/spec/evidence commits as appropriate.
Use branch feat/anhvy-w4-analytics-ui-design in both repositories. Commit as Nguyen Thi Anh Vy <anhvydn2005@gmail.com>. When reviewing another owner's work add their Co-authored-by trailer without rewriting previous commits.
Push client first with git subtree push --prefix=client client-remote <branch> from the monorepo, then git push -u origin <branch>. Open and cross-link one PR in each repo. Verify their client file diffs match. Do not merge these design PRs automatically.
```

## Checklist
- [ ] Spec maps screen/state → PRD story/AC → fixture → screenshot/check.
- [ ] Explicit conditional decision variants and live-integration exclusions.
- [ ] Source runs using design/README.md instructions.
- [ ] Actual screenshots and review, with no fabricated pass claims.
- [ ] Correct author/coauthors; matching client/monorepo branches and paired PRs.

## Current review prototype

User selected visual option 1 on 2026-09-15. [Open source](prototype/index.html), [specification](design-spec.md), [review evidence](review.md), [visual QA](design-qa.md).
Run `node client/design/shared/serve.cjs` from the monorepo, then open `http://127.0.0.1:4173/design/analytics/prototype/`.
The inspector exposes synthetic edge states. Nothing here connects to production APIs or approves pending PRD decisions. See the review report for completed checks versus integration gaps.
