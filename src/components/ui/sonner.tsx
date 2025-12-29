import * as React from "react"
import { createPortal } from "react-dom"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { PortalContext } from "@/context/portal.context"

const resolveTheme = (): ToasterProps["theme"] => {
  if (typeof document === "undefined") {
    return "light"
  }

  const root = document.documentElement
  const isDark = root.classList.contains("dark")
  return isDark ? "dark" : "light"
}

const Toaster = (props: ToasterProps) => {
  const portalContainer = React.useContext(PortalContext)
  const theme = resolveTheme()
  const [toastContainer, setToastContainer] = React.useState<HTMLElement | null>(null)

  // Create a dedicated fixed-position container for toasts
  React.useEffect(() => {
    if (!portalContainer) return

    // Get the shadow root
    const shadowRoot = portalContainer.getRootNode() as ShadowRoot
    if (!shadowRoot) return

    // Create a fixed-position container inside the shadow root
    let container = shadowRoot.querySelector('[data-toast-container]') as HTMLElement
    if (!container) {
      container = document.createElement('div')
      container.setAttribute('data-toast-container', 'true')
      container.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
      `
      shadowRoot.appendChild(container)
    }
    setToastContainer(container)

    return () => {
      // Cleanup on unmount
      if (container && container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  }, [portalContainer])

  const content = (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )

  if (toastContainer) {
    return createPortal(content, toastContainer)
  }

  // Fallback to portal container if toast container not ready
  if (portalContainer) {
    return createPortal(content, portalContainer)
  }

  return content
}

export { Toaster }
