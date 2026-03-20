# MVP Scope

This document freezes the Solange Bernard MVP scope as of March 20, 2026.

It defines the product boundary only. Detailed decisions for actors, status
lifecycles, inventory rules, and notification behavior stay in their own
task-sized docs and decisions.

## Goal

Ship one workable commerce baseline:

- customers can browse published products
- customers can place an order without creating an account
- customers can look up an existing order
- staff can operate the catalog, inventory, and order lifecycle
- the platform exposes the minimum operational signal needed to verify it is up

## In Scope

### Customer-facing scope

- public catalog of published products
- product detail page
- variant selection and stock visibility
- guest order placement
- customer order lookup by order reference and phone number

### Back-office scope

- admin authentication for protected back-office access
- product CRUD
- publish and unpublish product actions
- product media upload, removal, and main-photo selection
- manual inventory adjustments and inventory history
- order list, order detail, internal notes, and order status management

### Platform and messaging scope

- customer notifications for order lifecycle events
- notification records and retry handling through a provider boundary
- public API health endpoint

### Delivery surface scope

- `web` carries the public customer flows
- `desktop` carries the admin and staff back-office flows
- `mobile` is limited to the same customer-facing flows as `web`

## Out Of Scope

- online payment gateway
- customer accounts
- carts across devices
- delivery provider integration
- promotions
- marketplace sync
- returns workflow
- analytics beyond basics
- multi-tenant anything

## Scope Guardrails

- New work is not part of the MVP unless it directly supports an in-scope flow.
- Nice-to-have polish, automation, or native-specific features stay out unless
  they unblock an in-scope workflow.
- Manual or lightweight operations are acceptable in the MVP when they keep the
  core ordering and back-office flows shippable.

## Repo Alignment

The current BDD coverage already maps to most of this scope through:

- `docs/bdd/mvp/auth`
- `docs/bdd/mvp/catalog`
- `docs/bdd/mvp/orders`
- `docs/bdd/mvp/products`
- `docs/bdd/mvp/inventory`
- `docs/bdd/mvp/platform`

`customer notifications` remain in MVP scope even though dedicated BDD coverage
for that area still needs to be added.
