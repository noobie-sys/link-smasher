/**
 * Keyboard shortcut configuration service
 * Manages user-configurable keyboard shortcuts with storage persistence
 */

import { STORAGE_KEYS } from "@/shared/constants/storage.keys";
import { KeyboardShortcutComboSchema } from "@/shared/validation/schemas";
import { ZodError } from "zod";
import { authService } from "@/core/auth/auth.service";
import { apiFetch } from "@/core/api/client";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { isExtensionContextValid } from "@/core/utils/extension-context.util";

export interface KeyboardShortcutConfig {
  id: string;
  name: string;
  description: string;
  defaultCombo: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
  };
  currentCombo?: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
  };
}

export enum ShortcutAction {
  OPEN_DIALOG = "OPEN_DIALOG",
  SAVE_LINK = "SAVE_LINK",
}

const DEFAULT_SHORTCUTS: Record<ShortcutAction, KeyboardShortcutConfig> = {
  [ShortcutAction.OPEN_DIALOG]: {
    id: ShortcutAction.OPEN_DIALOG,
    name: "Open Link Dialog",
    description: "Open the link management dialog",
    defaultCombo: {
      key: "j",
      ctrlKey: true,
    },
  },
  [ShortcutAction.SAVE_LINK]: {
    id: ShortcutAction.SAVE_LINK,
    name: "Save Current Link",
    description: "Save the current page link",
    defaultCombo: {
      key: "b",
      metaKey: true, // CMD
      ctrlKey: true, // CTRL
    },
  },
};

export const keyboardConfigService = {
  /**
   * Get all shortcuts with their current configurations
   */
  async getShortcuts(): Promise<KeyboardShortcutConfig[]> {
    if (!isExtensionContextValid()) return Object.values(DEFAULT_SHORTCUTS);
    const userPrefs =
      (await getStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts") as Record<string, KeyboardShortcutConfig["defaultCombo"]> | null) || {};

    const shortcuts = Object.values(DEFAULT_SHORTCUTS).map((def) => ({
      ...def,
      currentCombo: userPrefs[def.id] || def.defaultCombo,
    }));
    return shortcuts;
  },

  /**
   * Get a specific shortcut configuration
   */
  async getShortcut(action: ShortcutAction): Promise<KeyboardShortcutConfig | null> {
    console.log("[keyboardConfigService] getShortcut() for action:", action);
    const shortcuts = await this.getShortcuts();
    const found = shortcuts.find((s) => s.id === action) || null;
    console.log("[keyboardConfigService] getShortcut() resolved:", found);
    return found;
  },

  /**
   * Update a shortcut configuration
   */
  async updateShortcut(
    action: ShortcutAction,
    combo: KeyboardShortcutConfig["defaultCombo"]
  ): Promise<void> {
    let validatedCombo;
    try {
      validatedCombo = KeyboardShortcutComboSchema.parse(combo);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(", ");
        throw new Error(messages);
      }
      throw error;
    }

    if (!isExtensionContextValid()) return;

    const userPrefs =
      (await getStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts") as Record<string, KeyboardShortcutConfig["defaultCombo"]> | null) || {};

    userPrefs[action] = validatedCombo;
    await setStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts", userPrefs as never);

    // Sync to DB if logged in
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated && isExtensionContextValid()) {
        await apiFetch("/api/shortcuts", {
          method: "PUT",
          body: JSON.stringify(userPrefs),
        });
      }
    } catch (dbErr) {
      console.error("[keyboardConfigService] Failed to sync shortcuts to database:", dbErr);
    }

    window.dispatchEvent(
      new CustomEvent("ls-shortcut-updated", {
        detail: { action, combo: validatedCombo },
      })
    );
  },

  /**
   * Reset a shortcut to its default
   */
  async resetShortcut(action: ShortcutAction): Promise<void> {
    if (!isExtensionContextValid()) return;

    const userPrefs =
      (await getStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts") as Record<string, KeyboardShortcutConfig["defaultCombo"]> | null) || {};

    delete userPrefs[action];
    await setStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts", userPrefs as never);

    // Sync to DB if logged in
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated && isExtensionContextValid()) {
        await apiFetch("/api/shortcuts", {
          method: "PUT",
          body: JSON.stringify(userPrefs),
        });
      }
    } catch (dbErr) {
      console.error("[keyboardConfigService] Failed to sync reset shortcuts to database:", dbErr);
    }

    const defaultCombo = DEFAULT_SHORTCUTS[action].defaultCombo;
    window.dispatchEvent(
      new CustomEvent("ls-shortcut-updated", { detail: { action, combo: defaultCombo } })
    );
  },

  /**
   * Reset all shortcuts to defaults
   */
  async resetAllShortcuts(): Promise<void> {
    if (!isExtensionContextValid()) return;

    await setStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts", {} as never);

    // Sync to DB if logged in (clear custom configuration)
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated && isExtensionContextValid()) {
        await apiFetch("/api/shortcuts", {
          method: "PUT",
          body: JSON.stringify({}),
        });
      }
    } catch (dbErr) {
      console.error("[keyboardConfigService] Failed to reset database shortcuts:", dbErr);
    }

    window.dispatchEvent(new CustomEvent("ls-shortcuts-reset"));
  },
};
