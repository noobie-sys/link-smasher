import { Link } from "@/shared/types/common.types";
import { PendingLink } from "@/shared/types/storage.types";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { HARDCODED_USER_ID, supabase } from "@/core/supabase/client";
import { syncService } from "@/core/services/sync.service";
import { storageMutex } from "@/core/storage/storage.mutex";

export const linkStorage = {
  async get(): Promise<Link[]> {
    return getStorage("links");
  },

  async set(links: Link[]): Promise<void> {
    await setStorage("links", links);
  },

  async clear(): Promise<void> {
    await setStorage("links", []);
  },
};

/**
 * Save a new link to local storage and sync to Supabase.
 *
 * @param link - The link to save
 * @param existingLinks - Optional pre-loaded links array to avoid a redundant storage read.
 *   If provided, we skip the `getStorage("links")` call and use this array directly.
 *   This eliminates the double-read that happens when `linkService.addLink`
 *   reads all links for duplicate checking, and then `saveLink` reads them again.
 */
export const saveLink = async (link: Link, existingLinks?: Link[]): Promise<void> => {
  const release = await storageMutex.acquire();
  try {
    const links = existingLinks ?? await getStorage("links");
    await setStorage("links", [link, ...links]);
  } finally {
    release();
  }

  // Supabase sync happens outside the mutex — we don't want to hold the lock
  // during a network request that could take seconds
  try {
    console.log("[saveLink] Saving link to Supabase", { id: link.id, url: link.url });

    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabase
      .from("links")
      .upsert({
        id: link.id,
        user_id: HARDCODED_USER_ID,
        url: link.url,
        title: link.title,
        hostname: link.hostname,
        tags: link.tags ?? [],
        notes: link.notes ?? null,
        category: link.category ?? "General",
        created_at: link.createdAt,
        updated_at: link.updatedAt,
        synced_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("[saveLink] Unexpected error, queueing pending item", err);
    const pending = await getStorage("pending");
    const pendingItem: PendingLink = {
      ...link,
      userId: HARDCODED_USER_ID,
      retryCount: 0,
      failedAt: Date.now(),
    };
    await setStorage("pending", [...pending, pendingItem]);
  }
};

/**
 * Delete a link from local storage and queue a remote delete.
 * If the Supabase delete fails, the ID is saved to `pendingDeletes`
 * so the background script can retry it later.
 */
export const deleteLink = async (id: string): Promise<void> => {
  const release = await storageMutex.acquire();
  try {
    const links = await getStorage("links");
    const filtered = links.filter((l) => l.id !== id);
    await setStorage("links", filtered);
  } finally {
    release();
  }

  console.log("[deleteLink] Deleted link locally", { id });

  // Try to delete from Supabase, queue for retry on failure
  try {
    await syncService.syncLinkDelete(id);
  } catch {
    console.error("[deleteLink] Failed to delete remotely, queueing for retry", { id });
    const pendingDeletes = await getStorage("pendingDeletes");
    if (!pendingDeletes.includes(id)) {
      await setStorage("pendingDeletes", [...pendingDeletes, id]);
    }
  }
};

export const getLinks = async (): Promise<Link[]> => {
  return getStorage("links");
};

/**
 * Update an existing link in local storage and sync to Supabase.
 * Sets `updatedAt` to the current time for conflict resolution.
 * On Supabase failure, queues to `pending` for retry (same as saveLink).
 */
export const updateLinkInStorage = async (
  id: string,
  updates: Partial<Link>,
): Promise<Link | null> => {
  let updatedLink: Link;

  const release = await storageMutex.acquire();
  try {
    const links = await getStorage("links");
    const index = links.findIndex((l) => l.id === id);

    if (index === -1) return null;

    const currentLink = links[index];
    updatedLink = {
      ...currentLink,
      ...updates,
      id: currentLink.id,
      createdAt: currentLink.createdAt,
      updatedAt: Date.now(),
    };

    const newLinks = [...links];
    newLinks[index] = updatedLink;

    await setStorage("links", newLinks);
  } finally {
    release();
  }

  // Sync to Supabase outside the mutex
  try {
    console.log("[updateLinkInStorage] Updating link in Supabase", { id });

    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await supabase
      .from("links")
      .update({
        url: updatedLink.url,
        title: updatedLink.title,
        hostname: updatedLink.hostname,
        tags: updatedLink.tags ?? [],
        notes: updatedLink.notes ?? null,
        category: updatedLink.category ?? "General",
        updated_at: updatedLink.updatedAt,
        synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (err) {
    // Queue failed updates for retry — same as saveLink does
    console.error("[updateLinkInStorage] Unexpected error, queueing pending item", err);
    const pending = await getStorage("pending");
    const pendingItem: PendingLink = {
      ...updatedLink,
      userId: HARDCODED_USER_ID,
      retryCount: 0,
      failedAt: Date.now(),
    };
    await setStorage("pending", [...pending, pendingItem]);
  }

  return updatedLink;
};
