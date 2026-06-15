import { StorageSchema, STORAGE_DEFAULTS } from "@/shared/types/storage.types";
import { isExtensionContextValid } from "@/core/utils/extension-context.util";

export const getStorage = async <K extends keyof StorageSchema>(
  key: K,
): Promise<StorageSchema[K]> => {
  if (!isExtensionContextValid()) {
    return STORAGE_DEFAULTS[key];
  }
  try {
    const result = await chrome.storage.local.get(key as string);
    return result && result[key as string] !== undefined
      ? (result[key as string] as StorageSchema[K])
      : STORAGE_DEFAULTS[key];
  } catch {
    // Context was invalidated between the guard check and the API call.
    return STORAGE_DEFAULTS[key];
  }
};

export const setStorage = async <K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K],
): Promise<void> => {
  if (!isExtensionContextValid()) {
    return;
  }
  try {
    await chrome.storage.local.set({ [key as string]: value });
  } catch {
    // Silently swallow — context invalidated, nothing to persist.
  }
};

