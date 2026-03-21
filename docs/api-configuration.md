# API Configuration

This document freezes the required API runtime configuration for Solange Bernard
as of March 21, 2026.

It is the source of truth for the environment variables the Nest API expects at
startup.

## Usage Rule

- Keep required runtime configuration explicit in `apps/api/.env.example`.
- Fail fast at startup when required configuration is missing or malformed.
- Keep notification provider configuration generic until the repo freezes the
  first real provider integration.

## Required Variables

- `APP_ENV`
  values: `local`, `staging`, `production`
- `PORT`
  defaults to `3000` when omitted
- `DATABASE_URL`
  PostgreSQL connection string for Prisma and the API runtime
- `AUTH_SECRET`
  server-side secret for future back-office session and auth flows
- `NOTIFICATION_PROVIDER`
  notification provider mode or adapter name such as local `noop`
- `FRONTEND_ORIGINS`
  comma-separated allowed origins for browser, desktop, and mobile surfaces

## Optional Variables

- `NOTIFICATION_PROVIDER_API_KEY`
  optional provider credential for non-local notification adapters
- `NOTIFICATION_PROVIDER_SENDER`
  optional sender label or sender identifier used by the notification adapter

## Current Behavior

- The API runtime loads environment values from `apps/api/.env` when present.
- The API startup path validates required values before the Nest app finishes
  booting.
- CORS uses `FRONTEND_ORIGINS` and enables credentials so the future cookie
  auth flow can work across approved client origins.

## Related Decisions

- `apps/api/.env.example`
- `docs/development-seed-data.md`
- `docs/domain-glossary.md`
- `docs/mvp-scope.md`
