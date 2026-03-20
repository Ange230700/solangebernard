<!-- TASKS.md -->

# Tasks

## Ordered software engineering task list for **Solange Bernard**

This is the **real execution order**.
Not the fantasy order. Not the “let’s build everything” order. ⚙️

The goal is to ship a **working MVP** for:

- **public catalog**
- **guest ordering**
- **admin login**
- **product management**
- **inventory management**
- **order management**
- **customer notifications**
- **basic platform ops**

---

# 0. Lock the MVP before writing more code

## 1. Freeze the MVP scope

Official source of truth: [docs/mvp-scope.md](docs/mvp-scope.md)

Define exactly what is **in**:

- public catalog
- product detail
- variants
- guest order placement
- customer order lookup
- admin auth
- product CRUD
- media upload
- inventory adjustments
- order status management
- customer notifications
- health endpoint

Define exactly what is **out**:

- online payment gateway
- customer accounts
- carts across devices
- delivery provider integration
- promotions
- marketplace sync
- returns workflow
- analytics beyond basics
- multi-tenant anything

## 2. Freeze the business actors

Official source of truth: [docs/business-actors.md](docs/business-actors.md)

Write down the actors explicitly:

- customer
- staff
- admin
- notification provider

## 3. Freeze the order statuses

Official source of truth: [docs/order-statuses.md](docs/order-statuses.md)

Choose the exact state machine and stop changing it every two days:

- `PendingConfirmation`
- `Confirmed`
- `ReadyForDelivery`
- `Delivered`
- `Cancelled`

## 4. Freeze the product lifecycle

Official source of truth: [docs/product-lifecycle.md](docs/product-lifecycle.md)

Define product statuses:

- `Draft`
- `Published`
- maybe later `Archived`, but not necessary now

## 5. Freeze inventory behavior

Official source of truth: [docs/inventory-behavior.md](docs/inventory-behavior.md)

Decide now:

- does order creation reserve stock immediately?
  For your current BDD: **yes**
- does cancellation restore stock?
  **yes**
- can stock go negative?
  **no**

## 6. Freeze notification behavior

Decide:

- which events send customer notifications
- which delivery channel is MVP-first
- whether failure blocks order updates
  It **should not**

---

# 1. Turn the BDD pack into the official source of truth

## 7. Create the feature file structure in the repo

Add:

```text
docs/bdd/mvp/
  auth/
  catalog/
  orders/
  products/
  inventory/
  notifications/
  platform/
```

## 8. Move all existing `.feature` files into that structure

## 9. Review every scenario for duplicated or conflicting business rules

## 10. Normalize wording across features

Use one naming convention for:

- admin vs staff
- published vs draft
- pending confirmation vs pending
- ready for delivery vs out for delivery

## 11. Add tags consistently

Use tags like:

- `@web`
- `@mobile`
- `@desktop`
- `@api`
- `@auth`
- `@catalog`
- `@orders`
- `@inventory`
- `@products`
- `@notifications`
- `@mvp`
- `@critical`
- `@smoke`

## 12. Mark critical scenarios

Identify the must-not-break flows:

- admin login
- public catalog loads
- order creation
- order confirmation
- stock restoration on cancellation
- notification queued after status changes

## 13. Derive a traceability sheet

Derived sheet: [docs/bdd/mvp/traceability-sheet.md](docs/bdd/mvp/traceability-sheet.md)

Map each feature/scenario to:

- domain object
- API endpoint
- frontend screen
- test type

---

# 2. Define the domain properly before building endpoints blindly

## 14. Create a domain glossary

Official source of truth: [docs/domain-glossary.md](docs/domain-glossary.md)

Define the ubiquitous language:

- Product
- ProductVariant
- ProductMedia
- InventoryAdjustment
- Order
- OrderItem
- OrderStatus
- CustomerContact
- AdminUser
- Role
- Notification
- NotificationAttempt
- PasswordResetToken

## 15. Define domain invariants

Official source of truth: [docs/domain-invariants.md](docs/domain-invariants.md)

Examples:

- unpublished products are invisible publicly
- published products must have at least one photo
- published products must have at least one variant
- stock cannot be negative
- out-of-stock variants cannot be ordered
- cancelled orders restore reserved stock
- notification failure does not roll back order status update

