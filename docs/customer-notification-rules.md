# Customer Notification Rules

This document freezes the Solange Bernard MVP customer notification behavior as
of March 22, 2026.

It is the source of truth for notification-triggering events, the MVP-first
delivery channel, and the non-blocking failure rule.

## Scope

- These rules apply to customer-facing notifications tied to order lifecycle
  events.
- These rules do not define internal operational alerts or back-office password
  reset messaging.

## MVP-First Channel

- `SMS` is the only customer notification channel that is required in MVP.
- Customer notification records should store `SMS` as the channel when a
  qualifying event is queued.
- Email, WhatsApp, or multi-channel fan-out are not required for MVP.

## Triggering Events

Queue one customer notification when an order reaches any of these states
through a valid lifecycle change:

| Event              | When it happens                       | Customer intent                                   |
| ------------------ | ------------------------------------- | ------------------------------------------------- |
| order confirmed    | `PendingConfirmation` -> `Confirmed`  | tell the customer the order was accepted          |
| ready for delivery | `Confirmed` -> `ReadyForDelivery`     | tell the customer the order is ready              |
| order delivered    | `ReadyForDelivery` -> `Delivered`     | tell the customer the order is complete           |
| order cancelled    | any allowed transition to `Cancelled` | tell the customer the order will not be fulfilled |

## Explicit Non-Triggers

- Creating an order in `PendingConfirmation` does not queue a separate customer
  notification in MVP because the order creation flow already returns the order
  reference and immediate confirmation to the customer.
- Inventory-only changes, internal notes, and back-office-only actions do not
  send customer notifications on their own.
- Re-saving the same status without a real lifecycle change does not send a new
  customer notification.

## Failure Rule

- Notification queueing or delivery failure must not roll back a valid order
  state change.
- The order remains in its new state even if the notification cannot be queued
  or delivered immediately.
- Failure must stay visible through notification records and attempt history so
  staff can retry later.

## Not In MVP

- channel preferences per customer
- parallel delivery to multiple channels
- provider callbacks that mutate order state
- notification-triggered business actions
- notification templates for events outside the order lifecycle list above

## Related Decisions

- `docs/order-statuses.md`
- `docs/domain-invariants.md`
- `docs/domain-state-transitions.md`
- `docs/domain-services.md`
- `docs/mvp-scope.md`
- `docs/bdd/mvp/notifications/order-status-notifications.feature`
