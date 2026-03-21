# Deletion Rules

This document freezes the Solange Bernard MVP soft-delete and hard-delete
policy as of March 21, 2026.

It is the source of truth for how the repo should remove data from active use,
preserve historical records, and allow limited technical cleanup.

## Usage Rule

- Prefer the smallest policy that preserves customer, operational, and audit
  history.
- Distinguish "remove from active workflows" from "physically delete from
  storage."
- Do not introduce a generic `deletedAt`, recycle bin, or `Archived` behavior
  unless a later task explicitly freezes that model.

## Repo Signals

- `Product` already uses `Draft` and `Published`, with unpublish returning a
  product to `Draft`.
- `AdminUser` already has `isActive`, which supports deactivation without
  deleting the account row.
- `InventoryAdjustment`, `Order`, `OrderItem`, `Notification`, and
  `NotificationAttempt` already behave like durable history-bearing records in
  the current domain docs and Prisma schema.
- MVP scope already includes product media removal, but it does not include
  order deletion, inventory-history deletion, or notification-history
  deletion.

## Decision Summary

| Record               | MVP delete rule                             | Preferred action                                        | Notes                                                       |
| -------------------- | ------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `AdminUser`          | no hard delete in normal MVP flows          | deactivate via `isActive = false`                       | preserve auth and audit references                          |
| `AdminSession`       | hard delete allowed only for technical cleanup | invalidate first, then purge expired or invalidated rows later | transient auth record, not durable business history         |
| `PasswordResetToken` | hard delete allowed only for technical cleanup | consume or expire first, then purge spent rows later    | transient auth record, not durable business history         |
| `Product`            | no hard delete in MVP                       | unpublish back to `Draft`                               | no generic soft-delete column or archive status             |
| `ProductVariant`     | no general delete flow in MVP               | edit draft data, set stock to `0`, or unpublish product | keep order and inventory references stable                  |
| `ProductMedia`       | hard delete allowed                         | remove the media row and backing file                   | published products must still satisfy publish invariants    |
| `InventoryAdjustment`| never delete                                | append-only history                                     | preserve the inventory audit trail                          |
| `Order`              | never delete                                | cancel instead of delete                                | preserve customer and back-office history                   |
| `OrderItem`          | never delete                                | keep with its parent `Order`                            | preserve order-time snapshot meaning                        |
| `Notification`       | never delete                                | update status or retry instead of delete                | preserve operational customer-communication history         |
| `NotificationAttempt`| never delete                                | append another attempt instead of deleting              | preserve retry and provider-debug history                   |

## Back-Office Identity Rules

- `AdminUser` accounts stay in the database in MVP. Disabling access uses
  `isActive = false`, not row deletion.
- `AdminSession` records are invalidated or expire first. A later cleanup job
  may hard-delete expired or invalidated sessions because they are technical
  credentials rather than durable business history.
- `PasswordResetToken` records are consumed or expire first. A later cleanup
  job may hard-delete expired or consumed tokens because they are technical
  credentials rather than durable business history.

## Catalog Rules

- Removing a product from sale uses unpublish, not delete.
- MVP does not add a product-level `deletedAt`, recycle bin, or `Archived`
  status.
- `ProductVariant` rows are not a general delete target in MVP. If the team
  needs a variant out of sale, use draft editing, stock changes, or unpublish
  the parent product.
- `ProductMedia` removal is allowed because media is replaceable content rather
  than durable business history. But media removal must not leave a published
  product without the photos required to remain publishable. If the last
  required photo would be removed, unpublish first or reject the removal.

## Orders, Inventory, And Notification History Rules

- `InventoryAdjustment` is append-only operational history and must remain
  intact.
- `Order` and `OrderItem` are durable business records. Cancellation changes
  order state; it does not erase the order.
- `Notification` and `NotificationAttempt` are durable operational history.
  Status changes and retries update or add records; they do not delete prior
  history.

## Recommended Now

- unpublish products instead of deleting them
- deactivate back-office users instead of deleting them
- allow cleanup purges only for expired sessions and spent reset tokens
- preserve all order, inventory, and notification history

## Not Recommended Now

- generic `deletedAt` columns on every table
- introducing `Archived` as a product pseudo-delete state
- hard-deleting orders, inventory adjustments, notifications, or notification
  attempts
- cascading deletes from products into historical order data

## Maybe Later

- background cleanup for expired sessions and consumed reset tokens
- a stricter data-retention or privacy policy once real production obligations
  are defined
- a dedicated variant-retirement rule if catalog complexity grows beyond the
  MVP

## Related Decisions

- `docs/mvp-scope.md`
- `docs/product-lifecycle.md`
- `docs/domain-invariants.md`
- `docs/domain-glossary.md`
- `docs/inventory-behavior.md`
- `docs/order-statuses.md`
- `docs/bdd/mvp/traceability-sheet.md`
