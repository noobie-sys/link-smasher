import { getStorage, setStorage } from "@/core/storage/storage.util";
import { STORAGE_DEFAULTS } from "@/shared/types/storage.types";
import { syncService } from "@/core/services/sync.service";
import { authService } from "@/core/auth/auth.service";
import { apiFetch } from "@/core/api/client";

export default defineBackground(() => {
  console.log("Link Smasher background script initialized (React MVP)");

  // 1. Startup Logic
  (async () => {
    // Bootstrap session from cookie store
    const token = await authService.fetchSessionToken();

    const links = await getStorage("links");
    const pending = await getStorage("pending");
    const pendingDeletes = await getStorage("pendingDeletes");

    console.log("[background] Startup", {
      isAuthenticated: !!token,
      links: links.length,
      pending: pending.length,
      pendingDeletes: pendingDeletes.length,
    });

    if (token) {
      if (pending.length > 0) {
        await syncService.syncPending();
      }

      if (pendingDeletes.length > 0) {
        await syncService.syncPendingDeletes();
      }

      // Always reconcile with the server — pulls any links added on other devices
      // and confirms any pending items that were just uploaded above.
      console.log("[background] Syncing from Next.js backend on startup...");
      await syncService.syncFromServer();
    }
  })();

  // 2. Browser Online Listener
  self.addEventListener("online", async () => {
    console.log("[background] Browser came online; checking auth and syncing pending");
    const token = await authService.fetchSessionToken();
    if (token) {
      void syncService.syncPending();
      void syncService.syncPendingDeletes();
    }
  });

  // 3. Real-Time Session Cookie Listener
  // Instantly triggers sync when user logs in or out on the web portal.
  if (chrome.cookies) {
    chrome.cookies.onChanged.addListener(async (changeInfo) => {
      const isSessionCookie = changeInfo.cookie.name === "better-auth.session_token";
      const isTargetDomain =
        changeInfo.cookie.domain.includes("localhost") ||
        changeInfo.cookie.domain.includes("linksmasher.com");

      if (!isSessionCookie || !isTargetDomain) return;

      if (!changeInfo.removed) {
        // Cookie was SET — user just logged in.
        // Upload all offline bookmarks saved while logged out, then pull server state.
        console.log("[background] Login detected — uploading pending links and syncing...");
        const token = await authService.fetchSessionToken();
        if (token) {
          await syncService.syncPending();
          await syncService.syncPendingDeletes();
          await syncService.syncFromServer();
        }
      } else {
        // Cookie was REMOVED — user just logged out.
        console.log("[background] Logout detected — clearing local session.");
        await authService.clearSession();
      }
    });
  }

  // 3. Periodic Background Sync Alarm
  if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === "sync") {
        console.log("[background] Periodic background sync alarm triggered");
        const token = await authService.fetchSessionToken();
        if (token) {
          await syncService.syncPending();
          await syncService.syncPendingDeletes();
          await syncService.syncFromServer();
        }
      }
    });
  }

  // 4. Extension Installed Listener
  if (chrome.runtime?.onInstalled) {
    chrome.runtime.onInstalled.addListener(async () => {
      const keys = Object.keys(STORAGE_DEFAULTS) as (keyof typeof STORAGE_DEFAULTS)[];

      for (const key of keys) {
        const currentValue = await getStorage(key);
        if (currentValue === undefined || currentValue === null) {
          await setStorage(key, STORAGE_DEFAULTS[key]);
        }
      }

      // Try reading cookies on install
      await authService.fetchSessionToken();

      // Create 5-minute periodic sync alarm
      if (chrome.alarms) {
        chrome.alarms.create("sync", { periodInMinutes: 5 });
      }
    });
  }

  // 5. Active Tab/Window Debug Listeners
  if (chrome.tabs) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete") {
        console.log("Tab updated:", { tabId, url: tab.url, title: tab.title });
      }
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      console.log("Tab activated:", activeInfo);
    });
  }

  // 6. Message Listener for content script CORS bypassing (Strict Security Validation)
  if (chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message && message.type === "API_FETCH") {
        const { endpoint, options } = message;

        // 1. Strict Endpoint Validation (Only allow creating, updating, or deleting vault links)
        const isCreateEndpoint = endpoint === "/api/links";
        const isSingleLinkRegex = /^\/api\/links\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/; // UUID validation
        const isSingleLinkEndpoint = isSingleLinkRegex.test(endpoint);

        if (!isCreateEndpoint && !isSingleLinkEndpoint) {
          console.warn("[security] Blocked message fetch to unauthorized endpoint:", endpoint);
          sendResponse({ success: false, error: "Unauthorized endpoint requested." });
          return false;
        }

        // 2. Strict Method Validation (Only allow state-modifying POST/PATCH/DELETE; block GET/arbitrary)
        const method = (options?.method || "GET").toUpperCase();
        const allowedMethods = ["POST", "PATCH", "DELETE"];
        if (!allowedMethods.includes(method)) {
          console.warn("[security] Blocked message fetch using unauthorized HTTP method:", method);
          sendResponse({ success: false, error: "Unauthorized HTTP method requested." });
          return false;
        }

        // 3. Strict Options Sanitization (Rebuild options object to prevent raw header or credentials injection)
        const sanitizedOptions: RequestInit = {
          method,
        };

        if (options?.body) {
          sanitizedOptions.body = options.body;
        }

        apiFetch(endpoint, sanitizedOptions)
          .then((res) => {
            sendResponse({ success: true, data: res });
          })
          .catch((err) => {
            sendResponse({ success: false, error: err.message || "Fetch failed" });
          });
        return true; // Keep message channel open for async response
      }
    });
  }
});
