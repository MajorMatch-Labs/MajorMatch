# Design guardrails
Applies to Codex, Antigravity and all modules. Current user directions govern scope; the PRD governs product behavior; DESIGN.md governs shared visual decisions. Vendored skill aesthetics are optional guidance and never authorize new business rules or override accessibility.

## Quality gates
1. Read the module PRD, DESIGN.md and tasks/ui-prd-review.md. Every screen and important state maps to a story/AC ID.
2. Readiness, ranking, prerequisite authority, multi-tag semantics and privacy claims are not invented by a designer. Record unresolved choices in the module decision table.
3. The user's foundation/design request authorizes review prototypes now. It does not approve unknown policy. Label conditional variants and avoid connecting them to live endpoints; final implementation approval remains separate.
4. Include default, loading, success, partial/empty, invalid, error, retry, disabled and cancelled/stale where relevant. Use synthetic fixtures with a persistent demo label. No real PDF leaves a review prototype.
5. Keyboard operation, programmatic labels, focus visibility, status announcements, 375px reflow, zoom and reduced motion are acceptance requirements. Measure contrast; do not declare WCAG compliance from a build or automated scan alone.
6. Preserve ten separate survey answers and all selected tags. Missing evidence is not zero. Changing inputs invalidates derived state. Unapproved scoring cannot become a polished numeric badge.
7. No decorative metrics, fake trust logos, fake user counts, unsupported guarantees, or automatic fail-to-mock success.
8. Screenshots come from the rendered artifact. Evidence must name viewport, scenario, source commit, method and actual result. Tests not run are NOT VERIFIED.
9. Prototype HTML/CSS/JS under design/ is intentionally isolated from production src/. Native CSS using shared variables is allowed here; production keeps its current Next/Tailwind conventions.
10. No third-party Product Design/Figma skill installation. Taste is limited to applicable visual advice: its own scope excludes multi-step forms. Microsoft review's generic three-interaction target must not remove required survey questions, and its visual flourishes must not override this task's restrained UI.
11. Folder names are module names: ingestion, analytics, advisor. Owner identities remain in documents/commit authors, not directory names.
12. Read the module README for branch/author. Push child client first, then monorepo using exactly the same branch name. Do not push feature work directly to main. Foundation auto-merge is explicitly authorized for this task; module design PRs are opened for review, not automatically merged.
