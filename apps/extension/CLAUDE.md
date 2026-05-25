# Link Smasher — Chrome Extension Rules

## Overview

- **Extension name**: Link Crust
- **Framework**: WXT (Web Extension Toolkit) with React.
- **Manifest**: Manifest V3. Do NOT use Manifest V2 APIs.
- **Permissions**: `storage`, `tabs`, `activeTab`. Do NOT request additional permissions without discussion.
- **Styling**: Tailwind CSS v4. Do NOT use vanilla CSS unless absolutely necessary.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **WXT** | Extension framework (dev server, build, manifest generation) |
| **React 19** | UI rendering |
| **Tailwind CSS v4** | Styling (`@tailwindcss/vite` + `@tailwindcss/postcss`) |
| **Zustand** | Client state management |
| **Supabase JS** | Database client (data queries + auth token for RLS) |
| **Radix UI** | Headless accessible primitives (Dialog, Tabs, ScrollArea, etc.) |
| **CVA** | Component variant definitions |
| **cmdk** | Command palette UI |
| **Zod** | Runtime validation |
| **lucide-react** | Icons |
| **sonner** | Toast notifications |

---

## Project Structure

```
apps/extension/
├── src/
│   ├── entrypoints/
│   │   ├── popup/            # Extension popup (main UI)
│   │   │   ├── App.tsx
│   │   │   ├── index.html
│   │   │   ├── index.tsx
│   │   │   ├── popup.store.ts
│   │   │   ├── popup.types.ts
│   │   │   └── components/   # Popup-specific components
│   │   ├── background/       # Background service worker
│   │   │   └── index.ts
│   │   ├── main.content.tsx  # Content script (main pages)
│   │   └── social-feed.content.tsx  # Content script (social feeds)
│   ├── components/
│   │   ├── ui/               # Shared UI primitives (Button, Input, etc.)
│   │   └── link-dialog/      # Link save/edit dialog
│   ├── core/
│   │   ├── services/         # Business logic services
│   │   ├── storage/          # WXT storage wrappers
│   │   ├── store/            # Zustand stores
│   │   ├── supabase/         # Supabase client
│   │   └── utils/            # Core utilities
│   ├── features/
│   │   └── social-feed-saver/  # Feature modules
│   ├── shared/
│   │   ├── constants/        # Shared constants
│   │   ├── types/            # TypeScript type definitions
│   │   └── validation/       # Zod schemas
│   ├── lib/
│   │   └── utils.ts          # Utility helpers (cn, etc.)
│   ├── context/              # React context providers
│   ├── custom-style/         # Custom CSS overrides (use sparingly)
│   ├── assets/               # Static assets
│   └── index.css             # Tailwind CSS entry point
├── public/                   # Static files copied to output
├── wxt.config.ts             # WXT configuration
├── tsconfig.json
└── package.json
```

---

## Entrypoint Rules

### Popup (`entrypoints/popup/`)
- The popup is the main user interface. It opens when clicking the extension icon.
- Keep it fast — the popup should render instantly. Avoid heavy computations on mount.
- State management lives in `popup.store.ts` (Zustand).
- Popup-specific components go in `entrypoints/popup/components/`.

### Background Service Worker (`entrypoints/background/`)
- Runs as a Manifest V3 service worker — NOT a persistent background page.
- It can be terminated at any time by the browser. Do NOT rely on in-memory state persisting.
- Use `chrome.storage` (via WXT storage wrappers) for persistent state.
- Use `@webext-core/messaging` for message passing between popup, content scripts, and background.

### Content Scripts (`*.content.tsx`)
- Injected into web pages. They run in an isolated world — they cannot access the page's JS context directly.
- `main.content.tsx` — general content script for all pages.
- `social-feed.content.tsx` — specialized content script for social media feeds.
- Keep content scripts lightweight. They affect page performance.
- Content script UI must use Shadow DOM to avoid style conflicts with the host page.

---

## Styling Rules

