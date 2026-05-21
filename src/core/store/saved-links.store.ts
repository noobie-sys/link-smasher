import { create } from "zustand";
import { linkService } from "@/core/services/link.service";

interface SavedLinksState {
  /** Set of all saved URLs for O(1) lookups */
  savedUrls: Set<string>;

  /** Whether the store has loaded from local storage at least once */
  initialized: boolean;

  /** Load all saved URLs from chrome.storage.local into the set */
  initialize: () => Promise<void>;

  /** Add a URL to the set (call after a successful save) */
  addUrl: (url: string) => void;

  /** Remove a URL from the set (call after a successful delete) */
  removeUrl: (url: string) => void;

  /** Check if a URL is already saved */
  isUrlSaved: (url: string) => boolean;
}

export const useSavedLinksStore = create<SavedLinksState>((set, get) => ({
  savedUrls: new Set(),
  initialized: false,

  initialize: async () => {
    // Skip if already initialized to avoid redundant storage reads
    if (get().initialized) return;

    try {
      const links = await linkService.getAllLinks();
      const urls = new Set(links.map((link) => link.url));
      set({ savedUrls: urls, initialized: true });
      console.log("[SavedLinksStore] Initialized with", urls.size, "saved URLs");
    } catch (error) {
      console.error("[SavedLinksStore] Failed to initialize:", error);
      // Mark as initialized anyway to prevent infinite retry loops
      set({ initialized: true });
    }
  },

  addUrl: (url: string) => {
    set((state) => {
      const next = new Set(state.savedUrls);
      next.add(url);
      return { savedUrls: next };
    });
  },

  removeUrl: (url: string) => {
    set((state) => {
      const next = new Set(state.savedUrls);
      next.delete(url);
      return { savedUrls: next };
    });
  },

  isUrlSaved: (url: string) => {
    return get().savedUrls.has(url);
  },
}));
