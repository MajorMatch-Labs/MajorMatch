---
name: prd
description: "Generate a Product Requirements Document (PRD) for a new feature. Use when planning a feature, starting a new project, or when asked to create a PRD. Triggers on: create a prd, write prd for, plan this feature, requirements for, spec out."
user-invocable: true
---

# PRD Generator

Create detailed Product Requirements Documents that are clear, actionable, and suitable for implementation.

## The Job

1. Receive a feature description from the user.
2. Ask 3-5 essential clarifying questions with lettered options.
3. Generate a structured PRD based on the answers.
4. Save it under `tasks/` as `prd-[feature-name].md` using kebab-case.

Do not start implementing the feature. Only create the PRD.

## Step 1: Clarifying Questions

Ask only critical questions where the initial prompt is ambiguous. Focus on:

- Problem or goal.
- Core functionality.
- Scope and boundaries.
- Success criteria.

Format questions so the user can answer with a short sequence such as `1A, 2C, 3B`:

```text
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]
```

## Step 2: PRD Structure

### 1. Introduction/Overview

Brief description of the feature and the problem it solves.

### 2. Goals

Specific and measurable objectives.

### 3. User Stories

Each story needs:

- A short descriptive title.
- `As a [user], I want [feature] so that [benefit].`
- A verifiable acceptance-criteria checklist.

Each story should be small enough to implement in one focused session.

```markdown
### US-001: [Title]

**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**

- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] Typecheck/lint passes
- [ ] **UI stories only:** Verify in browser using dev-browser skill
```

Acceptance criteria must be verifiable. Do not write vague criteria such as "works correctly."

### 4. Functional Requirements

Use a numbered list of explicit requirements such as:

- `FR-1: The system must allow users to...`
- `FR-2: When a user clicks X, the system must...`

### 5. Non-Goals

State what the feature will not include.

### 6. Design Considerations

Include UI/UX requirements, links to approved mockups, and existing components to reuse when applicable.

### 7. Technical Considerations

Include known constraints, dependencies, integration points, and performance requirements when applicable.

### 8. Success Metrics

State how success will be measured. Mark unavailable baselines or targets as requiring human decision rather than inventing them.

### 9. Open Questions

List unresolved decisions.

## Writing for Junior Developers and AI Agents

- Be explicit and unambiguous.
- Avoid jargon or explain it.
- Provide enough context to understand the purpose and core logic.
- Number requirements for traceability.
- Use concrete examples where helpful.
- Never invent requirements, research, metrics, data sources, or completed verification.

## Checklist

- [ ] Asked clarifying questions with lettered options.
- [ ] Incorporated the user's answers.
- [ ] User stories are small and specific.
- [ ] Functional requirements are numbered and unambiguous.
- [ ] Non-goals define clear boundaries.
- [ ] Every major claim has repository evidence or an explicit UNKNOWN label.
- [ ] Saved under `tasks/` with a kebab-case filename.

## Provenance

Project-local copy adapted from `snarktank/ralph`, `skills/prd/SKILL.md`, retrieved on 2026-09-15:

`https://github.com/snarktank/ralph/blob/main/skills/prd/SKILL.md`
