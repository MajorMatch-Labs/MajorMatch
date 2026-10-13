# Client working instructions
Read DESIGN.md and DESIGN-GUARDRAILS.md before PRD, design or frontend work. Then read tasks/<module>/prd-<module>-ui.md and design/<module>/README.md.
Directories use ingestion, analytics and advisor, including docs/ai-evidence/<module>/. Preserve owner credit. All git commit messages MUST strictly be written in English following Conventional Commits (`feat(...)`, `fix(...)`, `docs(...)`). Individual feature branches must keep Author == Committer (NO Co-authored-by trailers) to guarantee clean single-avatar graphs on GitHub.
Keep the existing stack and Product Design/Figma plugins. Only the two requested frontend skills are vendored alongside the existing PRD skill. Skills do not approve business policy.
Use design/shared/tokens.css for review prototypes. Keep production src/ untouched during design tasks unless implementation is explicitly requested.
Publish matching feature branch names, client subtree first, MajorMatch second. Do not merge design PRs without user authorization.

## Code Review Rules

- For learner profile, analysis, roadmap, or chat changes, flag stale or mismatched context: edits to evidence, answers, or selected majors must not leave dependent results looking current; missing evidence must not be treated as zero.
- Keep data origin and transformation honest. Live data and synthetic demo data must remain distinguishable; never silently turn a failed live request into a successful mock result or present unresolved scoring/readiness policy as approved.
- Protect learner data. Flag PDF/profile content in URLs, logs, screenshots, or committed evidence, and flag request/error handling that leaks sensitive values or leaves stale streaming responses able to update a changed profile.

These rules guide Codex pull request reviews; they do not replace implementation tests, CI, branch protection, or human approval.
