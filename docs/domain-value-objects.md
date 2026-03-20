# Domain Value Objects

This document freezes the Solange Bernard MVP domain value objects as of March
20, 2026.

It is the source of truth for the small immutable domain values that should be
modeled explicitly instead of passed around as unchecked primitive strings or
numbers.

## Usage Rule

- Use a value object when a primitive carries business meaning, normalization,
  validation, or comparison rules of its own.
- Keep value objects immutable.
- Reject invalid raw input at construction time instead of letting invalid
  values drift deeper into the system.
- Keep formatting and display concerns outside the value object unless the
  canonical representation is itself a business rule.

## MVP Value Object Summary

| Value object     | Purpose                                                        | Core rule                                              |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| `Money`          | represent product price and order-time unit price              | never use floating-point arithmetic for domain pricing |
| `PhoneNumber`    | represent customer lookup and notification destination numbers | compare using one normalized international form        |
| `EmailAddress`   | represent back-office login and password-reset email addresses | compare and store using one normalized email form      |
| `OrderReference` | represent the customer-visible order identifier                | must be human-readable and unique                      |
| `ProductSku`     | represent the unique sellable code for a product variant       | must be stable and unique per variant                  |
| `PasswordHash`   | represent stored credential state for a back-office user       | never store or expose raw passwords                    |

## Money

### Purpose

- represents product price and order-item unit price at order time

### Canonical Rule

- `Money` must not be represented as a floating-point number in domain logic.
- Use an integer amount in the configured MVP business currency.
- Negative prices are not valid for current MVP product and order pricing use
  cases.

### Notes

- The repo currently shows raw integer prices such as `35000` in BDD scenarios.
- Multi-currency pricing is out of scope for the MVP.
- Currency formatting for UI is not the value object's responsibility.

## PhoneNumber

### Purpose

- represents customer phone numbers used for order placement, order lookup, and
  notifications

### Canonical Rule

- Normalize to one international canonical string form that begins with `+`.
- Comparison and lookup must use the normalized value, not the raw user input.
- Empty, malformed, or non-canonical phone numbers are invalid.

### Notes

- Current BDD examples already use canonical values such as `+2250102030405`.
- Phone presentation formatting for UI can differ from the stored normalized
  value.

## EmailAddress

### Purpose

- represents back-office user login and password-reset email addresses

### Canonical Rule

- Normalize by trimming surrounding whitespace and using a consistent lowercase
  representation for MVP comparison and storage.
- Empty or malformed email addresses are invalid.

### Notes

- Current BDD examples use values such as `admin@solangebernard.com` and
  `staff@solangebernard.com`.
- Email delivery mechanics are not part of the value object itself.

## OrderReference

### Purpose

- represents the human-readable identifier customers use to look up an order

### Canonical Rule

- `OrderReference` is immutable after order creation.
- It must be unique across orders.
- The MVP canonical display and storage pattern is uppercase `ORD-` followed by
  digits, matching current repo examples such as `ORD-001` and `ORD-1001`.

### Notes

- Customers use `OrderReference` together with `PhoneNumber` for lookup.
- Internal database IDs do not replace the customer-facing order reference.

## ProductSku

### Purpose

- represents the stable sellable code for a specific `ProductVariant`

### Canonical Rule

- `ProductSku` must be unique per variant and stable once assigned.
- Normalize to trimmed uppercase ASCII for MVP comparisons and storage.
- Empty values are invalid.

### Notes

- The backlog already calls for unique SKU support even though BDD scenarios do
  not yet show example values.
- Human-friendly SKU structure is allowed, but uniqueness matters more than
  decorative formatting.

## PasswordHash

### Purpose

- represents the stored credential output for a back-office user's password

### Canonical Rule

- `PasswordHash` is derived from a raw password using an approved password
  hashing algorithm.
- Raw passwords must never be stored, returned to clients, or logged as domain
  state.
- Password verification compares a raw candidate against the hash through a
  verifier, not by exposing or reversing the stored value.

### Notes

- Password strength validation applies to the raw password before hashing.
- Hash algorithm choice and library details can live behind infrastructure or
  adapter boundaries as long as the domain rule stays the same.

## Supporting Technical Identifier

- The repo already contains a generic `EntityId` branded type in
  `packages/contracts`.
- `EntityId` remains a supporting technical identifier type, not a substitute
  for the business value objects in this document.
- Use specific value objects such as `OrderReference`, `EmailAddress`, and
  `PhoneNumber` where the business meaning matters.

## Not Value Objects Yet In MVP

- customer full name
- delivery area
- delivery address
- product name
- category label
- internal notes
- free-text inventory adjustment reason

These stay as validated primitive fields for now. Promote them to value objects
later only if the repo gains shared normalization or business rules that justify
the extra type.

## Related Decisions

- `docs/domain-glossary.md`
- `docs/domain-invariants.md`
- `docs/domain-aggregates.md`
- `docs/domain-services.md`
- `docs/order-statuses.md`
- `docs/inventory-behavior.md`
- `docs/bdd/mvp/traceability-sheet.md`
