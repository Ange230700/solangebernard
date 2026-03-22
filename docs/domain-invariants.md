# Domain Invariants

This document freezes the Solange Bernard MVP domain invariants as of March 20, 2026.

An invariant is a rule the system must never violate. Domain code, API
validation, persistence, and tests should all preserve these rules.

## Usage Rule

- Treat these statements as always-true domain rules, not optional workflow
  suggestions.
- Use the invariant IDs in tests, contracts, code comments, and future design
  discussions when a rule needs to be referenced precisely.
- Related vocabulary and state-machine definitions stay in the glossary and
  task-sized freeze docs linked at the end of this file.

## Product And Catalog Invariants

- `PROD-001`: `Product.status` must be either `Draft` or `Published`.
- `PROD-002`: Only `Published` products may appear in public catalog or product
  detail flows.
- `PROD-003`: A product may move to `Published` only if it has a price, at
  least one `ProductVariant`, and at least one `ProductMedia` photo.
- `PROD-004`: If the publish preconditions are not met, publish must be
  rejected and the product must remain in `Draft`.
- `PROD-005`: Unpublishing moves a product from `Published` back to `Draft`
  without deleting the product, its variants, or its media.
- `PROD-006`: In MVP, removing a product from sale uses unpublish back to
  `Draft`; a general product hard-delete flow is out of scope.
- `PROD-007`: Removing `ProductMedia` is allowed, but a `Published` product
  must not be left without the photo coverage required by `PROD-003`.

## Inventory Invariants

- `STOCK-001`: Inventory is tracked per `ProductVariant` in whole sellable
  units.
- `STOCK-002`: `ProductVariant.stock` must never be negative.
- `STOCK-003`: An order may be created only if the selected variant exists and
  the requested quantity does not exceed available stock.
- `STOCK-004`: Order creation and stock reduction must succeed or fail
  together.
- `STOCK-005`: In MVP, reserving stock and reducing sellable stock are the same
  state change; there is no second reserved-stock ledger.
- `STOCK-006`: Cancelling an order restores exactly the quantity that order
  reserved to the same variant, and restoration must happen at most once for a
  given cancelled order.
- `STOCK-007`: Every manual stock increase or decrease must create an
  `InventoryAdjustment` history record.
- `STOCK-008`: Manual stock decreases that would push stock below zero must be
  rejected.
- `STOCK-009`: `InventoryAdjustment` records are append-only history and must
  not be deleted in normal MVP workflows.

## Order Invariants

- `ORDER-001`: An `Order` must contain at least one `OrderItem`.
- `ORDER-002`: Each `OrderItem.quantity` must be greater than zero.
- `ORDER-003`: `CustomerContact` on an order must include full name, phone
  number, delivery area, and delivery address.
- `ORDER-004`: Every new order starts in `PendingConfirmation`.
- `ORDER-005`: `Order.status` must always be one of the canonical statuses
  frozen in `docs/order-statuses.md`.
- `ORDER-006`: Order status transitions must follow only the allowed state
  machine:
  `PendingConfirmation -> Confirmed -> ReadyForDelivery -> Delivered`, with
  cancellation allowed from `PendingConfirmation`, `Confirmed`, or
  `ReadyForDelivery`.
- `ORDER-007`: `Delivered` and `Cancelled` are terminal order statuses.
- `ORDER-008`: Customer order lookup requires both the order reference and the
  matching phone number from `CustomerContact`.
- `ORDER-009`: Internal order notes are back-office data and must not be shown
  in customer-facing lookup flows.
- `ORDER-010`: `OrderItem` data must preserve enough order-time snapshot
  context that later catalog edits do not rewrite what the customer ordered.
- `ORDER-011`: `Order` and `OrderItem` records are durable business history and
  must not be soft-deleted or hard-deleted in MVP workflows.

## Back-Office Identity Invariants

- `AUTH-001`: Only `staff` and `admin` are valid back-office roles.
- `AUTH-002`: `admin` is a strict permission superset of `staff`.
- `AUTH-003`: Product, inventory, order, and notification operations require an
  authenticated `staff` or `admin` user; user management is admin-only.
- `AUTH-004`: Disabled back-office users cannot authenticate or create new
  sessions.
- `AUTH-005`: Protected back-office routes require a current authenticated
  session; unauthenticated or expired sessions must be rejected.
- `AUTH-006`: A `PasswordResetToken` belongs to exactly one `AdminUser`, is
  time-bounded, and becomes unusable after expiry or successful consumption.
- `AUTH-007`: A successful password reset must invalidate that user's prior
  authenticated sessions.
- `AUTH-008`: Back-office accounts are disabled via account state such as
  `isActive`; hard delete is not part of normal MVP account management.
- `AUTH-009`: `AdminSession` and `PasswordResetToken` rows may be hard-deleted
  only as technical cleanup after invalidation, expiry, or consumption.

## Notification Invariants

- `NOTIF-001`: A `Notification` must be linked to the `Order` event that
  triggered it and the customer contact data needed for delivery.
- `NOTIF-002`: Notification side effects must not be the source of truth for
  order state; if notification queueing or delivery fails, the order status
  update remains committed.
- `NOTIF-003`: A `NotificationAttempt` is append-only history for one
  `Notification`; retrying creates a new attempt rather than overwriting a
  previous one.
- `NOTIF-004`: `Notification` and `NotificationAttempt` records are operational
  history and must not be deleted in normal MVP workflows.

## Boundary Note

- This document freezes invariant rules.
- `docs/customer-notification-rules.md` freezes the exact MVP trigger list,
  channel choice, and failure-handling detail for customer notifications.

## Related Decisions

- `docs/domain-glossary.md`
- `docs/deletion-rules.md`
- `docs/mvp-scope.md`
- `docs/business-actors.md`
- `docs/product-lifecycle.md`
- `docs/order-statuses.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
