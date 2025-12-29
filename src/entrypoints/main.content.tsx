import { LinkDialog } from '@/components/link-dialog';
import '@/index.css';
import { createRoot } from 'react-dom/client';
import React, { useState, useRef, useEffect } from 'react';

import { PortalContext } from '@/context/portal.context';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { keyboardService } from "@/core/services/keyboard.service";
import { keyboardConfigService, ShortcutAction } from "@/core/services/keyboard-config.service";
import { linkService } from "@/core/services/link.service";

const ContentRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const unregisterRefs = useRef<Map<string, () => void>>(new Map())

    // Load and register shortcuts from configuration
    const loadAndRegisterShortcuts = async () => {
        // Unregister all existing shortcuts
        unregisterRefs.current.forEach((unregister) => unregister());
        unregisterRefs.current.clear();

        // Load shortcuts from config
        const shortcuts = await keyboardConfigService.getShortcuts();

        // Register each shortcut
        for (const shortcut of shortcuts) {
            const combo = shortcut.currentCombo || shortcut.defaultCombo;
            
            const unregister = keyboardService.register({
                id: shortcut.id,
                key: combo.key,
                metaKey: combo.metaKey,
                ctrlKey: combo.ctrlKey,
                altKey: combo.altKey,
                shiftKey: combo.shiftKey,
                handler: async (e) => {
                    if (shortcut.id === ShortcutAction.OPEN_DIALOG) {
                        setLinkDialogOpen(true);
                    } else if (shortcut.id === ShortcutAction.SAVE_LINK) {
                        // Save current link directly
                        try {
                            const url = window.location.href;
                            const title = document.title || url;
                            const result = await linkService.addLink({
                                url,
                                title,
                                tags: [],
                            });

                            if (result) {
                                toast.success("Link saved!");
                            } else {
                                toast.info("Link updated or already exists.");
                            }
                        } catch (error) {
                            console.error("Failed to save link", error);
                            toast.error("Failed to save link.");
                        }
                    }
                },
            });

            unregisterRefs.current.set(shortcut.id, unregister);
        }
    };

    useEffect(() => {
        // Initial load
        loadAndRegisterShortcuts();

        // Listen for shortcut updates
        const handleShortcutUpdate = () => {
            loadAndRegisterShortcuts();
        };

        window.addEventListener("ls-shortcut-updated", handleShortcutUpdate);
        window.addEventListener("ls-shortcuts-reset", handleShortcutUpdate);

        return () => {
            // Cleanup
            unregisterRefs.current.forEach((unregister) => unregister());
            unregisterRefs.current.clear();
            window.removeEventListener("ls-shortcut-updated", handleShortcutUpdate);
            window.removeEventListener("ls-shortcuts-reset", handleShortcutUpdate);
        };
    }, []);

    return (
        <React.StrictMode>
            <PortalContext.Provider value={portalContainer} >
                <div ref={setPortalContainer} id="link-smasher-container">
                    <LinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} />
                    <Toaster />
                </div>
            </PortalContext.Provider>
        </React.StrictMode>
    )
}


export default defineContentScript({
    matches: ["<all_urls>"],
    cssInjectionMode: "ui",

    async main(ctx) {
        console.log("Link Smasher: Content script main started");
        try {
            const ui = await createShadowRootUi(ctx, {
                name: "link-smasher",
                position: "inline",
                anchor: "body",
                isolateEvents: ["keydown", "keyup", "keypress", "wheel"],
                onMount: container => {
                    console.log("Link Smasher: UI mounting");
                    const app = document.createElement("div");
                    app.id = "link-smasher-root";
                    container.append(app);

                    const root = createRoot(app);
                    root.render(<ContentRoot />)
                    return root
                },
                onRemove: root => {
                    console.log("Link Smasher: UI unmounting");
                    root?.unmount();
                }
            })
            ui.mount()
            console.log("Link Smasher: UI mounted call finished");
        } catch (e) {
            console.error("Link Smasher: Error mounting UI", e);
        }
    }
})