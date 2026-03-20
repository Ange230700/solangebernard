# Branching and Environments

This repository should use the smallest process that helps a small team ship an MVP
from one monorepo without adding ceremony that the codebase does not yet support.

## Recommended Now

### Environment Model

Use one environment model only:

1. `local`
2. `staging`
3. `production`

What that means in practice:

- `local`: every developer runs the parts they are changing on their own machine.
- `staging`: one shared integration environment for hosted surfaces, especially
  `web` and `api`.
- `production`: the live environment, promoted from a tagged commit that has already
  been validated in staging.

For `desktop` and `mobile`:

- keep them on the same trunk as the rest of the monorepo
- build internal test artifacts from `main` when needed
- ship release artifacts from tagged commits on `main`
- do not create separate long-lived environment branches for them

### Branch Strategy

Use one branch strategy only: `trunk-based`.

Rules:

- `main` is the only permanent branch.
- all other branches are short-lived topic branches created from `main`
- merge back to `main` quickly through pull request or equivalent review
- release from tagged commits on `main`

Recommended branch patterns:

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

### Promotion Flow

The intended movement of code is:

1. topic branch
2. `main`
3. `staging`
4. tagged release from the same `main` commit
5. `production`

Hotfixes follow the same model:

1. create `fix/...` from `main`
2. review and merge to `main`
3. validate in `staging`
4. tag and release to `production`

The important rule is simple: promote the same commit forward. Do not fix staging by
hand, and do not release a different commit than the one that passed validation.

## Why This Is The Right Fit

This policy fits the repo as it exists today:

- the repository is one monorepo with shared packages and shared runtime concerns
- only `main` is actually in use as a long-lived branch today
- local development is well defined
- production-style build modes exist
- staging and deployment are planned, but not yet implemented
- there is no evidence of delivery infrastructure that justifies Git Flow or
  multiple permanent branches

In short, the repo needs faster integration and clearer promotion, not more branch
types.

## Not Recommended Now

Do not adopt these now:

- Git Flow
- a long-lived `develop` branch
- permanent `staging` or `production` branches
- permanent per-app branches such as `web`, `api`, `mobile`, or `desktop`
- preview branches such as `preview/...`
- separate branching strategies per app inside the monorepo

These add merge overhead without solving a real delivery problem in the current repo.

## Maybe Later

Consider these only if the repo grows into them:

- temporary `release/...` branches when desktop packaging or mobile store review
  requires a stabilization window
- PR preview environments for `web`
- app-specific release tags if release cadence diverges significantly across surfaces

Even later, the default should remain: avoid new long-lived branches unless there is
clear operational evidence that they are needed.

## Migration From The Repo's Current State

The repository already behaves close to this model, but the policy should be made
explicit.

1. treat `main` as the only permanent branch
2. stop using `develop` as a workflow branch
3. keep using short-lived topic branches off `main`
4. add shared environment configuration so local, staging, and production differ by
   config rather than by branch
5. add deployment automation later so `staging` and `production` are real
   environments, not just planned ones
6. release desktop and mobile from tagged `main` commits instead of dedicated
   branches

## Working Agreement

Until real CI/CD and deployment automation exist, contributors should behave as if
`main` must remain close to releasable at all times.

That means:

- keep branches short-lived
- avoid stacking long-running branches
- merge small increments
- prefer feature slices that can be validated quickly
- document any new environment assumptions in the repo
