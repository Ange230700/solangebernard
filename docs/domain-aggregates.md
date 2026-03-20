# Domain Aggregates

This document freezes the Solange Bernard MVP aggregate boundaries as of March
20, 2026.

It is the source of truth for which concepts are aggregate roots, what each
aggregate owns, and where cross-aggregate coordination should happen.

## Usage Rule

- Aggregate roots own consistency inside their boundary.
- Cross-aggregate work should use identifiers and services, not shared mutable
  object graphs.
- Persistence may use multiple tables per aggregate, but the consistency
  boundary in this document should stay stable unless the domain model changes
  materially.

## MVP Aggregate Summary

| Aggregate root | Owns directly                                                                                     | References by ID or snapshot                              | Primary consistency responsibilities                                  |
| -------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `Product`      | product details, `ProductVariant`, `ProductMedia`, current variant stock                          | back-office actor for audit context                       | product lifecycle, publish preconditions, non-negative stock          |
| `Order`        | `OrderItem`, `CustomerContact`, order status, order reference, internal notes                     | `Product`, `ProductVariant`, initiating back-office actor | order creation shape, order status transitions, customer lookup rules |
| `AdminUser`    | credentials, role, active or disabled state, password-reset lifecycle, session invalidation state | none required in MVP                                      | authentication and authorization identity rules                       |
| `Notification` | recipient snapshot, trigger context, queue state, `NotificationAttempt` history                   | `Order`, related status change, operator context          | notification record lifecycle and delivery-attempt history            |

## Product Aggregate

### Root

- `Product`

### Owns

- descriptive catalog fields such as name, description, category, and base
  price
- product lifecycle status
- `ProductVariant` children, including the current sellable stock for each
  variant
- `ProductMedia` children, including which media item is the main photo

### Enforces

- `PROD-001` through `PROD-005`
- `STOCK-001`, `STOCK-002`, and `STOCK-008`

### Boundary Decision

- Current sellable stock stays inside `ProductVariant` instead of creating a
  separate MVP `Inventory` aggregate.
- This matches the current domain glossary and keeps the MVP inventory model
  limited to per-variant stock with no warehouse pools, reservations ledger, or
  backorder rules.

### Cross-Aggregate References

- order placement and order cancellation reference the chosen
  `ProductVariant` by identifier and coordinate stock changes through a service
- inventory history records refer back to the affected `Product` and
  `ProductVariant` rather than becoming child aggregate roots

## Order Aggregate

### Root

- `Order`

### Owns

- order reference
- `OrderItem` children
- `CustomerContact`
- current `OrderStatus`
- internal notes and other back-office-only operational data

### Enforces

- `ORDER-001` through `ORDER-010`

### Boundary Decision

- `OrderItem` keeps order-time snapshot data for product name, variant label,
  price, and quantity so later catalog edits do not mutate the historical order
  meaning.
- The `Order` aggregate does not own live product catalog data or product stock.

### Cross-Aggregate References

- references `Product` and `ProductVariant` by identifier plus order-time
  snapshot fields
- order creation coordinates with the `Product` aggregate so stock reduction
  and order creation succeed or fail together
- order status updates coordinate with `Notification` creation, but the order
  remains the source of truth for fulfillment state

## AdminUser Aggregate

### Root

- `AdminUser`

### Owns

- login identifier such as email
- password hash or equivalent credential state
- `Role`
- active or disabled account status
- password-reset lifecycle state, including `PasswordResetToken`
  issuance and consumption rules
- session invalidation state needed to expire older sessions after password
  reset

### Enforces

- `AUTH-001` through `AUTH-007`

### Boundary Decision

- `staff` and `admin` are roles carried by one internal account model; they are
  not separate aggregates.
- `PasswordResetToken` is not an aggregate root in MVP. It belongs to the
  `AdminUser` account lifecycle even if stored in a separate table.

## Notification Aggregate

### Root

- `Notification`

### Owns

- recipient contact snapshot needed for delivery
- trigger context such as the related order event or status change
- queue or send status
- `NotificationAttempt` history

### Enforces

- `NOTIF-001` through `NOTIF-003`

### Boundary Decision

- `Notification` is its own aggregate instead of part of `Order` because
  delivery attempts, retry history, and provider interaction have a separate
  lifecycle from order fulfillment.
- This separation also preserves the invariant that notification failure does
  not roll back the order status update.

### Cross-Aggregate References

- references the related `Order` by identifier
- stores the delivery recipient as a snapshot so later order-contact edits do
  not erase what a given notification tried to send
- provider delivery happens outside the aggregate through an adapter or service

## Not Aggregate Roots In MVP

- `ProductVariant`: child entity inside the `Product` aggregate
- `ProductMedia`: child entity inside the `Product` aggregate
- `OrderItem`: child entity inside the `Order` aggregate
- `CustomerContact`: owned part of the `Order` aggregate
- `InventoryAdjustment`: append-only supporting record keyed to a
  `ProductVariant`, not an aggregate root
- `PasswordResetToken`: child record in the `AdminUser` lifecycle
- `NotificationAttempt`: child record inside the `Notification` aggregate
- `Role` and `OrderStatus`: value-like domain types, not aggregates

## Cross-Aggregate Coordination Rule

- Use services to coordinate work that spans more than one aggregate.
- In MVP, the main cross-aggregate workflows are:
  order placement between `Order` and `Product`,
  order cancellation between `Order` and `Product`,
  and order-status-triggered notification scheduling between `Order` and
  `Notification`.
- Keep the consistency rule local to the owning aggregate whenever possible,
  and use IDs plus transactions or durable orchestration only where a workflow
  truly spans boundaries.

## Related Decisions

- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/mvp-scope.md`
- `docs/business-actors.md`
- `docs/product-lifecycle.md`
- `docs/order-statuses.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
