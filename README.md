# SolangeBernard Monorepo

## Repo Layout

- `apps/client`: Angular workspace that contains the `web`, `desktop`, and `mobile` frontends.
- `apps/api`: NestJS API using the Fastify adapter.
- `packages/contracts`: shared API and entity types.
- `packages/domain`: framework-free domain helpers.
- `packages/api-client`: tiny fetch-based client for the API.

## What Lives Where

- `web`: browser app using Angular and PrimeNG.
- `desktop`: Angular desktop frontend that runs in Tauri.
- `mobile`: Angular mobile frontend using Ionic UI.
- `api`: backend API that exposes the shared health endpoint.
- `contracts`: shared TypeScript contracts used by the API and clients.
- `domain`: reusable business/domain utilities with no UI or backend framework code.
- `api-client`: shared fetch client used by the frontends.

## Run Commands

From the repo root:

- Web: `pnpm client:web`
- Mobile: `pnpm client:mobile`
- Desktop: `pnpm client:desktop`
- API: `pnpm api`
- Build everything: `pnpm build`
- Typecheck everything: `pnpm typecheck`
- Run all client app tests: `pnpm test:client`
- Run web tests only: `pnpm test:client:web`
- Run desktop tests only: `pnpm test:client:desktop`
- Run mobile tests only: `pnpm test:client:mobile`

Useful target-local commands:

- Client web serve: `pnpm --dir apps/client run serve:web`
- Client mobile serve: `pnpm --dir apps/client run serve:mobile`
- Client desktop Angular serve: `pnpm --dir apps/client run serve:desktop`
- Client Tauri dev: `pnpm --dir apps/client run tauri:dev`
- Client Tauri build: `pnpm --dir apps/client run tauri:build`
- Client tests: `pnpm --dir apps/client run test`
- Client web tests: `pnpm --dir apps/client run test:web`
- Client desktop tests: `pnpm --dir apps/client run test:desktop`
- Client mobile tests: `pnpm --dir apps/client run test:mobile`
- Client Capacitor sync: `pnpm --dir apps/client run cap:sync`
- API dev: `pnpm --dir apps/api run dev`
- API build: `pnpm --dir apps/api run build`
- API Prisma validate: `pnpm --dir apps/api run prisma:validate`
- API Prisma generate: `pnpm --dir apps/api run prisma:generate`
- API Prisma push: `pnpm --dir apps/api run prisma:push`
- API Prisma seed: `pnpm --dir apps/api run prisma:seed`
- Start local PostgreSQL via Docker: `pnpm db:dev:up`
- Apply the Prisma schema to local PostgreSQL: `pnpm db:push`
- Seed the local development database: `pnpm db:seed`
- Stop the local PostgreSQL container: `pnpm db:dev:down`

The Docker-backed database scripts read `apps/api/.env` and start PostgreSQL
with matching local credentials, port, and database name.

## Persistence

- API Prisma schema: `apps/api/prisma/schema.prisma`
- API Prisma seed: `apps/api/prisma/seed.ts`
- API Prisma config: `apps/api/prisma.config.ts`
- API database env example: `apps/api/.env.example`
- Local Docker database stack: `compose.yml`

## API Configuration

- API runtime configuration source of truth: `docs/api-configuration.md`
- Copy `apps/api/.env.example` to `apps/api/.env` for local API work
- Required API runtime env vars now include:
  `APP_ENV`,
  `DATABASE_URL`,
  `AUTH_SECRET`,
  `NOTIFICATION_PROVIDER`,
  `FRONTEND_ORIGINS`
- `PORT` defaults to `3000` when omitted

## Boundaries

- Architecture source of truth: `ARCHITECTURE.md`
- Database source of truth: `docs/database-choice.md`
- ORM/query-layer source of truth: `docs/orm-choice.md`
- Boundary source of truth: `docs/workspace-boundaries.md`
- Path alias source of truth: `docs/path-aliases.md`
- `packages/contracts` is for shared contracts and transport-safe types only.
- `packages/domain` is for framework-free domain logic only.
- `packages/api-client` is for typed client calls into the API only.
- `apps/api` is the Nest transport and orchestration layer.
- `apps/client` owns the web, desktop, and mobile UI surfaces.
- Angular UI libraries are shared only between `web` and `desktop`.
- `mobile` uses Ionic UI and must not depend on `ui-web`.
