# MVP Traceability Sheet

This sheet maps the current MVP BDD scenarios to domain objects, target API
endpoints, target frontend screens, and expected test types.

## Reading Guide

- `Confirmed` means the repo already contains the endpoint, client call, or
  screen route today.
- `Derived` means the mapping is inferred from the BDD pack, `TASKS.md`, and
  the frozen MVP decision docs.
- Only the platform health flow is fully confirmed in the current repo.
  Everything else is a target mapping that should guide contracts,
  implementation, and tests.

## Confirmed Repo Signals

- API controller: `GET /health` in `apps/api/src/app.controller.ts`
- API client: `getHealth()` in `packages/api-client/src/index.ts`
- Web route: `/` renders the current web health screen
- Desktop route: `/` renders the current desktop health screen
- Mobile routes: `/` redirects to `/home`, which renders the current mobile
  health screen

## Auth

### Back-office login

| Scenario                                      | Domain objects                    | API endpoint(s)    | Frontend screen(s)                                       | Test type(s)                            | Basis   |
| --------------------------------------------- | --------------------------------- | ------------------ | -------------------------------------------------------- | --------------------------------------- | ------- |
| Successful admin login with valid credentials | `AdminUser`, `Role`, auth session | `POST /auth/login` | Desktop back-office login, desktop back-office dashboard | API integration, desktop smoke          | Derived |
| Successful staff login with valid credentials | `AdminUser`, `Role`, auth session | `POST /auth/login` | Desktop back-office login, desktop back-office dashboard | API integration, desktop smoke          | Derived |
| Login fails with invalid password             | `AdminUser`, auth session         | `POST /auth/login` | Desktop back-office login                                | API integration                         | Derived |
| Login fails for unknown email                 | `AdminUser`                       | `POST /auth/login` | Desktop back-office login                                | API integration                         | Derived |
| Disabled back-office user cannot log in       | `AdminUser`, `Role`               | `POST /auth/login` | Desktop back-office login                                | API integration                         | Derived |
| Required fields are validated                 | `AdminUser`                       | `POST /auth/login` | Desktop back-office login                                | API integration, desktop component test | Derived |

### Back-office password reset

| Scenario                           | Domain objects                                    | API endpoint(s)                     | Frontend screen(s)             | Test type(s)    | Basis   |
| ---------------------------------- | ------------------------------------------------- | ----------------------------------- | ------------------------------ | --------------- | ------- |
| Request a password reset           | `AdminUser`, `PasswordResetToken`, `Notification` | `POST /auth/password-reset/request` | Desktop forgot-password screen | API integration | Derived |
| Reset password with a valid token  | `AdminUser`, `PasswordResetToken`, auth session   | `POST /auth/password-reset/confirm` | Desktop reset-password screen  | API integration | Derived |
| Reject reset with an invalid token | `PasswordResetToken`                              | `POST /auth/password-reset/confirm` | Desktop reset-password screen  | API integration | Derived |
| Reject weak replacement password   | `PasswordResetToken`, `AdminUser`                 | `POST /auth/password-reset/confirm` | Desktop reset-password screen  | API integration | Derived |

### Back-office session security

| Scenario                                             | Domain objects                    | API endpoint(s)                          | Frontend screen(s)                                         | Test type(s)                   | Basis   |
| ---------------------------------------------------- | --------------------------------- | ---------------------------------------- | ---------------------------------------------------------- | ------------------------------ | ------- |
| Authenticated user can access a protected route      | `AdminUser`, `Role`, auth session | `GET /admin/orders`                      | Desktop protected back-office shell, desktop orders screen | API integration                | Derived |
| Unauthenticated user cannot access a protected route | `AdminUser`, auth session         | `GET /admin/orders`                      | Desktop protected back-office shell                        | API integration                | Derived |
| User can log out                                     | auth session                      | `POST /auth/logout`, `GET /admin/orders` | Desktop back-office shell                                  | API integration, desktop smoke | Derived |
| Expired session is rejected                          | auth session                      | `GET /admin/orders`                      | Desktop protected back-office shell                        | API integration                | Derived |

