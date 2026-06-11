import { supabaseClient } from "@/core/supabase/client";
import { syncService } from "@/core/services/sync.service";
import { authService } from "@/core/auth/auth.service";
import { getStorage } from "@/core/storage/storage.util";
import { RealtimeChannel } from "@supabase/supabase-js";

let activeChannel: RealtimeChannel | null = null;

export const realtimeSyncService = {
  /**
   * Starts a Supabase Realtime subscription scoped to the current user's links.
   * On any change, triggers a full syncFromServer() so local storage always has
   * properly-joined data (e.g. category name from the categories table).
   */
  async startSubscription(): Promise<void> {
    if (!supabaseClient) {
      console.warn("[realtimeSyncService] Supabase client not configured — skipping realtime subscription.");
      return;
    }

    try {
      const authenticated = await authService.isAuthenticated();
      if (!authenticated) {
        console.log("[realtimeSyncService] User not authenticated, skipping realtime subscription.");
        await this.stopSubscription();
        return;
      }

      if (activeChannel) {
        await this.stopSubscription();
      }

      const user = await getStorage("user");
      if (!user?.id) {
        console.warn("[realtimeSyncService] No user ID in storage, skipping realtime subscription.");
        return;
      }

      console.log("[realtimeSyncService] Initializing Supabase Realtime subscription...");

      const channel = supabaseClient
        .channel("extension-links-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "links",
            // Filter server-side so only this user's rows are delivered.
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            console.log("[realtimeSyncService] Change detected in public.links:", payload.eventType);
            // Pull full data from the Next.js API so we get properly joined fields
            // (category name, etc.) rather than raw DB column values.
            await syncService.syncFromServer();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("[realtimeSyncService] Subscribed to PostgreSQL changes successfully");
          } else {
            console.log("[realtimeSyncService] Subscription status change:", status);
          }
        });

      activeChannel = channel;
    } catch (error) {
      console.error("[realtimeSyncService] Subscription setup failed:", error);
    }
  },

  /**
   * Stops the active realtime subscription and releases the channel.
   */
  async stopSubscription(): Promise<void> {
    if (activeChannel && supabaseClient) {
      try {
        await supabaseClient.removeChannel(activeChannel);
        console.log("[realtimeSyncService] Unsubscribed from links channel successfully");
      } catch (err) {
        console.error("[realtimeSyncService] Failed to unsubscribe:", err);
      } finally {
        activeChannel = null;
      }
    } else {
      activeChannel = null;
    }
  },
};
