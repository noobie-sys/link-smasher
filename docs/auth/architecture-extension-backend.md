# Architectural Blueprint: Chrome Extension & Next.js Backend Sync

This document establishes the architecture for integrating the **Link Crust** Chrome Extension (`apps/extension`) with the **Link Smasher** Next.js & Better Auth Backend (`apps/web`).

---

## 🏛️ The Target Architecture: Unified API Gateway Pattern

Instead of the Chrome Extension communicating with the database directly using the `@supabase/supabase-js` client under a hardcoded/mock user ID, we route all data modifications and retrievals through the **Next.js Edge API routes**.

This keeps our database secure behind Next.js, avoids exposing direct database connections or custom JWT signers, and centralizes validation and business logic.

```
┌──────────────────────────────────────────────┐
│            Chrome Extension (WXT)            │
│  - Storage: chrome.storage.local (Links)     │
│  - Auth: Reads Better Auth Session Cookie    │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTP API /api/links (Bearer Token)
                       ▼
┌──────────────────────────────────────────────┐
│            Next.js Portal (Apps/Web)         │
│  - Auth Handler: Better Auth Verification   │
│  - Database: Prisma Client                   │
└──────────────────────┬───────────────────────┘
                       │
                       │ Prisma PostgreSQL Connection
                       ▼
┌──────────────────────────────────────────────┐
│             Supabase Database                │
│  - Tables: links, categories, User, Session  │
└──────────────────────────────────────────────┘
```

---

## 🔑 1. The Authentication Bridge

Better Auth uses a secure, HTTP-only cookie (`better-auth.session_token`) stored on the web portal's domain (`http://localhost:3000` or `https://linksmasher.com`).

### Extension Side (Background Script)
1. In `manifest.json`, the extension requests the `cookies` permission.
2. The background service worker queries `chrome.cookies.get` for the active domain.
3. It extracts the session token and caches it in `chrome.storage.local`.
4. The token is attached to every outgoing fetch header:
   ```http
   Authorization: Bearer <session_token>
   ```

### Backend Side (Next.js Edge Route)
1. `auth.api.getSession({ headers })` automatically extracts the `Bearer` token from the `Authorization` header.
2. It verifies the session against the `Session` table in PostgreSQL.
3. If valid, the user identity is resolved securely, protecting the data boundary.

---

## 📡 2. Client-Server CRUD API Interface

The extension service layer completely replaces direct Supabase client calls with unified API client fetches targeting Next.js:

| Action | Next.js API Endpoint | Request Payload | Response Shape |
| :--- | :--- | :--- | :--- |
| **Save Link** | `POST /api/links` | `{ url, title, tags, notes, category }` | `{ success: true, data: Link }` |
| **Get All** | `GET /api/links` | None | `{ success: true, data: Link[] }` |
| **Get for Site** | `GET /api/links?hostname=x.com` | None | `{ success: true, data: Link[] }` |
| **Update Link** | `PATCH /api/links/[id]` | `{ tags, notes, category }` | `{ success: true, data: Link }` |
| **Delete Link** | `DELETE /api/links/[id]` | None | `{ success: true }` |

---

## 🛜 3. Resilient Offline-First Synchronization

To maintain a zero-latency, premium user interface, all read and write operations are performed locally first.

1. **Instant UI Render**: The extension UI reads directly from the local `links` cache (`chrome.storage.local`), ensuring instant, animation-rich loads.
2. **Offline Saves / Deletes**:
   * If a network request to Next.js fails (e.g., due to poor connection), the extension queues the action in `pending` (for saves/updates) or `pendingDeletes` (for deletes).
3. **Background Sync Worker**:
   * A background alarm (`chrome.alarms`) periodically wakes up the service worker to retry the queues.
   * `syncService.syncPending()` sends queued saves to `POST /api/links`.
   * `syncService.syncPendingDeletes()` sends queued deletes to `DELETE /api/links/[id]`.
4. **Pull Sync & Merge**:
   * On startup, the extension pulls the full server copy from `GET /api/links`.
   * It merges it with the local cache by evaluating the `updatedAt` (or `createdAt`) timestamps. If a link exists in both places, the record with the newer timestamp is preserved.
