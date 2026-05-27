import { getStorage, setStorage } from "@/core/storage/storage.util";
import { STORAGE_DEFAULTS } from "@/shared/types/storage.types";
import { syncService } from "@/core/services/sync.service";
import { authService } from "@/core/auth/auth.service";

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

      if (!links.length) {
        console.log(
          "[background] No local links found; syncing from Next.js backend",
        );
        await syncService.syncFromServer();
      }
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

  // 3. Periodic Background Sync Alarm
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

  // 4. Extension Installed Listener
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
    chrome.alarms.create("sync", { periodInMinutes: 5 });
  });

  // 5. Active Tab/Window Debug Listeners
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      console.log("Tab updated:", { tabId, url: tab.url, title: tab.title });
    }
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log("Tab activated:", activeInfo);
  });
});
