# Product Lifecycle

This document freezes the Solange Bernard MVP product lifecycle as of March 20, 2026.

It is the source of truth for canonical product statuses and the rules for
moving between them.

## Canonical Statuses

| Status      | Meaning                                                                             | Publicly visible | Terminal |
| ----------- | ----------------------------------------------------------------------------------- | ---------------- | -------- |
| `Draft`     | Product can be created and edited internally but is not available to customers yet. | No               | No       |
| `Published` | Product is complete enough for customer-facing catalog and order flows.             | Yes              | No       |

## Not In MVP

- `Archived` is not an MVP status.
- There is no separate lifecycle status for `Scheduled`, `Hidden`, `Deleted`, or
  `Discontinued`.

## State Machine

- All newly created products start in `Draft`.
- `Draft` can move to `Published`.
- `Published` can move back to `Draft` through unpublish.
- `Draft` is the non-public working state.
- `Published` is the public selling state.

## Publish Rules

A product may move from `Draft` to `Published` only when all of the following
are true:

- it has a price
- it has at least one variant
- it has at least one photo

If any of these are missing:

- publish must be rejected
- the product must remain in `Draft`
- the product must stay hidden from the public catalog

## Unpublish Rules

- Unpublish moves a product from `Published` back to `Draft`.
- Once unpublished, the product must disappear from public catalog and product
  detail flows.
- Unpublish does not require deletion of product data, variants, or media.

## Visibility Rule

- Only `Published` products are visible in public catalog and product detail
  flows.
- `Draft` products are back-office only.

## Naming Rule

- Domain, contracts, persistence, API payloads, and UI copy should use the
  exact status names `Draft` and `Published`.
- Do not introduce `Archived` into MVP code paths, contracts, filters, or UI.
- Do not create alternate spellings such as `Unpublished`, `Live`, `Active`, or
  `Private`.

## Operational Rule

- Staff and admins can create and edit products while they are in `Draft`.
- Publishing is the act that makes a product customer-visible.
- Unpublishing is the MVP-safe alternative to removing a product from sale.

## Repo Alignment

Current repo signals already agree on the intended MVP lifecycle:

- `TASKS.md` lists `Draft` and `Published`, with `Archived` deferred
- `docs/bdd/mvp/products/admin-manage-products.feature` shows create draft,
  publish complete product, reject incomplete publish, and unpublish back to
  `Draft`
- `docs/bdd/mvp/catalog` assumes only published products are visible publicly

This document freezes that model and keeps `Archived` out of MVP until the repo
actually needs it.
