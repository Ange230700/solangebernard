# Client Core Boundary

This document freezes the role of `apps/client/projects/core` as of March 20, 2026.

## Decision

`projects/core` is for UI-agnostic Angular helpers, not general shared app
logic.

## Why

- Shared business rules already belong in `packages/domain`.
- Shared transport behavior already belongs in `packages/api-client`.
- Shared transport-safe types already belong in `packages/contracts`.
- The current `core` library already looks like an Angular helper library: it
  has Angular peer dependencies, no platform UI dependencies, and currently
  exports only a client configuration injection token.
- `projects/ui-web` already exists as the place where shared presentation code
  can live for web and desktop, so `core` does not need to grow into a second
  presentation library.

## What May Live In `projects/core`

- Angular injection tokens
- Angular provider factories
- Angular configuration helpers
- UI-agnostic routing helpers or guards
- Angular state or signal helpers that do not assume PrimeNG, Ionic, Tauri, or
  Capacitor
- thin Angular wrappers that help client apps consume shared API client or
  contract code without turning `core` into a design-system library

## What Must Stay Out Of `projects/core`

- product, inventory, order, notification, or auth business rules that belong
  in `packages/domain`
- typed HTTP client behavior that belongs in `packages/api-client`
- PrimeNG presentation components
- Ionic-specific UI or runtime behavior
- Capacitor or Tauri runtime bridges
- web-only, desktop-only, or mobile-only presentation code
- large shared feature slices that would turn `core` into a second app layer

## Relationship To Other Workspaces

- `projects/core` may be consumed by `web`, `desktop`, and `mobile`.
- `projects/core` should stay Angular-specific but platform-agnostic.
- `projects/ui-web` remains the separate decision point for shared presentation
  between `web` and `desktop`.
- `packages/domain` remains the place for framework-free business logic.

## Current Repo Alignment

Current repo signals already match this decision:

- `@repo/client-core` declares only Angular peer dependencies
- `apps/client/projects/core/src/lib/core.ts` currently exports only
  `CLIENT_CORE_CONFIG`
- the library README already describes it as Angular-only and free of PrimeNG,
  Ionic, Capacitor, and Tauri code

This change makes that boundary explicit and narrows the phrase "shared app
logic" so the library does not drift into business/domain ownership.

## Related Decisions

- `docs/workspace-boundaries.md`
- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-services.md`
