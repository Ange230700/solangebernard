# AGENTS.md

## Purpose

This repository uses a small-team, MVP-friendly branching and environment policy.

When making changes here, follow the rules in this file and the fuller policy in
`docs/branching-and-environments.md`.

This file exists to keep work consistent, trunk-friendly, and easy to ship.

---

## Operating defaults

- Treat `main` as the only permanent branch.
- Keep `main` releasable.
- Prefer small, focused, validated changes.
- Prefer short-lived topic branches over long-lived integration branches.
- Prefer TDD for behavior changes when practical: `RED → GREEN → REFACTOR`.
- Do not introduce extra process unless the repository clearly requires it.

---

## Recommended now

### Branch model

- Use `main` as the integration trunk.
- Use short-lived topic branches created from the latest `main`.
- Use branch prefixes such as:
  - `feat/...`
  - `fix/...`
  - `chore/...`
  - `docs/...`
  - `test/...`
  - `refactor/...`
  - `ci/...`
  - `style/...`
  - `perf/...`
  - `revert/...`

### Environment model

Assume the environment model is:

- `local`
- `staging`
- `production`

### Release model

- `local` is where developers run the monorepo apps, scripts, and tests on their own machines.
- `staging` is the shared integration environment for hosted surfaces, especially `web` and `api`.
- `production` is released from tagged commits on `main` that have already been validated in `staging`.
- `desktop` and `mobile` should follow the same trunk and be released as artifacts from tagged commits on `main`, not from separate long-lived branches.

---

## Branching rules

- Start work from the latest `main`.
- Do not create or rely on a long-lived `develop` branch.
- Do not create permanent `staging`, `production`, `web`, `api`, `mobile`, or `desktop` branches.
- Do not invent app-specific branching models unless the repository gains clear delivery infrastructure that requires them.
- Use `fix/...` branches for urgent production issues, but integrate them back through `main` like any other short-lived branch.
- Keep branch names task-oriented and readable.
- Keep branch lifetime short.
- Do not keep working on stale topic branches after their original task is complete.

---

## Task execution workflow

When working from the backlog, issue list, or task list:

1. Select exactly one task.
2. If the task is tracked in GitHub Projects and access is available, identify the
   matching project item before changing code.
3. Update local `main`.
4. Create a fresh short-lived branch from the latest `main`.
5. Name the branch according to the task type and task purpose.
6. Switch to that branch before making changes.
7. If the task is tracked in GitHub Projects and access is available, move the
   matching project item to `In Progress` when work starts.
8. Keep the scope limited to the selected task.
9. Implement the task.
10. Validate the task with the relevant checks.
11. Integrate the validated work back into `main`.
12. Delete the temporary branch after integration.
13. If the task is tracked in GitHub Projects and access is available, move the
   matching project item to `Done` after the validated work has been merged and
   pushed, or leave it in `In Progress` and say why if the task is only partial.
14. Repeat the same cycle for the next task.

### Branch examples

- `feat/project-brief-doc`
- `fix/auth-guard-regression`
- `docs/branching-policy`
- `test/client-baseline-tests`
- `refactor/order-service-validation`

### Rules for this workflow

- Work on one task at a time.
- Do not batch unrelated backlog tasks into one branch unless explicitly requested.
- Do not continue new work on an old topic branch after its task is complete.
- Do not leave stale temporary branches behind.
- Do not merge unvalidated work back into `main`.
- Unless explicitly told otherwise, complete the full Git cycle after validated work:
  merge the topic branch into `main`, push `main`, and delete the merged branch
  locally and on the remote when it exists.

## GitHub Projects handling

When the repository uses a GitHub Project backlog and access is available:

- treat the matching GitHub Project item as part of the working context for the
  selected task
- use the GitHub CLI when practical to inspect and update the project item
- when asked to do backlog grooming, sprint planning, or roadmap maintenance,
  agents may also create or update sprint field values, sprint options, and
  future sprint planning items in the GitHub Project
- keep project status aligned with real repo state instead of leaving stale `Todo`
  items behind
- move the item to `In Progress` when implementation starts
- move the item to `Done` only after validation, merge to `main`, and push are
  complete
- if the work is partial, blocked, or intentionally split across tasks, leave the
  item in `In Progress` and state the reason clearly
- do not bulk rewrite the project backlog or create new project items unless the
  maintainer asks for backlog cleanup or backlog expansion
- say clearly when GitHub Project access is missing, unsupported, or blocked by
  authentication so project updates are not silently skipped

## TDD cycle

When implementing a task, prefer the smallest practical TDD loop:

1. **RED**
   - write or update the smallest relevant automated test that expresses the task or bug
   - run the test and confirm it fails for the expected reason

2. **GREEN**
   - implement the smallest sane change that makes the failing test pass
   - avoid broad refactors during this step

