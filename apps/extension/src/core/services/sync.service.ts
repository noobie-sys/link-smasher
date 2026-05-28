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

      // Preserve unsynced local-only links
      for (const localLink of localLinks) {
        if (!remoteMap.has(localLink.id)) {
          merged.push(localLink);
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
   * Pushes all queued offline saves/updates to the Next.js backend.
   * Failed items are re-queued with an incremented retryCount (max 5).
   */
  async syncPending(): Promise<void> {
    try {
      const pending = await getStorage("pending");
      if (!pending.length) return;

      console.log("[syncService] Syncing pending saves:", pending.length);
      const remaining: PendingLink[] = [];

      for (const item of pending) {
        try {
          const { userId, retryCount, failedAt, createdAt, updatedAt, ...rest } = item;

          // Try upsert via POST (backend deduplicates by URL)
          await apiFetch("/api/links", {
            method: "POST",
            body: JSON.stringify({
              ...rest,
              id: item.id,
              url: item.url,
              title: item.title,
              hostname: item.hostname,
              tags: item.tags ?? [],
              notes: item.notes,
              category: item.category ?? "General",
            }),
          });
        } catch (error) {
          console.error("[syncService] Failed to sync pending item:", item.id, error);
          
          if (error instanceof ApiError && error.status === 409) {
            console.log("[syncService] Item already exists on server (409 Conflict). Removing from queue:", item.id);
            continue;
          }

          const nextRetryCount = item.retryCount + 1;
          if (nextRetryCount <= MAX_PENDING_RETRIES) {
            remaining.push({ ...item, retryCount: nextRetryCount, failedAt: Date.now() });
          } else {
            console.warn("[syncService] Dropping pending item after max retries:", item.id);
          }
        }
      }

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
