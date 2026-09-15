# Design QA: Analytics selected direction

Source visual truth: `references/selected-option-1.png`, first displayed option selected by the user.
Implementation: `screenshots/success-1487.png`; primary source commit `4c9d963`.
State: AI & Data Science selected, complete synthetic evidence, dark mode, collapsed details.
Viewport: 1487×1058 CSS px, device scale factor 1. Source pixels: 1487×1058. Render: 1487×1369 full-page pixels. No rescaling in the stored comparison; extra page height is preserved and not disguised as density mismatch.

## Comparison evidence

- Full view: `screenshots/comparison.png`, source left and implementation right in one input.
- Focused text/chart/skills: `screenshots/comparison-detail.png`, 1040×720 source region beside 826×720 implementation region. Crops retain native pixels; widths intentionally differ due to the 1120px repo content-width cap.
- Additional rendered mobile/table/error evidence: `screenshots/success-375.png`, `table-1280.png`, and scenario captures.

## Findings and iteration history

1. Initial internal render: P2 skill-heading default margins stretched the groups; radar text was small and axis buttons increased default density. Fixed heading margins, tightened group spacing, increased canvas text from 16 to 21 source px, disclosed axis controls under a named summary. Re-rendered and reran keyboard/dialog tests at `4c9d963`; compared the two stored combined inputs above.
2. Post-fix: no remaining actionable P0/P1/P2 issues within the constrained repo design interpretation. This is not pixel-clone approval: source invented tabs/icons/files are intentionally absent; 1120px content cap, title position, additional provenance and reviewer inspector yield a taller scrollable page. Controls remain reachable; no page-wide horizontal overflow in tested sizes.

## Required fidelity surfaces

- Typography: Segoe UI/system fallback matches the shared product. 32px H1, 28px selected heading, 16px body, smaller secondary labels. Vietnamese labels wrap; native DOM alternatives carry the full six-axis names. No imported marketing typeface.
- Layout rhythm: rail plus chart/skill detail matches the selected structural direction. Shared spacing and 8/12px control/grouping radii; no nested inner cards. Additional page height and reduced rail height are documented constraints, not hidden capture differences.
- Colors/tokens: dark neutral background, indigo brand, restrained selected surface. Semantic group colors accompanied by text. Token ratios in `verification/contrast.json`; no gradient/glow imitation.
- Assets: existing product wordmark treatment preserved. No hero images/avatars are required. Decorative skill imagery and invented filenames omitted under PRD/guardrails. Radar is a genuine fixture-driven chart with dashed/solid series, not an illustrative substitute.
- Copy: functional Vietnamese, persistent demo label, source uncertainty, evidence limitations, explicit selected-major handoff boundary. No career-success/confidence promises or automatic mock success.

## Interactions and limitations

Verified: radio arrows and focus preservation, disclosure, axis dialog/Escape/return focus, table, cancel/late response rejection, stale blocking, selected-major handoff; browser page errors = 0. User-authorized Edge headless plus in-app preview inspection. Exact browser result metadata in `verification/results.json`.

Not verified: screen-reader user study, production integration, performance SLA, actual browser 200% zoom setting. The responsive equivalent at 640px and reduced-motion/forced-colors captures do not replace those checks. P3: a future approved shared layout may use a wider desktop content cap and slightly larger radar; do not change shared foundation on this module branch.

final result: passed
