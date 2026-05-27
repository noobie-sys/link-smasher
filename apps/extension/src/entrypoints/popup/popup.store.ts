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
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );

  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      setIsLoadingAuth(true);
      try {
        // Fetch/bootstrap cookie token
        const token = await authService.fetchSessionToken();
        const storedUser = await getStorage("user");

        const authOk = !!(token && storedUser);
        setIsAuthenticated(authOk);
        setUser(storedUser);

        if (authOk) {
          // Get Active Tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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

            // Load links for this hostname
            await loadLinks(hostname);
          }
        }
      } catch (err) {
        console.error("[usePopup] Auth bootstrap error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuthAndLoad();
  }, []);

  const loadLinks = async (hostname: string) => {
    try {
      const list = await linkService.getLinksByHostname(hostname);
      setLinks(list);
    } catch (err) {
      console.error("[usePopup] Load links failed:", err);
    }
  };

  const saveLink = async () => {
    if (!currentTab || !isAuthenticated) return;
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

      console.log("RESULTS: ", result);

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
