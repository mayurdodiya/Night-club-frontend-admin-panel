# Night Club Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (subagent-driven-development is NOT used on this project — standing user preference is no Agent-tool dispatch). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React (JS) admin panel for the Night Club API, scoped entirely to `invoice-manager/n8-admin/`, with a black/gray + gradient "club" theme, one API file per backend module, and CRUD screens for Venues/Events/Subscriptions/Users/Social Feed.

**Architecture:** Token-gated SPA — public `/login`, protected shell (`Sidebar` + `Topbar` + nested routes) guarded by `AuthContext`. Each module has an `api/*.js` file (thin Axios wrapper) and a `hooks/use*.js` hook (data + mutations); pages only call hooks, never Axios directly.

**Tech Stack:** Vite, React 18 (JavaScript, no TypeScript), React Router v6, Axios, Tailwind CSS, hand-written shadcn/ui-style primitives on top of Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-switch`), `sonner` for toasts, `lucide-react` for icons, `clsx` + `tailwind-merge` for class merging.

**Spec:** `n8-admin/docs/specs/2026-08-27-nightclub-admin-panel-design.md`

## Global Constraints

- Everything lives under `invoice-manager/n8-admin/` — no file outside that folder is created or modified.
- Auth header on every authenticated request is `x-auth-token` (NOT `Authorization: Bearer`), per the Postman collection.
- `POST /auth/admin/login` does not exist in the API yet — body `{ email, password }`, expected response `{ token, admin }`. This is a known backend gap (spec §2, §12.1); only `api/authApi.js` + `AuthContext.jsx` will need to change if the real shape differs.
- No Payments module (no list endpoint exists — spec §5, §12.2). No admin user CRUD (list only — spec §12.3). Social Feed reuses existing user-facing endpoints (spec §12.4).
- No automated test framework — verification is manual per spec §10: `npm run build` must pass, and each CRUD flow is manually exercised (against a live backend if `VITE_API_BASE_URL` is reachable, otherwise explicitly noted as unverified — never silently assumed working).
- Base API URL comes from `VITE_API_BASE_URL`, default `http://localhost:3005/api` — never hardcoded elsewhere.
- Theme tokens: `bg-void #0a0a0f`, `bg-surface #15151f`, `bg-elevated #1e1e2a`, accent gradient `from-violet-600 via-fuchsia-600 to-blue-600`.

---

## Task 1: Project Scaffold & Tailwind Theme

**Files:**
- Create: `n8-admin/package.json`
- Create: `n8-admin/vite.config.js`
- Create: `n8-admin/index.html`
- Create: `n8-admin/tailwind.config.js`
- Create: `n8-admin/postcss.config.js`
- Create: `n8-admin/.env.example`
- Create: `n8-admin/.gitignore`
- Create: `n8-admin/src/main.jsx`
- Create: `n8-admin/src/App.jsx`
- Create: `n8-admin/src/styles/globals.css`
- Create: `n8-admin/src/lib/utils.js`

**Interfaces:**
- Produces: `cn(...classes)` helper in `src/lib/utils.js`, imported by every component task from here on.
- Produces: Tailwind tokens `bg-void`, `bg-surface`, `bg-elevated`, `text-primary`, `text-muted`, and gradient utility class `bg-club-gradient`, used by every UI task from here on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nightclub-admin",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "axios": "^1.7.7",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "lucide-react": "^0.441.0",
    "sonner": "^1.5.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.6",
    "tailwindcss": "^3.4.10",
    "postcss": "^8.4.45",
    "autoprefixer": "^10.4.20"
  }
}
```

- [ ] **Step 2: Create `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Night Club Admin</title>
  </head>
  <body class="bg-void">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        surface: '#15151f',
        elevated: '#1e1e2a',
      },
      boxShadow: {
        glow: '0 0 20px rgba(217, 70, 239, 0.35)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, 6%) scale(1.1)' },
          '66%': { transform: 'translate(-3%, -4%) scale(0.95)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '0.15' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      animation: {
        'drift-slow': 'drift 18s ease-in-out infinite',
        'drift-med': 'drift 13s ease-in-out infinite',
        'drift-fast': 'drift 9s ease-in-out infinite',
        sweep: 'sweep 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create `.env.example`**

```
VITE_API_BASE_URL=http://localhost:3005/api
```

- [ ] **Step 7: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 8: Create `src/lib/utils.js`**

```js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 9: Create `src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-void text-zinc-100;
  }
}

@layer utilities {
  .bg-club-gradient {
    @apply bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600;
  }
  .text-muted {
    @apply text-zinc-400;
  }
}
```

- [ ] **Step 10: Create placeholder `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 11: Create placeholder `src/App.jsx`**

```jsx
export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void text-zinc-100">
      <p>Night Club Admin — scaffold OK</p>
    </div>
  )
}
```

- [ ] **Step 12: Install dependencies and verify dev server boots**

Run: `cd n8-admin && npm install`
Expected: installs without errors.

Run: `npm run dev`
Expected: Vite prints a local URL; open it in a browser and confirm "Night Club Admin — scaffold OK" renders on a black background. Stop the dev server after confirming (`Ctrl+C`).

- [ ] **Step 13: Commit**

```bash
git add n8-admin/package.json n8-admin/vite.config.js n8-admin/index.html n8-admin/tailwind.config.js n8-admin/postcss.config.js n8-admin/.env.example n8-admin/.gitignore n8-admin/src/main.jsx n8-admin/src/App.jsx n8-admin/src/styles/globals.css n8-admin/src/lib/utils.js
git commit -m "chore(n8-admin): scaffold Vite/React project with Tailwind club theme"
```

---

## Task 2: Core UI Primitives (Button, Input, Label, Textarea, Card, Badge, Table, Skeleton, Toaster)

