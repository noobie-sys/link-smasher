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
});

export const syncService = {
  /**
   * Syncs links from Supabase Database.
   * Method name is kept as 'syncFromSupabase' to guarantee compatibility and prevent 
   * breaking references in background scripts and UI components.
   */
  async syncFromSupabase(): Promise<void> {
    try {
      console.log("[syncFromSupabase] Starting sync for user", HARDCODED_USER_ID);

      if (!supabase) {
        console.warn("[syncFromSupabase] Supabase client not initialized.");
        return;
      }

      const { data: rows, error } = await supabase
        .from("links")
        .select("id, user_id, url, title, hostname, tags, notes, category, created_at")
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

      const links: Link[] = (rows as unknown as SupabaseLinkRow[]).map(fromSupabase);
      await setStorage("links", links);
      console.log("[syncFromSupabase] Synced links from Supabase", {
        count: links.length,
      });
    } catch (err) {
      console.error("[syncFromSupabase] Unexpected error during sync", err);
    }
  },

  async syncPending(): Promise<void> {
    try {
      const pending = await getStorage("pending");
      if (!pending.length) {
        console.log("[syncPending] No pending items to sync");
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

  async syncLinkDelete(id: string): Promise<void> {
    try {
      console.log("[syncLinkDelete] Deleting link in Supabase", { id });
      if (!supabase) {
        console.warn("[syncLinkDelete] Supabase client not initialized.");
        return;
      }
      
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("[syncLinkDelete] Unexpected error deleting in Supabase", err);
    }
  },
};
