import { CommandMenu } from '@/components/command-pallete';
import '@/index.css';
import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';

import { PortalContext } from '@/context/portal.context';



const ContentRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

    return (
        <React.StrictMode>
            <PortalContext.Provider value={portalContainer} >
                <div ref={setPortalContainer} id="command-portal-container">
                    <CommandMenu />
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