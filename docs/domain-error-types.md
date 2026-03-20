# Domain Error Types

This document freezes the Solange Bernard MVP domain error catalog as of March
20, 2026.

It is the source of truth for the canonical error types used across domain
logic, contracts, API mapping, and tests.

## Usage Rule

- Use the exact canonical error names in domain code, shared contracts, and
  transport mapping.
- Keep user-facing copy separate from the canonical error name.
- Prefer the most specific error available instead of collapsing known business
  failures into a generic validation error.
- Transport status codes and response envelope shape are defined separately from
  this catalog.

## Naming Rule

- Canonical error types should use `PascalCase`.
- Domain and contract layers should treat the error type as a stable identifier.
- UI text may say "invalid credentials", "stock limit error", or "validation
  error", while the underlying canonical type stays stable.

## Canonical Error Catalog

| Error type                           | Category     | Meaning                                                                                                                        |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `ValidationFailed`                   | validation   | Generic input or value-object validation failed and no more specific business error applies.                                   |
| `InvalidCredentials`                 | auth         | Login failed because the credentials do not match an active back-office account.                                               |
| `AccountDisabled`                    | auth         | Authentication was attempted for a disabled back-office account.                                                               |
| `Unauthorized`                       | access       | The caller is not authenticated or the authenticated session is missing or expired.                                            |
| `Forbidden`                          | access       | The caller is authenticated but does not have permission for the requested action.                                             |
| `ProductNotFound`                    | lookup       | The requested product does not exist in the addressed context.                                                                 |
| `VariantNotFound`                    | lookup       | The requested product variant does not exist in the addressed context.                                                         |
| `OrderNotFound`                      | lookup       | The requested order does not exist for an internal operational lookup.                                                         |
| `OrderLookupFailed`                  | lookup       | Customer lookup by order reference and phone number failed; callers should not learn whether the reference or phone was wrong. |
| `InsufficientStock`                  | inventory    | The requested stock decrease or order quantity exceeds available sellable stock.                                               |
| `InvalidStatusTransition`            | state        | A requested lifecycle move is not allowed by the frozen state machine.                                                         |
| `IncompleteProductCannotPublish`     | product      | A `Draft` product is missing one or more publish preconditions such as price, variant, or photo.                               |
| `InvalidOrExpiredPasswordResetToken` | auth         | The supplied password reset token is unknown, expired, or already consumed.                                                    |
| `WeakPassword`                       | auth         | A new password fails the system's required strength rules.                                                                     |
| `NotificationDeliveryFailed`         | notification | A notification provider attempt failed to deliver the notification.                                                            |

## Auth And Access Errors

### `InvalidCredentials`

- use when login fails for unknown email or wrong password
- keep the canonical type the same for both cases so authentication does not
  reveal which part was wrong

### `AccountDisabled`

- use when a valid back-office account exists but is not allowed to authenticate
- this is distinct from `InvalidCredentials` because the account state is known

### `Unauthorized`

- use when the request has no valid authenticated session
- covers missing, destroyed, or expired sessions

### `Forbidden`

- use when an authenticated user lacks the required role or permission
- in MVP this most clearly applies to staff users trying to manage users

### `InvalidOrExpiredPasswordResetToken`

- use when a password reset token cannot be consumed because it is invalid,
  expired, or already used

### `WeakPassword`

- use when a replacement password fails the required strength policy

## Validation Error

### `ValidationFailed`

- use for malformed or missing required input when there is no better specific
  error type in this catalog
- examples include missing login fields, missing required order fields, invalid
  email format, malformed phone number, or non-positive order quantity
- when both `ValidationFailed` and a more specific business error could apply,
  prefer the more specific business error

## Lookup Errors

### `ProductNotFound`

- use when an addressed product cannot be found for back-office or public-detail
  workflows

### `VariantNotFound`

- use when an addressed variant cannot be found under the expected product or
  lookup context

### `OrderNotFound`

- use for internal back-office order lookups where disclosing non-existence is
  acceptable

### `OrderLookupFailed`

- use for customer-facing order lookup by `OrderReference` and `PhoneNumber`
- intentionally covers both "order does not exist" and "phone number does not
  match" so the lookup flow does not leak order existence details

## Inventory And Product Errors

### `InsufficientStock`

- use when order placement or manual stock decrease would push stock below the
  available sellable quantity

### `IncompleteProductCannotPublish`

- use when a `Draft` product does not satisfy the frozen publish preconditions
- missing price, missing variant, or missing photo all map to this canonical
  type

## State Error

### `InvalidStatusTransition`

- use when a requested order or product state move is not in
  `docs/domain-state-transitions.md`
- applies to forward skips, backward moves, and attempts to mutate terminal
  states

## Notification Error

### `NotificationDeliveryFailed`

- use when a provider attempt fails after a notification has been created and
  scheduled
- notification delivery failure must not roll back a valid order status update

## Selection Guidance

- Prefer `InvalidCredentials` over `ValidationFailed` when the login payload is
  syntactically valid but the credentials are wrong.
- Prefer `AccountDisabled` over `InvalidCredentials` when the account exists and
  is known to be disabled.
- Prefer `Unauthorized` over `Forbidden` when there is no valid authenticated
  session.
- Prefer `Forbidden` over `Unauthorized` when the caller is authenticated but
  lacks permission.
- Prefer `OrderLookupFailed` over `OrderNotFound` in customer-facing lookup
  flows.
- Prefer `InvalidStatusTransition` over `ValidationFailed` when the input is
  syntactically valid but violates the lifecycle rules.

## Not In Scope For This Catalog

- transport-only infrastructure failures such as database outage, timeout, or
  unknown internal server errors
- HTTP response envelope shape
- frontend screen copy, i18n wording, or inline field-message phrasing

Those concerns can map from this catalog later, but they are not themselves
canonical domain error types.

## Related Decisions

- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-aggregates.md`
- `docs/domain-services.md`
- `docs/domain-state-transitions.md`
- `docs/order-statuses.md`
- `docs/product-lifecycle.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
