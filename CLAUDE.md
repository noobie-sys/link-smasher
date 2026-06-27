# Link Smasher — Monorepo Rules

## Project Overview

- **Product**: Link Smasher — a URL shortener/saver with a Chrome extension and a Next.js web dashboard.
- **Architecture**: pnpm monorepo with two apps and shared packages.
- **Database**: Supabase PostgreSQL (data storage only).
- **Auth**: Better Auth (`better-auth`) — used in the web app. The extension authenticates via the web app's API.

---

## Monorepo Structure

```
link-smasher/
├── apps/
│   ├── web/              # Next.js 16 web dashboard
│   └── extension/        # Chrome extension (WXT + React)
├── packages/
│   └── shared/           # Shared types, constants, utilities
├── supabase/             # Database schema & migrations
├── pnpm-workspace.yaml
├── package.json          # Root scripts
└── tsconfig.base.json    # Shared TypeScript config
```

---

## General Rules

### Language
- **TypeScript** everywhere. No `.js` or `.jsx` files in either app.
- Use strict mode. Never use any and never type safety until or unless you need it (avoid complex, over-engineered typing).

### Package Manager
- **pnpm** is the only package manager. Do NOT use `npm` or `yarn`.
- Install dependencies scoped to the correct workspace:
  - Web: `pnpm --filter web add <package>`
  - Extension: `pnpm --filter extension add <package>`
  - Root devDependencies: `pnpm add -Dw <package>`

### Workspace Boundaries
- `apps/web` and `apps/extension` are separate workspaces. Do NOT import directly between them.
- Shared code (types, constants, validation schemas) must go in `packages/shared` if needed by both apps.
- Each app has its own `node_modules`, `tsconfig.json`, and build pipeline.

### Styling
- **Tailwind CSS** is the primary styling solution across the entire monorepo. Do NOT use vanilla CSS unless absolutely necessary (e.g., a third-party library requires it or for CSS reset/normalization).
- The extension uses **Tailwind CSS v4** via `@tailwindcss/vite` and `@tailwindcss/postcss`.
- The web app should also use Tailwind CSS. Install and configure it as needed.
- Use `tailwind-merge` (`cn()` utility) for conditional class merging.
- Use `class-variance-authority` (CVA) for component variant definitions.

### Icons
- **lucide-react** is the icon library. Do NOT add other icon libraries (heroicons, react-icons, etc.) without discussion.

### Validation
- Use **Zod** for runtime schema validation (API inputs, form data, env vars).

### State Management
- Extension: **Zustand** for client state.
- Web: Prefer React Server Components + props. Use Zustand only if complex client-side state is needed.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev:web` | Start Next.js dev server |
| `pnpm build:web` | Production build of web app |
| `pnpm start:web` | Start production web server |
| `pnpm dev:extension` | Start WXT dev server (Chrome) |
| `pnpm build:extension` | Production build of extension |
| `pnpm compile:extension` | Type-check extension |

---

## Environment Variables

- Never commit `.env` files. Use `.env.example` as a template.
- Never hardcode secrets or API keys.

---

## Database

- Supabase PostgreSQL is the data layer. Schema lives in `supabase/schema.sql`.
- The `links` table has RLS enabled. Policies scope data to the authenticated user.
- For the web app, use Better Auth sessions to identify users and query with `WHERE user_id = ?`.
- For the extension, use Supabase client with the user's JWT so RLS is enforced.

---

## Git & Code Quality

- Write clear commit messages with scope: `web: ...`, `extension: ...`, `shared: ...`, `db: ...`.
- Do NOT commit `.env`, `node_modules/`, `.next/`, `.output/`, `.wxt/`, or editor-specific files.
- Keep PRs focused — one feature or fix per PR.

---

## App-Specific Rules

Each app has its own `CLAUDE.md` with detailed rules:
- `apps/web/CLAUDE.md` — Next.js 16, Better Auth, API routes, server/client components.
- `apps/extension/CLAUDE.md` — WXT, Manifest V3, content scripts, popup, background service worker.
