<div align="center">

# 🔗 Link Smasher

**Save, organize, and sync your links from anywhere — without breaking your flow.**

Link Smasher (shipped as the **Link Crust** browser extension) is a local-first link
manager that pairs a one-click Chrome extension with a polished Next.js dashboard.
Bookmark any page or social post instantly, then search, tag, and manage everything
from a single cloud-synced vault.

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Scripts](#-scripts) · [Project Structure](#-project-structure) · [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🗂️ Unified Link Vault
- **Local-first storage** — bookmarks, tags, and notes save instantly and work offline.
- **Cloud sync** — links sync automatically to Supabase PostgreSQL once you sign in, with real-time updates across devices.

### 📌 Smart Page Bookmarking *(Link Crust extension)*
- **Floating bookmark button** — a subtle, glassmorphic button on every page for one-click saves.
- **Contrast-aware UI** — the button reads the page background brightness and adapts to stay legible.
- **Per-site hiding** — a "Hide on this site" toggle keeps the button out of editors, games, and design tools.
- **Inline editor** — already saved? Clicking the button opens an on-page modal to edit tags, notes, or category.
- **Keyboard shortcuts** — save a link or open the popup overlay with custom hotkeys.

### 📰 Social Feed Saving
Injects native-looking save buttons directly into posts on **LinkedIn, X, Instagram,
Facebook, Reddit, and Threads** — and auto-extracts the post text, author, timestamp,
and media so context comes along for the ride.

### 🖥️ Web Dashboard
- Centralized place to **search, tag, filter, and organize** every saved link.
- Secure authentication via **Better Auth** (email + Google OAuth).
- Categories, batch import/export, usage analytics, and user settings.

---

## 🏗️ Architecture

Link Smasher is a **pnpm monorepo** with two apps and a shared package:

```
┌─────────────────┐         ┌──────────────────┐
│  Link Crust     │  HTTPS  │   Next.js Web    │
│  Extension      │ ──────► │   App + API      │
│  (WXT + React)  │         │  (Better Auth)   │
└─────────────────┘         └────────┬─────────┘
        │                            │
        │ local-first store          │ Prisma
        ▼                            ▼
   chrome.storage            Supabase PostgreSQL
                              (+ Realtime sync)
```

- The **extension** stores links locally first, then talks to the web app's API for auth and sync.
- The **web app** owns authentication (Better Auth) and all data access (Prisma → Supabase).
- **Authorization is enforced at the API layer**, not via Supabase RLS — Better Auth users don't carry Supabase JWTs. Supabase RLS is enabled only so Realtime can broadcast change events.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20 (developed on Node 26)
- **pnpm** ≥ 11 (`npm install -g pnpm`)
- A **Supabase** project (PostgreSQL + Realtime)
- **Google OAuth** credentials (for social login)

### 1. Install
```bash
git clone <repo-url> link-smasher
cd link-smasher
pnpm install
```

### 2. Configure environment
Copy the template and fill in your values:
```bash
cp .env.example .env
```

> ⚠️ Never commit `.env`. Extension vars **must** be prefixed with `WXT_`; client-exposed web vars with `NEXT_PUBLIC_`.

### 3. Set up the database
Apply the Prisma schema, then run the RLS policies in the Supabase SQL Editor
(only the policy section of `supabase/schema.sql` should be run manually):
```bash
pnpm --filter web exec prisma migrate deploy
```

### 4. Run it
```bash
pnpm dev:web        # Next.js dashboard → http://localhost:3000
pnpm dev:extension  # WXT dev server, loads the extension in Chrome
```

For the extension, WXT opens a Chrome instance with it pre-loaded. To load a build
manually, run `pnpm build:extension` and load `apps/extension/.output/chrome-mv3`
via `chrome://extensions` → **Load unpacked**.

---

## 📜 Scripts

Run from the repo root:

| Command | Description |
|---|---|
| `pnpm dev:web` | Start the Next.js dev server |
| `pnpm build:web` | Production build of the web app |
| `pnpm start:web` | Start the production web server |
| `pnpm dev:extension` | Start the WXT dev server (Chrome) |
| `pnpm build:extension` | Production build of the extension |
| `pnpm compile:extension` | Type-check the extension (`tsc --noEmit`) |

Extension-only extras (run with `pnpm --filter extension <script>`): `zip`, `zip:firefox`.

---

## 📁 Project Structure

```
link-smasher/
├── apps/
│   ├── web/                  # Next.js 16 dashboard + API
│   │   ├── app/
│   │   │   ├── (auth)/       # Login / signup routes
│   │   │   ├── (protected)/  # Dashboard (auth-gated)
│   │   │   ├── (settings)/   # User settings
│   │   │   └── api/          # links, categories, shortcuts, analytics, auth
│   │   ├── components/       # UI (shadcn/Radix + Tailwind)
│   │   └── prisma/           # Prisma schema & client
│   └── extension/            # Chrome extension (WXT + React)
│       └── src/
│           ├── entrypoints/  # background, popup, content scripts
│           ├── components/   # floating bookmark, link dialog, UI
│           ├── core/         # api, auth, storage, store (Zustand), supabase
│           └── features/     # social-feed-saver
├── packages/
│   └── shared/               # Zod schemas, shared types & constants
├── supabase/                 # Reference schema + RLS policies
└── pnpm-workspace.yaml
```

> **Workspace boundary:** `apps/web` and `apps/extension` never import from each other.
> Anything shared by both lives in `packages/shared` (`@link-smasher/shared`).

### API surface (web app)
| Route | Purpose |
|---|---|
| `/api/auth/[...all]` | Better Auth handler (sessions, OAuth) |
| `/api/links`, `/api/links/[id]` | CRUD for links |
| `/api/categories`, `/api/categories/[id]` | CRUD for categories |
| `/api/shortcuts` | User keyboard-shortcut preferences |
| `/api/analytics/{events,summary,time}` | Usage events & analytics |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript (strict, everywhere) |
| **Monorepo** | pnpm workspaces |
| **Web** | Next.js 16, React 19, Better Auth, Prisma |
| **Extension** | WXT, React 19, Zustand, Manifest V3 |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI, CVA, `tailwind-merge` |
| **Icons** | lucide-react |
| **Validation** | Zod |
| **Database** | Supabase PostgreSQL (+ Realtime) |

---
