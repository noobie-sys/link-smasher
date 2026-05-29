import { useState, useEffect } from "react";
import { linkService } from "@/core/services/link.service";
import { getHostname } from "@/core/utils/url.util";
import { Link } from "@/shared/types/common.types";
import { getStorage } from "@/core/storage/storage.util";
import { authService } from "@/core/auth/auth.service";
import { StoredUser } from "@/shared/types/auth.types";

export function usePopup() {
  const [currentTab, setCurrentTab] = useState<{
    url: string;
    title: string;
    hostname: string;
  } | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [allLinks, setAllLinks] = useState<Link[]>([]);
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );

  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapPopup = async () => {
      setIsLoadingAuth(true);
      try {
        const tabs = chrome.tabs ? await chrome.tabs.query({ active: true, currentWindow: true }) : [];
        const tab = tabs?.[0];
        const url = tab?.url || "";
        const title = tab?.title || "New Tab";

        const isSystemPage =
          url.startsWith("chrome://") ||
          url.startsWith("chrome-extension://") ||
          url.startsWith("about:") ||
          !url;

        if (isSystemPage) {
          setCurrentTab({
            url: "",
            title: "System Page",
            hostname: "system-page",
          });
        } else {
          const hostname = getHostname(url);
          setCurrentTab({
            url,
            title,
            hostname,
          });

          await loadLinks(hostname);
        }

        await loadAllLinks();

        // Load session and user credentials directly from local storage cache.
        // This is instantaneous and avoids blocking HTTP request latency on every popup render.
        const token = await getStorage("sessionToken");
        const storedUser = await getStorage("user");

        const authOk = !!(token && storedUser);
        setIsAuthenticated(authOk);
        setUser(authOk ? storedUser : null);
      } catch (err) {
        console.error("[usePopup] Bootstrap error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    bootstrapPopup();
  }, []);

  // 2. Real-Time Storage Listener
  // Instantly synchronizes authentication and links state if updated in background script (login/logout/sync).
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local") {
        if (changes.sessionToken !== undefined || changes.user !== undefined) {
          getStorage("sessionToken").then((token) => {
            getStorage("user").then((storedUser) => {
              const authOk = !!(token && storedUser);
              setIsAuthenticated(authOk);
              setUser(authOk ? storedUser : null);
            });
          });
        }
        if (changes.links !== undefined) {
          loadAllLinks();
          if (currentTab && currentTab.hostname !== "system-page") {
            loadLinks(currentTab.hostname);
          }
        }
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
  }, [currentTab]);

  const loadLinks = async (hostname: string) => {
    try {
      const list = await linkService.getLinksByHostname(hostname);
      setLinks(list);
    } catch (err) {
      console.error("[usePopup] Load links failed:", err);
    }
  };

  const loadAllLinks = async () => {
    try {
      const list = await linkService.getAllLinks();
      setAllLinks(list);
    } catch (err) {
      console.error("[usePopup] Load local links failed:", err);
    }
  };

  const saveLink = async () => {
    if (!currentTab || currentTab.hostname === "system-page") return;
    setStatus("saving");
    try {
      const result = await linkService.addLink({
        url: currentTab.url,
        title:
          currentTab.title === "YouTube" ||
          currentTab.title.includes("youtube.com")
            ? currentTab.url
            : currentTab.title,
        tags: tag.trim() ? tag.split(",").map((t) => t.trim()) : [],
        notes: notes.trim().slice(0, 200) || undefined,
      });

      if (result) {
        setLinks((prevLinks) => {
          const index = prevLinks.findIndex((l) => l.url === result.url);
          if (index >= 0) {
            const newLinks = [...prevLinks];
            newLinks[index] = result;
            return newLinks;
          }
          return [result, ...prevLinks];
        });
        setAllLinks((prevLinks) => {
          const index = prevLinks.findIndex((l) => l.url === result.url);
          if (index >= 0) {
            const newLinks = [...prevLinks];
            newLinks[index] = result;
            return newLinks;
          }
          return [result, ...prevLinks];
        });

        setTag("");
        setNotes("");
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return {
    currentTab,
    links,
    allLinks,
    tag,
    setTag,
    notes,
    setNotes,
    saveLink,
    status,
    user,
    isAuthenticated,
    isLoadingAuth,
  };
}
