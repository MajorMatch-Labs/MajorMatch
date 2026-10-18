# Week 42 ingestion UI review

Source: MajorMatch `origin/main` at `8e52a75`; implementation branch `feat/nhat-w42-ui-clarity`. The production website was inspected on 2026-10-18, followed by the local production build in the in-app browser at 1247 × 926 px. No real student PDF or account was used. Local captures: [home](screenshots/home-desktop.jpg), [intake](screenshots/intake-desktop.jpg).

| Scenario | Requirement | Observed before | Implemented and checked locally |
| --- | --- | --- | --- |
| New learner opens intake | ING-UI-FR-01, XUI-AC-06 | Upload and RIASEC were described with infrastructure jargon; login requirement was hidden inside the drop zone. | Plain-language steps and prominent login action. |
| New learner opens survey | ING-UI-FR-04, XUI-AC-01 | Ten prefilled answers and a computed Holland label appeared before input. | All ten answers and tags start empty. Guest inputs are disabled until login so login cannot discard a guest survey. An earlier local iteration showed progress changing from 0/10 to 1/10 after one explicit choice; the final authenticated journey was not exercised. |
| Analysis preconditions | ING-UI-AC-01, XUI-AC-02 | Submission could navigate to results after a swallowed API error and substitute default answers/tags. | Submission requires login, ten answers and at least one tag; a failed request stays on intake and shows an error. |

Verification: `npm run build` passed; `npm test` passed (52 tests). Browser checks covered desktop home, intake and empty result. 375 px and 768 px reflow, keyboard-only completion and live authenticated API behavior were not verified. Survey-only eligibility for an AI roadmap remains a product decision; the current UI requires academic evidence before generating one.