### Role-based back-office authorization

| Scenario                              | Domain objects                                               | API endpoint(s)        | Frontend screen(s)             | Test type(s)    | Basis   |
| ------------------------------------- | ------------------------------------------------------------ | ---------------------- | ------------------------------ | --------------- | ------- |
| Staff user can manage products        | `AdminUser`, `Role`, `Product`                               | `GET /admin/products`  | Desktop products screen        | API integration | Derived |
| Staff user can manage orders          | `AdminUser`, `Role`, `Order`                                 | `GET /admin/orders`    | Desktop orders screen          | API integration | Derived |
| Staff user can manage inventory       | `AdminUser`, `Role`, `ProductVariant`, `InventoryAdjustment` | `GET /admin/inventory` | Desktop inventory screen       | API integration | Derived |
| Staff user cannot manage users        | `AdminUser`, `Role`                                          | `GET /admin/users`     | Desktop user-management screen | API integration | Derived |
| Admin user inherits staff permissions | `AdminUser`, `Role`, `Product`                               | `GET /admin/products`  | Desktop products screen        | API integration | Derived |
| Admin user can manage users           | `AdminUser`, `Role`                                          | `GET /admin/users`     | Desktop user-management screen | API integration | Derived |

## Catalog

### Browse the public product catalog

| Scenario                            | Domain objects                              | API endpoint(s)                             | Frontend screen(s)                    | Test type(s)                             | Basis   |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------- | ------------------------------------- | ---------------------------------------- | ------- |
| View the catalog landing page       | `Product`, `ProductVariant`, `ProductMedia` | `GET /catalog/products`                     | Web catalog page, mobile catalog page | API integration, web smoke, mobile smoke | Derived |
| Only published products are visible | `Product`, `ProductMedia`                   | `GET /catalog/products`                     | Web catalog page, mobile catalog page | API integration, web smoke, mobile smoke | Derived |
| Filter products by category         | `Product`                                   | `GET /catalog/products?category={category}` | Web catalog page, mobile catalog page | API integration, web smoke, mobile smoke | Derived |
| Empty state when no products match  | `Product`                                   | `GET /catalog/products?category={category}` | Web catalog page, mobile catalog page | API integration, web smoke, mobile smoke | Derived |

### View product details and choose a variant

| Scenario                                      | Domain objects                              | API endpoint(s)                     | Frontend screen(s)                                  | Test type(s)                                  | Basis   |
| --------------------------------------------- | ------------------------------------------- | ----------------------------------- | --------------------------------------------------- | --------------------------------------------- | ------- |
| View product detail page                      | `Product`, `ProductVariant`, `ProductMedia` | `GET /catalog/products/{productId}` | Web product detail page, mobile product detail page | API integration, web smoke, mobile smoke      | Derived |
| Select an in-stock variant                    | `ProductVariant`                            | `GET /catalog/products/{productId}` | Web product detail page, mobile product detail page | API integration, UI component test            | Derived |
| Out-of-stock variant cannot be ordered        | `ProductVariant`                            | `GET /catalog/products/{productId}` | Web product detail page, mobile product detail page | API integration, UI component test            | Derived |
| Variant stock message updates after selection | `ProductVariant`                            | `GET /catalog/products/{productId}` | Web product detail page, mobile product detail page | UI component test, mobile component/manual QA | Derived |

## Orders

### Place an order from the catalog

