# Link Smasher Next.js Backend Links API Specification

This document details the architectural standards, security principles, and CRUD endpoints for managing saved links safely from both the Next.js Portal (`apps/web`) and the Chrome Extension (`apps/extension`).

---

## 🏛️ Architecture & Security Principles

To ensure absolute security and guard against cross-tenant data leaks, all link operations **MUST** go through the Next.js backend instead of direct client-to-database connections.

### 1. Unified Authentication (Better Auth)
* All backend routes are protected. The server extracts the authenticated session from cookies.
* If a request does not contain a valid session, it is immediately rejected with a `401 Unauthorized` response.
* **Never** trust client-asserted `userId` parameters in request bodies or query strings. Always derive the `userId` exclusively from the verified server session.

### 2. Schema Selection: The "Category" Model
We discussed two approaches for organizing bookmark categories:

#### Option A: Flat Category Column (Default & Recommended for MVP)
Categories are saved directly as a text string column (`category String @default("General")`) in the `links` table.
* **Why it's great:** Extremely fast, zero join overhead, fully matches our existing database schema (`schema.prisma` and Supabase SQL), and keeps extension API requests simple.
* **Enhancements:** To prevent category chaos, the backend will validate input against a pre-approved list of tags or normalizes strings (e.g., trimming, lowercase/title-case mapping).

#### Option B: Relational Category Table (Future Expansion)
Categories are stored in a dedicated `Category` model, with a foreign key relationship linking `Link` to `Category`.
* **Why it's great:** Allows users to create custom categories with custom colors, icons, descriptions, and sorting orders.
* **Suggested Implementation:** Start with **Option A** for speed and simplicity. If rich visualization is required, we can seamlessly migrate to Option B using a Prisma schema upgrade.

---

## 📡 Protected CRUD Endpoints

All endpoints are relative to `http://localhost:3000/api`.

### 1. Create Link (Save Link)
Saves a webpage link to the vault.

* **Endpoint:** `POST /api/links`
* **Security:** Session Required
* **Request Headers:**
  * `Content-Type: application/json`
  * `Cookie: better-auth.session_token=<token>` (or standard request headers in extensions)
* **Payload Validation (Zod Schema):**
  ```typescript
  const createLinkSchema = z.object({
    url: z.string().url("Invalid URL format"),
    title: z.string().min(1, "Title is required").max(500),
    hostname: z.string().min(1, "Hostname is required"),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
    category: z.string().default("General")
  });
  ```
* **Response (Success - `201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "clz123456789",
      "url": "https://github.com/google-deepmind/alphafold",
      "title": "AlphaFold Structure Analysis",
      "hostname": "github.com",
      "tags": ["Research"],
      "notes": "AlphaFold prediction guidelines",
      "category": "Research",
      "createdAt": "1779889719"
    }
  }
  ```

---

### 2. Read Links (List/Get Links)
Retrieves links saved by the authenticated user, supporting optional search and hostname filtering.

* **Endpoint:** `GET /api/links`
* **Security:** Session Required
* **Query Parameters:**
  * `hostname`: (Optional) Filter links to only show cards matching a specific website host (e.g. `github.com`). Essential for the extension's *This Site Only* feature.
  * `search`: (Optional) Match query string against title, url, or notes.
* **Response (Success - `200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "clz123456789",
        "url": "https://github.com/google-deepmind/alphafold",
        "title": "AlphaFold Structure Analysis",
        "hostname": "github.com",
        "tags": ["Research"],
        "notes": "AlphaFold guidelines",
        "category": "Research",
        "createdAt": "1779889719"
      }
    ]
  }
  ```

---

### 3. Update Link
Modifies details of an existing saved link.

* **Endpoint:** `PATCH /api/links/[id]`
* **Security:** Session Required (Matches `userId` from session against link owner)
* **Payload Validation (Zod Schema):**
  ```typescript
  const updateLinkSchema = z.object({
    title: z.string().min(1).max(500).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    category: z.string().optional()
  });
  ```
* **Response (Success - `200 OK`):**
  ```json
  {
    "success": true,
    "message": "Link updated successfully",
    "data": {
      "id": "clz123456789",
      "category": "Docs",
      "notes": "Updated link notes"
    }
  }
  ```

---

### 4. Delete Link
Deletes a link permanently from the vault.

* **Endpoint:** `DELETE /api/links/[id]`
* **Security:** Session Required (Matches `userId` from session against link owner)
* **Response (Success - `200 OK`):**
  ```json
  {
    "success": true,
    "message": "Link deleted successfully"
  }
  ```

---

## 🔒 Error Handling Standard

To prevent security vulnerabilities and reverse-engineering, we return clean, uniform HTTP error codes:

| Status Code | Cause | Response Payload |
|:---|:---|:---|
| **`401 Unauthorized`** | Missing or expired session cookie | `{"error": "Unauthorized. Please sign in."}` |
| **`400 Bad Request`** | Input validation (Zod) failure | `{"error": "Validation failed", "details": [...]}` |
| **`404 Not Found`** | Link not found or belongs to another user | `{"error": "Link not found"}` |
| **`500 Internal Error`**| Database timeout or system error | `{"error": "An internal server error occurred"}` |