## 16. Define aggregates

Official source of truth: [docs/domain-aggregates.md](docs/domain-aggregates.md)

At minimum:

- `Product` aggregate
- `Order` aggregate
- `AdminUser` aggregate
- maybe `Notification` aggregate
- maybe `Inventory` as part of `ProductVariant` or its own boundary

## 17. Define domain services

Official source of truth: [docs/domain-services.md](docs/domain-services.md)

Examples:

- order placement service
- stock reservation service
- stock restoration service
- order status transition service
- notification scheduling service

## 18. Define value objects

Official source of truth:
[docs/domain-value-objects.md](docs/domain-value-objects.md)

Examples:

- `Money`
- `PhoneNumber`
- `EmailAddress`
- `OrderReference`
- `ProductSku`
- `PasswordHash`

## 19. Define allowed state transitions

Write them down explicitly.

For orders:

- pending → confirmed
- confirmed → ready for delivery
- ready for delivery → delivered
- pending/confirmed/ready → cancelled
- delivered → not reversible in MVP

## 20. Define error types

Examples:

- invalid credentials
- unauthorized
- forbidden
- product not found
- variant not found
- insufficient stock
- invalid status transition
- incomplete product cannot publish
- notification delivery failure

---

# 3. Shape the packages in the monorepo correctly

## 21. Clean the workspace boundaries

Respect your own rules:

- `packages/contracts` = only shared contracts/types
- `packages/domain` = pure domain logic, no Angular/Nest
- `packages/api-client` = typed fetch client
- `apps/api` = transport + orchestration
- `apps/client` = UI only

## 22. Decide if `projects/core` becomes shared app logic or UI-agnostic Angular helpers

## 23. Decide if `projects/ui-web` is only for `web` and `desktop`

It should **not** leak into `mobile`.

## 24. Define import boundaries

Set lint or tooling rules so:

- mobile cannot import `ui-web`
- domain cannot import Nest/Angular
- contracts stay transport-safe
- API cannot dump DB models directly into clients

## 25. Add path aliases and keep them stable

## 26. Add architecture docs for the monorepo

A short `ARCHITECTURE.md` is enough.

---

# 4. Design the data model

## 27. Choose the database

If not decided yet, choose one and stop delaying.
For this type of system, **PostgreSQL** is the sane default.

## 28. Choose the ORM or query layer

Pick one:

- Prisma
- Drizzle
- Kysely
- raw SQL

Do not waste weeks debating it.

## 29. Model the tables/entities

At minimum:

- admins
- admin_sessions or tokens
- password_reset_tokens
- products
- product_variants
- product_media
- inventory_adjustments
- orders
- order_items
- notifications
- notification_attempts

## 30. Define unique keys and indexes

Examples:

- unique admin email
- unique order reference
- unique SKU
- index orders by status
- index notifications by status
- index published products
- index variants by product

## 31. Define timestamps everywhere important

Use created/updated timestamps consistently.

## 32. Decide soft-delete vs hard-delete rules

MVP recommendation:

- products: soft-ish via status/unpublish
- orders: never hard-delete
- inventory adjustments: never delete
- notifications: never delete

## 33. Write the initial database migration plan

## 34. Seed minimum development data

Seed:

- admin user
- a few products
- variants
- draft and published products
- sample orders
- sample notifications

---

# 5. Define the API contracts first

## 35. Create contract slices in `packages/contracts`

Suggested folders:

- `auth`
- `products`
- `inventory`
- `orders`
- `notifications`
- `health`

## 36. Define request/response DTO contracts

Examples:

- login request/response
- list products response
- product detail response
- create order request/response
- list orders response
- update order status request
- inventory adjustment request
- retry notification request

## 37. Define shared enums centrally

Examples:

- role
- product status
- order status
- notification status

## 38. Define pagination shape

Even if MVP endpoints are small, standardize now.

## 39. Define error response shape

Use one predictable structure.

## 40. Define auth session contract

Decide cookie vs token shape.

## 41. Define public vs protected contract folders if needed

---

# 6. Build the API skeleton in `apps/api`

## 42. Create module structure

Suggested modules:

- health
- auth
- admin-users
- products
- inventory
- orders
- notifications

## 43. Add global validation