**Files:**
- Create: `n8-admin/src/components/ui/button.jsx`
- Create: `n8-admin/src/components/ui/input.jsx`
- Create: `n8-admin/src/components/ui/label.jsx`
- Create: `n8-admin/src/components/ui/textarea.jsx`
- Create: `n8-admin/src/components/ui/card.jsx`
- Create: `n8-admin/src/components/ui/badge.jsx`
- Create: `n8-admin/src/components/ui/table.jsx`
- Create: `n8-admin/src/components/ui/skeleton.jsx`
- Create: `n8-admin/src/components/ui/toaster.jsx`

**Interfaces:**
- Consumes: `cn` from `src/lib/utils.js` (Task 1).
- Produces: `<Button>`, `<Input>`, `<Label>`, `<Textarea>`, `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>`, `<Badge>`, `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`, `<Skeleton>`, `<Toaster>` components used by every page task from here on. `toast` re-exported from `sonner` for use in hooks/pages.

- [ ] **Step 1: Create `src/components/ui/button.jsx`**

```jsx
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-club-gradient text-white hover:shadow-glow',
  secondary: 'bg-elevated text-zinc-100 hover:bg-elevated/80',
  ghost: 'bg-transparent text-zinc-300 hover:bg-elevated/60',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
}

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    icon: 'h-9 w-9 p-0',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Create `src/components/ui/input.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-zinc-700 bg-surface px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600',
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Create `src/components/ui/label.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Label({ className, ...props }) {
  return <label className={cn('mb-1 block text-sm font-medium text-zinc-300', className)} {...props} />
}
```

- [ ] **Step 4: Create `src/components/ui/textarea.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-20 w-full rounded-md border border-zinc-700 bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600',
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 5: Create `src/components/ui/card.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-lg border border-zinc-800 bg-surface', className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-zinc-800 p-4', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-base font-semibold text-zinc-100', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('p-4', className)} {...props} />
}
```

- [ ] **Step 6: Create `src/components/ui/badge.jsx`**

```jsx
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-elevated text-zinc-200',
  success: 'bg-emerald-600/20 text-emerald-400',
  warning: 'bg-amber-600/20 text-amber-400',
  danger: 'bg-red-600/20 text-red-400',
}

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}
```

- [ ] **Step 7: Create `src/components/ui/table.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-800">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  )
}
export function TableHeader({ className, ...props }) {
  return <thead className={cn('bg-elevated text-zinc-400', className)} {...props} />
}
export function TableBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-zinc-800', className)} {...props} />
}
export function TableRow({ className, ...props }) {
  return <tr className={cn('hover:bg-elevated/50', className)} {...props} />
}
export function TableHead({ className, ...props }) {
  return <th className={cn('px-4 py-3 font-medium', className)} {...props} />
}
export function TableCell({ className, ...props }) {
  return <td className={cn('px-4 py-3 text-zinc-200', className)} {...props} />
}
```

- [ ] **Step 8: Create `src/components/ui/skeleton.jsx`**

```jsx
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-elevated', className)} {...props} />
}
```

- [ ] **Step 9: Create `src/components/ui/toaster.jsx`**

```jsx
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        style: {
          background: '#1e1e2a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
        },
      }}
    />
  )
}

export { toast } from 'sonner'
```

- [ ] **Step 10: Verify build compiles**

Run: `cd n8-admin && npm run build`
Expected: build succeeds (these components aren't wired into `App.jsx` yet, so this just confirms no syntax errors via unused-file compilation isn't guaranteed by Vite — instead, temporarily import `Button` into `App.jsx`, run `npm run dev`, confirm a gradient button renders, then revert `App.jsx` to the Task 1 placeholder).

- [ ] **Step 11: Commit**

```bash
git add n8-admin/src/components/ui
git commit -m "feat(n8-admin): add core UI primitives (button, input, card, table, toaster, etc.)"
```

---

## Task 3: Dialog, ConfirmDialog, and Switch Primitives

**Files:**
- Create: `n8-admin/src/components/ui/dialog.jsx`
- Create: `n8-admin/src/components/ui/switch.jsx`
- Create: `n8-admin/src/components/shared/ConfirmDialog.jsx`

**Interfaces:**
- Consumes: `cn` (Task 1), `Button` (Task 2), `@radix-ui/react-dialog`, `@radix-ui/react-switch`.
- Produces: `<Dialog>`, `<DialogTrigger>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`, `<DialogFooter>` from `dialog.jsx`; `<Switch>` from `switch.jsx`; `<ConfirmDialog open, onOpenChange, title, description, onConfirm, confirmLabel>` used by Venues/Events/SocialFeed delete flows (Tasks 9, 10, 12).

- [ ] **Step 1: Create `src/components/ui/dialog.jsx`**

```jsx
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger

