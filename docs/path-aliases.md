# Path Aliases

This document freezes the Solange Bernard MVP path-alias contract as of
March 20, 2026.

It is the source of truth for the internal package aliases that source code may
use and for where those aliases are wired into TypeScript configuration.

The repo also enforces the package-root form with lint rules so internal code
does not drift into deep imports under `@repo/.../*`.

## Canonical Alias Set

The canonical internal aliases are the workspace package names:

| Alias                 | Meaning                                                  |
| --------------------- | -------------------------------------------------------- |
| `@repo/contracts`     | shared transport-safe contracts                          |
| `@repo/domain`        | framework-free domain logic for server-side consumers    |
| `@repo/api-client`    | typed API client for web, desktop, and mobile            |
| `@repo/client-core`   | shared UI-agnostic Angular helpers                       |
| `@repo/client-ui-web` | shared presentation library for `web` and `desktop` only |

These alias names are stable public import IDs inside the monorepo.

## Stability Rules

- Use package-root aliases exactly as listed above.
- Do not introduce alternate aliases such as `@app`, `@shared`, `@lib`, or
  `@core` for the same workspaces.
- Do not deep-import another workspace through paths such as
  `@repo/contracts/src/...`,
  `@repo/api-client/src/...`,
  `@repo/client-core/src/...`,
  or `../../packages/...`.
- If files move internally, update the TypeScript path mapping behind the same
  alias instead of renaming the alias in application code.
- If a new internal alias is introduced, add it here and update the matching
  TypeScript config in the same change.

## Where Aliases Are Wired

### Client Alias Map

The client-facing aliases are defined in
[tsconfig.client-aliases.json](/C:/Users/USER/solangebernard/tsconfig.client-aliases.json)
and inherited by
[apps/client/tsconfig.json](/C:/Users/USER/solangebernard/apps/client/tsconfig.json).

That map includes:

- `@repo/contracts`
- `@repo/api-client`
- `@repo/client-core`
- `@repo/client-ui-web`

`@repo/client-core` and `@repo/client-ui-web` stay package-root aliases even
though their current Angular workspace path mappings resolve through the client
library build outputs.

### API Alias Map

The API-facing aliases are defined in
[tsconfig.api-aliases.json](/C:/Users/USER/solangebernard/tsconfig.api-aliases.json)
and inherited by
[apps/api/tsconfig.json](/C:/Users/USER/solangebernard/apps/api/tsconfig.json).

That map includes:

- `@repo/contracts`
- `@repo/domain`

This keeps the server-side alias set small and aligned with the current
workspace boundary that allows `apps/api` to depend on contracts and domain.

## Boundary Note

- `apps/client` should not gain a `@repo/domain` alias.
- `mobile` may inherit the client alias map, but the import-boundary lint rules
  still forbid `@repo/client-ui-web`.
- `packages/contracts`, `packages/domain`, and `packages/api-client` should not
  inherit the app alias configs. Their own package builds must keep resolving
  internal dependencies through real workspace package names and package-manager
  resolution, not cross-workspace source-path aliases.
- the root package lint config plus the client and API ESLint configs forbid
  deep imports such as `@repo/contracts/...` and `@repo/api-client/...`

## Related Decisions

- [workspace-boundaries.md](/C:/Users/USER/solangebernard/docs/workspace-boundaries.md)
- [import-boundaries.md](/C:/Users/USER/solangebernard/docs/import-boundaries.md)
- [client-core-boundary.md](/C:/Users/USER/solangebernard/docs/client-core-boundary.md)
- [client-ui-web-boundary.md](/C:/Users/USER/solangebernard/docs/client-ui-web-boundary.md)
