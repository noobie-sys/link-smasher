import { HARDCODED_USER_ID, supabase } from "@/core/supabase/client";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { Link } from "@/shared/types/common.types";
import { PendingLink } from "@/shared/types/storage.types";

interface SupabaseLinkRow {
  id: string;
  user_id: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes: string | null;
  category: string | null;
  created_at: string | number;
  updated_at: string | number | null;
}

const MAX_PENDING_RETRIES = 5;

const fromSupabase = (row: SupabaseLinkRow): Link => ({
  id: row.id,
  url: row.url,
  title: row.title,
  hostname: row.hostname,
  tags: row.tags ?? [],
  notes: row.notes ?? undefined,
  category: row.category ?? undefined,
  createdAt: Number(row.created_at),
  updatedAt: row.updated_at ? Number(row.updated_at) : Number(row.created_at),
});

export const syncService = {
  /**
   * Syncs links from Supabase Database.
   *
   * IMPORTANT: This now MERGES instead of replacing.
   *
   * Think of it like two kids both have toy boxes:
   * - "Local box" = links on this device (chrome.storage)
   * - "Remote box" = links on Supabase (the cloud)
   *
   * Old behavior: dump your local box and copy the remote box exactly.
   *   Problem: any toys you put in locally while offline get thrown away!
   *
   * New behavior: compare both boxes toy by toy:
   *   - Toy only in remote box? → add it to local
   *   - Toy only in local box? → keep it (it hasn't been synced yet)
   *   - Toy in BOTH boxes? → keep whichever was played with more recently
   *     (the one with the higher `updatedAt` timestamp)
   */
  async syncFromSupabase(): Promise<void> {
    try {
      console.log("[syncFromSupabase] Starting merge sync for user", HARDCODED_USER_ID);

      if (!supabase) {
        console.warn("[syncFromSupabase] Supabase client not initialized.");
        return;
      }

      const { data: rows, error } = await supabase
        .from("links")
        .select("id, user_id, url, title, hostname, tags, notes, category, created_at, updated_at")
        .eq("user_id", HARDCODED_USER_ID)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[syncFromSupabase] Error fetching links from Supabase:", error);
        return;
      }

      if (!rows) {
        console.log("[syncFromSupabase] No data returned from Supabase");
        return;
      }

      const remoteLinks: Link[] = (rows as unknown as SupabaseLinkRow[]).map(fromSupabase);
      const localLinks = await getStorage("links");

      // Build a lookup map: id → link (for O(1) lookups instead of O(n) scanning)
      const localMap = new Map<string, Link>();
      for (const link of localLinks) {
        localMap.set(link.id, link);
      }

      const remoteMap = new Map<string, Link>();
      for (const link of remoteLinks) {
        remoteMap.set(link.id, link);
      }

      const merged: Link[] = [];

      // 1. Process all remote links
      for (const remoteLink of remoteLinks) {
        const localLink = localMap.get(remoteLink.id);

        if (!localLink) {
          // Remote-only link — add it to local
          merged.push(remoteLink);
        } else {
          // Exists in both — pick the one with the newer updatedAt
          const localTime = localLink.updatedAt || localLink.createdAt;
          const remoteTime = remoteLink.updatedAt || remoteLink.createdAt;

          if (remoteTime >= localTime) {
            merged.push(remoteLink);
          } else {
            merged.push(localLink);
          }
        }
      }

      // 2. Add local-only links (not in remote — these are unsynced new saves)
      for (const localLink of localLinks) {
        if (!remoteMap.has(localLink.id)) {
          merged.push(localLink);
        }
      }

      // Sort by createdAt descending (newest first)
      merged.sort((a, b) => b.createdAt - a.createdAt);

      await setStorage("links", merged);
      console.log("[syncFromSupabase] Merged links from Supabase", {
        remote: remoteLinks.length,
        local: localLinks.length,
        merged: merged.length,
      });
    } catch (err) {
      console.error("[syncFromSupabase] Unexpected error during sync", err);
    }
  },

  async syncPending(): Promise<void> {
    try {
      const pending = await getStorage("pending");
      if (!pending.length) {
        return;
      }

      const remaining: PendingLink[] = [];

      if (!supabase) {
        console.warn("[syncPending] Supabase client not initialized.");
        return;
      }

      for (const item of pending) {
        try {
          const { userId, retryCount, failedAt, ...link } = item;

          console.log("[syncPending] Attempting to sync pending item to Supabase", {
            id: link.id,
            retryCount,
          });

          const { error } = await supabase
            .from("links")
            .upsert({
              id: link.id,
              user_id: userId,
              url: link.url,
              title: link.title,
              hostname: link.hostname,
              tags: link.tags ?? [],
              notes: link.notes ?? null,
              category: link.category ?? "General",
              created_at: link.createdAt,
              updated_at: link.updatedAt,
            });

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error("[syncPending] Failed to sync pending item to Supabase", error);
          const nextRetryCount = item.retryCount + 1;
          if (nextRetryCount > MAX_PENDING_RETRIES) {
            console.warn(
              "[syncPending] Dropping pending item after max retries",
              item,
            );
          } else {
            remaining.push({
              ...item,
              retryCount: nextRetryCount,
              failedAt: Date.now(),
            });
          }
        }
      }

      await setStorage("pending", remaining);
      console.log("[syncPending] Finished syncing pending items", {
        remaining: remaining.length,
      });
    } catch (err) {
      console.error("[syncPending] Unexpected error syncing pending", err);
    }
  },

  /**
   * Sync pending deletes to Supabase.
   * Works just like syncPending but for delete operations.
   *
   * Why do we need this? Before, if you deleted a link while offline,
   * the delete was "fire and forget" — if it failed, the link stayed in
   * Supabase forever like a zombie. Now we retry it.
   */
  async syncPendingDeletes(): Promise<void> {
    try {
      const pendingDeletes = await getStorage("pendingDeletes");
      if (!pendingDeletes.length) {
        return;
      }

      if (!supabase) {
        console.warn("[syncPendingDeletes] Supabase client not initialized.");
        return;
      }

      const remaining: string[] = [];

      for (const id of pendingDeletes) {
        try {
          console.log("[syncPendingDeletes] Attempting to delete from Supabase", { id });

          const { error } = await supabase
            .from("links")
            .delete()
            .eq("id", id);

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error("[syncPendingDeletes] Failed to delete from Supabase", { id, error });
          remaining.push(id);
        }
      }

      await setStorage("pendingDeletes", remaining);
      console.log("[syncPendingDeletes] Finished syncing pending deletes", {
        remaining: remaining.length,
      });
    } catch (err) {
      console.error("[syncPendingDeletes] Unexpected error", err);
    }
  },

  /**
   * Delete a single link from Supabase.
   * Throws on failure so the caller (link.storage.ts) can queue it for retry.
   */
  async syncLinkDelete(id: string): Promise<void> {
    console.log("[syncLinkDelete] Deleting link in Supabase", { id });
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  },
};
