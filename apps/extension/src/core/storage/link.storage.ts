import { Link } from "@/shared/types/common.types";
import { PendingLink } from "@/shared/types/storage.types";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { HARDCODED_USER_ID, supabase } from "@/core/supabase/client";
import { syncService } from "@/core/services/sync.service";

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

export const saveLink = async (link: Link): Promise<void> => {
  const links = await getStorage("links");
  await setStorage("links", [link, ...links]);

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

export const deleteLink = async (id: string): Promise<void> => {
  const links = await getStorage("links");
  const filtered = links.filter((l) => l.id !== id);
  await setStorage("links", filtered);

  console.log("[deleteLink] Deleted link locally", { id });
  void syncService.syncLinkDelete(id);
};

export const getLinks = async (): Promise<Link[]> => {
  return getStorage("links");
};

export const updateLinkInStorage = async (
  id: string,
  updates: Partial<Link>,
): Promise<Link | null> => {
  const links = await getStorage("links");
  const index = links.findIndex((l) => l.id === id);

  if (index === -1) return null;

  const currentLink = links[index];
  const updatedLink: Link = {
    ...currentLink,
    ...updates,
    id: currentLink.id,
    createdAt: currentLink.createdAt,
  };

  const newLinks = [...links];
  newLinks[index] = updatedLink;

  await setStorage("links", newLinks);

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
        synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error("[updateLinkInStorage] Unexpected error updating in Supabase", err);
  }

  return updatedLink;
};
