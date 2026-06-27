@AGENTS.md

# Link Smasher — Web Application Rules

## Authentication Rules

### Provider
- **Better Auth** (`better-auth`) is the sole authentication provider. Do NOT introduce any other auth library (NextAuth, Clerk, Auth0, Supabase Auth, etc.).
- Better Auth is a TypeScript-first, framework-agnostic auth library with first-class Next.js support.

### Setup & Configuration
- Define the Better Auth server instance in `lib/auth.ts` using `betterAuth()` from `better-auth`.
- Export the auth client from `lib/auth-client.ts` using `createAuthClient()` from `better-auth/react` for client-side hooks.
- Mount the Better Auth API handler at `app/api/auth/[...all]/route.ts` — this is the catch-all route that handles all auth endpoints (`/api/auth/*`).

### Database
- Better Auth manages its own auth tables (`user`, `session`, `account`, `verification`). Use the **Supabase PostgreSQL** database as the underlying datastore via a Prisma or Drizzle adapter, or the built-in `pg` pool adapter.
- The `links` table references `user.id` from Better Auth's user table. Update the foreign key accordingly.
- Do NOT use Supabase Auth RLS policies tied to `auth.uid()` — use Better Auth sessions to identify the user server-side and query with explicit `WHERE user_id = ?` clauses.

### Environment Variable
- Never hardcode secrets. Always read from environment variables.

### Session & Token Handling
- Better Auth uses **HTTP-only, secure cookies** for sessions by default. Do NOT override this to use localStorage or sessionStorage.
- Use `auth.api.getSession()` in Server Components, Route Handlers, and Server Actions to retrieve the current session.
- Use the `useSession()` hook from `better-auth/react` in Client Components.
- Sessions are validated on every request — no need for manual JWT verification.

### Route Protection
- Protect routes in `proxy.ts` (or `middleware.ts`) by checking the session cookie. If no valid session exists for protected routes, redirect to `/login`.
- The proxy/middleware matcher is: `["/dashboard/:path*", "/settings/:path*"]`.
- Public routes: `/`, `/login` — these must be accessible without authentication.
- API routes under `/api/*` (except `/api/auth/*`) must validate the session via `auth.api.getSession({ headers })`. Do NOT trust client-provided user IDs — always extract the user from the verified session.

### Auth Flows
- Support **email/password** sign-up and sign-in at minimum.
- Social OAuth providers (Google, GitHub) can be added via Better Auth plugins — not required initially.
- After successful login, redirect to `/dashboard`.
- After logout, call `authClient.signOut()` on the client, then redirect to `/`.
- Handle auth errors gracefully — show user-friendly messages, never expose raw error internals.

### Security Rules
- Always validate and sanitize user input on both client and server.
- Never trust the client — all authorization checks must be performed server-side using `auth.api.getSession()`.
- Better Auth handles CSRF protection internally. Do NOT disable it.
- Set `Secure`, `HttpOnly`, and `SameSite=Lax` flags on auth cookies (Better Auth defaults).

---

## Project Overview

- **App name**: Link Smasher
- **Purpose**: A URL shortener web app that syncs with a companion Chrome browser extension.
- **Backend**: Supabase PostgreSQL for data storage. Better Auth for authentication.
- **Framework**: Next.js 16 (App Router) with Turbopack.
- **Runtime**: Node.js. This is a monorepo — the web app lives at `apps/web/`.

---

## Tech Stack Rules

### Framework & Bundler
- **Next.js 16.2+** with the **App Router** (`app/` directory). Do NOT use Pages Router (`pages/`).
- **Turbopack** is the default bundler. Do NOT add Webpack-specific config or plugins.
- Use `proxy.ts` for edge network logic (Next.js 16 replacement for `middleware.ts`). The `middleware.ts` convention is deprecated.

### Language
- **TypeScript** is mandatory for all files. No `.js` or `.jsx` files.
- Use strict mode (`"strict": true`). Do NOT disable or loosen any strict checks.
- Prefer explicit type annotations for function parameters and return types. Avoid `any` — use `unknown` and narrow with type guards when the type is genuinely unknown.

### Package Manager
- **pnpm** is the package manager. Do NOT use `npm` or `yarn`.
- Install dependencies scoped to the web workspace: `pnpm --filter web add <package>`.
- Never install to the monorepo root unless it's a shared devDependency.

---

## Project Structure

