import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SocialFeedSaver } from '@/features/social-feed-saver';
import { Toaster } from "@/components/ui/sonners";
import { PortalContext } from '@/context/portal.context';
import '@/index.css';

const SocialFeedRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    return (
        <PortalContext.Provider value={portalContainer}>
            <div ref={setPortalContainer} id="social-feed-saver-container">
                <SocialFeedSaver />
                <Toaster />
            </div>
        </PortalContext.Provider>
    );
};

export default defineContentScript({
    matches: [
        "*://*.linkedin.com/*",
        "*://*.instagram.com/*",
        "*://*.x.com/*",
        "*://*.twitter.com/*",
        "*://*.facebook.com/*",
        "*://*.reddit.com/*",
        "*://*.threads.net/*"
    ],
    cssInjectionMode: "ui",

    async main(ctx) {
        try {
            const ui = await createShadowRootUi(ctx, {
                name: "social-feed-saver",
                position: "inline",
                anchor: "body",
                isolateEvents: ["keydown", "keyup", "keypress", "wheel"],
                onMount: container => {
                    const app = document.createElement("div");
                    app.id = "social-feed-saver-root";
                    container.append(app);

                    const root = createRoot(app);
                    root.render(
                        <React.StrictMode>
                            <SocialFeedRoot />
                        </React.StrictMode>
                    );
                    return root;
                },
                onRemove: root => {
                    console.log("Social Feed Saver: UI unmounting");
                    root?.unmount();
                }
            });
            ui.mount();
        } catch (e) {
            console.error("Social Feed Saver: Error mounting UI", e);
        }
    }
});

