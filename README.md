# Link Smasher (Link Crust)

**Link Smasher** (deployed as the **Link Crust** extension) is a high-performance, developer-friendly link management platform designed to save, categorize, and sync web links instantly without breaking your browsing workflow.

The platform is structured as a pnpm monorepo containing a modern web application and a feature-rich Chrome extension.

---

## What the Platform Does

Link Smasher bridges the gap between browser bookmarking and dashboard organization by offering:

### 1. Unified Link Vault
- **Local-First Storage**: Instantly saves bookmarks, tags, and short notes locally so saving is fast and runs offline.
- **Cloud Synchronization**: Syncs links automatically to a secure cloud database (Supabase PostgreSQL) once authenticated.

### 2. Intelligent Page Bookmarking (Link Crust Extension)
- **Omnipresent Floating Bookmark**: A subtle, glassmorphic floating bookmark button on every webpage for single-click bookmarking.
- **Background Contrast Adaptation**: The floating button automatically detects the page's background brightness to stay legible and aesthetically premium.
- **Site Blacklisting**: A "Hide on this site" toggle allows users to hide the bookmark button on specific domains (e.g., games, editors, design software).
- **Inline Editor**: If a page is already bookmarked, clicking the floating button immediately opens a modal on the page to edit its tags, notes, or category.
- **Global Keyboard Shortcuts**: Save links or open the popup overlay instantly using custom hotkeys.

### 3. Social Feed Saving
- Dynamically injects dedicated bookmark buttons into native posts on popular social platforms:
  - **LinkedIn**
  - **X (formerly Twitter)**
  - **Instagram**
  - **Facebook**
  - **Reddit**
  - **Threads**
- Auto-extracts metadata (post text, author username, original timestamp, and media assets) directly from the feed card to categorize and save the post context.

### 4. Interactive Web Dashboard
- A Next.js web application providing a centralized repository to search, tag, filter, and organize saved links.
- Implements secure user authentication powered by Better Auth.
- Features a clean, premium dashboard layout with categorization filters, batch exports/imports, and user settings.

---

## Monorepo Architecture

- **`apps/web`**: Next.js dashboard and synchronization web app.
- **`apps/extension`**: Chrome extension built with WXT (Vite + PostCSS) and React.
- **`packages/shared`**: Shared validation schemas (Zod), TypeScript types, and constants.
- **`supabase`**: Database schemas and migration configurations.
