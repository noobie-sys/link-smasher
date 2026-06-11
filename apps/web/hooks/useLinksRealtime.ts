import { useEffect, useRef } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes: string | null;
  category: string;
  createdAt: number;
}

/**
 * Subscribes to PostgreSQL changes on the links table for the given user and
 * synchronizes updates with local React state in real-time.
 *
 * Pass `userId` so the subscription is filtered server-side to this user's rows
 * only — prevents receiving other users' changes.
 *
 * Category names are not present in the raw Supabase payload (the DB stores
 * category_id, not the name). INSERT events show "General" temporarily; the
 * dashboard's background poll corrects it within its poll interval.
 * UPDATE events keep the existing category name in state.
 *
 * Gracefully no-ops if the Supabase client is not configured.
 */
export function useLinksRealtime(
  setLinks: React.Dispatch<React.SetStateAction<SavedLink[]>>,
  userId: string | undefined,
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!supabaseClient) {
      console.warn("[realtime] Supabase client not configured — skipping Realtime subscription. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable.");
      return;
    }

    // Skip subscription until we have the user ID so we don't receive other
    // users' rows during the brief window before the session resolves.
    if (!userId) return;

    let isMounted = true;

    const channel = supabaseClient
      .channel("links-postgres-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "links",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (!isMounted) return;

          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            const record = payload.new as Record<string, unknown>;
            // The raw DB payload has category_id (FK), not the category name.
            // Default to "General" — the background poll will supply the real name.
            const formattedLink: SavedLink = {
              id: record.id as string,
              url: record.url as string,
              title: record.title as string,
              hostname: record.hostname as string,
              tags: (record.tags as string[]) || [],
              notes: (record.notes as string) || null,
              category: "General",
              createdAt: Number(record.created_at),
            };
            setLinks((prev) => {
              // Optimistic update already replaced the draft with the server ID,
              // so skip if this link is already present.
              if (prev.some((link) => link.id === formattedLink.id)) {
                return prev;
              }
              return [formattedLink, ...prev];
            });
          } else if (eventType === "UPDATE") {
            const record = payload.new as Record<string, unknown>;
            setLinks((prev) =>
              prev.map((link) =>
                link.id === record.id
                  ? {
                      ...link,
                      url: record.url as string,
                      title: record.title as string,
                      hostname: record.hostname as string,
                      tags: (record.tags as string[]) || [],
                      notes: (record.notes as string) || null,
                      // Keep the existing category name — category_id in the payload
                      // cannot be resolved to a name without an extra round-trip.
                    }
                  : link
              )
            );
          } else if (eventType === "DELETE") {
            const oldRecord = payload.old as Record<string, unknown>;
            setLinks((prev) => prev.filter((link) => link.id !== oldRecord.id));
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("[realtime] Subscribed to PostgreSQL changes successfully");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[realtime] Channel error — check RLS policy on links table:", err);
        } else if (status === "TIMED_OUT") {
          console.warn("[realtime] Subscription timed out. Will retry automatically.");
        } else if (status === "CLOSED") {
          console.log("[realtime] Channel closed.");
        }
      });

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current) {
        void supabaseClient?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setLinks, userId]);
}
