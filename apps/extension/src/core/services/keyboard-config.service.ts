/**
 * Keyboard shortcut configuration service
 * Manages user-configurable keyboard shortcuts with storage persistence
 */

import { STORAGE_KEYS } from "@/shared/constants/storage.keys";
import { KeyboardShortcutComboSchema } from "@/shared/validation/schemas";
import { ZodError } from "zod";

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
    console.log("[keyboardConfigService] getShortcuts() - fetching from local storage");
    const saved = await chrome.storage.local.get(STORAGE_KEYS.SHORTCUTS);
    const userPrefs =
      (saved[STORAGE_KEYS.SHORTCUTS] as Record<string, KeyboardShortcutConfig["defaultCombo"]>) ||
      {};
    console.log("[keyboardConfigService] getShortcuts() - raw preferences from storage:", userPrefs);

    const shortcuts = Object.values(DEFAULT_SHORTCUTS).map((def) => ({
      ...def,
      currentCombo: userPrefs[def.id] || def.defaultCombo,
    }));
    console.log("[keyboardConfigService] getShortcuts() - resolved configuration list:", shortcuts);
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
    console.log("[keyboardConfigService] updateShortcut() requested for action:", action, "with combo:", combo);
    let validatedCombo;
    try {
      validatedCombo = KeyboardShortcutComboSchema.parse(combo);
      console.log("[keyboardConfigService] updateShortcut() - combo passed Zod validation:", validatedCombo);
    } catch (error) {
      console.error("[keyboardConfigService] updateShortcut() - Zod validation failed for combo:", combo, error);
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(", ");
        throw new Error(messages);
      }
      throw error;
    }

    const saved = await chrome.storage.local.get(STORAGE_KEYS.SHORTCUTS);
    const userPrefs =
      (saved[STORAGE_KEYS.SHORTCUTS] as Record<string, KeyboardShortcutConfig["defaultCombo"]>) ||
      {};

    userPrefs[action] = validatedCombo;
    console.log("[keyboardConfigService] updateShortcut() - saving updated preferences to storage:", userPrefs);
    await chrome.storage.local.set({ [STORAGE_KEYS.SHORTCUTS]: userPrefs });

    // Dispatch event to notify listeners of shortcut change
    console.log("[keyboardConfigService] updateShortcut() - dispatching ls-shortcut-updated custom event");
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
    console.log("[keyboardConfigService] resetShortcut() requested for action:", action);
    const saved = await chrome.storage.local.get(STORAGE_KEYS.SHORTCUTS);
    const userPrefs =
      (saved[STORAGE_KEYS.SHORTCUTS] as Record<string, KeyboardShortcutConfig["defaultCombo"]>) ||
      {};

    delete userPrefs[action];
    console.log("[keyboardConfigService] resetShortcut() - saving updated preferences to storage:", userPrefs);
    await chrome.storage.local.set({ [STORAGE_KEYS.SHORTCUTS]: userPrefs });

    // Dispatch event to notify listeners
    const defaultCombo = DEFAULT_SHORTCUTS[action].defaultCombo;
    console.log("[keyboardConfigService] resetShortcut() - dispatching ls-shortcut-updated event with default combo:", defaultCombo);
    window.dispatchEvent(
      new CustomEvent("ls-shortcut-updated", { detail: { action, combo: defaultCombo } })
    );
  },

  /**
   * Reset all shortcuts to defaults
   */
  async resetAllShortcuts(): Promise<void> {
    console.log("[keyboardConfigService] resetAllShortcuts() requested");
    await chrome.storage.local.remove(STORAGE_KEYS.SHORTCUTS);
    console.log("[keyboardConfigService] resetAllShortcuts() - shortcuts storage key removed");
    window.dispatchEvent(new CustomEvent("ls-shortcuts-reset"));
  },
};