```
apps/web/
├── app/                  # Next.js App Router pages & layouts
│   ├── api/
│   │   ├── auth/[...all]/ # Better Auth catch-all handler
│   │   └── links/         # Links API routes
│   ├── dashboard/        # Protected — requires auth
│   ├── login/            # Public — auth page
│   ├── settings/         # Protected — requires auth
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page (public)
├── components/           # Reusable React components
├── lib/
│   ├── auth.ts           # Better Auth server instance
│   ├── auth-client.ts    # Better Auth client (React hooks)
│   └── supabase.ts       # Supabase client (data queries only)
├── proxy.ts              # Route protection (replaces middleware.ts)
├── next.config.ts        # Next.js configuration
├── package.json
└── tsconfig.json
```

### Conventions
- **Pages**: One `page.tsx` per route directory. Co-locate `loading.tsx`, `error.tsx`, and `not-found.tsx` as needed.
- **Layouts**: Use `layout.tsx` for shared UI shells. Layouts do NOT re-render on navigation.
- **Components**: Place in `components/` at the web app root. Group by feature if the folder grows large (e.g., `components/dashboard/`, `components/ui/`).
- **Lib**: Place utilities, API clients, constants, and type definitions in `lib/`.
- Do NOT create a `src/` directory — all code lives directly under `apps/web/`.

---

## Component Rules

### Server vs Client Components
- **Default to Server Components.** Only add `"use client"` when the component needs browser APIs, React hooks (`useState`, `useEffect`, etc.), or event handlers.
- Keep client components as small and leaf-level as possible. Push data fetching up to server components and pass data down as props.
- Never mark layout files as `"use client"` unless absolutely necessary.

### Naming
- Use **PascalCase** for component files and exports: `LinkCard.tsx`, `export default function LinkCard()`.
- Use **camelCase** for utility files: `formatUrl.ts`, `useClipboard.ts`.
- Custom hooks must start with `use`: `useAuth.ts`, `useLinks.ts`.

### Imports
- Use the `@/*` path alias for imports within the web app (e.g., `import { auth } from "@/lib/auth"`).
- Prefer named exports for utilities and types. Use default exports only for page/layout components (Next.js convention).

---

## Styling Rules

- **Tailwind CSS** is the primary styling solution. Do NOT use vanilla CSS unless absolutely necessary (e.g., a third-party library requires it or for global CSS resets).
- Use `cn()` utility (`clsx` + `tailwind-merge`) for conditional class merging.
- Use `class-variance-authority` (CVA) for component variant definitions (size, color, state).
- Inline styles should be avoided — use Tailwind utility classes instead.
- Icons come from **lucide-react**. Do NOT add other icon libraries without discussion.


---

## API Route Rules

### Structure
- API routes live under `app/api/`. Each route exports named functions: `GET`, `POST`, `PATCH`, `DELETE`.
- Use `NextRequest` and `NextResponse` from `next/server`.
- Dynamic route params are async in Next.js 16: `{ params }: { params: Promise<{ id: string }> }` — always `await params`.

### Response Format
- Return consistent JSON shapes: `{ data: ... }` for success, `{ error: "message" }` for errors.
- Always set appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Validate request bodies before processing. Return 400 with a descriptive error for malformed input.

### CORS
- API routes are same-origin by default. If the Chrome extension needs to call them, configure CORS headers explicitly for the extension origin only — never use `*`.

---

## Error Handling

- Wrap async operations in try/catch. Never let unhandled promise rejections crash the server.
- Use `error.tsx` boundary files for page-level error recovery.
- Use `loading.tsx` or React Suspense for loading states — never leave the user staring at a blank screen.
- Log errors with context (route, user action) but never log sensitive data (tokens, passwords, full request bodies).

---

## Performance

- Prefer Server Components for data fetching — avoid client-side `useEffect` + `fetch` patterns when the data can be loaded on the server.
- Use Next.js `<Image>` for optimized image loading.
- Use Next.js `<Link>` for client-side navigation — never use raw `<a>` tags for internal routes.
- Lazy-load heavy client components with `dynamic()` from `next/dynamic`.

---

## Monorepo Rules

- The web app (`apps/web`) and extension (`apps/extension`) are separate workspaces. Do NOT import directly between them.
- Shared code (types, constants, utilities) should go in `packages/` if needed by both apps.
- Run web-specific commands via the root: `pnpm dev:web`, `pnpm build:web`, `pnpm start:web`.

---

## Git & Code Quality

- Write clear, descriptive commit messages. Prefix with scope: `web: add login page`, `api: fix links validation`.
- Do NOT commit `.env`, `node_modules/`, `.next/`, or editor-specific files.
- Keep PRs focused — one feature or fix per PR.
