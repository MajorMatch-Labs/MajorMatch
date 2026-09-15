# MajorMatch design foundation
Version: w4-1. Owner: Ingestion (Văn Hoàng); reviewers: Analytics (Ánh Vy), Advisor/Core (Long Nhật).
This is the shared design source for Codex and Antigravity. Read [guardrails](DESIGN-GUARDRAILS.md), the module PRD and [review decisions](tasks/ui-prd-review.md) before authoring.

## Product direction
Help a learner provide actual evidence, compare computing directions and understand the next learning action. Design for a Vietnamese university learner; interest-only learners have explicit partial-data states. One primary action per stage. Source, validation and recovery take priority over decoration.

## Visual foundation
Preserve the MajorMatch wordmark, indigo brand family and dark neutral surfaces from `tailwind.config.ts`. Use solid surfaces for legibility, subtle borders and restrained emphasis. No mandatory glass effects, gradients or new font/library installation.
Typography: system Segoe UI/sans-serif with Vietnamese support; body 16px/1.6, labels 14px, main heading 32–40px with 1.2 line-height. System type is a deliberate readable prototype choice, not a Microsoft Fluent implementation.
Semantic values live in [shared tokens](design/shared/tokens.css). Reuse them; new module-only colors require a documented reason. Brand accent is indigo; green/amber/red carry success/warning/error meaning plus text, never decoration alone.
Spacing: 4/8/12/16/24/32/48px. Controls: minimum 44px height. Radius: controls 8px, grouping surfaces 12px; no arbitrary mix of pills and nested cards.
Content width: 1120px. Desktop: task area plus optional context rail; mobile: one column, input and recovery before secondary detail. Check 375/768/1280px and 200% zoom. State and content determine grouping, not a fixed three-card marketing template.
Keep motion to direct feedback; no autoplay, parallax or animated fake processing percentage. Respect reduced motion. Dark is the current product baseline; light-mode expansion is not required for this design task. Forced-colors and keyboard focus must remain usable.

## Shared patterns
- Shell: brand, journey labels and current stage; unavailable downstream destinations explain why, never fake links.
- Field: visible label, hint, native control, associated error.
- Buttons: primary advance/submit, secondary back/retry, destructive remove with explicit consequence.
- Feedback: polite progress/status, alert for actionable failure, no surprise focus stealing.
- Provenance: session origin LIVE/DEMO independently from USER-PROVIDED/DERIVED/AI-GENERATED/UNKNOWN. The prototype always identifies itself as a simulation.
- Empty/partial: show what is missing and the available next action; never substitute sample GPA/skills into a live session.
- Review controls belong in a separate, collapsible prototype inspector and never masquerade as learner functionality.

## Sources and ownership
PRDs: [Ingestion](tasks/ingestion/prd-ingestion-ui.md), [Analytics](tasks/analytics/prd-analytics-ui.md), [Advisor](tasks/advisor/prd-advisor-ui.md).
Shared files are changed on a coordinated foundation branch; module branches consume the same foundation. Component/style variations stay in the owning module unless approved for shared use. See [design workflow](design/README.md).

## Deliverables
A repo-native HTML/CSS/JS prototype is an editable design source and can be reviewed without a Figma account. Each module supplies spec, state matrix, screenshots and evidence. If Figma is used, record actual file/node links and preserve token naming; do not claim an export or file exists without creating it. Keep existing Product Design and official Figma plugins; installing these two local skills does not install another plugin.
