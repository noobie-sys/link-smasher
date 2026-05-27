# Authentication Architecture & Rules Index

Welcome to the modular authentication documentation for **Link Smasher**. This directory contains isolated, highly-detailed instructions and guidelines governing every aspect of authentication in our monorepo.

Rather than overloading a single master rulebook, our instructions are separated by technical boundary to ensure high signal-to-noise ratio when implementing or debugging logic.

---

## 🗂️ Auth Rules Index

Any developer or AI agent implementing authentication logic in this repository **MUST** review the corresponding instruction sheet before writing code:

1. **[Authentication Strategy](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/strategy.md)**  
   _Authentication entry points, OAuth prioritization, anonymous access restriction, and strategic rationales._

2. **[Security Architecture](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/security.md)**  
   _Session lifetime, cookie attributes, hashing standards, brute force rate-limits, and CSRF protection._

3. **[Next.js Code Directives](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/code-directives.md)**  
   _Code rules for Next.js 16 (App Router / React 19). Instructions for API routes, middleware route guarding, Server Action sessions, and client-side hooks._

4. **[Chrome Extension Bridge](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/extension-bridge.md)**  
   _Session-sharing mechanisms between the WXT Chrome Extension and the Web App, permissions, and service worker cookie access rules._

5. **[Database Schema & Query Isolation](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/database.md)**  
   _Supabase PostgreSQL schema models, relational integrity rules, and database isolation constraints._

6. **[Secrets & Audit Logging](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/logging-env.md)**  
   _Environment variable requirements, production rotations, and PII-sanitized logging standards._

7. **[Premium UI/UX Specifications](file:///Users/amangupta/Developer/web-extension/link-smasher/docs/auth/ux-ui.md)**  
   _Visual hierarchy guidelines, Glassmorphism design system tokens, reactive input styling, loading animation states, and secure error messages._

---

## 🛠️ The Tech Stack Core

Our monorepo coordinates the following components:

- **Web Portal (`apps/web`)**: Next.js 16 (App Router)
- **Chrome Extension (`apps/extension`)**: WXT (Vite + React 19)
- **Auth Backend Engine**: **Better Auth** (type-safe, modern TS-first engine)
- **Database Layer**: Supabase PostgreSQL
