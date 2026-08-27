# Night Club Admin Panel — Design Spec

Date: 2026-08-27
Scope: `invoice-manager/n8-admin/` only. No other folder in the repo is touched by this project.

## 1. Purpose

Build a standalone React admin panel for the Night Club API (see
`Night Club API.postman_collection.json` in this folder) covering venues,
events, subscriptions, users, and social-feed moderation. Deployed to Vercel
as a static SPA. Visual theme: black/dark-gray surfaces with violet-pink-blue
gradient accents and an animated "club night" login screen — no video/image
assets, CSS-only.

## 2. Source of truth for the API

`Night Club API.postman_collection.json` defines every real endpoint. One
endpoint used by this panel does **not** exist yet in the collection:

- `POST /auth/admin/login` — body `{ email, password }`, response
  `{ token, admin: {...} }`. This is a backend gap; the panel calls it as
  designed, and the backend team is expected to implement + seed an admin
  user with matching shape. If the actual response shape differs, only
  `src/api/authApi.js` and `AuthContext` need to change.

All other endpoints are implemented exactly as declared in the collection,
using `{{baseUrl}}` as `VITE_API_BASE_URL` (env var, defaults to
`http://localhost:3005/api` to match the collection).

Auth header: every authenticated request sends `x-auth-token: <token>` (not
`Authorization: Bearer`), matching the collection.

## 3. Tech stack

- Vite + React (JavaScript, no TypeScript)
- Tailwind CSS + shadcn/ui components (table, dialog, form, toast/sonner,
  dropdown, tabs, skeleton)
- React Router (client-side routing)
- Axios for HTTP
- Deploy target: Vercel (static build + SPA rewrite)

## 4. Project structure (inside `n8-admin/`)

```
n8-admin/
  Night Club API.postman_collection.json   (existing, untouched)
  docs/specs/2026-08-27-nightclub-admin-panel-design.md  (this file)
  index.html
  vite.config.js
  tailwind.config.js
  vercel.json
  src/
    main.jsx
    App.jsx                       (router root)
    api/
      client.js                   (axios instance + interceptors)
      authApi.js
      userApi.js
      venueApi.js
      eventApi.js
      subscriptionApi.js
      socialFeedApi.js
      uploadApi.js
    context/
      AuthContext.jsx              (token state, login/logout, guard)
    hooks/
      useVenues.js, useEvents.js, useUsers.js, useSubscriptions.js,
      useSocialFeed.js              (data + mutation hooks per module,
                                      each wraps its api/*.js file only)
    components/
      ui/                          (shadcn primitives)
      layout/
        Sidebar.jsx, Topbar.jsx, ProtectedLayout.jsx
      shared/
        DataTable.jsx, Pagination.jsx, ConfirmDialog.jsx,
        StatusBadge.jsx, ImageUploader.jsx, EmptyState.jsx
    pages/
      Login.jsx
      Dashboard.jsx
      Users.jsx
      Venues.jsx
      Events.jsx
      Subscriptions.jsx
      SocialFeed.jsx
      NotFound.jsx
    lib/
      utils.js                     (cn() helper, formatters)
    styles/
      globals.css                  (Tailwind entry + club-bg animations)
```

## 5. Modules

| Module | Endpoints | Capabilities |
|---|---|---|
| Auth | `POST /auth/admin/login` (new) | Login, logout, token persisted in `localStorage`, `AuthContext` guards all protected routes |
| Dashboard | `GET /venue/admin/list`, `/event/admin/list`, `/user`, `/subscription` (limit=1 each) | Summary cards with best-effort totals; falls back to "—" if a list response has no total/count field |
| Users | `GET /user?page&limit` | Paginated read-only table: name, phone, email, joined date. No edit/delete — API doesn't support it |
| Venues | `GET/POST/PUT/DELETE /venue`, `/venue/admin/list`, `PUT /venue/:id/feature` | Paginated table, create/edit modal form, delete confirm dialog, feature toggle switch, image/menu upload via shared `ImageUploader` |
| Events | `GET/POST/PUT/DELETE /event`, `/event/admin/list`, `PUT /event/:id/feature` | Same shape as Venues |
| Subscriptions | `GET /subscription`, `PUT /subscription/:id` | List plans as cards, inline "edit amount" only (only field API supports) |
| Social Feed | `GET /social-feed`, `GET /social-feed/:id/comments`, `DELETE /social-feed/:id` | Moderation feed: paginated post list with like/comment counts, expandable comments, delete post with confirm |
| Upload | `POST /upload/image`, `POST /upload/logo` | Shared drag-drop widget used inside Venue/Event forms; returns a URL appended to `imageUrls`/`menuUrls` |

