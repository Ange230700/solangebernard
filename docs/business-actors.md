# Business Actors

This document freezes the Solange Bernard MVP business actors and role boundary
as of March 20, 2026.

It is the source of truth for who interacts with the system and what each actor
is allowed to do.

There are only four MVP actors:

- customer
- staff
- admin
- notification provider

## Actor Definitions

### Customer

- external actor
- does not need an account
- can browse published products
- can view product details and variants
- can place a guest order
- can look up an order by order reference and phone number
- can receive order notifications
- cannot access back-office surfaces

### Staff

- internal authenticated back-office actor
- uses the same protected auth system as admin users
- can manage products and product media
- can manage inventory adjustments and inventory history
- can manage orders, status changes, and internal notes
- can review notification status and perform operational retry actions
- cannot manage back-office users or roles

### Admin

- internal authenticated back-office actor
- has every staff capability
- can access user-management routes and other elevated account-management
  actions
- exists to manage internal access and sensitive administration, not to create a
  separate day-to-day operating workflow

### Notification Provider

- external system actor
- receives notification delivery requests from the platform
- returns delivery outcomes such as sent or failed
- does not own product, inventory, order, or user state
- cannot trigger business actions on its own

## Permission Freeze

- `customer` is the only public actor.
- `staff` and `admin` are the only protected back-office roles in MVP.
- `admin` is a strict superset of `staff`.
- Product, inventory, order, and notification operations are staff-or-admin
  actions.
- User management is admin-only.
- There is no separate MVP actor for finance, delivery partner, customer support,
  or tenant owner.

## Naming Rule

- `admin auth` in the backlog means protected back-office authentication, not
  "only admins may sign in."
- The codebase may still use names such as `AdminUser` for the internal account
  record.
- In business language, `staff` and `admin` are the two internal roles carried
  by that authenticated account.

## Repo Alignment

Current repo signals already confirm:

- `customer` handles catalog, ordering, and order lookup flows in
  `docs/bdd/mvp/catalog` and `docs/bdd/mvp/orders`
- `staff` can manage orders and inventory, but cannot manage users, in
  `docs/bdd/mvp/auth/admin-authorization.feature`
- `admin` can manage users in
  `docs/bdd/mvp/auth/admin-authorization.feature`
- back-office product, inventory, and order features describe the operator as a
  `staff member`, even where some background steps still say `admin user`

This document resolves that wording mismatch by treating `staff` as the normal
operational role and `admin` as the elevated superset role.