| Scenario                                           | Domain objects                                                           | API endpoint(s)                                     | Frontend screen(s)                                                      | Test type(s)                             | Basis   |
| -------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- | ------- |
| Place an order successfully                        | `Order`, `OrderItem`, `CustomerContact`, `ProductVariant`, `OrderStatus` | `GET /catalog/products/{productId}`, `POST /orders` | Web product detail and order form, mobile product detail and order form | API integration, web smoke, mobile smoke | Derived |
| Prevent ordering more than available stock         | `Order`, `ProductVariant`                                                | `GET /catalog/products/{productId}`, `POST /orders` | Web product detail and order form, mobile product detail and order form | API integration, web smoke, mobile smoke | Derived |
| Customer must provide required contact information | `Order`, `CustomerContact`                                               | `POST /orders`                                      | Web product detail and order form, mobile product detail and order form | API integration, form component test     | Derived |

### Manage customer orders in the back office

| Scenario                                                    | Domain objects                           | API endpoint(s)                          | Frontend screen(s)                        | Test type(s)                   | Basis   |
| ----------------------------------------------------------- | ---------------------------------------- | ---------------------------------------- | ----------------------------------------- | ------------------------------ | ------- |
| Confirm an order in `Pending confirmation`                  | `Order`, `OrderStatus`                   | `POST /admin/orders/{orderId}/status`    | Desktop orders list, desktop order detail | API integration, desktop smoke | Derived |
| Mark an order as ready for delivery                         | `Order`, `OrderStatus`                   | `POST /admin/orders/{orderId}/status`    | Desktop orders list, desktop order detail | API integration, desktop smoke | Derived |
| Mark an order as delivered                                  | `Order`, `OrderStatus`                   | `POST /admin/orders/{orderId}/status`    | Desktop orders list, desktop order detail | API integration, desktop smoke | Derived |
| Cancel an order in `Pending confirmation` and restore stock | `Order`, `OrderStatus`, `ProductVariant` | `POST /admin/orders/{orderId}/status`    | Desktop orders list, desktop order detail | API integration, desktop smoke | Derived |
| Filter orders by status                                     | `Order`, `OrderStatus`                   | `GET /admin/orders?status={orderStatus}` | Desktop orders list                       | API integration, desktop smoke | Derived |
| Add an internal note to an order                            | `Order`                                  | `POST /admin/orders/{orderId}/notes`     | Desktop order detail                      | API integration, desktop smoke | Derived |

### Customer checks order status

| Scenario                                      | Domain objects                                         | API endpoint(s)                                                     | Frontend screen(s)                              | Test type(s)                             | Basis   |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- | ------- |
| Customer looks up an order with valid details | `Order`, `OrderItem`, `CustomerContact`, `OrderStatus` | `GET /orders/lookup?reference={orderReference}&phone={phoneNumber}` | Web order lookup page, mobile order lookup page | API integration, web smoke, mobile smoke | Derived |
| Reject lookup with mismatched phone number    | `Order`, `CustomerContact`                             | `GET /orders/lookup?reference={orderReference}&phone={phoneNumber}` | Web order lookup page, mobile order lookup page | API integration, web smoke, mobile smoke | Derived |
| Order status reflects latest update           | `Order`, `OrderStatus`                                 | `GET /orders/lookup?reference={orderReference}&phone={phoneNumber}` | Web order lookup page, mobile order lookup page | API integration, web smoke, mobile smoke | Derived |

## Products

### Manage products in the back office

| Scenario                             | Domain objects                              | API endpoint(s)                              | Frontend screen(s)                                       | Test type(s)                   | Basis   |
| ------------------------------------ | ------------------------------------------- | -------------------------------------------- | -------------------------------------------------------- | ------------------------------ | ------- |
| Create a draft product               | `Product`                                   | `POST /admin/products`                       | Desktop product list, desktop product create-edit screen | API integration, desktop smoke | Derived |
| Add variants to a product            | `Product`, `ProductVariant`                 | `PATCH /admin/products/{productId}`          | Desktop product create-edit screen                       | API integration, desktop smoke | Derived |
| Publish a complete product           | `Product`, `ProductVariant`, `ProductMedia` | `POST /admin/products/{productId}/publish`   | Desktop product list, desktop product create-edit screen | API integration, desktop smoke | Derived |
| Cannot publish an incomplete product | `Product`, `ProductVariant`, `ProductMedia` | `POST /admin/products/{productId}/publish`   | Desktop product create-edit screen                       | API integration, desktop smoke | Derived |
| Unpublish a product                  | `Product`                                   | `POST /admin/products/{productId}/unpublish` | Desktop product list, desktop product create-edit screen | API integration, desktop smoke | Derived |