Input validation must exist from day one.

## 44. Add global error handling

Return stable error responses.

## 45. Add configuration management

Environment variables for:

- database URL
- auth secret
- notification provider config
- frontend origins
- app env

## 46. Add CORS configuration for web/mobile/desktop clients

## 47. Add health controller

Implement `/health`.

## 48. Add request logging middleware/interceptor

## 49. Add consistent response mapping where needed

---

# 7. Implement authentication and authorization first

## 50. Implement admin user persistence

## 51. Implement password hashing

## 52. Implement login endpoint

## 53. Implement authenticated session creation

Choose one:

- secure cookie session
- JWT with refresh flow

For your use case, **cookie session for web/desktop** can be simpler.

## 54. Implement auth guard

## 55. Implement role guard

At minimum:

- `admin`
- `staff`

## 56. Implement logout

## 57. Implement “current user” endpoint

## 58. Implement password reset request endpoint

## 59. Implement password reset token generation and expiry

## 60. Implement password reset confirm endpoint

## 61. Invalidate old sessions after password reset

## 62. Write auth integration tests

Cover:

- valid login
- invalid login
- disabled user
- protected route rejection
- staff/admin authorization
- password reset

---

# 8. Implement products and catalog

## 63. Implement public product listing endpoint

## 64. Implement product detail endpoint

## 65. Ensure only published products are public

## 66. Add category filtering

## 67. Add variant availability in product detail response

## 68. Add admin create product endpoint

## 69. Add admin update product endpoint

## 70. Add admin list products endpoint

## 71. Add publish product endpoint

## 72. Add unpublish product endpoint

## 73. Enforce publish validation

Cannot publish unless:

- price exists
- at least one variant exists
- at least one main photo exists

## 74. Implement product media upload handling

Even if local/dev-only first.

## 75. Implement main-photo selection

## 76. Implement media deletion

## 77. Add product API tests

Cover:

- public only sees published
- publish blocked when incomplete
- publish success when complete
- unpublish removes from public listing

---

# 9. Implement inventory properly

## 78. Model variant stock clearly

## 79. Implement inventory adjustment endpoint

## 80. Record adjustment history on every manual stock change

## 81. Prevent negative stock

## 82. Add inventory history endpoint

## 83. Add inventory list or per-product inventory view

## 84. Add inventory integration tests

Cover:

- stock increase
- stock decrease
- insufficient stock
- history entry created

---

# 10. Implement order placement and lifecycle

## 85. Implement create order endpoint

## 86. Validate required customer fields

At minimum:

- full name
- phone number
- delivery area
- delivery address

## 87. Validate selected variant exists

## 88. Validate requested quantity > 0

## 89. Validate enough stock exists

## 90. Reserve/reduce stock atomically during order creation

## 91. Generate human-readable order references

## 92. Store ordered item snapshot data

Do not rely only on future product state.

Store:

- product name at order time
- variant label
- unit price at order time

## 93. Implement order lookup endpoint for customers

Based on:

- order reference
- phone number

## 94. Implement admin list orders endpoint

## 95. Add order filtering by status

## 96. Add order detail endpoint

## 97. Implement update order status endpoint

## 98. Enforce valid status transitions

## 99. Implement cancellation with stock restoration

## 100. Implement internal notes on orders

## 101. Add order integration tests

Cover:

- happy path order
- insufficient stock
- missing fields
- lookup with correct/incorrect phone
- valid/invalid status transitions
- cancellation restores stock

---

# 11. Implement notifications without making them the system core

## 102. Choose the first notification channel

One only for MVP-first implementation:

- email
- SMS
- WhatsApp via provider

## 103. Define notification templates

Templates for:

- order created
- order confirmed
- ready for delivery
- delivered
- cancelled

## 104. Implement notification queue/record model

## 105. Trigger notification creation on order events

## 106. Implement provider adapter boundary

Do not hard-wire provider code everywhere.

## 107. Implement delivery attempt recording

## 108. Mark notification as sent/failed

## 109. Implement admin retry notification action

## 110. Ensure notification failure does not roll back order update

## 111. Add notification tests

Cover:

- event queues notification
- success marks sent
- failure marks failed
- retry creates new attempt
- order state remains updated even if notification fails

---

