# `@repo/contracts`

This package stays slice-first.

Use `public/` and `protected/` subfolders only when one domain slice exposes
both customer-facing and back-office contracts.

Current convention:

- `health` is public-only
- `auth`, `inventory`, and `notifications` are protected-only
- `products` and `orders` expose both `public` and `protected` surfaces

Preferred imports for mixed slices:

- `@repo/contracts/products/public`
- `@repo/contracts/products/protected`
- `@repo/contracts/orders/public`
- `@repo/contracts/orders/protected`

The slice roots still re-export both surfaces for compatibility:

- `@repo/contracts/products`
- `@repo/contracts/orders`
