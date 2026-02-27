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

const toSupabase = (link: Link, userId: string) => ({
  id: link.id,
  user_id: userId,
  url: link.url,
  title: link.title,
  hostname: link.hostname,
  tags: link.tags ?? [],
  notes: link.notes ?? null,
  created_at: new Date(link.createdAt).toISOString(),
});

const fromSupabase = (row: {
  id: string;
  user_id: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes: string | null;
  created_at: string;
}): Link => ({
  id: row.id,
  url: row.url,
  title: row.title,
  hostname: row.hostname,
  tags: row.tags ?? [],
  notes: row.notes ?? undefined,
  createdAt: new Date(row.created_at).getTime(),
});

export const saveLink = async (link: Link): Promise<void> => {
  const links = await getStorage("links");
  await setStorage("links", [link, ...links]);

  try {
    console.log("[saveLink] Saving link", { id: link.id, url: link.url });

    const { error } = await supabase
      .from("links")
      .insert(toSupabase(link, HARDCODED_USER_ID));

    if (error) {
      console.warn("[saveLink] Supabase insert failed, queueing pending item", {
        id: link.id,
        error,
      });
      const pending = await getStorage("pending");
      const pendingItem: PendingLink = {
        ...link,
        userId: HARDCODED_USER_ID,
        retryCount: 0,
        failedAt: Date.now(),
      };
      await setStorage("pending", [...pending, pendingItem]);
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
    const { error } = await supabase
      .from("links")
      .update(toSupabase(updatedLink, HARDCODED_USER_ID))
      .eq("id", id);

    if (error) {
      console.error("[updateLinkInStorage] Supabase error", error);
    }
  } catch (err) {
    console.error("[updateLinkInStorage] Unexpected error", err);
  }

  return updatedLink;
};

