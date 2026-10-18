# Week 42 analytics UI review

Source: MajorMatch `origin/main` at `8e52a75`; implementation branch `feat/nhat-w42-ui-clarity`. Production website and local production build were inspected in the in-app browser on 2026-10-18 at 1247 × 926 px. Only public pages and synthetic fixture data were used. Local captures: [demo result](screenshots/demo-result-desktop.jpg), [guest empty result](screenshots/empty-result-desktop.jpg).

| Scenario | Requirement | Observed before | Implemented and checked locally |
| --- | --- | --- | --- |
| Guest opens `/result` | Analytics AC05, XUI-AC-02 | Personal-looking scores appeared without a profile. | Empty result with a link to intake; verified in the local browser. |
| Learner opens demo link | Analytics AC05, XUI-AC-02 | The home link opened an unlabeled result. | Explicit `?demo=1` route shows a persistent synthetic-data banner and cannot generate a roadmap; verified in the local browser. |
| Learner compares majors | Analytics AC04, XUI-AC-03 | Rank badges contradicted score order, and one global detail could appear under several majors. | Cards show score without ordinal ranking. Detail appears only when present for the selected major; a numeric radar table accompanies the chart. |

Verification: `npm run build` passed; `npm test` passed (52 tests). The desktop demo and guest empty state were checked visually. Live authenticated results, 375/768 px layouts and keyboard traversal of the full journey were not verified. The canonical ranking rule and score bands remain unapproved; this change does not choose either policy.