## Inventory

### Adjust inventory for product variants

| Scenario                                      | Domain objects                          | API endpoint(s)                                     | Frontend screen(s)               | Test type(s)                   | Basis   |
| --------------------------------------------- | --------------------------------------- | --------------------------------------------------- | -------------------------------- | ------------------------------ | ------- |
| Increase stock after receiving new items      | `ProductVariant`, `InventoryAdjustment` | `POST /admin/inventory/adjustments`                 | Desktop inventory screen         | API integration, desktop smoke | Derived |
| Decrease stock due to damage or loss          | `ProductVariant`, `InventoryAdjustment` | `POST /admin/inventory/adjustments`                 | Desktop inventory screen         | API integration, desktop smoke | Derived |
| Prevent negative stock from manual adjustment | `ProductVariant`, `InventoryAdjustment` | `POST /admin/inventory/adjustments`                 | Desktop inventory screen         | API integration, desktop smoke | Derived |
| View inventory history for a variant          | `ProductVariant`, `InventoryAdjustment` | `GET /admin/inventory/variants/{variantId}/history` | Desktop inventory history screen | API integration, desktop smoke | Derived |

## Notifications

### Queue customer notifications for order status changes

| Scenario                                                          | Domain objects                                                                   | API endpoint(s)                       | Frontend screen(s)                   | Test type(s)                              | Basis   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------ | ----------------------------------------- | ------- |
| Queue a customer notification after order confirmation            | `Order`, `OrderStatus`, `CustomerContact`, `Notification`, `NotificationAttempt` | `POST /admin/orders/{orderId}/status` | Desktop order detail status workflow | API integration, notification integration | Derived |
| Queue a customer notification when an order is ready for delivery | `Order`, `OrderStatus`, `CustomerContact`, `Notification`, `NotificationAttempt` | `POST /admin/orders/{orderId}/status` | Desktop order detail status workflow | API integration, notification integration | Derived |
| Queue a customer notification when an order is delivered          | `Order`, `OrderStatus`, `CustomerContact`, `Notification`, `NotificationAttempt` | `POST /admin/orders/{orderId}/status` | Desktop order detail status workflow | API integration, notification integration | Derived |
| Queue a customer notification when an order is cancelled          | `Order`, `OrderStatus`, `CustomerContact`, `Notification`, `NotificationAttempt` | `POST /admin/orders/{orderId}/status` | Desktop order detail status workflow | API integration, notification integration | Derived |
| Notification failure does not roll back an order status update    | `Order`, `OrderStatus`, `Notification`, `NotificationAttempt`                    | `POST /admin/orders/{orderId}/status` | Desktop order detail status workflow | API integration, notification integration | Derived |

## Platform

### API health endpoint

| Scenario                               | Domain objects           | API endpoint(s) | Frontend screen(s)                                                                      | Test type(s)                                                         | Basis     |
| -------------------------------------- | ------------------------ | --------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------- |
| Health endpoint returns success        | Health response contract | `GET /health`   | Web health screen at `/`, desktop health screen at `/`, mobile health screen at `/home` | API controller test, API E2E, web smoke, desktop smoke, mobile smoke | Confirmed |
| Health endpoint is publicly accessible | Health response contract | `GET /health`   | Web health screen at `/`, desktop health screen at `/`, mobile health screen at `/home` | API E2E, client smoke                                                | Confirmed |

## Maintenance Note

As contracts, routes, and UI screens are implemented, update this sheet so
`Derived` mappings become `Confirmed` and endpoint names stay aligned with the
real code.
