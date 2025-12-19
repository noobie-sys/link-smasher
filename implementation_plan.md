# Link Smasher MVP - Implementation Plan

## User Objective

Build a "Link Smasher" browser extension MVP that allows instant link saving and context-aware retrieval without leaving the current page.

## Core Features

1.  **Instant Save**: Keyboard shortcut to save the current page immediately.
2.  **Clean Modal**: Opens on top of the current website to view links.
3.  **Smart Context**: Shows links for the current site by default, toggle to show all.
4.  **Premium UI**: Glassmorphism, animations, dark mode.

## Project Structure & Progress

### 1. Foundation & Configuration 🏗️

- [ ] **Configure WXT & Manifest**
  - [ ] Update `wxt.config.ts` name to "Link Smasher".
  - [ ] Verify `permissions`: `storage`, `tabs`.
  - [ ] Add `commands` to `manifest` (optional, or use content script listeners).
- [ ] **Content Script Entrypoint**
  - [ ] Create `src/entrypoints/content/index.tsx`.
  - [ ] Implement Shadow DOM isolation.
  - [ ] Setup style injection.

### 2. Business Logic (Core) 🧠

- [x] **Link Storage**: `src/core/storage/link.storage.ts` implemented.
- [x] **Link Service**: `src/core/services/link.service.ts` implemented.
  - [x] `addLink` (with valid URL check).
  - [x] `getLinksByHostname`.
  - [x] `getAllLinks`.
  - [x] `deleteLink`.

### 3. UI Components (The "Clean Modal") 🎨

- [ ] **Setup Tailwind/Styles**
  - [ ] Ensure `index.css` supports the shadow DOM context or injected styles.
- [ ] **Overlay Component**
  - [ ] Create `src/core/components/Overlay.tsx`.
  - [ ] Implement Glassmorphism container.
  - [ ] Implement Tabs (Current Site vs All).
  - [ ] Implement Search/List view.
- [ ] **Toast Notification**
  - [ ] Create `src/core/components/Toast.tsx`.

### 4. Integration & Interaction 🤝

- [ ] **Connect Service to Content Script**
  - [ ] Call `linkService.addLink` from content script.
  - [ ] Call `linkService.getLinks...` from overlay.
- [ ] **Keyboard Shortcuts**
  - [ ] Implement listener for `Alt+S` (Save).
  - [ ] Implement listener for `Alt+K` (Toggle).

### 5. Polish ✨

- [ ] **Animations**: Framer Motion or CSS transitions.
- [ ] **Testing**: Verify on major sites.

## Next Step

- Update `wxt.config.ts` to reflect the new project identity.
- Initialize `src/entrypoints/content/index.tsx`.
