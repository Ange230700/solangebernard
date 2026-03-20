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

## Boundaries

- `packages/*` stay plain TypeScript and framework-light.
- `contracts` and `domain` do not take Angular, Nest, Ionic, Capacitor, or Tauri dependencies.
- Angular UI libraries are shared only between `web` and `desktop`.
- `mobile` uses Ionic UI and must not depend on `ui-web`.
- The API remains NestJS with the Fastify adapter.
