# Domain Services

This document freezes the Solange Bernard MVP domain service catalog as of
March 20, 2026.

It is the source of truth for when the domain should use explicit services and
what each service is responsible for coordinating.

## Usage Rule

- Use a domain service when business logic spans more than one aggregate or
  when a shared domain policy must be reused across multiple workflows.
- Keep logic inside an aggregate when the rule belongs entirely to that
  aggregate's own consistency boundary.
- Keep transport, persistence, session, and provider-delivery mechanics outside
  the domain service layer.

## MVP Service Summary

| Service                         | Main aggregates involved                | Why it exists                                                                     | Key outcomes                                                                           |
| ------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `OrderPlacementService`         | `Order`, `Product`                      | order creation spans order shape plus stock reservation                           | create order in `PendingConfirmation`, reduce stock atomically, capture order snapshot |
| `StockReservationService`       | `Product`                               | reservation logic is reused by order-creation workflows                           | reject insufficient stock, reduce selected variant stock                               |
| `StockRestorationService`       | `Order`, `Product`                      | cancellation restoration must be precise and non-repeatable                       | restore reserved quantity once to the same variant                                     |
| `InventoryAdjustmentService`    | `Product`, `InventoryAdjustment` record | manual stock changes require both stock mutation and history recording            | apply stock delta, reject negative stock, record history entry                         |
| `OrderStatusTransitionService`  | `Order`, `Product`, `Notification`      | status changes can trigger cancellation restore and notification scheduling       | enforce allowed transitions, update status, trigger follow-up actions                  |
| `NotificationSchedulingService` | `Notification`, `Order`                 | notification creation has its own lifecycle separate from order state             | create notification records from qualifying order events                               |
| `PasswordResetService`          | `AdminUser`, `Notification`             | password recovery spans account state, reset token lifecycle, and reset messaging | issue tokens, consume valid tokens, invalidate prior sessions                          |

## OrderPlacementService

### Purpose

- coordinates guest order creation with stock reservation
- exists because `Order` owns order shape while `Product` owns variant stock

### Responsibilities

- validate that the selected product variant exists and is orderable
- validate required customer contact fields and requested quantity
- obtain or build the order-time snapshot fields needed by `OrderItem`
- create a new `Order` that starts in `PendingConfirmation`
- ensure stock reduction and order creation succeed or fail together

### Does Not Own

- public catalog querying
- notification delivery
- payment, shipping, or account creation flows, which are out of MVP scope

## StockReservationService

### Purpose

- applies the MVP reservation rule that reserving stock and reducing sellable
  stock are the same state change

### Responsibilities

- check the targeted `ProductVariant` stock level
- reject requests that exceed available stock
- reduce stock by the reserved quantity on the chosen variant

### Notes

- In MVP this service operates inside the `Product` boundary and is typically
  called by `OrderPlacementService`.
- It exists as a separate named policy because the backlog and invariants treat
  stock reservation as a first-class business rule.

## StockRestorationService

### Purpose

- restores reserved stock during valid cancellation flows

### Responsibilities

- confirm that the order is in a cancellable state
- identify the exact reserved variant and quantity from the order
- restore that quantity to the same `ProductVariant`
- prevent duplicate restoration on later updates to the same cancelled order

### Notes

- This service is normally invoked by `OrderStatusTransitionService` when a
  cancellation transition succeeds.

## InventoryAdjustmentService

### Purpose

- handles manual back-office stock changes that must also create history

### Responsibilities

- increase or decrease stock on a `ProductVariant`
- reject manual decreases that would push stock below zero
- create the matching `InventoryAdjustment` record with quantity delta, reason,
  actor, and timestamp context

### Notes

- The current stock remains owned by the `Product` aggregate.
- `InventoryAdjustment` stays an append-only supporting record rather than
  becoming its own aggregate root.

## OrderStatusTransitionService

### Purpose

- coordinates order lifecycle changes that can affect stock and notifications

### Responsibilities

- enforce the allowed `OrderStatus` state machine
- apply the new order status when the transition is valid
- call `StockRestorationService` when the transition is a cancellation
- invoke `NotificationSchedulingService` for qualifying order events

### Notes

- The `Order` aggregate remains the source of truth for fulfillment state.
- Notification failure must not roll back an already-valid order status update.

## NotificationSchedulingService

### Purpose

- turns qualifying order events into queued `Notification` records

### Responsibilities

- determine whether a given order event should create a notification in MVP
- build the notification using order context and recipient snapshot data
- create a new `Notification` ready for later provider delivery

### Notes

- This service schedules or records notifications; it does not talk directly to
  the external provider.
- Provider delivery and retry execution happen through adapters or application
  orchestration around the `Notification` aggregate.

## PasswordResetService

### Purpose

- coordinates the back-office password reset lifecycle

### Responsibilities

- create a reset token for a valid active `AdminUser`
- reject invalid, expired, or already-consumed reset tokens
- update credentials when a valid reset is completed
- invalidate prior authenticated sessions after a successful reset
- schedule the reset notification needed to deliver the recovery flow

### Notes

- Session issuance itself is not a domain service concern.
- Password hashing implementation details may sit behind value objects or
  adapters, while the reset lifecycle rules remain domain logic.

## Not Domain Services In MVP

- Product publish and unpublish validation can stay on the `Product` aggregate
  because the rule is local to product lifecycle consistency.
- Order note editing can stay on the `Order` aggregate because it does not span
  another aggregate.
- Login transport, cookie or token issuance, logout mechanics, and protected
  route guards are application or infrastructure concerns, even though they
  enforce domain rules.
- Notification provider delivery is an adapter boundary, not a domain service.
- Catalog listing, filtering, and read-model shaping are query concerns, not
  domain services.

## Coordination Rule

- Domain services should exchange aggregate IDs, snapshots, and domain values,
  not large shared object graphs.
- Service outputs should leave each aggregate in a valid post-condition state
  according to `docs/domain-invariants.md`.
- When a workflow spans aggregates, use domain services to express the business
  rule and let application orchestration handle persistence transactions or
  durable retries around it.

## Related Decisions

- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-aggregates.md`
- `docs/mvp-scope.md`
- `docs/business-actors.md`
- `docs/order-statuses.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
