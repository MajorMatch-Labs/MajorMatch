# Frontend Design Review: Ingestion review prototype

## Current revision: selected option 1

2026-09-15: user selected the first displayed Product Design concept and requested attention to typography/colors plus commits. Source `73ac0e7` supersedes the visual assessment below. [Chosen target](references/selected-option-1.png) and current [desktop](screenshots/intake-1280.png), [mobile](screenshots/intake-375.png) captures show the open layout, horizontal progress, icon-assisted choices and restrained shared indigo. The original review below records the first pass; its old screenshots are recoverable in Git, while linked PNGs now show the revised source.

Frontend Design Review was used for this implementation. Visual comparison covered intake, survey, review, mobile handoff and zoom. Font family remains the shared Vietnamese-capable sans; hierarchy is refined through size, regular/semibold weights and spacing, not decorative type. Low-contrast dividers separate content only; control borders remain distinct. No marketing imagery, account feature or new brand palette was introduced.

Verification rerun: **4 model tests and 11 browser groups PASS**, 25 actual screenshots. New keyboard-only 375px test traverses both survey pages, tags, review and handoff. The 200% CSS-zoom check initially failed: removing action overflow alone was insufficient; allowing header wrapping fixed the remaining overflow. Final generated results name the tested source. Local server was restarted after an initial connection-refused run. Neither failure is counted as a pass.

Verdict: ready for user visual review, not production sign-off. Screen-reader speech, live integrations, Figma fidelity and policy approval remain unverified. Existing Q1-Q9 remain open; visual selection is not business-policy approval.

## Context

Văn Hoàng · Week 4 Task 2 · source revision `62c38af`. Purpose: let learners provide evidence, independently answer interest questions and review their selected career directions. Direction: restrained MajorMatch dark/indigo workflow, strong task hierarchy and explicit provenance. Reviewed using the client-local Microsoft Frontend Design Review skill. Taste is installed but explicitly does not govern multi-step product forms.

## Summary

**Pass for human design review; production approval remains pending.** The isolated prototype demonstrates the intended journey and recovery states. It does not resolve the nine product decisions or implement the live application.

## Design system compliance and aesthetic quality

- Shared semantic color/control tokens are reused; spacing and responsive composition are local to this isolated prototype.
- System sans typography supports Vietnamese without new network assets. Solid surfaces, a workflow rail and restrained indigo actions follow the existing identity; no decorative statistics or marketing cards.
- Native controls are an intentional prototype exception to production React component reuse. No framework migration or production component change was made.
- Figma component mapping, Dev Mode measurements and light-theme parity are not assessed: no Figma source was created and this artifact follows the current dark baseline.
- Reduced-motion CSS removes animation/transition; feedback does not require decorative motion. The required ten-question task is not shortened to satisfy a generic interaction-count heuristic.

## Pillar assessment

| Pillar | Status | Evidence / boundary |
| --- | --- | --- |
| Frictionless | Pass for prototype | Clear next action, separate evidence paths, editable back flow, independent radios; [mobile survey](screenshots/survey-375.png) |
| Quality craft | Pass with follow-up | Reviewed desktop intake/review and mobile intake/survey/error; responsive captures and token contrast checks. Assistive-technology testing remains open |
| Trustworthy | Pass for prototype | Persistent demo banner, no backend POST, explicit retry/demo, no invented academic data; [error](screenshots/error-375.png), [handoff](screenshots/handoff-1280.png) |

## Design critique and issues

Verdict: suitable to discuss and review in a design PR. No known blocker to publishing this scoped prototype. **Do not treat this as production sign-off.**

Resolved during review:

1. Windows Python static hosting served `.mjs` as `text/plain`, preventing startup. Added a loopback-only Node preview server with explicit module MIME types; rerun succeeded.
2. Mobile upload title/helper text ran together. Made both block elements and regenerated captures.
3. Survey completion count was repeated beside the status announcement. Replaced the action hint with a back/edit reminder.

Before production: obtain Q1–Q9 decisions, validate live DTO/provenance and stale-response integration, test real keyboard-only completion and screen-reader output across all error states. No claim is made that the whole UI meets WCAG from token ratios alone. Parsed-field inspection/correction depends on Q3 and is not falsely marked complete.

## Verification

[Generated results](verification/results.json): four Node model tests passed separately; ten browser check groups passed; 24 rendered screenshots captured at the documented states. Shared token ratios: main text 16.96:1, muted text 9.96:1, primary-button text 7.90:1, error text 10.13:1, control border 3.73:1 and focus token 12.84:1 against tested backgrounds.

Checked browser behavior includes independent answers, file boundaries, five-tag limit, cancelled/replaced callback protection, error versus explicit demo, 429 delay, skip-link access, stage focus, reflow and no backend/external requests. Source and commands: [verification README](verification/README.md).

Not verified: live PDF extraction, production build, API/SSE/Zustand integration, screen-reader speech, user research, approved scoring/privacy policy or Figma fidelity. Follow the [conditional decision table](design-spec.md) rather than inferring those approvals from the visual finish.