# 12. Build the shared API client

## 112. In `packages/api-client`, create typed functions for:

- login
- logout
- get current user
- request password reset
- confirm password reset
- list public products
- get public product detail
- create order
- lookup order
- list admin products
- create/update/publish/unpublish product
- upload/remove/set main product media
- adjust inventory
- get inventory history
- list orders
- get order detail
- update order status
- retry notification
- health check

## 113. Standardize auth handling in the API client

## 114. Standardize error parsing in the API client

## 115. Add tests for the API client where useful

---

# 13. Build the web app first for public flows

## 116. Create the public app shell for `web`

## 117. Add catalog page

## 118. Add category filter UI

## 119. Add product detail page

## 120. Add variant selector UI

## 121. Add order form UI

## 122. Add order success state UI

## 123. Add order lookup page

## 124. Add basic loading/error/empty states everywhere

## 125. Add responsive layout fixes

## 126. Add basic form validation UX

## 127. Connect the web app to the API client

## 128. Add public web E2E smoke tests

Cover:

- catalog opens
- product page loads
- order placed
- order lookup works

---

# 14. Build the desktop admin app next

## 129. Create the desktop app shell

## 130. Add admin login screen

## 131. Add protected routing

## 132. Add dashboard shell

Even if minimal.

## 133. Add product list screen

## 134. Add create/edit product screen

## 135. Add media management screen

## 136. Add publish/unpublish actions

## 137. Add inventory screen

## 138. Add inventory adjustment form

## 139. Add inventory history view

## 140. Add orders list screen

## 141. Add order detail screen

## 142. Add status update actions

## 143. Add internal notes UI

## 144. Add notification status/retry UI if included in MVP UI

## 145. Add current-user/logout flows

## 146. Add desktop admin E2E smoke tests

Cover:

- login
- create product
- publish product
- adjust stock
- confirm order

---

# 15. Build the mobile app only for the necessary customer-facing slice

## 147. Create the mobile app shell

## 148. Add mobile catalog page

## 149. Add mobile product detail page

## 150. Add mobile order form

## 151. Add mobile order lookup page

## 152. Apply Ionic-native UI adaptations

## 153. Verify API auth assumptions do not break mobile public flows

## 154. Add mobile smoke tests or at least manual QA checklist

---

# 16. Add file/media infrastructure

## 155. Decide media storage strategy

For MVP:

- local dev storage locally
- production object storage/CDN later

## 156. Implement upload constraints

Validate:

- file type
- size
- maybe dimensions later

## 157. Implement media URL exposure

## 158. Implement orphan media cleanup strategy

At least manual or scheduled cleanup plan.

---

# 17. Add quality gates

## 159. Set up repo-wide formatting and lint enforcement

## 160. Ensure root scripts work for:

- build
- typecheck
- lint
- test

## 161. Add missing root-level scripts if not already present

## 162. Add `packages/domain` unit tests

This is where most business rules belong.

## 163. Add API integration tests

## 164. Add a few E2E tests only

Do not turn everything into browser E2E tests.

## 165. Add contract drift checks if possible

## 166. Add test data builders/fixtures

## 167. Add CI pipeline

At minimum:

- install
- lint
- typecheck
- test
- build

## 168. Make CI fail on broken boundaries or broken contracts

---

# 18. Add security basics before production

## 169. Secure secrets and env handling

## 170. Hash passwords correctly

## 171. Add rate limiting to auth endpoints

## 172. Add brute-force mitigation for login/reset flows

## 173. Validate and sanitize uploads

## 174. Lock down CORS properly

## 175. Avoid leaking internal errors to clients

## 176. Add audit-ish logging for critical admin actions

At least:

- login
- publish/unpublish product
- inventory adjustments
- order status changes
- password reset completion

## 177. Review authorization on every admin route

Do not assume guards are correct.

---

# 19. Add observability and operations

## 178. Add structured logging

## 179. Add error monitoring

## 180. Add request correlation IDs if possible

## 181. Add health check to deployment environment

## 182. Add startup failure checks for required env vars

## 183. Add backup strategy for the database

## 184. Add restore test for backups

A backup you cannot restore is fake.

## 185. Add basic metrics or admin reporting later only if needed

---

# 20. Deployment and release setup

