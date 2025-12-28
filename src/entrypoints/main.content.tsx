import { CommandMenu } from '@/components/command-pallete';
import { LinkDialog } from '@/components/link-dialog';
import '@/index.css';
import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';

import { PortalContext } from '@/context/portal.context';
import { Toaster } from "@/components/ui/sonner";
import { shortcutService } from "@/core/services/shortcut.service";
import { ShortcutAction } from "@/shared/types/shortcut.types";



const ContentRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)

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
                    // Open the link dialog instead of directly saving
                    setLinkDialogOpen(true);
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
                    {/* <CommandMenu /> */}
                    <LinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} />
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