- **Tailwind CSS v4** is the primary styling solution. Do NOT write vanilla CSS unless a third-party library or Shadow DOM isolation requires it.
- The Tailwind entry point is `src/index.css`.
- Use `cn()` from `@/lib/utils` for conditional class merging (`clsx` + `tailwind-merge`).
- Use `class-variance-authority` (CVA) to define component variants (size, color, state).
- PostCSS uses `rem-to-px` conversion (`@thedutchcoder/postcss-rem-to-px`) to ensure consistent sizing in extension contexts where the host page's root font size varies.
- Custom CSS overrides go in `src/custom-style/` — use sparingly and document why vanilla CSS was needed.

---

## Component Rules

### UI Primitives (`components/ui/`)
- These are the foundational components (Button, Input, Badge, Card, etc.).
- Built on Radix UI primitives for accessibility (keyboard nav, ARIA, focus management).
- Styled with Tailwind + CVA. Each component should support variants via `className` prop.
- Follow the shadcn/ui pattern: copy-paste components, not installed as a dependency.

### Feature Components
- Group by feature in `features/` (e.g., `features/social-feed-saver/`).
- Each feature should be self-contained with its own components, hooks, and logic.

### Naming
- **PascalCase** for components: `LinkCard.tsx`, `SaveDialog.tsx`.
- **camelCase** for utilities and stores: `popup.store.ts`, `utils.ts`.
- **kebab-case** for feature directories: `social-feed-saver/`, `link-dialog/`.

---

## State Management

### Zustand
- Create stores in `core/store/` for global state or `entrypoints/popup/popup.store.ts` for popup-specific state.
- Use the slice pattern for large stores.
- Persist state using WXT's storage API, NOT Zustand's `persist` middleware (which uses localStorage, unavailable in service workers).

### WXT Storage
- Use WXT's `storage` module for cross-context persistent state (accessible from popup, background, and content scripts).
- Wrap storage access in `core/storage/` utilities.

---

## Authentication (Extension Side)

- The extension uses **Supabase JS client** (`@supabase/supabase-js`) for data queries.
- Auth tokens are obtained from the web app's Better Auth system. The extension stores the session token in `chrome.storage.local`.
- Use `WXT_SUPABASE_URL` and `WXT_SUPABASE_ANON_KEY` environment variables (WXT auto-prefixes with `import.meta.env`).
- Never store raw passwords. Only store session tokens.
- Always check auth state before making Supabase queries.

---

## Environment Variables

- All env vars must be prefixed with `WXT_` for WXT to expose them via `import.meta.env.WXT_*`.
- Define defaults in `.env.example`. Never commit `.env`.
- Access via `import.meta.env.WXT_SUPABASE_URL` — NOT `process.env`.

---

## Build & Development

### Commands
| Command | Description |
|---|---|
| `pnpm dev:extension` | Start WXT dev server (Chrome, hot reload) |
| `pnpm build:extension` | Production build for Chrome |
| `pnpm compile:extension` | TypeScript type-check only |
| `pnpm --filter extension dev:firefox` | Dev for Firefox |
| `pnpm --filter extension build:firefox` | Build for Firefox |
| `pnpm --filter extension zip` | Zip for Chrome Web Store submission |

### Build Output
- Build output goes to `.output/`. Do NOT commit this directory.
- WXT types go to `.wxt/`. Do NOT commit this directory.

---

## Performance

- Keep the popup bundle small. Lazy-load features not needed on initial render.
- Content scripts must be minimal — they run on every matching page and affect site performance.
- Background service worker should do as little work as possible and go idle quickly.
- Use `chrome.alarms` instead of `setInterval` in the background (service workers get killed).

---

## Security

- Follow Manifest V3 security model. No `eval()`, no inline scripts, no remote code execution.
- Validate all data from storage and external sources with Zod schemas before use.
- Never log sensitive data (tokens, user data) to the console in production builds.
- Content scripts should NOT inject arbitrary HTML — sanitize everything.
