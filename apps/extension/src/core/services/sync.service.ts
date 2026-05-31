import { apiFetch, ApiError } from "@/core/api/client";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { Link } from "@/shared/types/common.types";
import { PendingLink } from "@/shared/types/storage.types";

const MAX_PENDING_RETRIES = 5;

interface ApiLinkResponse {
  success: boolean;
  data: Link | Link[];
}

export const syncService = {
  /**
   * Pulls the full link list from the Next.js backend and merges it with the
   * local chrome.storage cache using updatedAt timestamps for conflict resolution.
   *
   * Think of it like two toy boxes:
   * - "Local box" = links on this device (chrome.storage.local)
   * - "Remote box" = links on the Next.js API (the authoritative cloud copy)
   *
   * We merge both boxes:
   * - Remote-only → add locally
   * - Local-only (unsynced) → keep
   * - Both → keep the one with the newer updatedAt
   */
  async syncFromServer(): Promise<void> {
    try {
      console.log("[syncService] Pulling links from Next.js backend...");

      const response = await apiFetch<{ success: boolean; data: Link[] }>("/api/links");
      if (!response.success || !Array.isArray(response.data)) {
        console.warn("[syncService] Unexpected response shape from /api/links");
        return;
      }

      const remoteLinks = response.data;
      const localLinks = await getStorage("links");

      const localMap = new Map<string, Link>();
      for (const link of localLinks) localMap.set(link.id, link);

      const remoteMap = new Map<string, Link>();
      for (const link of remoteLinks) remoteMap.set(link.id, link);

      const merged: Link[] = [];

      // Process remote links first
      for (const remoteLink of remoteLinks) {
        const localLink = localMap.get(remoteLink.id);
        if (!localLink) {
          merged.push(remoteLink);
        } else {
          const localTime = localLink.updatedAt || localLink.createdAt;
          const remoteTime = remoteLink.updatedAt || remoteLink.createdAt;
          merged.push(remoteTime >= localTime ? remoteLink : localLink);
        }
      }

      const user = await getStorage("user");
      const activeUserId = user?.id || "";

      // Preserve unsynced local-only guest links
      // Discard links that were previously synced under the active user but are now missing from the server (meaning they were deleted).
      for (const localLink of localLinks) {
        if (!remoteMap.has(localLink.id)) {
          const wasSynced = localLink.userId && localLink.userId === activeUserId;
          if (!wasSynced) {
            merged.push(localLink);
          } else {
            console.log("[syncService] Discarding locally deleted link:", localLink.id, localLink.title);
          }
        }
      }

      merged.sort((a, b) => b.createdAt - a.createdAt);
      await setStorage("links", merged);
      await setStorage("lastSyncedAt", Date.now());

      console.log("[syncService] Sync complete:", {
        remote: remoteLinks.length,
        local: localLinks.length,
        merged: merged.length,
      });
    } catch (err) {
      console.error("[syncService] Failed to sync from server:", err);
    }
  },

  /**
   * Pushes all queued guest offline saves to the Next.js backend.
   * Ensures auth credentials and user profile are loaded in local storage first,
   * stamps all pending links with the active user.id, and updates the local cache.
   */
  async syncPending(): Promise<void> {
    try {
      const token = await getStorage("sessionToken");
      const user = await getStorage("user");
      if (!token || !user) {
        console.warn("[syncService] Cannot sync pending links: user credentials not yet stored.");
        return;
      }

      const pending = await getStorage("pending");
      if (!pending.length) return;

      console.log("[syncService] Syncing pending saves for user:", user.email, pending.length);
      const remaining: PendingLink[] = [];

      // Update user ID on all local links as well
      const localLinks = await getStorage("links");
      const updatedLocalLinks = [...localLinks];

      for (const item of pending) {
        try {
          const stampedItem = {
            ...item,
            userId: user.id,
          };

          // Try upsert via POST (backend deduplicates by URL and uses client ID if provided)
          await apiFetch("/api/links", {
            method: "POST",
            body: JSON.stringify({
              id: stampedItem.id, // Pass client ID to prevent server duplication
              url: stampedItem.url,
              title: stampedItem.title,
              hostname: stampedItem.hostname,
              tags: stampedItem.tags ?? [],
              notes: stampedItem.notes,
              category: stampedItem.category ?? "General",
            }),
          });
          console.log("[syncService] Successfully uploaded pending item:", stampedItem.id, stampedItem.url);

          // Update user ID on the local link matching this ID
          const localIndex = updatedLocalLinks.findIndex((l) => l.id === stampedItem.id);
          if (localIndex !== -1) {
            updatedLocalLinks[localIndex].userId = user.id;
          }
        } catch (error) {
          console.error("[syncService] Failed to sync pending item:", item.id, error);
          
          if (error instanceof ApiError && error.status === 409) {
            console.log("[syncService] Item already exists on server (409 Conflict). Removing from queue:", item.id);
            // Even if duplicate on server, update local links with user ID for reconciliation
            const localIndex = updatedLocalLinks.findIndex((l) => l.id === item.id);
            if (localIndex !== -1) {
              updatedLocalLinks[localIndex].userId = user.id;
            }
            continue;
          }

          remaining.push(item);
        }
      }

      await setStorage("links", updatedLocalLinks);
      await setStorage("pending", remaining);
      console.log("[syncService] Pending sync done. Remaining:", remaining.length);
    } catch (err) {
      console.error("[syncService] Unexpected error in syncPending:", err);
    }
  },

  /**
   * Pushes all queued offline deletes to the Next.js backend.
   * Failed IDs are re-queued for retry.
   */
  async syncPendingDeletes(): Promise<void> {
    try {
      const pendingDeletes = await getStorage("pendingDeletes");
      if (!pendingDeletes.length) return;

      console.log("[syncService] Syncing pending deletes:", pendingDeletes.length);
      const remaining: string[] = [];

      for (const id of pendingDeletes) {
        try {
          await apiFetch(`/api/links/${id}`, { method: "DELETE" });
        } catch (error) {
          console.error("[syncService] Failed to delete from server:", id, error);
          
          if (error instanceof ApiError && error.status === 404) {
            console.log("[syncService] Link already deleted from server (404 Not Found). Removing from queue:", id);
            continue;
          }

          remaining.push(id);
        }
      }

      await setStorage("pendingDeletes", remaining);
      console.log("[syncService] Pending delete sync done. Remaining:", remaining.length);
    } catch (err) {
      console.error("[syncService] Unexpected error in syncPendingDeletes:", err);
    }
  },

  /**
   * Deletes a single link from the server.
   * Throws on failure so the caller can queue it for retry.
   */
  async syncLinkDelete(id: string): Promise<void> {
    console.log("[syncService] Deleting link on server:", id);
    await apiFetch(`/api/links/${id}`, { method: "DELETE" });
  },
};
