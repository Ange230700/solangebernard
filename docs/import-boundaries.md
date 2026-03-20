# Import Boundaries

This document freezes the Solange Bernard MVP import boundaries as of March 20, 2026.

It is the source of truth for which workspace layers may import which others,
and which boundaries are enforced through lint rules today.

## Usage Rule

- Treat these boundaries as architecture rules, not optional style guidance.
- Prefer package-level imports over cross-workspace relative imports.
- When a new boundary is needed, update this document and the matching lint
  rules in the same change.

## Rule Summary

| Rule                                        | Meaning                                                                                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `mobile -> not ui-web`                      | `apps/client/projects/mobile` must not import `@repo/client-ui-web` or local `ui-web` library files.                                |
| `domain -> not frameworks`                  | `packages/domain` must stay framework-free and must not import Angular, Nest, Ionic, Capacitor, Tauri, or client-layer packages.    |
| `contracts -> transport-safe only`          | `packages/contracts` must stay free of app code, domain logic, UI frameworks, and ORM model types.                                  |
| `api -> not client packages`                | `apps/api` must not import client-side packages or client UI frameworks.                                                            |
| `api controllers -> not DB models directly` | Controller files must not import ORM or persistence-model modules directly; they should map through services and contracts instead. |

## Enforced Lint Rules

### `packages/domain`

Enforced in the root [eslint.config.mjs](/C:/Users/USER/solangebernard/eslint.config.mjs).

- disallows Angular imports such as `@angular/*`
- disallows Nest imports such as `@nestjs/*`
- disallows Ionic, Capacitor, Tauri, and PrimeNG imports
- disallows imports from client-layer packages such as `@repo/api-client`,
  `@repo/client-core`, and `@repo/client-ui-web`

This keeps domain code aligned with the frozen rule that `packages/domain` owns
framework-free business logic.

### `packages/contracts`

Enforced in the root [eslint.config.mjs](/C:/Users/USER/solangebernard/eslint.config.mjs).

- disallows Angular, Nest, Ionic, Capacitor, Tauri, and PrimeNG imports
- disallows imports from internal app or domain layers such as `@repo/domain`,
  `@repo/api`, and client packages
- disallows direct ORM-package imports such as `@prisma/client`,
  `drizzle-orm`, and `typeorm`

This keeps shared contracts transport-safe and prevents contract types from
drifting into domain or persistence ownership.

### `apps/client/projects/mobile`

Enforced in
[apps/client/projects/mobile/eslint.config.js](/C:/Users/USER/solangebernard/apps/client/projects/mobile/eslint.config.js).

- disallows `@repo/client-ui-web`
- disallows direct local imports that reach into `ui-web` library files

This preserves the frozen client-library split:
`projects/core` is the shared Angular-helper library,
while `projects/ui-web` is presentation for `web` and `desktop` only.

### `apps/api`

Enforced in [apps/api/eslint.config.mjs](/C:/Users/USER/solangebernard/apps/api/eslint.config.mjs).

- disallows imports from client packages such as `@repo/api-client`,
  `@repo/client-core`, and `@repo/client-ui-web`
- disallows Angular, Ionic, Capacitor, Tauri, and PrimeNG imports in API code
- adds a stricter controller rule that disallows direct imports from ORM and
  persistence-model paths

This keeps the API server-side and prevents controller files from exposing
future DB-layer shapes directly as client-facing responses.

## Current Limitation

- The repo has chosen PostgreSQL as the target database.
- The repo has chosen Prisma as the default ORM or query layer.
- The repo has not created the real Prisma persistence module layout yet.
- Because of that, the "API cannot dump DB models directly into clients" rule
  is currently enforced as a pre-persistence-layout guardrail:
  controller files may not import `@prisma/client`, other ORM packages, or
  persistence-model path patterns directly.
- Once the repo adds a dedicated Prisma module and persistence layer, these
  rules should be extended to match the real package and file layout.

## Related Decisions

- [workspace-boundaries.md](/C:/Users/USER/solangebernard/docs/workspace-boundaries.md)
- [client-core-boundary.md](/C:/Users/USER/solangebernard/docs/client-core-boundary.md)
- [client-ui-web-boundary.md](/C:/Users/USER/solangebernard/docs/client-ui-web-boundary.md)
- [domain-services.md](/C:/Users/USER/solangebernard/docs/domain-services.md)
