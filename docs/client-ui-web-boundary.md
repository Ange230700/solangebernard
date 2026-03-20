# Client UI-Web Boundary

This document freezes the role of `apps/client/projects/ui-web` as of March 20, 2026.

## Decision

`projects/ui-web` is only for shared presentation used by `web` and `desktop`.
`mobile` must not depend on it.

## Why

- The current `ui-web` library already describes itself as shared presentation
  for `web` and `desktop`.
- The `mobile` app uses Ionic and carries different UI and runtime assumptions
  from the browser and Tauri surfaces.
- `projects/core` is already frozen as the place for UI-agnostic Angular
  helpers that all three client apps may use.
- Keeping `ui-web` limited to `web` and `desktop` prevents a mixed library that
  tries to satisfy PrimeNG-style desktop or browser presentation and
  Ionic/mobile presentation at the same time.

## What May Live In `projects/ui-web`

- shared Angular presentation components for `web` and `desktop`
- shared browser or desktop-oriented layouts and shells
- shared PrimeNG-based presentation pieces if the repo adds them later
- shared styling helpers, presentation directives, and UI composition utilities
  that make sense for both `web` and `desktop`

## What Must Stay Out Of `projects/ui-web`

- Ionic-specific components, styles, or runtime assumptions
- Capacitor-specific or device-oriented mobile integration code
- presentation code that is only valid for the `mobile` app
- framework-free business logic that belongs in `packages/domain`
- typed HTTP client behavior that belongs in `packages/api-client`
- UI-agnostic Angular helpers that belong in `projects/core`

## Relationship To Other Client Libraries

- `projects/ui-web` may be consumed by `web` and `desktop`.
- `projects/ui-web` must not be consumed by `mobile`.
- `projects/core` remains the shared Angular helper library that all client apps
  may consume.
- `projects/ui-web` is presentation-specific; `projects/core` is not.

## Current Repo Alignment

Current repo signals already match this decision:

- `@repo/client-ui-web` declares only Angular peer dependencies
- the library README already says it is shared presentation for `web` and
  `desktop`
- the public API comment already says `mobile` must not depend on it
- there are currently no `@repo/client-ui-web` imports in the `mobile`
  project tree

This change makes that boundary explicit so future shared UI work does not drift
into `mobile`.

## Related Decisions

- `docs/workspace-boundaries.md`
- `docs/client-core-boundary.md`
- `docs/domain-glossary.md`
- `docs/domain-services.md`
