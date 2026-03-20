# Domain Glossary

This document freezes the Solange Bernard MVP domain glossary and ubiquitous
language as of March 20, 2026.

It is the source of truth for the business terms used across the BDD pack,
contracts, domain package, persistence model, and UI copy.

## Usage Rule

- Use these names consistently in docs, code, contracts, tests, and data model
  discussions.
- When a technical name differs from the preferred business wording, keep the
  technical name mapped back to this glossary instead of inventing a second
  concept.
- Lifecycle, actor, and inventory rules stay in the related freeze docs listed
  at the end of this file.

## Catalog Terms

### Product

- customer-facing sellable catalog record managed by staff or admin users
- owns descriptive catalog data such as name, description, category, status,
  variants, and media
- starts in `Draft` and becomes public only when `Published`
- exists independently from any single variant or photo

### ProductVariant

- specific purchasable option under a `Product`, such as a size and color
  combination
- inventory is tracked per variant
- ordering selects a variant, not only a parent product
- out-of-stock variants are not orderable

### ProductMedia

- media asset attached to a `Product`, currently used as product photos in MVP
- supports public catalog/detail presentation and back-office media management
- one media item can be designated as the main photo
- at least one product photo is required before a product can be `Published`

## Inventory Term

### InventoryAdjustment

- durable record of a manual stock increase or decrease for one
  `ProductVariant`
- created by a staff or admin action, not by initial order placement or
  cancellation
- should capture the variant, quantity delta, reason or context, actor, and
  timestamp
- forms the inventory history for the variant

## Ordering Terms

### Order

- customer-submitted purchase record created without a customer account in MVP
- contains customer contact information, at least one order item, a current
  order status, and back-office operational data such as internal notes
- starts in `PendingConfirmation`
- reserves variant stock immediately when created
- is looked up by order reference and phone number

### OrderItem

- line item inside an `Order` for a specific product variant and quantity
- should represent the ordered snapshot, not only a live pointer to current
  product data
- carries enough information to explain what was ordered even if the catalog
  later changes

### OrderStatus

- canonical lifecycle value for an `Order`
- MVP statuses are `PendingConfirmation`, `Confirmed`, `ReadyForDelivery`,
  `Delivered`, and `Cancelled`
- display labels and allowed transitions are defined in
  `docs/order-statuses.md`
- notification behavior reacts to status changes without introducing extra
  order states

### CustomerContact

- customer-supplied contact and delivery details attached to an `Order`
- minimum MVP fields are full name, phone number, delivery area, and delivery
  address
- is used for order placement, order lookup, and customer notifications
- is not a customer account

## Back-Office Identity Terms

### AdminUser

- internal authenticated back-office account record used by the protected auth
  system
- can carry either the `staff` role or the `admin` role
- keeps a historical technical name in the repo even though business language
  distinguishes the two roles
- owns credentials, account status, sessions, and password reset flows

### Role

- authorization value attached to an `AdminUser`
- MVP roles are `staff` and `admin`
- `admin` is a strict superset of `staff`
- `customer` is an actor, not a back-office role on `AdminUser`

### PasswordResetToken

- time-bounded reset credential issued for one `AdminUser`
- exists only for back-office password recovery
- becomes unusable when expired, invalid, or already consumed
- successful password reset invalidates prior authenticated sessions for that
  user

## Notification Terms

### Notification

- customer-facing message record created when an order event should trigger
  outbound communication
- is linked to an `Order` and the relevant `CustomerContact` data
- is queued and tracked inside the platform before or while a provider tries
  delivery
- must not be treated as the source of truth for order state

### NotificationAttempt

- immutable record of one provider delivery try for a `Notification`
- stores the outcome of that attempt, such as sent or failed, plus operational
  detail useful for retry and debugging
- multiple attempts can exist for the same notification over time
- retrying a notification creates another attempt rather than erasing previous
  ones

## Related Decisions

- `docs/mvp-scope.md`
- `docs/business-actors.md`
- `docs/product-lifecycle.md`
- `docs/order-statuses.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
