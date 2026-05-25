import { StorageSchema, STORAGE_DEFAULTS } from "@/shared/types/storage.types";

export const getStorage = async <K extends keyof StorageSchema>(
  key: K,
): Promise<StorageSchema[K]> => {
  const result = await chrome.storage.local.get(key as string);
  return result[key as string] !== undefined
    ? (result[key as string] as StorageSchema[K])
    : STORAGE_DEFAULTS[key];
};

export const setStorage = async <K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): Promise<void> => {
  await chrome.storage.local.set({ [key as string]: value });
};
