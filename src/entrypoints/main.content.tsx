import { CommandMenu } from '@/components/command-pallete';
import '@/index.css';
import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';

import { PortalContext } from '@/context/portal.context';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { shortcutService } from "@/core/services/shortcut.service";
import { linkService } from "@/core/services/link.service";
import { ShortcutAction } from "@/shared/types/shortcut.types";



const ContentRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

    React.useEffect(() => {
        const handleKeydown = async (e: KeyboardEvent) => {
            const action = await shortcutService.getShortcutAction(e);
            if (action) {
                // Prevent default for handled shortcuts
                e.preventDefault();
                e.stopPropagation();

                if (action === ShortcutAction.TOGGLE_PALETTE) {
                    window.dispatchEvent(new CustomEvent("ls-toggle-palette"));
                } else if (action === ShortcutAction.SAVE_LINK) {
                    try {
                        const url = window.location.href;
                        const title = document.title || url;
                        const result = await linkService.addLink({
                            url,
                            title,
                            tags: []
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
            }
        };

        // Listen on document, but use capture to ensure we get it first if needed, 
        // though bubbling is usually fine.
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    }, []);

    return (
        <React.StrictMode>
            <PortalContext.Provider value={portalContainer} >
                <div ref={setPortalContainer} id="command-portal-container">
                    <CommandMenu />
                    {portalContainer && <Toaster container={portalContainer} />}
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
                name: "command-palette",
                position: "inline",
                anchor: "body",
                isolateEvents: ["keydown", "keyup", "keypress", "wheel"],
                onMount: container => {
                    console.log("Link Smasher: UI mounting");
                    const app = document.createElement("div");
                    app.id = "command-palette-root";
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