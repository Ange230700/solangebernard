# Order Statuses

This document freezes the Solange Bernard MVP order state machine as of March
20, 2026.

It is the source of truth for canonical status names, display labels, and
allowed transitions.

## Canonical Statuses

| Enum value            | Display label          | Meaning                                                                                        | Terminal |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| `PendingConfirmation` | `Pending confirmation` | Order was created and stock was reserved. The back office still needs to confirm or cancel it. | No       |
| `Confirmed`           | `Confirmed`            | Order was accepted and is being prepared for fulfillment.                                      | No       |
| `ReadyForDelivery`    | `Ready for delivery`   | Order is ready to hand over, dispatch, or deliver.                                             | No       |
| `Delivered`           | `Delivered`            | Order reached the customer and is complete for MVP purposes.                                   | Yes      |
| `Cancelled`           | `Cancelled`            | Order will not be fulfilled. Reserved stock must be restored.                                  | Yes      |

## State Machine

- All newly created orders start in `PendingConfirmation`.
- `PendingConfirmation` can move to `Confirmed`.
- `PendingConfirmation` can move to `Cancelled`.
- `Confirmed` can move to `ReadyForDelivery`.
- `Confirmed` can move to `Cancelled`.
- `ReadyForDelivery` can move to `Delivered`.
- `ReadyForDelivery` can move to `Cancelled`.
- `Delivered` is terminal.
- `Cancelled` is terminal.

## Invalid Transitions

- `PendingConfirmation` cannot skip directly to `ReadyForDelivery` or
  `Delivered`.
- `Confirmed` cannot move back to `PendingConfirmation` or jump directly to
  `Delivered`.
- `ReadyForDelivery` cannot move back to `PendingConfirmation` or `Confirmed`.
- `Delivered` cannot move to any other status.
- `Cancelled` cannot move to any other status.

## Naming Rule

- Domain, contracts, persistence, and API payloads should use the enum values in
  this document.
- UI copy, customer-facing screens, and BDD scenarios should use the display
  labels in this document.
- `Pending confirmation` and `Ready for delivery` are the only approved display
  spellings for MVP.
- Do not introduce new status names such as `Pending`, `OutForDelivery`,
  `Shipped`, `Completed`, `Returned`, or `Refunded`.

## Operational Rule

- Customer order lookup should display the human-readable label, not the raw
  enum value.
- Notification behavior must react to status changes without creating extra
  order statuses.
- Payment, shipping, return, and refund sub-statuses are out of scope for MVP.

## Repo Alignment

Current repo signals already show the same lifecycle in two different forms:

- `TASKS.md` uses the enum-style values
- `docs/bdd/mvp/orders` uses the human-readable labels

This document intentionally keeps both forms so code and business language stay
aligned without adding extra statuses.
