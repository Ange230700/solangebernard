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
- `WEB_CLIENT_ORIGINS`
  comma-separated browser origins, including the local web Angular dev server
- `DESKTOP_CLIENT_ORIGINS`
  comma-separated Tauri desktop origins for the Angular dev server and packaged shell
- `MOBILE_CLIENT_ORIGINS`
  comma-separated mobile origins for the Angular dev server and Capacitor webview

## Optional Variables

- `NOTIFICATION_PROVIDER_API_KEY`
  optional provider credential for non-local notification adapters
- `NOTIFICATION_PROVIDER_SENDER`
  optional sender label or sender identifier used by the notification adapter
- `FRONTEND_ORIGINS`
  temporary backward-compatible fallback for older local `.env` files while they
  are being migrated to the scoped client origin variables above

## Current Behavior

- The API runtime loads environment values from `apps/api/.env` when present.
- The API startup path validates required values before the Nest app finishes
  booting.
- CORS uses the scoped web, desktop, and mobile origin lists, allows
  credentials, and answers preflight requests with the standard JSON/API
  methods and headers the clients need.
- Local development assumes:
  `pnpm client:web` on `http://127.0.0.1:4200`,
  `pnpm client:desktop` on `http://127.0.0.1:4201` during Tauri dev and
  `tauri://localhost` when packaged,
  `pnpm client:mobile` on `http://127.0.0.1:4202` plus
  `capacitor://localhost` or `http://localhost` in the native shell.

## Related Decisions

- `apps/api/.env.example`
- `docs/development-seed-data.md`
- `docs/domain-glossary.md`
- `docs/mvp-scope.md`
