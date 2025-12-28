import { LinkDialog } from '@/components/link-dialog';
import '@/index.css';
import { createRoot } from 'react-dom/client';
import React, { useState, useRef } from 'react';

import { PortalContext } from '@/context/portal.context';
import { Toaster } from "@/components/ui/sonner";
import { keyboardService } from "@/core/services/keyboard.service";

const ContentRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const unregisterRef = useRef<(() => void) | null>(null)

    React.useEffect(() => {
        // Register cmd+J to open link dialog
        const unregister = keyboardService.register({
            key: "j",
            metaKey: true, // cmd on Mac
            handler: () => {
                setLinkDialogOpen(true);
            },
        });

        unregisterRef.current = unregister;

        return () => {
            if (unregisterRef.current) {
                unregisterRef.current();
            }
        };
    }, []);

    return (
        <React.StrictMode>
            <PortalContext.Provider value={portalContainer} >
                <div ref={setPortalContainer} id="link-smasher-container">
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