import ReactDOM from "react-dom/client";
import "@/index.css";
import { CommandPalette } from "@/components/CommandPalette";
import React from "react";

export const PortalContext = React.createContext<HTMLElement | null>(null);

const ContentRoot = () => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null,
    );

    return (
        <React.StrictMode>
            <PortalContext.Provider value={portalContainer}>
                <div ref={setPortalContainer} id="command-portal-container">
                    <CommandPalette />
                </div>
            </PortalContext.Provider>
        </React.StrictMode>
    );
};

export default defineContentScript({
    matches: ["https://www.google.com/"],
    cssInjectionMode: "ui",

    async main(ctx) {
        const ui = await createShadowRootUi(ctx, {
            name: "command-palette",
            position: "inline",
            anchor: "body",
            onMount: (container) => {
                const app = document.createElement("div");
                app.id = "command-palette-root";
                container.append(app);

                const root = ReactDOM.createRoot(app);
                root.render(<ContentRoot />);
                return root;
            },
            onRemove: (root) => {
                root?.unmount();
            },
        });

        ui.mount();
    },
});





