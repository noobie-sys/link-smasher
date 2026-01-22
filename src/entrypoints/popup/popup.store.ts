import { useState, useEffect } from "react";
import { linkService } from "@/core/services/link.service";
import { getHostname } from "@/core/utils/url.util";
import { Link } from "@/shared/types/common.types";

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

  useEffect(() => {
    // 1. Get Active Tab
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url && tab?.title) {
        const hostname = getHostname(tab.url);
        setCurrentTab({
          url: tab.url,
          title: tab.title,
          hostname,
        });

        // 2. Load links for this hostname
        loadLinks(hostname);
      }
    });
  }, []);

  const loadLinks = async (hostname: string) => {
    const list = await linkService.getLinksByHostname(hostname);
    setLinks(list);
  };

  const saveLink = async () => {
    if (!currentTab) return;
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
        // Optimistic / Immediate update to avoid storage race conditions
        setLinks((prevLinks) => {
          const index = prevLinks.findIndex((l) => l.url === result.url);
          if (index >= 0) {
            const newLinks = [...prevLinks];
            newLinks[index] = result;
            return newLinks;
          }
          return [result, ...prevLinks];
        });

        // Also refresh from storage to be sure
        await loadLinks(currentTab.hostname);

        setTag("");
        setNotes("");
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error"); // Duplicate or invalid
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
  };
}
