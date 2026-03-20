# MVP BDD Features

This folder holds the MVP feature files that act as the business-behavior source
of truth for the repo.

Expected slices:

- `auth/`
- `catalog/`
- `orders/`
- `products/`
- `inventory/`
- `notifications/`
- `platform/`

Folder purpose:

- group scenarios by business area
- keep MVP feature files separate from later-phase work
- give implementation and test tasks one predictable location

## Tag Conventions

Use one consistent tag order on feature files:

1. client or runtime surface tags such as `@web`, `@mobile`, `@desktop`, `@api`
2. one business-area tag such as `@auth`, `@catalog`, `@orders`,
   `@inventory`, `@products`, `@notifications`, or `@platform`
3. `@mvp`

Current MVP features use feature-level tags to describe surface and area.

Use scenario-level tags for execution priority:

- `@critical` for must-not-break MVP flows
- `@smoke` for the smallest cross-surface confidence checks when needed

Avoid one-off tags unless they are adopted across the whole BDD pack.

## Related Docs

- `traceability-sheet.md` maps scenarios to domain objects, API endpoints,
  frontend screens, and test types.
