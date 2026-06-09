import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Loader2, EyeOff } from "lucide-react";
import { linkService } from "@/core/services/link.service";
import { useSavedLinksStore } from "@/core/store/saved-links.store";
import { STORAGE_KEYS } from "@/shared/constants/storage.keys";
import { Link } from "@/shared/types/common.types";
import { cn } from "@/lib/utils";

interface FloatingBookmarkProps {
  onOpenEdit: (link: Link) => void;
}

/**
 * Renders a floating bookmark button in the top-right of the page that can save the current page or open an edit flow for an already-saved page.
 *
 * The component automatically hides itself for hostnames present in a persisted blacklist, adapts its visual theme based on sampled background brightness near the top-right of the page, and exposes a callback for opening the edit flow when the current URL is already saved.
 *
 * @param onOpenEdit - Callback invoked with the saved `Link` when the user requests editing for an already-saved page
 * @returns A JSX element containing the floating bookmark UI, or `null` when the current hostname is blacklisted
 */
export function FloatingBookmark({ onOpenEdit }: FloatingBookmarkProps) {
  const { isUrlSaved, addUrl } = useSavedLinksStore();
  const [isBlacklisted, setIsBlacklisted] = useState<boolean>(true); // start true till loaded
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [theme, setTheme] = useState({
    bg: "bg-[#0b1020]/90 border-[#273044]",
    text: "text-slate-200 hover:text-white",
    hoverBg: "hover:bg-[#151b2e]",
    subBg: "bg-[#0f172a]/95 border-[#273044]",
  });

  const currentUrl = window.location.href;
  const currentHostname = window.location.hostname;

  // 1. Detect if blacklisted, and load config
  useEffect(() => {
    const checkBlacklist = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
        const list = (result[STORAGE_KEYS.BLACKLIST] as string[]) || [];
        setIsBlacklisted(list.includes(currentHostname));
      } catch (err) {
        console.error("[FloatingBookmark] Failed to read blacklist:", err);
        setIsBlacklisted(false);
      }
    };

    checkBlacklist();

    // Listen to changes in blacklist (cross-context)
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes[STORAGE_KEYS.BLACKLIST]) {
        const list = (changes[STORAGE_KEYS.BLACKLIST].newValue as string[]) || [];
        setIsBlacklisted(list.includes(currentHostname));
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, [currentHostname]);

  // 2. Adaptive theme styling based on background brightness at top-right
  useEffect(() => {
    const detectTheme = () => {
      try {
        // Sample element near top right of page
        const el = document.elementFromPoint(window.innerWidth - 80, 40);
        if (!el) return;

        let currentElement: Element | null = el;
        let bgColor = "rgba(0, 0, 0, 0)";

        while (currentElement && currentElement !== document.documentElement) {
          const bg = window.getComputedStyle(currentElement).backgroundColor;
          if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
            bgColor = bg;
            break;
          }
          currentElement = currentElement.parentElement;
        }

        const match = bgColor.match(/\d+/g);
        if (match && match.length >= 3) {
          const [r, g, b] = match.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          if (brightness > 200) {
            // Very light background: render a darker floating button for visibility
            setTheme({
              bg: "bg-[#0b1020]/95 border-[#1e293b] shadow-xl",
              text: "text-slate-200 hover:text-white",
              hoverBg: "hover:bg-slate-800",
              subBg: "bg-[#0f172a]/95 border-[#1e293b]",
            });
          } else {
            // Dark background: render standard high-premium glassmorphism
            setTheme({
              bg: "bg-slate-900/80 backdrop-blur-md border-slate-700/60 shadow-lg",
              text: "text-slate-300 hover:text-white",
              hoverBg: "hover:bg-slate-800/80",
              subBg: "bg-slate-950/80 backdrop-blur-md border-slate-800/80",
            });
          }
        }
      } catch (e) {
        // fallback remains default dark premium theme
      }
    };

    setTimeout(detectTheme, 1000);
  }, []);

  if (isBlacklisted) return null;

  const isSaved = isUrlSaved(currentUrl);

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;

    if (isSaved) {
      // Find the link to edit
      try {
        const links = await linkService.getAllLinks();
        const existing = links.find((l) => l.url === currentUrl);
        if (existing) {
          onOpenEdit(existing);
        } else {
          toast.error("Could not find saved link details.");
        }
      } catch (err) {
        console.error("Failed to load link details for editing:", err);
        toast.error("Failed to load link details.");
      }
      return;
    }

    // Save current link
    try {
      setIsSaving(true);
      const title = document.title || currentUrl;
      const result = await linkService.addLink({
        url: currentUrl,
        title,
        tags: [],
      });

      if (result) {
        addUrl(currentUrl);
        toast.success("Saved page to vault!");
      }
    } catch (err) {
      console.error("[FloatingBookmark] Failed to save link:", err);
      toast.error("Failed to save link.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlacklist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST);
      const list = (result[STORAGE_KEYS.BLACKLIST] as string[]) || [];
      const updatedList = [...list, currentHostname];
      await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: updatedList });

      // Visual feedback toast with UNDO action!
      toast.info(`Bookmark icon hidden on ${currentHostname}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const freshList = ((await chrome.storage.local.get(STORAGE_KEYS.BLACKLIST))[STORAGE_KEYS.BLACKLIST] as string[]) || [];
            const restoredList = freshList.filter((item: string) => item !== currentHostname);
            await chrome.storage.local.set({ [STORAGE_KEYS.BLACKLIST]: restoredList });
            toast.success(`Restored bookmark icon on ${currentHostname}`);
          },
        },
      });
    } catch (err) {
      console.error("[FloatingBookmark] Failed to blacklist site:", err);
      toast.error("Failed to hide on this site.");
    }
  };

  return (
    <div
      className="fixed top-6 right-6 flex items-center gap-1.5 pointer-events-auto z-[2147483646]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hide on this site button (Slides out on hover) */}
      <div
        className={cn(
          "flex items-center transition-all duration-300 origin-right scale-0 opacity-0 w-0",
          isHovered && "scale-100 opacity-100 w-auto"
        )}
      >
        <button
          onClick={handleBlacklist}
          title="Hide on this site"
          aria-label="Hide link crust bookmark icon on this site"
          className={cn(
            "p-2 rounded-full border shadow-md flex items-center justify-center cursor-pointer transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-500",
            theme.subBg,
            theme.text,
            theme.hoverBg
          )}
        >
          <EyeOff size={14} />
        </button>
      </div>

      {/* Main Bookmark Action Button */}
      <button
        onClick={handleAction}
        disabled={isSaving}
        title={isSaved ? "Edit bookmark" : "Bookmark this page"}
        aria-label={isSaved ? "Edit bookmark for this page" : "Bookmark this page"}
        aria-pressed={isSaved}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleAction(e as any);
          }
        }}
        className={cn(
          "w-10 h-10 rounded-full border shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 outline-none focus:ring-2 focus:ring-indigo-500",
          theme.bg,
          isSaving ? "opacity-60 cursor-not-allowed" : (isHovered ? "opacity-100" : "opacity-30 focus:opacity-100")
        )}
      >
        {isSaving ? (
          <Loader2 size={16} className="animate-spin text-indigo-400" />
        ) : isSaved ? (
          <BookmarkCheck size={18} className="text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
        ) : (
          <Bookmark size={18} className={cn("transition-colors", isHovered ? "text-indigo-400" : "text-slate-300")} />
        )}
      </button>
    </div>
  );
}