3. **REFACTOR**
   - improve code, names, duplication, and structure without changing behavior
   - keep tests green while refactoring

### TDD rules

- Prefer small TDD loops over large test batches.
- For bug fixes, reproduce the bug with a failing test before fixing it when practical.
- Keep the test scope aligned to the selected task.
- Do not mix unrelated behavior changes into the same `RED → GREEN → REFACTOR` cycle.
- If a task cannot reasonably start with an automated test, say so clearly and use the smallest relevant validation instead.
- After refactoring, rerun the relevant checks to confirm behavior is unchanged.

---

## What agents should do

- Keep changes compatible with trunk-based development.
- Prefer changes that help `main` stay releasable.
- Use the smallest sane implementation that solves the requested task.
- Respect the monorepo boundaries already defined in the repository.
- Document new environment assumptions explicitly when adding config, env vars, build steps, deployment steps, or release steps.
- Update `docs/branching-and-environments.md` in the same change if branching or environment behavior changes materially.
- Prefer task-sized changes over broad refactors unless the task clearly requires broader work.
- Say directly when infrastructure, environment behavior, or release assumptions are missing or underdefined.
- Treat merge-to-`main` and merged-branch cleanup as the default finish state, not
  as separate optional follow-up steps, unless the maintainer asks to keep the
  branch.
- Keep GitHub Project item status aligned with the actual task state when the
  repo uses a project backlog and access is available.

---

## What agents should not do

- Do not create new long-lived branches.
- Do not use environment branches as substitutes for real deployment environments.
- Do not create per-app permanent branches.
- Do not assume hidden deployment infrastructure exists if the repo does not show it.
- Do not expand scope from one task into multiple unrelated tasks.
- Do not replace working tooling without a clear repo-backed reason.
- Do not introduce heavy workflow process for a small-team MVP repo.

---

## Not recommended now

- Git Flow
- long-lived `develop`
- permanent release branches
- per-app long-lived branches
- preview branches as a branching strategy
- environment branches as substitutes for real deployment environments

---

## Maybe later

- temporary `release/...` branches for store-review or packaging freezes
- PR preview deployments for `web`
- app-specific release tags if release cadence diverges materially
- more explicit release coordination rules if the delivery process becomes more complex

---

## Environment guidance

When analyzing or documenting environments:

- separate confirmed environments from inferred environments
- distinguish runtime environments from deployment environments
- distinguish deployment environments from Git branches
- prefer the smallest viable environment model
- avoid inventing environment matrices unsupported by scripts, CI, or deployment config

When new environment behavior is introduced, document:

- what the environment is for
- which app(s) it applies to
- how code reaches it
- what configuration it depends on
- how it differs from `local`, `staging`, or `production`

---

## Client testing guidance

When asked to set up or improve tests in `apps/client`:

- inspect existing Angular workspace test configuration before changing tools
- prefer the smallest CI-safe baseline
- avoid introducing Playwright, Cypress, Jest, or Vitest unless the repo clearly requires it
- do not require Tauri native runtime for desktop baseline tests
- do not require Capacitor or device runtime for mobile baseline tests
- keep the baseline focused on unit, component, and smoke tests
- make commands runnable from `apps/client` and preferably from repo root
- always verify by running the test commands
- document exact commands if missing

---

## Change validation expectations

Before considering a task complete:

- run the smallest relevant validation for the change
- prefer targeted validation over random broad commands
- if the change affects build, test, or config behavior, run the corresponding checks
- if full validation cannot be completed, state clearly what was and was not verified
- when using TDD, confirm the relevant test failed before the fix and passed after the fix
- prefer the smallest relevant `RED → GREEN → REFACTOR` loop over large unscoped validation runs

Examples of relevant validation:

- lint for touched files or packages
- typecheck for affected app or package
- unit or smoke tests for affected client app
- build or configuration validation when changing build config or scripts

---

## Documentation expectations

When changing repo behavior, keep documentation aligned.

Update relevant docs when you change:

- branching rules
- environment assumptions
- test commands
- build commands
- release steps
- deployment expectations
- required env vars

Prefer short, direct, working documentation over bloated explanation.

---

## Output style for analysis tasks

When asked to analyze environments, branching, release flow, or related repo policy:

1. Show concrete repo signals first.
2. Separate:
   - confirmed from repo
   - inferred
   - missing information
3. Recommend one practical model by default.
4. Avoid presenting multiple equal options unless explicitly asked.
5. End with:
   - recommended now
   - not recommended now
   - maybe later

---

## Definition of done

Work is done only if a maintainer can clearly answer:

- what changed
- why it changed
- how it was validated
- how it fits the trunk-based workflow
- whether the matching GitHub Project item was updated or why it was not
- whether it has been integrated back into `main`
- whether the temporary task branch can be deleted or has already been deleted
