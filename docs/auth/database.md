# Database Schema & Query Isolation Rules

This document details the database integration standards for **Better Auth** and our **Supabase PostgreSQL** instance. All instructions must be strictly implemented by developers and AI agents without introducing raw database commands or typescript snippets in this guide.

---

## 🗄️ 1. Required Table Schema Structure

Better Auth requires the database to maintain standard relational tables. Any developer or AI agent modifying database schemas **MUST** ensure the following tables are mapped precisely to the auth engine's model requirements:

### A. User Table (`user`)
* **Purpose**: Holds primary identity records.
* **Requirements**:
  * **Primary Identity Field**: Must use high-entropy strings or UUIDv4 values as a primary key. **DO NOT** use auto-incrementing integers.
  * **Name Field**: Text representation of user's display name, supporting null values.
  * **Email Field**: Text-based, unique, and strictly stored in lowercase letters.
  * **Email Verification Field**: Boolean status flags indicating if the email is confirmed. Defaults to false.
  * **Image Field**: Text-based, nullable URL pointing to the user's uploaded avatar.
  * **Timestamps**: Explicit creation and update timestamps showing record history.

### B. Session Table (`session`)
* **Purpose**: Manages active credentials sessions and device tokens.
* **Requirements**:
  * **Session Identifier**: Unique primary key string.
  * **User Relationship**: Foreign key link referencing the user table's primary key.
  * **Access Token**: A unique, high-entropy string representing the active session key.
  * **Expiration Timestamp**: Absolute timestamp indicating when the session is no longer valid.
  * **IP Address**: Nullable string recording the client's network address during session generation.
  * **User Agent**: Nullable string storing the browser/device characteristics of the active session.

### C. Account Table (`account`)
* **Purpose**: Stores linked identity profiles (Credentials, Google OAuth, etc.).
* **Requirements**:
  * **Account Identifier**: Unique primary key string.
  * **User Relationship**: Foreign key link referencing the user table's primary key.
  * **Provider Identifier**: Records the authentication source (such as "google" or "credentials").
  * **Provider Account Identifier**: The internal profile ID provided by the external identity system.
  * **Hashed Password**: Nullable text storing securely hashed passwords (only utilized for credentials authentication).
  * **Access & Refresh Tokens**: Nullable tokens returned by OAuth providers for third-party scopes.
  * **Token Expiration**: Nullable expiration timestamp of the provider tokens.

### D. Verification Table (`verification`)
* **Purpose**: Tracks email validation challenges or password-reset flows.
* **Requirements**:
  * **Verification Identifier**: Unique primary key string.
  * **Email Identifier**: Records the target email address being validated.
  * **Token Value**: A secure, randomly generated challenge token.
  * **Expiration Timestamp**: Time limit for completing the challenge flow.

---

## 🔗 2. Relational Integrity Rules (Cascade Deletes)

To prevent database bloat, orphaned records, and strictly adhere to privacy standards like GDPR:

* **Do**: Implement `ON DELETE CASCADE` constraints on all tables containing foreign keys pointing to the primary user table.
* **Do**: Enforce automatic cascading deletion of:
  * Active sessions when a user account is deleted.
  * Provider accounts when a user account is deleted.
  * User-created domain tables (such as saved bookmarks or links) when a user account is deleted.

---

## 🛡️ 3. Query Isolation Principle

Developer components and backend systems must maintain absolute data boundaries between users to guard against cross-tenant data leaks.

* **Do Not**: Accept or trust client-asserted user ID parameters directly in API query variables or request payloads. Doing so exposes the system to serious authentication bypass vulnerabilities.
* **Do**: Fetch the current session details server-side from HTTP headers.
* **Do**: Validate that a session exists and return an unauthorized error (such as status code 401) immediately if the session is missing or invalid.
* **Do**: Extract the validated user ID directly from the resolved server session object.
* **Do**: Restrict all database reads, insertions, modifications, and deletions by applying filters matching the server-extracted user ID exclusively.
