/**
 * Checks whether the extension's runtime context is still valid.
 *
 * When an extension is reloaded or updated while a content script is already
 * injected into a tab, the old content script's `chrome.runtime` context
 * becomes "invalidated". Any subsequent calls to `chrome.*` APIs (storage,
 * sendMessage, etc.) will throw "Extension context invalidated."
 *
 * Call this before any `chrome.*` API usage that could run in a long-lived
 * content script (i.e. anything inside useEffect, event listeners, etc.).
 */
export function isExtensionContextValid(): boolean {
  try {
    // chrome.runtime.id is undefined when the context is invalidated.
    return typeof chrome !== "undefined" && !!chrome.runtime?.id;
  } catch {
    return false;
  }
}
