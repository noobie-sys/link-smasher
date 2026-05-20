import { HARDCODED_USER_ID, sql } from "@/core/neon/client";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { Link } from "@/shared/types/common.types";
import { PendingLink } from "@/shared/types/storage.types";

interface NeonLinkRow {
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

const fromNeon = (row: NeonLinkRow): Link => ({
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
   * Syncs links from Neon Database.
   * Method name is kept as 'syncFromSupabase' to guarantee compatibility and prevent 
   * breaking references in background scripts and UI components.
   */
  async syncFromSupabase(): Promise<void> {
    try {
      console.log("[syncFromNeon] Starting sync for user", HARDCODED_USER_ID);

      if (!sql) {
        console.warn("[syncFromNeon] Neon client not initialized.");
        return;
      }

      const rows = (await sql`
        SELECT id, user_id, url, title, hostname, tags, notes, category, created_at
        FROM links
        WHERE user_id = ${HARDCODED_USER_ID}
        ORDER BY created_at DESC
      `) as unknown as NeonLinkRow[];

      if (!rows) {
        console.log("[syncFromNeon] No data returned from Neon");
        return;
      }

      const links: Link[] = rows.map(fromNeon);
      await setStorage("links", links);
      console.log("[syncFromNeon] Synced links from Neon", {
        count: links.length,
      });
    } catch (err) {
      console.error("[syncFromNeon] Unexpected error during sync", err);
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

      if (!sql) {
        console.warn("[syncPending] Neon client not initialized.");
        return;
      }

      for (const item of pending) {
        try {
          const { userId, retryCount, failedAt, ...link } = item;

          console.log("[syncPending] Attempting to sync pending item to Neon", {
            id: link.id,
            retryCount,
          });

          await sql`
            INSERT INTO links (id, user_id, url, title, hostname, tags, notes, category, created_at)
            VALUES (
              ${link.id},
              ${userId},
              ${link.url},
              ${link.title},
              ${link.hostname},
              ${link.tags ?? []},
              ${link.notes ?? null},
              ${link.category ?? "General"},
              ${link.createdAt}
            )
            ON CONFLICT (id) DO NOTHING
          `;
        } catch (error) {
          console.error("[syncPending] Failed to sync pending item to Neon", error);
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
      console.log("[syncLinkDelete] Deleting link in Neon", { id });
      if (!sql) {
        console.warn("[syncLinkDelete] Neon client not initialized.");
        return;
      }
      await sql`
        DELETE FROM links WHERE id = ${id}
      `;
    } catch (err) {
      console.error("[syncLinkDelete] Unexpected error deleting in Neon", err);
    }
  },
};