export function DialogContent({ className, children, ...props }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-800 bg-surface p-6 shadow-glow',
          className,
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-100">
          <X size={18} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-4', className)} {...props} />
}
export function DialogTitle({ className, ...props }) {
  return <RadixDialog.Title className={cn('text-lg font-semibold text-zinc-100', className)} {...props} />
}
export function DialogFooter({ className, ...props }) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
}
```

- [ ] **Step 2: Create `src/components/ui/switch.jsx`**

```jsx
import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export function Switch({ className, ...props }) {
  return (
    <RadixSwitch.Root
      className={cn(
        'relative h-6 w-11 rounded-full bg-zinc-700 outline-none transition-colors data-[state=checked]:bg-club-gradient',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </RadixSwitch.Root>
  )
}
```

- [ ] **Step 3: Create `src/components/shared/ConfirmDialog.jsx`**

```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmLabel = 'Confirm' }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `cd n8-admin && npm run build`
Expected: succeeds with no missing-module errors (confirms `@radix-ui/react-dialog` / `@radix-ui/react-switch` resolve correctly from Task 1's `package.json`).

- [ ] **Step 5: Commit**

```bash
git add n8-admin/src/components/ui/dialog.jsx n8-admin/src/components/ui/switch.jsx n8-admin/src/components/shared/ConfirmDialog.jsx
git commit -m "feat(n8-admin): add dialog, switch, and confirm-dialog primitives"
```

---

## Task 4: API Client & Per-Module API Files

**Files:**
- Create: `n8-admin/src/api/client.js`
- Create: `n8-admin/src/api/authApi.js`
- Create: `n8-admin/src/api/userApi.js`
- Create: `n8-admin/src/api/venueApi.js`
- Create: `n8-admin/src/api/eventApi.js`
- Create: `n8-admin/src/api/subscriptionApi.js`
- Create: `n8-admin/src/api/socialFeedApi.js`
- Create: `n8-admin/src/api/uploadApi.js`

**Interfaces:**
- Produces: `client` (Axios instance with `x-auth-token` interceptor and 401-handling via a registrable `onUnauthorized` callback), and one function per endpoint per module (e.g. `venueApi.list(page, limit)`, `venueApi.create(payload)`, `venueApi.update(id, payload)`, `venueApi.remove(id)`, `venueApi.setFeatured(id, isFeatured)`). Consumed by hooks in Tasks 5, 8-12.

- [ ] **Step 1: Create `src/api/client.js`**

```js
import axios from 'axios'

const TOKEN_KEY = 'nightclub_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api',
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers['x-auth-token'] = token
  return config
})

let unauthorizedHandler = null
export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)
```

- [ ] **Step 2: Create `src/api/authApi.js`**

```js
import { client } from './client'

export const authApi = {
  adminLogin: (email, password) => client.post('/auth/admin/login', { email, password }).then((r) => r.data),
}
```

- [ ] **Step 3: Create `src/api/userApi.js`**

```js
import { client } from './client'

export const userApi = {
  list: (page = 1, limit = 10) => client.get('/user', { params: { page, limit } }).then((r) => r.data),
}
```

- [ ] **Step 4: Create `src/api/venueApi.js`**

```js
import { client } from './client'

export const venueApi = {
  list: (page = 1, limit = 10) => client.get('/venue/admin/list', { params: { page, limit } }).then((r) => r.data),
  create: (payload) => client.post('/venue', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/venue/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/venue/${id}`).then((r) => r.data),
  setFeatured: (id, isFeatured) => client.put(`/venue/${id}/feature`, { isFeatured }).then((r) => r.data),
}
```

- [ ] **Step 5: Create `src/api/eventApi.js`**

```js
import { client } from './client'

