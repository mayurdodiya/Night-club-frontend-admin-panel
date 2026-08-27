# Night Club Admin Panel

Admin panel for the Night Club API (see `Night Club API.postman_collection.json`).

## Setup

```
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL if not localhost:3005
```

## Develop

```
npm run dev
```

## Build

```
npm run build   # outputs to dist/
```

## Deploy

Deploy this folder (`n8-admin/`) as its own Vercel project. Set `VITE_API_BASE_URL`
as an environment variable in the Vercel project settings for each environment.

## Known backend gaps (see docs/specs/2026-08-27-nightclub-admin-panel-design.md §12)

- `POST /auth/admin/login` must be implemented + an admin user seeded with
  `{ email, password }` in / `{ token, admin }` out.
- No payments-list endpoint — Payments module intentionally not built.
- No admin user CRUD — Users page is read-only by design.
