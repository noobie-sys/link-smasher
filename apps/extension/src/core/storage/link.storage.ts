import { Link } from "@/shared/types/common.types";
import { PendingLink } from "@/shared/types/storage.types";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { syncService } from "@/core/services/sync.service";
import { storageMutex } from "@/core/storage/storage.mutex";
import { apiFetch } from "@/core/api/client";

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
 * Save a new link to local storage, then push to the Next.js backend if authenticated.
 * Guest users' saves are queued in the `pending` list for later synchronization upon login.
 *
 * @param link - The fully-formed link to save.
 * @param existingLinks - Optional pre-loaded links array to avoid a redundant storage read.
 */
export const saveLink = async (link: Link, existingLinks?: Link[]): Promise<void> => {
  // 1. Write locally first (inside mutex for safety)
  const release = await storageMutex.acquire();
  try {
    const links = existingLinks ?? (await getStorage("links"));
    await setStorage("links", [link, ...links]);
  } finally {
    release();
  }

  const token = await getStorage("sessionToken");
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    // 2. Push to Next.js backend for authenticated sessions (no offline-first queuing)
    try {
      console.log("[link.storage] Saving link to backend:", link.id);

      await apiFetch("/api/links", {
        method: "POST",
        body: JSON.stringify({
          id: link.id, // Explicitly pass client ID to prevent server duplication
          url: link.url,
          title: link.title,
          hostname: link.hostname,
          tags: link.tags ?? [],
          notes: link.notes,
          category: link.category ?? "General",
        }),
      });
    } catch (err) {
      console.error("[link.storage] Backend save failed:", err);
    }
  } else {
    // Guest mode: queue link in local pending storage for future login synchronization
    console.log("[link.storage] Guest user: queueing saved link in pending list");
    const pending = await getStorage("pending");
    const pendingItem: PendingLink = {
      ...link,
      userId: "",
      retryCount: 0,
      failedAt: Date.now(),
    };
    await setStorage("pending", [...pending, pendingItem]);
  }
};

/**
 * Delete a link from local storage and propagate the delete to the backend if authenticated.
 */
export const deleteLink = async (id: string): Promise<void> => {
  // 1. Delete locally first (inside mutex)
  const release = await storageMutex.acquire();
  try {
    const links = await getStorage("links");
    await setStorage("links", links.filter((l) => l.id !== id));
  } finally {
    release();
  }

  console.log("[link.storage] Deleted link locally:", id);

  const token = await getStorage("sessionToken");
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    try {
      await syncService.syncLinkDelete(id);
    } catch (err) {
      console.error("[link.storage] Backend delete failed:", err);
    }
  } else {
    // Guest mode: remove from the local pending list if it was queued
    const releasePending = await storageMutex.acquire();
    try {
      const pending = await getStorage("pending");
      await setStorage("pending", pending.filter((l) => l.id !== id));
    } finally {
      releasePending();
    }
  }
};

export const getLinks = async (): Promise<Link[]> => {
  return getStorage("links");
};

/**
 * Update an existing link in local storage and sync the change to the backend if authenticated.
 * Sets updatedAt to now for conflict resolution.
 */
export const updateLinkInStorage = async (
  id: string,
  updates: Partial<Link>
): Promise<Link | null> => {
  let updatedLink!: Link;

  const release = await storageMutex.acquire();
  try {
    const links = await getStorage("links");
    const index = links.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const current = links[index];
    updatedLink = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: Date.now(),
    };

    const newLinks = [...links];
    newLinks[index] = updatedLink;
    await setStorage("links", newLinks);
  } finally {
    release();
  }

  const token = await getStorage("sessionToken");
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    // Sync to backend for authenticated sessions (no offline-first queuing)
    try {
      console.log("[link.storage] Updating link on backend:", id);

      await apiFetch(`/api/links/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: updatedLink.title,
          tags: updatedLink.tags ?? [],
          notes: updatedLink.notes,
          category: updatedLink.category ?? "General",
        }),
      });
    } catch (err) {
      console.error("[link.storage] Backend update failed:", err);
    }
  } else {
    // Guest mode: update or append to the local pending list
    const releasePending = await storageMutex.acquire();
    try {
      const pending = await getStorage("pending");
      const pIndex = pending.findIndex((l) => l.id === id);
      if (pIndex !== -1) {
        const newPending = [...pending];
        newPending[pIndex] = {
          ...pending[pIndex],
          ...updates,
          updatedAt: Date.now(),
        };
        await setStorage("pending", newPending);
      } else {
        const pendingItem: PendingLink = {
          ...updatedLink,
          userId: "",
          retryCount: 0,
          failedAt: Date.now(),
        };
        await setStorage("pending", [...pending, pendingItem]);
      }
    } finally {
      releasePending();
    }
  }

  return updatedLink;
};
