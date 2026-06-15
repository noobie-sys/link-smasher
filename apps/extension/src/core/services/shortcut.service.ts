import { STORAGE_KEYS } from "@/shared/constants/storage.keys";
import {
  ShortcutAction,
  ShortcutDef,
  KeyCombo,
} from "@/shared/types/shortcut.types";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { isExtensionContextValid } from "@/core/utils/extension-context.util";

const DEFAULT_SHORTCUTS: Record<ShortcutAction, ShortcutDef> = {
  [ShortcutAction.SAVE_LINK]: {
    id: ShortcutAction.SAVE_LINK,
    name: "Save Link",
    description: "Save the current tab's link",
    defaultCombo: { key: "b", metaKey: true, ctrlKey: true }, // CMD+CTRL+B
  },
  [ShortcutAction.TOGGLE_PALETTE]: {
    id: ShortcutAction.TOGGLE_PALETTE,
    name: "Command Palette",
    description: "Open the command palette",
    defaultCombo: { key: "j", metaKey: true }, // CMD+J
  },
};

export const shortcutService = {
  async getShortcuts(): Promise<ShortcutDef[]> {
    if (!isExtensionContextValid()) return Object.values(DEFAULT_SHORTCUTS);
    const userPrefs =
      (await getStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts") as Record<string, KeyCombo> | null) || {};

    return Object.values(DEFAULT_SHORTCUTS).map((def) => ({
      ...def,
      currentCombo: userPrefs[def.id] || def.defaultCombo,
    }));
  },

  async updateShortcut(action: ShortcutAction, combo: KeyCombo): Promise<void> {
    if (!isExtensionContextValid()) return;
    const userPrefs =
      (await getStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts") as Record<string, KeyCombo> | null) || {};

    userPrefs[action] = combo;
    await setStorage(STORAGE_KEYS.SHORTCUTS as "shortcuts", userPrefs as never);
  },

  matches(event: KeyboardEvent, combo: KeyCombo): boolean {
    // Normalize keys
    const eventKey = event.key.toLowerCase();
    const comboKey = combo.key.toLowerCase();

    if (eventKey !== comboKey) return false;

    // Strict checking for all modifiers
    if (!!combo.metaKey !== event.metaKey) return false;
    if (!!combo.ctrlKey !== event.ctrlKey) return false;
    if (!!combo.shiftKey !== event.shiftKey) return false;
    if (!!combo.altKey !== event.altKey) return false;

    return true;
  },

  async getShortcutAction(
    event: KeyboardEvent
  ): Promise<ShortcutAction | null> {
    const shortcuts = await this.getShortcuts();
    for (const s of shortcuts) {
      if (s.currentCombo && this.matches(event, s.currentCombo)) {
        return s.id;
      }
    }
    return null;
  },
};

