import { Link } from "@/shared/types/common.types";
import { STORAGE_KEYS } from "@/shared/constants/storage.keys";

export const linkStorage = {
  async get(): Promise<Link[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LINKS);
    return (result[STORAGE_KEYS.LINKS] as Link[]) || [];
  },

  async set(links: Link[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.LINKS]: links });
  },

  async clear(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEYS.LINKS);
  },
};
