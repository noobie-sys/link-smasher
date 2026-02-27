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
  created_at: string;
}

const MAX_PENDING_RETRIES = 5;

const fromSupabase = (row: SupabaseLinkRow): Link => ({
  id: row.id,
  url: row.url,
  title: row.title,
  hostname: row.hostname,
  tags: row.tags ?? [],
  notes: row.notes ?? undefined,
  createdAt: new Date(row.created_at).getTime(),
});

const toSupabase = (link: Link, userId: string): Omit<SupabaseLinkRow, "created_at"> => ({
  id: link.id,
  user_id: userId,
  url: link.url,
  title: link.title,
  hostname: link.hostname,
  tags: link.tags ?? [],
  notes: link.notes ?? null,
});

export const syncService = {
  async syncFromSupabase(): Promise<void> {
    try {
      console.log("[syncFromSupabase] Starting sync for user", HARDCODED_USER_ID);
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", HARDCODED_USER_ID)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[syncFromSupabase] Supabase error", error);
        return;
      }

      if (!data) {
        console.log("[syncFromSupabase] No data returned from Supabase");
        return;
      }

      const links: Link[] = data.map(fromSupabase);
      await setStorage("links", links);
      console.log("[syncFromSupabase] Synced links from Supabase", {
        count: links.length,
      });
    } catch (err) {
      console.error("[syncFromSupabase] Unexpected error", err);
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

      for (const item of pending) {
        try {
          const { userId, retryCount, failedAt, ...link } = item;

          console.log("[syncPending] Attempting to sync pending item", {
            id: link.id,
            retryCount,
          });

          const { error } = await supabase
            .from("links")
            .insert(toSupabase(link, userId));

          if (error) {
            const nextRetryCount = retryCount + 1;
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
        } catch (error) {
          const nextRetryCount = item.retryCount + 1;
          if (nextRetryCount > MAX_PENDING_RETRIES) {
            console.warn(
              "[syncPending] Dropping pending item after unexpected error",
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
      console.error("[syncPending] Unexpected error", err);
    }
  },

  async syncLinkDelete(id: string): Promise<void> {
    try {
      console.log("[syncLinkDelete] Deleting link in Supabase", { id });
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) {
        console.error("[syncLinkDelete] Supabase error", error);
      }
    } catch (err) {
      console.error("[syncLinkDelete] Unexpected error", err);
    }
  },

  // async checkAndRefreshPlan(userId: string): Promise<void> {
  //   try {
  //     const lastSyncedAt = await getStorage("plan_synced_at");
  //     const now = Date.now();

  //     if (lastSyncedAt && now - lastSyncedAt < FOUR_HOURS_MS) {
  //       return;
  //     }

  //     const { data, error } = await supabase
  //       .from<{
  //         id: string;
  //         plan: Plan;
  //       }>("profiles")
  //       .select("id, plan")
  //       .eq("id", userId)
  //       .maybeSingle();

  //     if (error) {
  //       console.error("[checkAndRefreshPlan] Supabase error", error);
  //       return;
  //     }

  //     if (!data) return;

  //     await setStorage("plan", data.plan);
  //     await setStorage("plan_synced_at", now);
  //   } catch (err) {
  //     console.error("[checkAndRefreshPlan] Unexpected error", err);
  //   }
  // },
};

