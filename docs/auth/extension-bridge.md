# Chrome Extension Authentication Bridge (WXT & Manifest V3)

This document describes how to bridge session states between the Chrome Extension (`apps/extension`) and the Next.js Portal (`apps/web`). Because extensions run in an isolated client runtime, sharing access tokens requires explicit channels.

Developers and AI agents **MUST** follow one of the two approved patterns detailed below when integrating extension capabilities.

---

## 🔑 Permissions Configuration

In order for the Extension service worker or scripts to communicate with authenticating domains:

- **Do**: Configure the extension manifest settings to request explicit Chrome permissions for cookie reading and local extension storage.
- **Do**: Request matching host permissions in the configuration for the specific web portal domain (e.g. `https://*.linksmasher.com/*`). This is required to read authentication cookies and call authorized backend endpoints.

---

## 🛠️ Pattern A: Background Cookie Monitoring (Direct Sharing)

This pattern leverages Chrome's native cookie engine. It provides a clean, non-obtrusive, and unified session out-of-the-box.

### 1. Service Worker Cookie Interception

- **Do**: Set up a background runtime message listener inside the extension service worker.
- **Do**: Monitor messages originating from the extension's user interface panels (such as popups or options pages).
- **Do**: When a session request message is received, query Chrome's cookies API targeting the specific secure web portal domain.
- **Do**: Retrieve the secure session cookie (specifically looking for the session token key like `"better-auth.session_token"`).
- **Do**: Return the cookie's value asynchronously back to the extension UI thread.
- **Do Not**: Hardcode the cookie key or allow arbitrary domains to query cookies.

### 2. UI Hook Session Resolution

- **Do**: Implement a custom state handler or hook inside the extension's user interface code.
- **Do**: Dispatch an initialization message to the background service worker to retrieve the web portal's active session token.
- **Do**: Store the returned token string in the UI component state.
- **Do**: Keep tracks of loading cycles, rendering a waiting spinner while the message resolution is pending.
- **Do**: Dynamically update the extension UI to display authentication options or user dashboards depending on token presence.

---

## 📦 Pattern B: Window Message Handshake (Fallback Storage)

If cookie isolation policies or cross-origin restrictions block background cookie access, use a Content Script storage channel as a robust fallback.

### 1. Web Portal Sync Page

- **Do**: Create a dedicated web page route (such as `/extension-bridge`) inside the Next.js web application.
- **Do**: Read the current web session status using the portal's client authentication framework.
- **Do**: When session load completes, broadcast a standard window post-message containing the active user ID, email, and raw session token.
- **Do**: Target only verified web frames to prevent message interception.
- **Do**: Display a clean synchronization message to users visiting this page to keep the experience polished.

### 2. Extension Content Script Hook

- **Do**: Set up an extension content script configured to load exclusively when visiting the web portal's bridge page.
- **Do**: Listen for window post-message events.
- **Do**: Verify that the incoming message's origin matching the web portal domain strictly. Reject messages from any other domains.
- **Do**: Check for the specialized auth sync message type.
- **Do**: If a valid token is found in the payload, save the token and user metadata in the extension's local chrome storage under private keys.
- **Do**: If no token is present, remove all session keys and user objects from the local extension storage to log the user out.

---

## 🛜 3. Enforcing Authenticated Requests in WXT

- **Do**: Ensure all outbound API requests executed by extension panels or background scripts fetch the active session token from local storage or cookie lookups.
- **Do**: Inject this token into the outgoing HTTP request headers under a standard bearer token schema (e.g. `Authorization: Bearer <token>`).
- **Do**: Catch authentication failures (such as HTTP `401 Unauthorized` responses) at the network layer.
- **Do**: In the event of a session rejection, immediately delete the stored session tokens and user profiles from local extension storage, and prompt the user to re-authenticate.
