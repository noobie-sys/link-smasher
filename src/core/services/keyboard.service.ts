/**
 * Centralized keyboard event handler service
 * Handles keyboard shortcuts independently of any component
 */

export type KeyboardHandler = (event: KeyboardEvent) => void | Promise<void>;

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: KeyboardHandler;
}

class KeyboardService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isListening = false;
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): () => void {
    const id = this.getShortcutId(shortcut);
    this.shortcuts.set(id, shortcut);

    // Auto-start listening if not already
    if (!this.isListening) {
      this.startListening();
    }

    // Return unregister function
    return () => {
      this.shortcuts.delete(id);
      if (this.shortcuts.size === 0) {
        this.stopListening();
      }
    };
  }

  /**
   * Check if a keyboard event matches a shortcut
   */
  private matches(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const eventKey = event.key.toLowerCase();
    const shortcutKey = shortcut.key.toLowerCase();

    if (eventKey !== shortcutKey) return false;

    // Strict checking for all modifiers
    if (!!shortcut.metaKey !== event.metaKey) return false;
    if (!!shortcut.ctrlKey !== event.ctrlKey) return false;
    if (!!shortcut.shiftKey !== event.shiftKey) return false;
    if (!!shortcut.altKey !== event.altKey) return false;

    return true;
  }

  /**
   * Generate a unique ID for a shortcut
   */
  private getShortcutId(shortcut: KeyboardShortcut): string {
    const parts = [
      shortcut.metaKey ? "meta" : "",
      shortcut.ctrlKey ? "ctrl" : "",
      shortcut.altKey ? "alt" : "",
      shortcut.shiftKey ? "shift" : "",
      shortcut.key.toLowerCase(),
    ].filter(Boolean);
    return parts.join("+");
  }

  /**
   * Start listening to keyboard events
   */
  private startListening(): void {
    if (this.isListening) return;

    this.boundHandler = (e: KeyboardEvent) => {
      for (const shortcut of this.shortcuts.values()) {
        if (this.matches(e, shortcut)) {
          e.preventDefault();
          e.stopPropagation();
          shortcut.handler(e);
          break; // Only handle first match
        }
      }
    };

    document.addEventListener("keydown", this.boundHandler, true);
    this.isListening = true;
  }

  /**
   * Stop listening to keyboard events
   */
  private stopListening(): void {
    if (!this.isListening || !this.boundHandler) return;

    document.removeEventListener("keydown", this.boundHandler, true);
    this.boundHandler = null;
    this.isListening = false;
  }

  /**
   * Clear all shortcuts and stop listening
   */
  clear(): void {
    this.shortcuts.clear();
    this.stopListening();
  }
}

// Export singleton instance
export const keyboardService = new KeyboardService();

