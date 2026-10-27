# Week 43 — Playwright browser test setup

- Module: advisor/core
- Owner credit: Long Nhật
- Agent: Codex
- Base: `MajorMatch/origin/main` at `0154bcf`
- Branch: `test/longnhat-w43-playwright-e2e`

## Request and decision

User asked whether Maestro or Playwright could be set up in the app. The existing client is a Next.js web app, so Playwright Test was selected for browser end-to-end checks. Maestro's web support is documented as beta and was not installed. This choice does not change product rules or production UI.

Sources: [Playwright installation](https://playwright.dev/docs/intro), [Playwright web server](https://playwright.dev/docs/test-webserver), [Maestro web browser support](https://docs.maestro.dev/get-started/supported-platform/web-browser).

## Changes

- Added `@playwright/test`, a dedicated `test:e2e` script, Chromium desktop (1280px) and mobile (375px) projects, and a local Next.js test server on port 3100.
- Added browser checks for the home-to-intake link and for visible synthetic-data labeling on the sample report.
- Ignored local reports, traces and screenshots. Tests use only public pages and synthetic demo data; no learner PDF or profile is recorded.

## Verification

- `npm test`: **VERIFIED**, 9 files and 52 tests passed.
- `npm run test:e2e`: **VERIFIED**, 4 browser cases passed after increasing the sample-report navigation timeout to account for initial Next.js development compilation. An earlier 5-second navigation assertion failed on cold compilation; it was not recorded as a product pass.
- `git diff --check`: **VERIFIED**, no whitespace errors.
- `npx tsc --noEmit`: **FAILED**, existing test typing errors include missing Vitest globals and `grade` on `CourseParsedItem`. These errors are outside the Playwright files and were not fixed as part of this setup.
- Real backend, login, upload and learner-data flows: **NOT VERIFIED**.

No human review or production deployment has been claimed.
