export type KeyCombo = {
  key: string;
  metaKey?: boolean; // Command on Mac, Control on Windows usually handled by 'modifier' generic but keeping simple
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export enum ShortcutAction {
  SAVE_LINK = "SAVE_LINK",
  TOGGLE_PALETTE = "TOGGLE_PALETTE",
}

export interface ShortcutDef {
  id: ShortcutAction;
  name: string;
  description: string;
  defaultCombo: KeyCombo;
  currentCombo?: KeyCombo;
}
