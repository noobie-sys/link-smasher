import { getStorage, setStorage } from "@/core/storage/storage.util";
import { STORAGE_DEFAULTS } from "@/shared/types/storage.types";
import { syncService } from "@/core/services/sync.service";

export default defineBackground(() => {
  console.log("Link Smasher background script initialized (React MVP)");

  (async () => {
    const links = await getStorage("links");

    console.log("[background] Startup: links in storage", { count: links.length });

    await syncService.syncPending();

    if (!links.length) {
      console.log(
        "[background] No local links found; syncing from Supabase using hardcoded user",
      );
      await syncService.syncFromSupabase();
    }
  })();

  self.addEventListener("online", () => {
    console.log("[background] Browser came online; syncing pending items");
    void syncService.syncPending();
  });

  chrome.runtime.onInstalled.addListener(async () => {
    const keys = Object.keys(STORAGE_DEFAULTS) as (keyof typeof STORAGE_DEFAULTS)[];

    for (const key of keys) {
      const currentValue = await getStorage(key);
      if (currentValue === undefined || currentValue === null) {
        await setStorage(key, STORAGE_DEFAULTS[key]);
      }
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      console.log("Tab updated:", { tabId, url: tab.url, title: tab.title });
    }
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log("Tab activated:", activeInfo);
  });
});

