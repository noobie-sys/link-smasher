/**
 * Centralized keyboard event handler service
 * Handles keyboard shortcuts independently of any component
 */

import { isExtensionContextValid } from "@/core/utils/extension-context.util";

export type KeyboardHandler = (event: KeyboardEvent) => void | Promise<void>;

export interface KeyboardShortcut {
  id?: string; // Optional ID for tracking and updating shortcuts
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: KeyboardHandler;
}

class KeyboardService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private shortcutsById: Map<string, string> = new Map(); // Map ID to shortcut key
  private isListening = false;
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): () => void {
    const id = this.getShortcutId(shortcut);
    console.log("[KeyboardService] register() requested. Unique shortcut key path ID:", id, "shortcut:", shortcut);
    this.shortcuts.set(id, shortcut);

    // Track by ID if provided
    if (shortcut.id) {
      // Unregister existing shortcut with same ID if any
      const existingId = this.shortcutsById.get(shortcut.id);
      if (existingId && existingId !== id) {
        console.log("[KeyboardService] register() - overwriting and deleting previous shortcut binding:", existingId, "for ID:", shortcut.id);
        this.shortcuts.delete(existingId);
      }
      this.shortcutsById.set(shortcut.id, id);
    }

    // Auto-start listening if not already
    if (!this.isListening) {
      this.startListening();
    }

    // Return unregister function
    return () => {
      console.log("[KeyboardService] unregistering shortcut with ID:", id);
      this.shortcuts.delete(id);
      if (shortcut.id) {
        this.shortcutsById.delete(shortcut.id);
      }
      if (this.shortcuts.size === 0) {
        this.stopListening();
      }
    };
  }

  /**
   * Update an existing shortcut by ID
   */
  updateShortcut(id: string, newShortcut: Omit<KeyboardShortcut, "handler">): boolean {
    const existingKey = this.shortcutsById.get(id);
    if (!existingKey) {
      return false;
    }

    const existing = this.shortcuts.get(existingKey);
    if (!existing) {
      return false;
    }

    // Create new shortcut with same handler
    const updated: KeyboardShortcut = {
      ...newShortcut,
      id,
      handler: existing.handler,
    };

    const newKey = this.getShortcutId(updated);
    
    // Remove old shortcut
    this.shortcuts.delete(existingKey);
    
    // Add new shortcut
    this.shortcuts.set(newKey, updated);
    this.shortcutsById.set(id, newKey);

    return true;
  }

  /**
   * Unregister a shortcut by ID
   */
  unregisterById(id: string): boolean {
    const key = this.shortcutsById.get(id);
    if (!key) {
      return false;
    }

    this.shortcuts.delete(key);
    this.shortcutsById.delete(id);

    if (this.shortcuts.size === 0) {
      this.stopListening();
    }

    return true;
  }

  /**
   * Check if a keyboard event matches a shortcut
   */
  private matches(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const target = event.target as HTMLElement;

    // Check if the user is typing in a form input, textarea, or contenteditable element
    const isInputField =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    // Ignore global shortcuts if target is inside an input field (without modifiers)
    // or if the target is our own dialog container (custom element LINK-SMASHER)
    if (
      target &&
      (target.tagName === "LINK-SMASHER" ||
        (isInputField && !shortcut.metaKey && !shortcut.ctrlKey && !shortcut.altKey))
    ) {
      console.log("[KeyboardService] matches() skipped matching because target is in input field or link-smasher dialog:", target.tagName);
      return false;
    }

    const eventKey = event.key.toLowerCase();
    const shortcutKey = shortcut.key.toLowerCase();

    if (eventKey !== shortcutKey) return false;

    // Strict checking for all modifiers
    if (!!shortcut.metaKey !== event.metaKey) return false;
    if (!!shortcut.ctrlKey !== event.ctrlKey) return false;
    if (!!shortcut.shiftKey !== event.shiftKey) return false;
    if (!!shortcut.altKey !== event.altKey) return false;

    console.log("[KeyboardService] matches() matched successfully! eventKey:", eventKey, "shortcutKey:", shortcutKey);
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
    console.log("[KeyboardService] startListening() - Adding global keydown capture listener on window");

    this.boundHandler = (e: KeyboardEvent) => {
      // If the extension was reloaded/updated, this content script's context is
      // invalidated. Self-destruct to prevent future uncaught errors on every keypress.
      if (!isExtensionContextValid()) {
        this.clear();
        return;
      }

      for (const shortcut of this.shortcuts.values()) {
        if (this.matches(e, shortcut)) {
          e.preventDefault();
          e.stopPropagation();
          try {
            const result = shortcut.handler(e);
            // Catch promise rejections from async handlers
            if (result instanceof Promise) {
              result.catch((err) => {
                if (err?.message?.includes("Extension context invalidated")) {
                  this.clear();
                } else {
                  console.error("[KeyboardService] Shortcut handler error:", err);
                }
              });
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("Extension context invalidated")) {
              this.clear();
            } else {
              console.error("[KeyboardService] Shortcut handler error:", err);
            }
          }
          break; // Only handle first match
        }
      }
    };

    window.addEventListener("keydown", this.boundHandler, true);
    this.isListening = true;
  }

  /**
   * Stop listening to keyboard events
   */
  private stopListening(): void {
    if (!this.isListening || !this.boundHandler) return;

    window.removeEventListener("keydown", this.boundHandler, true);
    this.boundHandler = null;
    this.isListening = false;
  }

  /**
   * Clear all shortcuts and stop listening
   */
  clear(): void {
    this.shortcuts.clear();
    this.shortcutsById.clear();
    this.stopListening();
  }
}

// Export singleton instance
export const keyboardService = new KeyboardService();

