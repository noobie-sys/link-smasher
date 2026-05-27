# Backend API Feature Specifications

This document outlines the detailed functional requirements, query structures, and security specifications for the individual features built on top of our backend API endpoints.

---

## 🏷️ Feature 1: Contextual Bookmarking & Auto-Host Extraction

When saving a link, the API is designed to automate metadata parsing to reduce user interaction requirements.

### ⚙️ Functional Flow
1. The client (e.g. Chrome Extension) dispatches a `POST` request to `/api/links` with the `url`, `title`, and optional `category`/`notes`.
2. **Server-Side Host Extraction:**
   * The server extracts the domain hostname dynamically from the URL (to ensure consistency even if a client sends raw, unparsed data).
   * It trims standard prefixes (`www.`, `m.`, `beta.`) to maintain clean lookup namespaces.
3. **Database Insertion:**
   * Checks if the user already has this exact URL saved. If yes, it can either reject as duplicate or return the existing card (preventing duplicate bloat).
   * Relates the link to the user's account using `userId` obtained from the session.

---

## 📂 Feature 2: In-Context Filtering ("This Site Only")

To keep tab navigation and bookmark lookup instantaneous, the API supports relative host filtering.

### ⚙️ Functional Flow
1. When loading the extension on a site (e.g., `github.com`), the client calls `GET /api/links?hostname=github.com`.
2. **Database Query Isolation:**
   * The server filters records strictly using both `userId` and `hostname`:
     ```typescript
     const links = await prisma.link.findMany({
       where: {
         userId: session.user.id,
         hostname: queryHostname
       },
       orderBy: {
         createdAt: 'desc'
       }
     });
     ```
3. **Optimistic fallback:**
   * If zero links are returned for the specific host, the API can return a header prompting the UI to offer standard recommendations or popular links.

---

## 🔍 Feature 3: Smart Search & Multi-Tag Filtering

The web vault dashboard requires standard search capability across a user's entire vault.

### ⚙️ Functional Flow
1. The client sends `GET /api/links?search=alphafold&category=Research`.
2. **Database Query Resolution:**
   * The API executes a search query with partial matching on `title`, `url`, `notes`, or within the string array of `tags`:
     ```typescript
     const links = await prisma.link.findMany({
       where: {
         userId: session.user.id,
         category: queryCategory || undefined,
         OR: [
           { title: { contains: searchQuery, mode: 'insensitive' } },
           { url: { contains: searchQuery, mode: 'insensitive' } },
           { notes: { contains: searchQuery, mode: 'insensitive' } },
           { tags: { has: searchQuery } }
         ]
       }
     });
     ```
3. **Performance Optimization:**
   * The query uses index lookups on the relational tables to run searches under **10ms**.
