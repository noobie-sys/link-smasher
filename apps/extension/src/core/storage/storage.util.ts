import { StorageSchema, STORAGE_DEFAULTS } from "@/shared/types/storage.types";

export const getStorage = async <K extends keyof StorageSchema>(
  key: K,
): Promise<StorageSchema[K]> => {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
    return STORAGE_DEFAULTS[key];
  }
  const result = await chrome.storage.local.get(key as string);
  return result && result[key as string] !== undefined
    ? (result[key as string] as StorageSchema[K])
    : STORAGE_DEFAULTS[key];
};

export const setStorage = async <K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): Promise<void> => {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
    return;
  }
  await chrome.storage.local.set({ [key as string]: value });
};
