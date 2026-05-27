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
 * Save a new link to local storage, then immediately sync to the Next.js backend.
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

  // 2. Push to Next.js backend (outside mutex — network can take time)
  try {
    console.log("[link.storage] Saving link to backend:", link.id);

    await apiFetch("/api/links", {
      method: "POST",
      body: JSON.stringify({
        url: link.url,
        title: link.title,
        hostname: link.hostname,
        tags: link.tags ?? [],
        notes: link.notes,
        category: link.category ?? "General",
      }),
    });
  } catch (err) {
    // Network failure — queue for background retry
    console.error("[link.storage] Backend save failed, queueing pending:", err);
    const pending = await getStorage("pending");
    const pendingItem: PendingLink = {
      ...link,
      userId: "", // userId resolved server-side from session; kept for schema compat
      retryCount: 0,
      failedAt: Date.now(),
    };
    await setStorage("pending", [...pending, pendingItem]);
  }
};

/**
 * Delete a link from local storage and propagate the delete to the backend.
 * If the backend call fails, the ID is saved to `pendingDeletes` for retry.
 */
export const deleteLink = async (id: string): Promise<void> => {
  const release = await storageMutex.acquire();
  try {
    const links = await getStorage("links");
    await setStorage("links", links.filter((l) => l.id !== id));
  } finally {
    release();
  }

  console.log("[link.storage] Deleted link locally:", id);

  try {
    await syncService.syncLinkDelete(id);
  } catch {
    console.error("[link.storage] Backend delete failed, queueing for retry:", id);
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
 * Update an existing link in local storage and sync the change to the backend.
 * Sets updatedAt to now for conflict resolution.
 * On failure, queues to `pending` for background retry.
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

  // Sync to backend
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
    console.error("[link.storage] Backend update failed, queueing pending:", err);
    const pending = await getStorage("pending");
    const pendingItem: PendingLink = {
      ...updatedLink,
      userId: "",
      retryCount: 0,
      failedAt: Date.now(),
    };
    await setStorage("pending", [...pending, pendingItem]);
  }

  return updatedLink;
};
