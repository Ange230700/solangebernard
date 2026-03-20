# Inventory Behavior

This document freezes the Solange Bernard MVP inventory behavior as of March
20, 2026.

It is the source of truth for how stock is tracked, consumed, restored, and
manually adjusted.

## Inventory Unit

- Inventory is tracked per product variant, not only per product.
- Stock is counted in whole sellable units.
- The stock number shown to the system is the current sellable quantity for that
  variant.

## Core Rules

- Order creation reserves stock immediately.
- In MVP, "reserve stock" and "reduce sellable stock" are the same operation.
- Order creation must fail if the requested quantity exceeds available stock.
- Cancellation must restore the quantity that the order previously reserved.
- Stock must never go negative.

## Order-Creation Rule

When a customer places an order successfully:

- the selected variant stock is reduced immediately
- the order is created with status `PendingConfirmation`
- the stock change and order creation must succeed or fail together

This means the MVP does not keep a second separate "reserved stock" bucket. The
reserved quantity is represented by the reduced sellable stock plus the order
record that holds the reserved quantity context.

## Cancellation Rule

- Cancelling an order restores the quantity that order reserved.
- The restored quantity returns to the same product variant.
- Restoration applies to cancellation flows, not to successful delivery flows.
- Inventory restoration should happen once for a given cancellation, not
  repeatedly on later updates.

## Manual Adjustment Rule

- Staff and admins can increase stock manually.
- Staff and admins can decrease stock manually.
- Every manual increase or decrease must create an inventory history entry.
- Manual decreases must be rejected if they would push stock below zero.

## Availability Rule

- Out-of-stock variants cannot be ordered.
- Public product detail can show stock availability and low-stock messaging.
- Public catalog and ordering flows must reflect the current variant stock state.

## Not In MVP

- negative stock
- backorders
- overselling
- separate warehouse-location inventory pools
- separate reserved-vs-available inventory ledgers
- real-time marketplace or external channel stock sync

## Naming Rule

- Use `stock` as the default business term in MVP docs and UI.
- When the repo says an order "reserves" stock, treat that as the same event as
  reducing the sellable stock count.
- Do not introduce extra MVP concepts such as `allocations`, `holds`,
  `backorderable stock`, or `safety stock` unless the repo later requires them.

## Repo Alignment

Current repo signals already support this model:

- `TASKS.md` says order creation reserves stock immediately, cancellation
  restores stock, and stock cannot go negative
- `docs/bdd/mvp/orders/place-order.feature` says successful order placement
  reduces stock immediately and rejects over-ordering
- `docs/bdd/mvp/orders/order-management.feature` says cancellation restores the
  reserved quantity
- `docs/bdd/mvp/inventory/inventory-adjustments.feature` says manual stock
  changes are recorded and negative stock is blocked

This document freezes those rules into one MVP inventory model.
