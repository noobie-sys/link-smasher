/**
 * Keyboard shortcut configuration service
 * Manages user-configurable keyboard shortcuts with storage persistence
 */

import { STORAGE_KEYS } from "@/shared/constants/storage.keys";

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
      metaKey: true, // CMD+J
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
    const saved = await chrome.storage.local.get(STORAGE_KEYS.SHORTCUTS);
    const userPrefs =
      (saved[STORAGE_KEYS.SHORTCUTS] as Record<string, KeyboardShortcutConfig["defaultCombo"]>) ||
      {};

    return Object.values(DEFAULT_SHORTCUTS).map((def) => ({
      ...def,
      currentCombo: userPrefs[def.id] || def.defaultCombo,
    }));
  },

  /**
   * Get a specific shortcut configuration
   */
  async getShortcut(action: ShortcutAction): Promise<KeyboardShortcutConfig | null> {
    const shortcuts = await this.getShortcuts();
    return shortcuts.find((s) => s.id === action) || null;
  },

  /**
   * Update a shortcut configuration
   */
  async updateShortcut(
    action: ShortcutAction,
    combo: KeyboardShortcutConfig["defaultCombo"]
  ): Promise<void> {
    const saved = await chrome.storage.local.get(STORAGE_KEYS.SHORTCUTS);
    const userPrefs =
      (saved[STORAGE_KEYS.SHORTCUTS] as Record<string, KeyboardShortcutConfig["defaultCombo"]>) ||
      {};

    userPrefs[action] = combo;
    await chrome.storage.local.set({ [STORAGE_KEYS.SHORTCUTS]: userPrefs });

    // Dispatch event to notify listeners of shortcut change
    window.dispatchEvent(new CustomEvent("ls-shortcut-updated", { detail: { action, combo } }));
  },

  /**
   * Reset a shortcut to its default
   */
  async resetShortcut(action: ShortcutAction): Promise<void> {
    const saved = await chrome.storage.local.get(STORAGE_KEYS.SHORTCUTS);
    const userPrefs =
      (saved[STORAGE_KEYS.SHORTCUTS] as Record<string, KeyboardShortcutConfig["defaultCombo"]>) ||
      {};

    delete userPrefs[action];
    await chrome.storage.local.set({ [STORAGE_KEYS.SHORTCUTS]: userPrefs });

    // Dispatch event to notify listeners
    const defaultCombo = DEFAULT_SHORTCUTS[action].defaultCombo;
    window.dispatchEvent(
      new CustomEvent("ls-shortcut-updated", { detail: { action, combo: defaultCombo } })
    );
  },

  /**
   * Reset all shortcuts to defaults
   */
  async resetAllShortcuts(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEYS.SHORTCUTS);
    window.dispatchEvent(new CustomEvent("ls-shortcuts-reset"));
  },
};

