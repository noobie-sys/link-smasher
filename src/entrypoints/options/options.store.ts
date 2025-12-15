import { useState, useEffect } from "react";
import { linkService } from "@/core/services/link.service";
import { Link } from "@/shared/types/common.types";

export function useOptions() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    const all = await linkService.getAllLinks();
    setLinks(all);
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const deleteLink = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await linkService.deleteLink(id);
      await refresh();
    }
  };

  const exportData = async () => {
    const json = await linkService.exportLinks();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `link-smasher-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const text = await file.text();
    try {
      const count = await linkService.importLinks(text);
      alert(`Successfully imported ${count} links.`);
      await refresh();
    } catch (e) {
      alert("Failed to import links. Check file format.");
      console.error(e);
    }
  };

  return {
    links,
    isLoading,
    deleteLink,
    exportData,
    importData,
  };
}