## 186. Define environments

At minimum:

- local
- staging
- production

## 187. Create deployment scripts/pipelines for the API

## 188. Create deployment path for the web app

## 189. Define how the desktop app is packaged and distributed

## 190. Define how mobile builds are generated and tested

## 191. Define DB migration process per environment

## 192. Define seed strategy for non-production environments

## 193. Define rollback strategy

---

# 21. Manual QA and launch prep

## 194. Create a QA checklist per feature area

For:

- auth
- catalog
- ordering
- inventory
- orders
- notifications

## 195. Test with realistic product data

## 196. Test with realistic low-stock scenarios

## 197. Test failed notification scenarios

## 198. Test slow network behavior on web/mobile

## 199. Test image-heavy product pages

## 200. Test desktop admin workflows end to end with actual seeded data

## 201. Run a pilot with real staff usage before public launch

---

# 22. Post-MVP hardening tasks

## 202. Clean technical debt created during MVP rush

## 203. Refine role permissions if staff/admin boundaries are too loose

## 204. Add better search/filtering for products and orders

## 205. Add analytics dashboard only after real usage proves the need

## 206. Add customer account system only if guest flow becomes limiting

## 207. Add payment integration only when order volume justifies it

## 208. Add delivery integration only when manual ops becomes painful

## 209. Add marketplace sync only after your internal catalog/inventory is trustworthy

---

# Critical path

If you need the **strict shortest path**, it is this:

1. freeze MVP rules
2. formalize BDD
3. define domain + contracts
4. model database
5. build auth
6. build products/catalog
7. build inventory
8. build order placement
9. build order admin lifecycle
10. build notifications
11. build web public UI
12. build desktop admin UI
13. test + secure + deploy

---

# What you should build first in code

## First concrete coding order

### Batch 1

- domain enums and invariants
- contracts
- DB schema
- Nest app skeleton
- `/health`

### Batch 2

- auth module
- admin login/logout/current user
- guards/roles

### Batch 3

- products + variants + media
- publish/unpublish
- public catalog endpoints

### Batch 4

- inventory adjustments + history

### Batch 5

- create order + stock reservation
- order lookup
- order status transitions + cancellation restore

### Batch 6

- notification queue + provider adapter + retry

### Batch 7

- web public flows

### Batch 8

- desktop admin flows

### Batch 9

- mobile customer flows

### Batch 10

- CI, security, observability, deploy, QA

---

# What not to do yet

Do **not** waste time on:

- microservices
- event bus theater
- real-time stock sync
- customer accounts
- dashboards before real data
- overdesigned design system
- advanced caching
- mobile-first native complexity
- offline mode
- multi-store / multi-tenant anything

That is how small teams burn time and ship nothing. 🔥

---

# Clean deliverable structure for your repo

## `packages/contracts`

- auth contracts
- product contracts
- inventory contracts
- order contracts
- notification contracts
- shared enums/errors

## `packages/domain`

- entities / aggregates
- value objects
- domain services
- invariants
- transition rules
- unit tests

## `packages/api-client`

- typed fetch client
- auth-aware client helpers
- endpoint wrappers
- error parsing

## `apps/api`

- Nest modules
- persistence
- controllers
- guards
- orchestration
- integration tests

## `apps/client/projects/web`

- public catalog
- product detail
- place order
- order lookup

## `apps/client/projects/desktop`

- login
- dashboard shell
- products
- media
- inventory
- orders
- notification retry

## `apps/client/projects/mobile`

- public catalog
- product detail
- place order
- order lookup

---

# Done criteria for MVP

You are done when all of this is true:

- admin can log in securely
- public users can browse published products
- users can place an order without an account
- stock decreases on order creation
- staff can adjust stock manually
- staff can manage order statuses
- cancellation restores stock
- customer can look up order status
- notifications are queued/sent on order events
- failed notifications are visible and retryable
- web and desktop core flows work
- builds, typecheck, lint, tests, and deployment pipeline all pass

---

# Brutal truth

Your biggest risk is **not code**.
It is **scope drift + messy business rules + weak data discipline**.

So the real order is:

**rules → domain → contracts → persistence → API → UI → ops**

Not:

**UI first → random endpoints → patch logic later**

That second path always turns into garbage.
