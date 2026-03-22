# Domain State Transitions

This document freezes the Solange Bernard MVP allowed domain state transitions
as of March 20, 2026.

It is the source of truth for which lifecycle moves are allowed, which are
forbidden, and which side effects matter when a state change happens.

## Usage Rule

- Use this document when implementing status changes in domain code, contracts,
  persistence, and tests.
- Treat a transition not listed here as disallowed unless another
  source-of-truth doc explicitly adds it later.
- Keep canonical status names aligned with the glossary and lifecycle docs
  linked at the end of this file.

## Order State Transitions

### Canonical Statuses

- `PendingConfirmation`
- `Confirmed`
- `ReadyForDelivery`
- `Delivered`
- `Cancelled`

### Allowed Order Transitions

| From                  | To                    | Allowed | Required side effects or notes                                                                                                     |
| --------------------- | --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| none                  | `PendingConfirmation` | Yes     | This is the only valid start state for a newly created order. Stock is reduced immediately when the order is created successfully. |
| `PendingConfirmation` | `Confirmed`           | Yes     | Confirms the order for fulfillment.                                                                                                |
| `PendingConfirmation` | `Cancelled`           | Yes     | Cancels the order and restores the reserved quantity to the same variant.                                                          |
| `Confirmed`           | `ReadyForDelivery`    | Yes     | Marks the order ready for handoff or delivery.                                                                                     |
| `Confirmed`           | `Cancelled`           | Yes     | Cancels the order and restores the reserved quantity to the same variant.                                                          |
| `ReadyForDelivery`    | `Delivered`           | Yes     | Completes the order for MVP purposes.                                                                                              |
| `ReadyForDelivery`    | `Cancelled`           | Yes     | Cancels the order and restores the reserved quantity to the same variant.                                                          |

### Forbidden Order Transitions

| From                  | To                    | Reason                                      |
| --------------------- | --------------------- | ------------------------------------------- |
| `PendingConfirmation` | `ReadyForDelivery`    | Cannot skip confirmation in MVP.            |
| `PendingConfirmation` | `Delivered`           | Cannot skip fulfillment preparation in MVP. |
| `Confirmed`           | `PendingConfirmation` | No rollback to the initial pending state.   |
| `Confirmed`           | `Delivered`           | Cannot skip the ready-for-delivery state.   |
| `ReadyForDelivery`    | `PendingConfirmation` | No backward move to earlier order states.   |
| `ReadyForDelivery`    | `Confirmed`           | No backward move to earlier order states.   |
| `Delivered`           | any other status      | `Delivered` is terminal in MVP.             |
| `Cancelled`           | any other status      | `Cancelled` is terminal in MVP.             |

### Order Transition Notes

- Order creation must succeed or fail together with stock reduction.
- Cancellation restores stock once for the reserved variant and quantity.
- Notification behavior may react to order transitions without creating new
  order statuses.
- Customer-facing screens should use the human-readable labels already frozen in
  `docs/order-statuses.md`.

## Product State Transitions

### Canonical Statuses

- `Draft`
- `Published`

### Allowed Product Transitions

| From        | To          | Allowed | Required side effects or notes                                                           |
| ----------- | ----------- | ------- | ---------------------------------------------------------------------------------------- |
| none        | `Draft`     | Yes     | This is the only valid start state for a newly created product.                          |
| `Draft`     | `Published` | Yes     | Allowed only when the product has a price, at least one variant, and at least one photo. |
| `Published` | `Draft`     | Yes     | This is the unpublish action. The product becomes back-office-only again.                |

### Forbidden Product Transitions

| From        | To                                               | Reason                                                       |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `Draft`     | any status other than `Published`                | No other product lifecycle statuses exist in MVP.            |
| `Published` | any status other than `Draft`                    | No other product lifecycle statuses exist in MVP.            |
| any state   | `Archived`                                       | `Archived` is not an MVP status.                             |
| any state   | `Scheduled`, `Hidden`, `Deleted`, `Discontinued` | These lifecycle states are not part of the frozen MVP model. |

### Product Transition Notes

- Failed publish attempts do not change the product state; the product remains
  in `Draft`.
- Only `Published` products may appear in public catalog and product detail
  flows.
- Unpublish does not delete the product, variants, or media.

## Constrained Lifecycles Without Frozen Status Enums

### PasswordResetToken

- The repo currently freezes behavior, not named token statuses.
- Allowed lifecycle moves are `issued -> consumed` and `issued -> expired`.
- Once consumed or expired, the token is terminal and unusable.
- This document does not introduce extra token status names such as
  `Active`, `Used`, or `Revoked` because the repo has not frozen them yet.

### Notification

- Valid order transitions to `Confirmed`, `ReadyForDelivery`, `Delivered`, and
  `Cancelled` can create queued customer notification records.
- `SMS` is the MVP-first customer notification channel.
- Notification failure does not roll back order state.
- This document still does not freeze a full notification delivery status
  machine; `docs/customer-notification-rules.md` only freezes the trigger
  matrix, channel choice, and non-blocking failure rule.

## Coordination Rule

- State changes that stay within one aggregate should be enforced by that
  aggregate.
- State changes that span aggregates should be coordinated through the domain
  services already frozen in `docs/domain-services.md`.
- In MVP, the main transition-linked cross-aggregate workflows are:
  order creation with stock reduction,
  order cancellation with stock restoration,
  and qualifying order status changes with notification scheduling.

## Related Decisions

- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-aggregates.md`
- `docs/domain-services.md`
- `docs/order-statuses.md`
- `docs/product-lifecycle.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