**Explicitly out of scope:** Payments module (no list-payments endpoint
exists in the collection — noted here as a backend gap, not built).

## 6. Auth flow

1. `Login.jsx` posts `{ email, password }` to `/auth/admin/login`.
2. On success, `AuthContext` stores `{ token, admin }` in `localStorage` and
   in memory, then navigates to `/`.
3. `client.js` request interceptor attaches `x-auth-token` from
   `AuthContext`/`localStorage` to every request.
4. Response interceptor: on `401`, clears stored auth and hard-redirects to
   `/login`.
5. `ProtectedLayout` reads `AuthContext`; if no token, redirects to `/login`
   before rendering any nested route.

## 7. Theming

Tailwind custom tokens:

- `bg-void` `#0a0a0f`, `bg-surface` `#15151f`, `bg-elevated` `#1e1e2a`
- Text: `text-zinc-100` / `text-zinc-400` for primary/secondary
- Accent gradient: `from-violet-600 via-fuchsia-600 to-blue-600`, applied to
  primary buttons, active sidebar item, card top-border, and a
  `shadow-[0_0_20px_rgba(217,70,239,0.35)]` glow on hover/focus
- Login screen: full-bleed `<div>` with 3–4 blurred, absolutely-positioned
  gradient blobs animated via `@keyframes drift` (translate + scale loop,
  12–20s durations, staggered), layered under the login card with a
  `backdrop-blur` glass panel. Optional low-opacity CSS "light beam" sweep
  across the screen for extra club-mood polish. All CSS, zero external
  assets.
- Sidebar/topbar use `bg-surface` with `bg-elevated` for active/hover states,
  consistent with the rest of the panel (not just the login screen).

## 8. Data flow pattern

Each module gets one hook (e.g. `useVenues(page, limit)`) returning
`{ data, total, loading, error, refetch, createVenue, updateVenue,
deleteVenue, setFeatured }`. Hooks are the only thing that import their
`api/*.js` file; pages only import hooks + shared components. Pagination
state (`page`, `limit`) is owned by the page component.

## 9. Error handling

- Centralized in the Axios interceptor: `401` → logout + redirect;
  everything else surfaces as a toast using the server's error message when
  present (`error.response?.data?.message`), else a generic
  "Something went wrong" fallback.
- Forms validate required fields client-side before submit; server-side
  validation errors also toast (not treated as a different code path).

## 10. Testing / verification plan

No automated test framework requested. Verification is manual:

- `npm run build` must succeed with no errors before considering any phase
  done.
- Each CRUD flow (Venues, Events, Subscriptions, Social Feed) exercised
  against the real API if `VITE_API_BASE_URL` is reachable during
  development; otherwise called out explicitly as "not verified against a
  live backend" rather than silently assumed working.
- Auth guard manually checked: unauthenticated access to `/` redirects to
  `/login`; expired/invalid token triggers logout.

## 11. Deployment

- `vercel.json` with a catch-all rewrite to `/index.html` for SPA routing.
- `VITE_API_BASE_URL` set as a Vercel environment variable per environment
  (dev/preview/prod), no base URL hardcoded outside the `.env` default.

## 12. Known gaps / assumptions carried forward

1. `POST /auth/admin/login` does not exist in the current API — backend
   must implement + seed an admin user matching `{ email, password }` in,
   `{ token, admin }` out.
2. No payments-list endpoint — Payments module not built.
3. No admin user CRUD (only list) — Users page is read-only.
4. No dedicated social-feed moderation endpoints — reuses the existing
   user-facing feed endpoints (a valid admin token is a valid token).
5. Pagination response shape (`total`/`count` field name) is assumed to
   follow common REST convention; Dashboard totals degrade gracefully to
   "—" if the field isn't present, rather than crashing.
