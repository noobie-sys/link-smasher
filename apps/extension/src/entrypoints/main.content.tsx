import { LinkDialog } from "@/components/link-dialog";
import "@/index.css";
import { createRoot } from "react-dom/client";
import React, { useState, useRef, useEffect } from "react";

import { PortalContext } from "@/context/portal.context";
import { Toaster } from "@/components/ui/sonners";
import { toast } from "sonner";
import { FloatingBookmark } from "@/components/floating-bookmark";
import { keyboardService } from "@/core/services/keyboard.service";
import {
  keyboardConfigService,
  ShortcutAction,
} from "@/core/services/keyboard-config.service";
import { linkService } from "@/core/services/link.service";
import { Link } from "@/shared/types/common.types";
import { ExtensionMessage } from "@/shared/types/message.types";
import { useSavedLinksStore } from "@/core/store/saved-links.store";
import { STORAGE_KEYS } from "@/shared/constants/storage.keys";
import { isExtensionContextValid } from "@/core/utils/extension-context.util";

const ContentRoot = () => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const unregisterRefs = useRef<Map<string, () => void>>(new Map());
  const { initialize, isUrlSaved, addUrl } = useSavedLinksStore();

  // Load and register shortcuts from configuration
  const loadAndRegisterShortcuts = async () => {
    console.log("[Content Script] loadAndRegisterShortcuts() starting...");
    // Unregister all existing shortcuts
    unregisterRefs.current.forEach((unregister) => unregister());
    unregisterRefs.current.clear();

    // Load shortcuts from config
    const shortcuts = await keyboardConfigService.getShortcuts();
    console.log(
      "[Content Script] Loaded shortcuts configuration from storage:",
      shortcuts,
    );

    // Register each shortcut
    for (const shortcut of shortcuts) {
      const combo = shortcut.currentCombo || shortcut.defaultCombo;
      console.log(
        "[Content Script] Registering hotkey with keyboardService:",
        shortcut.id,
        "combo:",
        combo,
      );

      const unregister = keyboardService.register({
        id: shortcut.id,
        key: combo.key,
        metaKey: combo.metaKey,
        ctrlKey: combo.ctrlKey,
        altKey: combo.altKey,
        shiftKey: combo.shiftKey,
        handler: async (e) => {
          console.log(
            "[Content Script] Hotkey triggered! Action ID:",
            shortcut.id,
          );
          if (shortcut.id === ShortcutAction.OPEN_DIALOG) {
            console.log("[Content Script] Opening link dialog...");
            setLinkToEdit(null); // Ensure clean state
            setLinkDialogOpen(true);
          } else if (shortcut.id === ShortcutAction.SAVE_LINK) {
            // Save current link directly
            console.log("[Content Script] Saving current page link...");
            try {
              const url = window.location.href;

              // Skip save entirely if already bookmarked — no database request
              if (isUrlSaved(url)) {
                console.log("[Content Script] URL is already saved:", url);
                toast.info("Already bookmarked!");
                return;
              }

              const title = document.title || url;
              const result = await linkService.addLink({
                url,
                title,
                tags: [],
              });

              if (result) {
                console.log(
                  "[Content Script] Link saved successfully:",
                  result,
                );
                addUrl(url);
                toast.success("Link saved!");
              } else {
                console.log("[Content Script] Link updated or already exists.");
                toast.info("Link updated or already exists.");
              }
            } catch (error) {
              console.error("[Content Script] Failed to save link:", error);
              toast.error("Failed to save link.");
            }
          }
        },
      });

      unregisterRefs.current.set(shortcut.id, unregister);
    }
    console.log("[Content Script] All shortcuts registered successfully.");
  };

  useEffect(() => {
    // Initialize Zustand store with saved URLs from local storage
    initialize();

    // Initial load
    loadAndRegisterShortcuts();

    // Send initial focus event if page is already visible
    if (document.visibilityState === "visible" && isExtensionContextValid()) {
      try {
        chrome.runtime.sendMessage({
          type: "PAGE_FOCUS",
          hostname: location.hostname,
          ts: Date.now(),
        });
      } catch { /* context invalidated */ }
    }

    // Listen for messages from popup
    const handleMessage = (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      const msg = message as ExtensionMessage;
      if (msg.type === "EDIT_LINK" && msg.link) {
        setLinkToEdit(msg.link);
        setLinkDialogOpen(true);
      }
    };

    // Track active time and close dialog on tab visibility changes
    const handleVisibilityChange = () => {
      if (!isExtensionContextValid()) return;
      if (document.hidden) {
        setLinkDialogOpen(false);
        setLinkToEdit(null);
        try {
          chrome.runtime.sendMessage({
            type: "PAGE_BLUR",
            hostname: location.hostname,
            ts: Date.now(),
          });
        } catch { /* context invalidated */ }
      } else {
        try {
          chrome.runtime.sendMessage({
            type: "PAGE_FOCUS",
            hostname: location.hostname,
            ts: Date.now(),
          });
        } catch { /* context invalidated */ }
      }
    };

    // Listen for shortcut and link changes in storage (cross-context)
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      // If the extension was reloaded while this content script is still alive,
      // the context is invalidated — stop triggering further chrome API calls.
      if (!isExtensionContextValid()) return;

      if (areaName === "local") {
        if (changes[STORAGE_KEYS.SHORTCUTS]) {
          console.log(
            "[Content Script] Shortcuts storage key updated, reloading hotkeys...",
          );
          loadAndRegisterShortcuts();
        }
        if (changes["links"]) {
          console.log(
            "[Content Script] Links storage key updated, refreshing UI state...",
          );
          initialize(true); // Force refresh the URL cache
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.onChanged
    ) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      // Cleanup
      unregisterRefs.current.forEach((unregister) => unregister());
      unregisterRefs.current.clear();
      chrome.runtime.onMessage.removeListener(handleMessage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.onChanged
      ) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
      // End any active focus session when content script unmounts
      if (isExtensionContextValid()) {
        try {
          chrome.runtime.sendMessage({
            type: "PAGE_BLUR",
            hostname: location.hostname,
            ts: Date.now(),
          });
        } catch { /* context invalidated */ }
      }
    };
  }, []);

  return (
    <React.StrictMode>
      <PortalContext.Provider value={portalContainer}>
        <div ref={setPortalContainer} id="link-smasher-container">
          <FloatingBookmark
            onOpenEdit={(link) => {
              setLinkToEdit(link);
              setLinkDialogOpen(true);
            }}
          />
          <LinkDialog
            open={linkDialogOpen}
            onOpenChange={(open) => {
              setLinkDialogOpen(open);
              if (!open) setLinkToEdit(null);
            }}
            linkToEdit={linkToEdit}
            onEditComplete={() => setLinkToEdit(null)}
          />
          <Toaster />
        </div>
      </PortalContext.Provider>
    </React.StrictMode>
  );
};

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    try {
      const ui = await createShadowRootUi(ctx, {
        name: "link-smasher",
        position: "modal",
        zIndex: 2147483647,
        anchor: "body",
        isolateEvents: ["keydown", "keyup", "keypress", "wheel"],
        onMount: (container) => {
          const app = document.createElement("div");
          app.id = "link-smasher-root";
          container.append(app);

          const root = createRoot(app);
          root.render(<ContentRoot />);
          return root;
        },
        onRemove: (root) => {
          console.log("Link Smasher: UI unmounting");
          root?.unmount();
        },
      });
      ui.mount();
    } catch (e) {
      console.error("Link Smasher: Error mounting UI", e);
    }
  },
});
