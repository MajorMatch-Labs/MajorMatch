# Reproduce Ingestion design checks

From monorepo root, start `node client/design/shared/serve.cjs`. In a standalone client checkout, omit `client/` from these paths. Preview: http://127.0.0.1:4173/design/ingestion/prototype/.

Run `node --test client/design/ingestion/verification/model.test.mjs` for four model tests. Browser verification requires an available Playwright package and installed Microsoft Edge, but adds no production dependency. If Playwright is not resolvable from Node, set `MAJORMATCH_PLAYWRIGHT_PATH` to its absolute package directory. Optionally set `MAJORMATCH_BROWSER_CHANNEL` to another installed Playwright-supported browser channel.

Run `node client/design/ingestion/verification/browser-check.cjs`. It generates [results.json](results.json) and 24 PNGs under `../screenshots/`. The recorded revision identifies the committed prototype source; the evidence commit follows it. Run against a clean source checkout for reproducibility. The default preview URL is loopback port 4173; the network assertion intentionally permits only that origin. No real personal records are needed: test PDFs are synthetic buffers.

The report separates ten checked groups from unverified work. CSS zoom and emulated forced-colors/reduced-motion are smoke checks, not a full browser/assistive-technology certification. Screenshots require human inspection in addition to automated overflow checks. Do not interpret this report as production E2E, live API, Figma fidelity or policy approval.
