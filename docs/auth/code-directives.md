# Next.js Code Directives (Better Auth & React 19)

This sheet documents the direct architectural paradigms and implementation rules enforced in the Next.js `apps/web` workspace. AI agents and developers **MUST** follow these specific instructions to maintain type safety and avoid edge runtime or client-server rendering conflicts.

---

## 📂 1. Core Architecture Split

To avoid importing server-only secrets (such as database credentials, service roles, or API secrets) into client bundles, auth configurations **MUST** be cleanly decoupled:

- **Server-Only Setup (`apps/web/lib/auth.ts`)**:
  - **Do**: Place the primary Better Auth engine instance here.
  - **Do**: Configure the database adapter, social providers, and email/password settings here.
  - **Do Not**: Import client-side React code or run this on edge environments that lack Node-based PostgreSQL bindings.
- **Client-Only Setup (`apps/web/lib/auth-client.ts`)**:
  - **Do**: Use the dedicated React-compatible client creation utilities here.
  - **Do**: Export hooks and simple functions (like useSession, signIn, signUp, and signOut) for interactive views.
  - **Do Not**: Import any server environment variables or database libraries into this file.

---

## ⚡ 2. Core Integration Steps

### Server Instance Setup

- **Do**: Connect the main Better Auth engine using a serverless-friendly PostgreSQL adapter or a Supabase connection pool.
- **Do**: Enable credentials signup, email/password options, and mandate verified emails.
- **Do**: Register OAuth providers (specifically Google) using secure client IDs and secrets read directly from environment variables.

### Client Hooks Setup

- **Do**: Initialize a React-compatible authentication client, pointing it dynamically to the public web application URL.
- **Do**: Export lightweight auth functions for components to reference directly.

### API Routing Hub

- **Do**: Configure a Next.js wildcard dynamic route handler in the app router under `apps/web/app/api/auth/[...auth]/route.ts`.
- **Do**: Wire this route directly to export both `GET` and `POST` handlers mapped from the server auth instance.

---

## 🛡️ 3. Client & Server Component Usage Rules

### Rule 1: Server Session Retrieval

- **Do Not**: Request session states via internal HTTP calls (such as using `fetch` or `axios` targeting `/api/auth/session`) within server components. This introduces slow, redundant loopbacks and degrades Largest Contentful Paint (LCP).
- **Do**: Retrieve session information in server pages and layouts by invoking the server auth API utility directly.
- **Do**: Pass incoming HTTP headers (sourced from Next.js headers helpers) directly into the server API utility to validate cookies.

### Rule 2: Client Hooks Scope

- **Do Not**: Call client session hooks (such as `useSession`) inside React Server Components.
- **Do**: Restrict all client-side authentication hooks strictly to files marked with the `'use client'` directive.

---

## 🚦 4. Route Guarding via Next.js Middleware

A centralized middleware system in the root of the web app must control route accessibility:

- **Do**: Define clear arrays of protected routes (such as dashboards, user settings, and analytics panels) and guest-only authentication pages (such as login, register, and password-reset pages).
- **Do**: Read the session token cookie from the incoming request's cookie store to check active session presence.
- **Do**: Redirect unauthenticated visitors attempting to access any protected route directly to the `/login` page.
- **Do**: Append the original requested path as a callback query parameter so users return to their desired destination upon successful login.
- **Do**: Redirect already authenticated users trying to access guest auth pages (like login or signup) back to the main dashboard.
- **Do**: Match only relevant path segments in the middleware configuration matcher to keep non-auth static assets and API paths fast.

---

## ⚛️ 5. React 19 Form & Hook Integration

Since Next.js 16 utilizes React 19, the UI **MUST** coordinate with React's native state handlers:

- **Do**: Manage login, registration, and recovery form actions using React 19's native `useActionState` hook to manage form states, pending load cycles, and validation errors.
- **Do**: Perform the actual login or signup trigger inside a server-side action or a custom async function.
- **Do**: Submit the form payload (email and password inputs) to the auth client's sign-in functions.
- **Do**: Handle errors returned by the auth client inside the form action and return them as state feedback.
- **Do**: Render inline, clean messages using structural elements rather than browser popups.
- **Do**: Disable inputs and display loading spinners when form submission is pending.
