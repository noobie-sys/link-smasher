import * as React from "react";
import { createPortal } from "react-dom";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { PortalContext } from "@/context/portal.context";

const resolveTheme = (): ToasterProps["theme"] => {
  if (typeof document === "undefined") {
    return "light";
  }

  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  return isDark ? "dark" : "light";
};

const Toaster = (props: ToasterProps) => {
  const portalContainer = React.useContext(PortalContext);
  const theme = resolveTheme();
  const [toastContainer, setToastContainer] =
    React.useState<HTMLElement | null>(null);

  // Create a dedicated fixed-position container for toasts and inject styles
  React.useEffect(() => {
    if (!portalContainer) return;

    // Get the shadow root
    const shadowRoot = portalContainer.getRootNode() as ShadowRoot;
    if (!shadowRoot) return;

    // Inject toast styles into shadow root
    let styleElement = shadowRoot.querySelector(
      "[data-toast-styles]"
    ) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.setAttribute("data-toast-styles", "true");
      const newLocal = styleElement.textContent = `
      
      /* Toast container */
      [data-sonner-toaster] {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 50;
        pointer-events: auto;
      }

      /* Base toast */
      [data-sonner-toast] {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        min-width: 320px;
        max-width: 420px;

        box-shadow:
          0 10px 15px -3px rgb(0 0 0 / 0.1),
          0 4px 6px -2px rgb(0 0 0 / 0.05);

        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont !important;
        font-size: 0.875rem !important;
        line-height: 1.25rem;
      }

      /* Ensure all toast content has consistent font size */
      [data-sonner-toast] * {
        font-size: 0.875rem !important;
      }

      /* Toast title/text content */
      [data-sonner-toast] [data-title],
      [data-sonner-toast] [data-description] {
        font-size: 0.875rem !important;
        line-height: 1.25rem !important;
      }
  `;  
      shadowRoot.appendChild(styleElement);
    }

    // Create a fixed-position container inside the shadow root
    let container = shadowRoot.querySelector(
      "[data-toast-container]"
    ) as HTMLElement;
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("data-toast-container", "true");
      container.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
      `;
      shadowRoot.appendChild(container);
    }
    setToastContainer(container);

    return () => {
      // Cleanup on unmount
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [portalContainer]);

  const content = (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      offset="16px"
      duration={0.1}
      gap={12}
      richColors
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: theme === "dark" ? "#1a1a1a" : "#c8b6ff",
          color: theme === "dark" ? "#ffffff" : "#001233",
          border: `1px solid ${theme === "dark" ? "#404040" : "#c8b6ff"}`,
          borderRadius: "12px",
          boxShadow:
            "0 10px 38px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
          padding: "16px",
          minWidth: "300px",
          maxWidth: "400px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          marginBottom: "4px",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        },
        classNames: {
          toast: "toast-styled",
          success: "toast-success",
          error: "toast-error",
          info: "toast-info",
          warning: "toast-warning",
        },
      }}
      {...props}
    />
  );

  if (toastContainer) {
    return createPortal(content, toastContainer);
  }

  // Fallback to portal container if toast container not ready
  if (portalContainer) {
    return createPortal(content, portalContainer);
  }

  return content;
};

export { Toaster };
