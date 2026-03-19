# Monorepo Starter

- `apps/client`: Angular workspace for web, desktop, and mobile.
- `apps/api`: NestJS API using the Fastify adapter.
- `packages/*`: plain TypeScript workspace packages shared across apps.

Sharing rules:
- Plain TypeScript packages can be shared across all apps.
- Angular UI libraries are shared only between web and desktop.
- Mobile uses Ionic UI.