export const eventApi = {
  list: (page = 1, limit = 10) => client.get('/event/admin/list', { params: { page, limit } }).then((r) => r.data),
  create: (payload) => client.post('/event', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/event/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/event/${id}`).then((r) => r.data),
  setFeatured: (id, isFeatured) => client.put(`/event/${id}/feature`, { isFeatured }).then((r) => r.data),
}
```

- [ ] **Step 6: Create `src/api/subscriptionApi.js`**

```js
import { client } from './client'

export const subscriptionApi = {
  list: () => client.get('/subscription').then((r) => r.data),
  update: (id, payload) => client.put(`/subscription/${id}`, payload).then((r) => r.data),
}
```

- [ ] **Step 7: Create `src/api/socialFeedApi.js`**

```js
import { client } from './client'

export const socialFeedApi = {
  list: (page = 1, limit = 10) => client.get('/social-feed', { params: { page, limit } }).then((r) => r.data),
  comments: (postId) => client.get(`/social-feed/${postId}/comments`).then((r) => r.data),
  remove: (postId) => client.delete(`/social-feed/${postId}`).then((r) => r.data),
}
```

- [ ] **Step 8: Create `src/api/uploadApi.js`**

```js
import { client } from './client'

export const uploadApi = {
  image: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/upload/image', form).then((r) => r.data)
  },
  logo: (file) => {
    const form = new FormData()
    form.append('file', file)
    return client.post('/upload/logo', form).then((r) => r.data)
  },
}
```

- [ ] **Step 9: Verify build**

Run: `cd n8-admin && npm run build`
Expected: succeeds (these files aren't imported anywhere yet, but this confirms no syntax errors — Vite tree-shakes unused modules at build time regardless, so also spot-check by eye that every function name here matches the table in Task 4's Interfaces block, since later tasks depend on exact names).

- [ ] **Step 10: Commit**

```bash
git add n8-admin/src/api
git commit -m "feat(n8-admin): add axios client and per-module API files"
```

---

## Task 5: AuthContext, Login Page (animated club background), Routing Shell

**Files:**
- Create: `n8-admin/src/context/AuthContext.jsx`
- Create: `n8-admin/src/components/layout/ProtectedLayout.jsx`
- Create: `n8-admin/src/pages/Login.jsx`
- Create: `n8-admin/src/pages/NotFound.jsx`
- Modify: `n8-admin/src/App.jsx` (replace scaffold placeholder with full router)

**Interfaces:**
- Consumes: `authApi.adminLogin` (Task 4), `client`/`getToken`/`setToken`/`clearToken`/`onUnauthorized` (Task 4), `Button`/`Input`/`Label`/`Card` (Task 2), `Toaster`/`toast` (Task 2).
- Produces: `useAuth()` hook returning `{ token, admin, login(email, password), logout() }`, consumed by `Topbar` (Task 6) and `ProtectedLayout`. `ProtectedLayout` is the parent route element every module page (Tasks 6, 8-12) nests under.

- [ ] **Step 1: Create `src/context/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '@/api/authApi'
import { getToken, setToken, clearToken, onUnauthorized } from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    onUnauthorized(() => {
      setTokenState(null)
      setAdmin(null)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.adminLogin(email, password)
    setToken(data.token)
    setTokenState(data.token)
    setAdmin(data.admin ?? null)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setAdmin(null)
  }, [])

  return <AuthContext.Provider value={{ token, admin, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Create `src/components/layout/ProtectedLayout.jsx`**

```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedLayout() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
```

(Sidebar/Topbar wrap `<Outlet />` inside this layout in Task 6 — this task keeps the guard minimal so the router can be wired now.)

- [ ] **Step 3: Create `src/pages/Login.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email and password are required')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl animate-drift-med" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl animate-drift-fast" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/10 animate-sweep" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-lg border border-zinc-800 bg-surface/80 p-8 shadow-glow backdrop-blur-md"
      >
        <h1 className="mb-1 text-2xl font-bold text-zinc-100">Night Club Admin</h1>
        <p className="mb-6 text-sm text-muted">Sign in to manage venues, events &amp; more.</p>

        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
          autoComplete="username"
        />

        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6"
          autoComplete="current-password"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/NotFound.jsx`**

```jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-void text-zinc-100">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted">Page not found.</p>
      <Link to="/" className="text-fuchsia-400 hover:underline">
        Back to dashboard
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: Replace `src/App.jsx` with full router**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<div className="p-8 text-zinc-100">Dashboard placeholder (Task 6)</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 6: Manual verification**

Run: `cd n8-admin && npm run dev`
Expected: visiting `/` redirects to `/login`. The login screen shows the animated gradient blobs drifting and a light sweep, with a glassy card on top. Submitting with empty fields shows a toast error. If a live backend is reachable at `VITE_API_BASE_URL` and an admin has been seeded, submitting valid credentials navigates to `/` and shows the dashboard placeholder; if no backend is reachable, note this explicitly as "auth flow not verified end-to-end — no live backend" rather than claiming it works. Stop the dev server after checking.

- [ ] **Step 7: Commit**

```bash
git add n8-admin/src/context n8-admin/src/components/layout/ProtectedLayout.jsx n8-admin/src/pages/Login.jsx n8-admin/src/pages/NotFound.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add auth context, animated login page, and route guard"
```

---

## Task 6: Sidebar, Topbar, Dashboard Page

**Files:**
- Create: `n8-admin/src/components/layout/Sidebar.jsx`
- Create: `n8-admin/src/components/layout/Topbar.jsx`
- Modify: `n8-admin/src/components/layout/ProtectedLayout.jsx` (wrap `<Outlet />` with Sidebar/Topbar shell)
- Create: `n8-admin/src/pages/Dashboard.jsx`
- Modify: `n8-admin/src/App.jsx` (mount `Dashboard` at `/`, add placeholder routes for other modules so nav links resolve)

**Interfaces:**
- Consumes: `useAuth` (Task 5), `venueApi.list`, `eventApi.list`, `userApi.list`, `subscriptionApi.list` (Task 4), `Card`/`CardHeader`/`CardTitle`/`CardContent`/`Skeleton` (Task 2).
- Produces: the persistent app shell every module page (Tasks 8-12) renders inside via `<Outlet />`.

- [ ] **Step 1: Create `src/components/layout/Sidebar.jsx`**

```jsx
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, MapPin, CalendarDays, CreditCard, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/venues', label: 'Venues', icon: MapPin },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/social-feed', label: 'Social Feed', icon: MessageSquare },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-zinc-800 bg-surface">
      <div className="border-b border-zinc-800 p-5">
        <span className="bg-club-gradient bg-clip-text text-lg font-bold text-transparent">Night Club</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-elevated',
                isActive && 'bg-club-gradient text-white shadow-glow',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/Topbar.jsx`**

```jsx
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function Topbar() {
  const { admin, logout } = useAuth()
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-surface/60 px-6 backdrop-blur">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{admin?.email || 'Admin'}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Modify `src/components/layout/ProtectedLayout.jsx` to render the shell**

```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function ProtectedLayout() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/Dashboard.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { venueApi } from '@/api/venueApi'
import { eventApi } from '@/api/eventApi'
import { userApi } from '@/api/userApi'
import { subscriptionApi } from '@/api/subscriptionApi'

function extractTotal(data) {
  if (typeof data?.total === 'number') return data.total
  if (typeof data?.count === 'number') return data.count
  if (Array.isArray(data?.data)) return data.data.length
  if (Array.isArray(data)) return data.length
  return null
}

const CARDS = [
  { key: 'venues', label: 'Total Venues', fetcher: () => venueApi.list(1, 1) },
  { key: 'events', label: 'Total Events', fetcher: () => eventApi.list(1, 1) },
  { key: 'users', label: 'Total Users', fetcher: () => userApi.list(1, 1) },
  { key: 'plans', label: 'Subscription Plans', fetcher: () => subscriptionApi.list() },
]

export default function Dashboard() {
  const [totals, setTotals] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all(
      CARDS.map(({ key, fetcher }) =>
        fetcher()
          .then((data) => [key, extractTotal(data)])
          .catch(() => [key, null]),
      ),
    ).then((entries) => {
      if (cancelled) return
      setTotals(Object.fromEntries(entries))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-3xl font-bold text-zinc-100">
                  {totals[key] === null || totals[key] === undefined ? '—' : totals[key]}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Modify `src/App.jsx` to mount Dashboard and placeholder module routes**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { Toaster } from '@/components/ui/toaster'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/pages/Dashboard'

const Placeholder = ({ name }) => <div className="text-zinc-100">{name} page (coming in a later task)</div>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Placeholder name="Users" />} />
            <Route path="/venues" element={<Placeholder name="Venues" />} />
            <Route path="/events" element={<Placeholder name="Events" />} />
            <Route path="/subscriptions" element={<Placeholder name="Subscriptions" />} />
            <Route path="/social-feed" element={<Placeholder name="Social Feed" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 6: Manual verification**

Run: `cd n8-admin && npm run dev`
Expected: after logging in (or by temporarily seeding a token in `localStorage.nightclub_admin_token` if no backend is reachable, purely to check layout), the sidebar + topbar render, all 6 nav links are clickable and highlight when active, and Dashboard shows 4 cards. If no backend is reachable, totals show "—" for all cards rather than crashing — confirm this explicitly. Stop the dev server after checking.

- [ ] **Step 7: Commit**

```bash
git add n8-admin/src/components/layout n8-admin/src/pages/Dashboard.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add sidebar/topbar shell and dashboard summary cards"
```

---

## Task 7: Shared DataTable, Pagination, EmptyState, ImageUploader

**Files:**
- Create: `n8-admin/src/components/shared/DataTable.jsx`
- Create: `n8-admin/src/components/shared/Pagination.jsx`
- Create: `n8-admin/src/components/shared/EmptyState.jsx`
- Create: `n8-admin/src/components/shared/ImageUploader.jsx`

**Interfaces:**
- Consumes: `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`/`Skeleton` (Task 2), `Button` (Task 2), `uploadApi` (Task 4), `toast` (Task 2).
- Produces: `<DataTable columns, rows, loading, emptyMessage />`, `<Pagination page, limit, total, onPageChange />`, `<EmptyState message />`, `<ImageUploader value, onChange, uploadFn, label />` — used by Venues/Events forms (Tasks 9, 10) and every list page (Tasks 8-12).

- [ ] **Step 1: Create `src/components/shared/EmptyState.jsx`**

```jsx
export function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-muted">{message}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/shared/Pagination.jsx`**

```jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : null

  return (
    <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-sm text-muted">
      <span>
        Page {page}
        {totalPages ? ` of ${totalPages}` : ''}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={totalPages ? page >= totalPages : false}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/shared/DataTable.jsx`**

```jsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './EmptyState'

export function DataTable({ columns, rows, loading, emptyMessage }) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id || row._id}>
            {columns.map((col) => (
              <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Create `src/components/shared/ImageUploader.jsx`**

```jsx
import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toaster'

export function ImageUploader({ value = [], onChange, uploadFn, label = 'Images' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadFn(file)
      const url = result.url || result.data?.url
      if (!url) throw new Error('Upload response had no url field')
      onChange([...value, url])
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-300">{label}</p>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-16 w-16 overflow-hidden rounded-md border border-zinc-700">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-0 top-0 rounded-bl-md bg-black/70 p-0.5 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
        <Upload size={14} />
        {uploading ? 'Uploading...' : 'Add image'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Verify build**

Run: `cd n8-admin && npm run build`
Expected: succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add n8-admin/src/components/shared
git commit -m "feat(n8-admin): add shared data table, pagination, empty state, image uploader"
```

---

## Task 8: Users Page (read-only)

**Files:**
- Create: `n8-admin/src/hooks/useUsers.js`
- Create: `n8-admin/src/pages/Users.jsx`
- Modify: `n8-admin/src/App.jsx` (replace `/users` placeholder with `Users` page)

**Interfaces:**
- Consumes: `userApi.list` (Task 4), `DataTable`, `Pagination` (Task 7).
- Produces: `useUsers(page, limit)` returning `{ rows, total, loading }`.

- [ ] **Step 1: Create `src/hooks/useUsers.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import { userApi } from '@/api/userApi'

export function useUsers(page, limit) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    userApi
      .list(page, limit)
      .then((data) => {
        setRows(data.data || data.users || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  return { rows, total, loading, refetch: load }
}
```

- [ ] **Step 2: Create `src/pages/Users.jsx`**

```jsx
import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { useUsers } from '@/hooks/useUsers'

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'phone', header: 'Phone', render: (row) => `${row.countryCode || ''} ${row.phone || ''}` },
  { key: 'email', header: 'Email' },
  {
    key: 'createdAt',
    header: 'Joined',
    render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'),
  },
]

export default function Users() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading } = useUsers(page, limit)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Users</h1>
      <div className="rounded-lg border border-zinc-800 bg-surface">
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No users found." />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Modify `src/App.jsx` to use the real Users page**

Replace the import line `const Placeholder = ...` usage for `/users` only:

```jsx
import Users from '@/pages/Users'
// ...
<Route path="/users" element={<Users />} />
```

(Keep the other placeholder routes as-is until their tasks land.)

- [ ] **Step 4: Manual verification**

Run: `cd n8-admin && npm run dev`, log in, click "Users" in the sidebar.
Expected: table renders with skeleton rows while loading, then either real user rows (if backend reachable) or an empty state (if the list is empty) — never a crash. Pagination buttons disable correctly at page 1. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add n8-admin/src/hooks/useUsers.js n8-admin/src/pages/Users.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add read-only Users page"
```

---

## Task 9: Venues Page (full CRUD + feature toggle)

**Files:**
- Create: `n8-admin/src/hooks/useVenues.js`
- Create: `n8-admin/src/pages/Venues.jsx`
- Modify: `n8-admin/src/App.jsx` (replace `/venues` placeholder)

**Interfaces:**
- Consumes: `venueApi.*` (Task 4), `uploadApi.image` (Task 4), `DataTable`, `Pagination`, `ImageUploader` (Task 7), `Dialog*`, `ConfirmDialog`, `Switch` (Task 3), `Button`, `Input`, `Label`, `Textarea`, `Badge`, `toast` (Task 2).
- Produces: `useVenues(page, limit)` returning `{ rows, total, loading, createVenue, updateVenue, deleteVenue, setFeatured, refetch }` — same shape pattern reused by `useEvents` (Task 10).

- [ ] **Step 1: Create `src/hooks/useVenues.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import { venueApi } from '@/api/venueApi'
import { toast } from '@/components/ui/toaster'

export function useVenues(page, limit) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    venueApi
      .list(page, limit)
      .then((data) => {
        setRows(data.data || data.venues || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  async function createVenue(payload) {
    await venueApi.create(payload)
    toast.success('Venue created')
    load()
  }

  async function updateVenue(id, payload) {
    await venueApi.update(id, payload)
    toast.success('Venue updated')
    load()
  }

  async function deleteVenue(id) {
    await venueApi.remove(id)
    toast.success('Venue deleted')
    load()
  }

  async function setFeatured(id, isFeatured) {
    await venueApi.setFeatured(id, isFeatured)
    toast.success(isFeatured ? 'Marked as featured' : 'Removed from featured')
    load()
  }

  return { rows, total, loading, createVenue, updateVenue, deleteVenue, setFeatured, refetch: load }
}
```

- [ ] **Step 2: Create `src/pages/Venues.jsx`**

```jsx
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toaster'
import { uploadApi } from '@/api/uploadApi'
import { useVenues } from '@/hooks/useVenues'

const emptyForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  description: '',
  imageUrls: [],
}

export default function Venues() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading, createVenue, updateVenue, deleteVenue, setFeatured } = useVenues(page, limit)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmId, setConfirmId] = useState(null)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(row) {
    setEditingId(row.id || row._id)
    setForm({
      name: row.name || '',
      address: row.address || '',
      latitude: row.latitude ?? '',
      longitude: row.longitude ?? '',
      description: row.description || '',
      imageUrls: row.imageUrls || [],
    })
    setFormOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const payload = {
      name: form.name,
      address: form.address,
      latitude: form.latitude === '' ? undefined : Number(form.latitude),
      longitude: form.longitude === '' ? undefined : Number(form.longitude),
      description: form.description,
      imageUrls: form.imageUrls,
    }
    if (editingId) {
      await updateVenue(editingId, payload)
    } else {
      await createVenue(payload)
    }
    setFormOpen(false)
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (row) => (
        <Switch
          checked={!!row.isFeatured}
          onCheckedChange={(checked) => setFeatured(row.id || row._id, checked)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirmId(row.id || row._id)}>
            <Trash2 size={16} className="text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Venues</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New Venue
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-surface">
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No venues yet." />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Venue' : 'New Venue'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="v-name">Name</Label>
              <Input id="v-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="v-address">Address</Label>
              <Input id="v-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="v-lat">Latitude</Label>
                <Input
                  id="v-lat"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="v-lng">Longitude</Label>
                <Input
                  id="v-lng"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="v-desc">Description</Label>
              <Textarea
                id="v-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <ImageUploader
              value={form.imageUrls}
              onChange={(imageUrls) => setForm({ ...form, imageUrls })}
              uploadFn={uploadApi.image}
              label="Venue Images"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create venue'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this venue?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && deleteVenue(confirmId)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Modify `src/App.jsx`**

```jsx
import Venues from '@/pages/Venues'
// ...
<Route path="/venues" element={<Venues />} />
```

- [ ] **Step 4: Manual verification**

Run: `cd n8-admin && npm run dev`, navigate to Venues.
Expected: table + "New Venue" button render; opening the dialog shows name/address/lat/lng/description/image uploader fields; submitting without a name shows a toast error and does not call the API. If a live backend is reachable, exercise create → edit → feature-toggle → delete and confirm each toasts success and the table refreshes; if not reachable, note explicitly which parts were only checked visually (form validation, dialog open/close) versus not exercised against a real API (create/edit/delete/feature network calls). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add n8-admin/src/hooks/useVenues.js n8-admin/src/pages/Venues.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add Venues CRUD page with feature toggle and image upload"
```

---

## Task 10: Events Page (full CRUD + feature toggle)

**Files:**
- Create: `n8-admin/src/hooks/useEvents.js`
- Create: `n8-admin/src/pages/Events.jsx`
- Modify: `n8-admin/src/App.jsx` (replace `/events` placeholder)

**Interfaces:**
- Consumes: `eventApi.*` (Task 4), same shared components as Task 9.
- Produces: `useEvents(page, limit)` — identical shape to `useVenues`.

- [ ] **Step 1: Create `src/hooks/useEvents.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import { eventApi } from '@/api/eventApi'
import { toast } from '@/components/ui/toaster'

export function useEvents(page, limit) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    eventApi
      .list(page, limit)
      .then((data) => {
        setRows(data.data || data.events || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  async function createEvent(payload) {
    await eventApi.create(payload)
    toast.success('Event created')
    load()
  }

  async function updateEvent(id, payload) {
    await eventApi.update(id, payload)
    toast.success('Event updated')
    load()
  }

  async function deleteEvent(id) {
    await eventApi.remove(id)
    toast.success('Event deleted')
    load()
  }

  async function setFeatured(id, isFeatured) {
    await eventApi.setFeatured(id, isFeatured)
    toast.success(isFeatured ? 'Marked as featured' : 'Removed from featured')
    load()
  }

  return { rows, total, loading, createEvent, updateEvent, deleteEvent, setFeatured, refetch: load }
}
```

- [ ] **Step 2: Create `src/pages/Events.jsx`**

```jsx
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toaster'
import { uploadApi } from '@/api/uploadApi'
import { useEvents } from '@/hooks/useEvents'

const emptyForm = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  description: '',
  imageUrls: [],
}

export default function Events() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { rows, total, loading, createEvent, updateEvent, deleteEvent, setFeatured } = useEvents(page, limit)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmId, setConfirmId] = useState(null)

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(row) {
    setEditingId(row.id || row._id)
    setForm({
      name: row.name || '',
      address: row.address || '',
      latitude: row.latitude ?? '',
      longitude: row.longitude ?? '',
      description: row.description || '',
      imageUrls: row.imageUrls || [],
    })
    setFormOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const payload = {
      name: form.name,
      address: form.address,
      latitude: form.latitude === '' ? undefined : Number(form.latitude),
      longitude: form.longitude === '' ? undefined : Number(form.longitude),
      description: form.description,
      imageUrls: form.imageUrls,
    }
    if (editingId) {
      await updateEvent(editingId, payload)
    } else {
      await createEvent(payload)
    }
    setFormOpen(false)
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    {
      key: 'isFeatured',
      header: 'Featured',
      render: (row) => (
        <Switch checked={!!row.isFeatured} onCheckedChange={(checked) => setFeatured(row.id || row._id, checked)} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setConfirmId(row.id || row._id)}>
            <Trash2 size={16} className="text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Events</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New Event
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-surface">
        <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No events yet." />
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="e-address">Address</Label>
              <Input id="e-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="e-lat">Latitude</Label>
                <Input
                  id="e-lat"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="e-lng">Longitude</Label>
                <Input
                  id="e-lng"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="e-desc">Description</Label>
              <Textarea
                id="e-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <ImageUploader
              value={form.imageUrls}
              onChange={(imageUrls) => setForm({ ...form, imageUrls })}
              uploadFn={uploadApi.image}
              label="Event Images"
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create event'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this event?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && deleteEvent(confirmId)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Modify `src/App.jsx`**

```jsx
import Events from '@/pages/Events'
// ...
<Route path="/events" element={<Events />} />
```

- [ ] **Step 4: Manual verification**

Same procedure as Task 9, Step 4, applied to `/events`. Note explicitly whether checked against a live backend or visually only.

- [ ] **Step 5: Commit**

```bash
git add n8-admin/src/hooks/useEvents.js n8-admin/src/pages/Events.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add Events CRUD page with feature toggle and image upload"
```

---

## Task 11: Subscriptions Page

**Files:**
- Create: `n8-admin/src/hooks/useSubscriptions.js`
- Create: `n8-admin/src/pages/Subscriptions.jsx`
- Modify: `n8-admin/src/App.jsx` (replace `/subscriptions` placeholder)

**Interfaces:**
- Consumes: `subscriptionApi.*` (Task 4), `Card*` (Task 2), `Dialog*`, `Button`, `Input`, `Label` (Tasks 2-3).
- Produces: `useSubscriptions()` returning `{ plans, loading, updatePlan }`.

- [ ] **Step 1: Create `src/hooks/useSubscriptions.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import { subscriptionApi } from '@/api/subscriptionApi'
import { toast } from '@/components/ui/toaster'

export function useSubscriptions() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    subscriptionApi
      .list()
      .then((data) => setPlans(data.data || data.plans || data || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function updatePlan(id, amount) {
    await subscriptionApi.update(id, { amount })
    toast.success('Plan updated')
    load()
  }

  return { plans, loading, updatePlan, refetch: load }
}
```

- [ ] **Step 2: Create `src/pages/Subscriptions.jsx`**

```jsx
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSubscriptions } from '@/hooks/useSubscriptions'

export default function Subscriptions() {
  const { plans, loading, updatePlan } = useSubscriptions()
  const [editing, setEditing] = useState(null)
  const [amount, setAmount] = useState('')

  function openEdit(plan) {
    setEditing(plan)
    setAmount(String(plan.amount ?? ''))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await updatePlan(editing.id || editing._id, Number(amount))
    setEditing(null)
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Subscriptions</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState message="No subscription plans found." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id || plan._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{plan.name || 'Plan'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                  <Pencil size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-zinc-100">₹{plan.amount}</span>
                <p className="text-sm text-muted">per {plan.duration || 'period'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan Price</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="s-amount">Amount (₹)</Label>
              <Input id="s-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 3: Modify `src/App.jsx`**

```jsx
import Subscriptions from '@/pages/Subscriptions'
// ...
<Route path="/subscriptions" element={<Subscriptions />} />
```

- [ ] **Step 4: Manual verification**

Run: `cd n8-admin && npm run dev`, navigate to Subscriptions.
Expected: plan cards render (or empty state), editing a plan's amount and saving shows a success toast and refreshes the displayed amount when a live backend is reachable; otherwise note this as unverified against a live API.

- [ ] **Step 5: Commit**

```bash
git add n8-admin/src/hooks/useSubscriptions.js n8-admin/src/pages/Subscriptions.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add Subscriptions page with plan price editing"
```

---

## Task 12: Social Feed Moderation Page

**Files:**
- Create: `n8-admin/src/hooks/useSocialFeed.js`
- Create: `n8-admin/src/pages/SocialFeed.jsx`
- Modify: `n8-admin/src/App.jsx` (replace `/social-feed` placeholder)

**Interfaces:**
- Consumes: `socialFeedApi.*` (Task 4), `Card*`, `Badge` (Task 2), `ConfirmDialog` (Task 3), `Pagination` (Task 7).
- Produces: `useSocialFeed(page, limit)` returning `{ posts, total, loading, loadComments, deletePost }`.

- [ ] **Step 1: Create `src/hooks/useSocialFeed.js`**

```js
import { useEffect, useState, useCallback } from 'react'
import { socialFeedApi } from '@/api/socialFeedApi'
import { toast } from '@/components/ui/toaster'

export function useSocialFeed(page, limit) {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    socialFeedApi
      .list(page, limit)
      .then((data) => {
        setPosts(data.data || data.posts || data || [])
        setTotal(typeof data.total === 'number' ? data.total : null)
      })
      .finally(() => setLoading(false))
  }, [page, limit])

  useEffect(() => {
    load()
  }, [load])

  async function deletePost(id) {
    await socialFeedApi.remove(id)
    toast.success('Post deleted')
    load()
  }

  async function loadComments(id) {
    const data = await socialFeedApi.comments(id)
    return data.data || data.comments || data || []
  }

  return { posts, total, loading, deletePost, loadComments, refetch: load }
}
```

- [ ] **Step 2: Create `src/pages/SocialFeed.jsx`**

```jsx
import { useState } from 'react'
import { Trash2, MessageCircle, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useSocialFeed } from '@/hooks/useSocialFeed'

export default function SocialFeed() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { posts, total, loading, deletePost, loadComments } = useSocialFeed(page, limit)

  const [confirmId, setConfirmId] = useState(null)
  const [openComments, setOpenComments] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)

  async function handleToggleComments(postId) {
    if (openComments === postId) {
      setOpenComments(null)
      return
    }
    setOpenComments(postId)
    setCommentsLoading(true)
    try {
      const list = await loadComments(postId)
      setComments(list)
    } finally {
      setCommentsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">Social Feed Moderation</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState message="No posts found." />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const id = post.id || post._id
            return (
              <Card key={id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-zinc-100">{post.user?.name || 'Unknown user'}</p>
                      <p className="text-sm text-zinc-300">{post.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setConfirmId(id)}>
                      <Trash2 size={16} className="text-red-400" />
                    </Button>
                  </div>

                  {post.imageUrls?.length ? (
                    <div className="flex gap-2">
                      {post.imageUrls.map((url) => (
                        <img key={url} src={url} alt="" className="h-20 w-20 rounded-md object-cover" />
                      ))}
                    </div>
                  ) : null}

                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Heart size={14} /> {post.likeCount ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleComments(id)}
                      className="flex items-center gap-1 hover:text-zinc-200"
                    >
                      <MessageCircle size={14} /> {post.commentCount ?? 0}
                    </button>
                  </div>

                  {openComments === id ? (
                    <div className="rounded-md border border-zinc-800 bg-elevated p-3">
                      {commentsLoading ? (
                        <Skeleton className="h-6 w-full" />
                      ) : comments.length === 0 ? (
                        <p className="text-sm text-muted">No comments.</p>
                      ) : (
                        <ul className="space-y-2">
                          {comments.map((c) => (
                            <li key={c.id || c._id} className="text-sm text-zinc-300">
                              <span className="font-medium text-zinc-100">{c.user?.name || 'User'}:</span>{' '}
                              {c.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-zinc-800 bg-surface">
        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this post?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmId && deletePost(confirmId)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Modify `src/App.jsx`**

```jsx
import SocialFeed from '@/pages/SocialFeed'
// ...
<Route path="/social-feed" element={<SocialFeed />} />
```

- [ ] **Step 4: Manual verification**

Run: `cd n8-admin && npm run dev`, navigate to Social Feed.
Expected: posts render (or empty state), clicking the comment icon expands/collapses the comments panel and shows a skeleton while loading, delete opens the confirm dialog and only deletes on confirm. Note explicitly if checked without a live backend.

- [ ] **Step 5: Commit**

```bash
git add n8-admin/src/hooks/useSocialFeed.js n8-admin/src/pages/SocialFeed.jsx n8-admin/src/App.jsx
git commit -m "feat(n8-admin): add Social Feed moderation page"
```

---

## Task 13: Vercel Deployment Config & Final Verification

**Files:**
- Create: `n8-admin/vercel.json`
- Create: `n8-admin/README.md`

**Interfaces:**
- Consumes: nothing new — this task packages the app built in Tasks 1-12 for deployment.
- Produces: a deployable static build (`npm run build` → `dist/`) with correct SPA routing on Vercel.

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Create `README.md`**

```md
# Night Club Admin Panel

Admin panel for the Night Club API (see `Night Club API.postman_collection.json`).

## Setup

npm install
cp .env.example .env.local   # set VITE_API_BASE_URL if not localhost:3005

## Develop

npm run dev

## Build

npm run build   # outputs to dist/

## Deploy

Deploy this folder (`n8-admin/`) as its own Vercel project. Set `VITE_API_BASE_URL`
as an environment variable in the Vercel project settings for each environment.

## Known backend gaps (see docs/specs/2026-08-27-nightclub-admin-panel-design.md §12)

- `POST /auth/admin/login` must be implemented + an admin user seeded with
  `{ email, password }` in / `{ token, admin }` out.
- No payments-list endpoint — Payments module intentionally not built.
- No admin user CRUD — Users page is read-only by design.
```

- [ ] **Step 3: Full manual verification pass**

Run: `cd n8-admin && npm install && npm run build`
Expected: clean build, no errors, `dist/` produced.

Run: `npm run preview`
Expected: open the printed local URL, confirm `/` redirects to `/login` when logged out, the login page shows the animated club background, and (if a token exists in `localStorage`) navigating directly to `/venues`, `/events`, `/subscriptions`, `/users`, `/social-feed` all render without console errors. Stop the preview server after checking.

State explicitly in your final report which flows were verified end-to-end against a live backend versus verified visually/structurally only (per Global Constraints — never claim a flow works if it wasn't actually exercised).

- [ ] **Step 4: Commit**

```bash
git add n8-admin/vercel.json n8-admin/README.md
git commit -m "chore(n8-admin): add Vercel SPA rewrite config and README"
```
