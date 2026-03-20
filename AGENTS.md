# AGENTS.md

## Purpose

This repository uses a small-team, MVP-friendly branching and environment policy.
When making changes here, follow the rules in this file and the fuller policy in
`docs/branching-and-environments.md`.

## Recommended Now

- Treat `main` as the only permanent branch.
- Use short-lived topic branches off `main` such as:
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
- Merge topic branches back into `main` quickly through review.
- Assume the environment model is:
  - `local`
  - `staging`
  - `production`

## Environment Policy

- `local` is where developers run the monorepo apps and tests on their own machines.
- `staging` is the shared integration environment for hosted surfaces, especially `web`
  and `api`.
- `production` is released from a tagged commit that has already been validated in
  staging.
- `desktop` and `mobile` should follow the same trunk and be released as artifacts
  from tagged commits on `main`, not from separate long-lived branches.

## Branching Rules

- Start work from the latest `main`.
- Do not create or rely on a long-lived `develop` branch.
- Do not create permanent `staging`, `production`, `web`, `api`, `mobile`, or
  `desktop` branches.
- Do not invent app-specific branching models unless the repo gains clear delivery
  infrastructure that requires them.
- Use `fix/...` branches for urgent production issues, but merge them back through
  `main` like any other short-lived branch.

## What Agents Should Do

- Keep changes compatible with trunk-based development.
- Prefer changes that help `main` stay releasable.
- Document new environment assumptions explicitly when adding config, env vars, or
  release steps.
- If you add real deployment or release automation later, update
  `docs/branching-and-environments.md` in the same change.

## Not Recommended Now

- Git Flow
- long-lived `develop`
- permanent release branches
- per-app long-lived branches
- preview branches
- environment branches as substitutes for real deployment environments

## Maybe Later

- temporary `release/...` branches for store-review or packaging freezes
- PR preview deployments for `web`
- app-specific release tags if release cadence diverges materially
