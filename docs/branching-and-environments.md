<!-- docs\branching-and-environments.md -->

# Branching and Environments

This repository uses the smallest process that helps a small team ship an MVP from one
monorepo without adding branch ceremony or environment complexity that the codebase
does not yet support.

## Recommended Now

Use one branch strategy only: **trunk-based development**.

Use one environment model only:

1. `local`
2. `staging`
3. `production`

The goal is simple:

- integrate quickly on one trunk
- keep `main` close to releasable
- promote the same validated commit forward
- avoid using branches as fake environments

---

## Environment Model

### `local`

`local` is where contributors run the parts of the monorepo they are changing on their
own machines.

In practice, this includes:

- local development servers
- local builds
- local tests
- local debugging
- local config needed to run affected surfaces

### `staging`

`staging` is the intended shared integration environment for hosted surfaces,
especially `web` and `api`.

Its purpose is to validate the same `main` commit that is expected to be released to
production.

Until full deployment automation exists, contributors should still design config,
promotion flow, and release behavior as if `staging` is the required validation step
before production.

### `production`

`production` is the live environment.

Only tagged commits on `main` are eligible for production release.

Production should be promoted from a commit that has already been validated in
`staging`.

### `desktop` and `mobile`

`desktop` and `mobile` follow the same trunk as the rest of the monorepo.

They should:

- stay on the same branch model as `web` and `api`
- build internal test artifacts from `main` when needed
- ship release artifacts from tagged commits on `main`
- avoid separate long-lived environment branches

Do not create permanent `desktop` or `mobile` branches.

---

## Current Reality

The intended model is:

1. `local`
2. `staging`
3. `production`

But not every part of that delivery model is fully implemented yet.

Until full CI/CD and deployment automation exist, contributors should keep branching,
configuration, and release decisions compatible with that target model instead of
inventing alternative workflows.

---

## Branch Strategy

Use one branch strategy only: **trunk-based**.

### Rules

- `main` is the only permanent branch.
- All other branches are short-lived topic branches created from the latest `main`.
- Merge back into `main` quickly.
- Keep branch scope small and task-focused.
- Release from tagged commits on `main`.

### Recommended branch patterns

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

### Branching constraints

- Do not create or rely on a long-lived `develop` branch.
- Do not create permanent `staging` or `production` branches.
- Do not create permanent per-app branches such as `web`, `api`, `mobile`, or
  `desktop`.
- Do not create separate branch strategies per app inside the monorepo.
- Do not use branches as substitutes for real deployment environments.

### Review rule

Merge back to `main` through pull request when repository workflow supports it.

Where that is not yet fully enforced, contributors should still keep changes small,
reviewable, and validated before integration.

---

## Task Execution Rule

Contributors should work one task at a time on a fresh short-lived branch created from
the latest `main`.

For each task:

1. create a topic branch from `main`
2. implement the task
3. validate the change
4. integrate the work back into `main`
5. delete the temporary branch

Do not batch unrelated tasks into one branch unless explicitly required.

Do not continue new work on an old topic branch after its original task is complete.

---

## Promotion Flow

The intended movement of code is:

1. topic branch
2. `main`
3. `staging`
4. tagged release from the same `main` commit
5. `production`

### Hotfix flow

Hotfixes follow the same model:

1. create `fix/...` from `main`
2. implement and validate the fix
3. merge back to `main`
4. validate the same commit in `staging`
5. tag and release that same commit to `production`

### Core promotion rule

Promote the same commit forward.

Do not fix `staging` by hand.

Do not release a different commit than the one that passed validation.

---

## Why This Fits the Repository

This policy matches the repo as it exists today:

- the repository is one monorepo with shared packages and shared runtime concerns
- `main` is already the natural long-lived trunk
- local development is well defined
- production-style build modes exist
- staging and deployment are planned, but not yet fully implemented
- there is no evidence of delivery infrastructure that justifies Git Flow, multiple
  permanent branches, or per-app branch models

The repo needs faster integration and clearer promotion, not more branch types.

---

## Not Recommended Now

Do not adopt these now:

- Git Flow
- a long-lived `develop` branch
- permanent `staging` or `production` branches
- permanent per-app branches such as `web`, `api`, `mobile`, or `desktop`
- preview branches such as `preview/...`
- separate branching strategies per app inside the monorepo
- environment branches used as substitutes for real deployment environments

These add merge overhead without solving a real delivery problem in the current repo.

---

## Maybe Later

Consider these only if the repo grows into them:

- temporary `release/...` branches when desktop packaging or mobile store review
  requires a stabilization window
- PR preview environments for `web`
- app-specific release tags if release cadence diverges materially across surfaces
- more explicit release coordination rules if the delivery process becomes more complex

Even later, the default should remain the same:

avoid new long-lived branches unless there is clear operational evidence that they are
needed.

---

## Migration From The Repo's Current State

The repository already behaves close to this model, but the policy should be explicit
and consistently followed.

### Immediate migration steps

1. treat `main` as the only permanent branch
2. stop using `develop` as a workflow branch
3. keep using short-lived topic branches from `main`
4. keep work task-sized and short-lived
5. add shared environment configuration so `local`, `staging`, and `production`
   differ by config rather than by branch
6. add deployment automation later so `staging` and `production` become real
   environments rather than planned ones
7. release `desktop` and `mobile` from tagged `main` commits instead of dedicated
   branches

---

## Working Agreement

Until real CI/CD and deployment automation exist, contributors should behave as if
`main` must remain close to releasable at all times.

That means:

- keep branches short-lived
- merge small increments
- avoid stacking long-running branches
- prefer feature slices that can be validated quickly
- document any new environment assumptions in the repo
- keep configuration and release behavior compatible with the intended
  `local` -> `staging` -> `production` model
