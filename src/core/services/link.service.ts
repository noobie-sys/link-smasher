import { Link, LinkDTO } from "@/shared/types/common.types";
import {
  deleteLink as deleteLinkFromStorage,
  getLinks as getAllLinksFromStorage,
  saveLink as saveLinkToStorage,
  updateLinkInStorage,
} from "@/core/storage/link.storage";
import { setStorage } from "@/core/storage/storage.util";
import { generateId } from "@/core/utils/id.util";
import { getHostname, isValidUrl } from "@/core/utils/url.util";
import { categorizeUrl } from "@/core/utils/categorize";

export const linkService = {
  async addLink(dto: LinkDTO): Promise<Link | null> {
    if (!isValidUrl(dto.url)) {
      throw new Error("Invalid URL");
    }

    const links = await getAllLinksFromStorage();

    // Check for duplicates (Upsert logic)
    const existingIndex = links.findIndex((l) => l.url === dto.url);

    if (existingIndex >= 0) {
      const existingLink = links[existingIndex];
      const updatedLink: Link = {
        ...existingLink,
        title: dto.title || existingLink.title,
        // Merge tags, unique only
        tags: Array.from(
          new Set([...(existingLink.tags || []), ...(dto.tags || [])]),
        ),
        // Update notes if provided
        notes: dto.notes !== undefined ? dto.notes : existingLink.notes,
        // Update category if provided, or retain existing, or auto-categorize
        category: dto.category || existingLink.category || categorizeUrl(dto.url, dto.title || existingLink.title),
      };

      await updateLinkInStorage(existingLink.id, updatedLink);
      console.log("Updated existing link:", updatedLink);
      return updatedLink;
    }

    const newLink: Link = {
      ...dto,
      category: dto.category || categorizeUrl(dto.url, dto.title),
      id: generateId(),
      hostname: getHostname(dto.url),
      createdAt: Date.now(),
    };

    console.log(newLink, "NewLinks");

    await saveLinkToStorage(newLink);
    return newLink;
  },

  async getLinksByHostname(hostname: string): Promise<Link[]> {
    const links = await getAllLinksFromStorage();
    return links.filter((l) => l.hostname === hostname);
  },

  async getAllLinks(): Promise<Link[]> {
    return await getAllLinksFromStorage();
  },

  /**
   * Updates an existing link.
   * Replaces tags and notes with the new values provided.
   */
  async updateLink(id: string, updates: Partial<Link>): Promise<Link | null> {
    const updated = await updateLinkInStorage(id, updates);
    if (updated) {
      console.log("Updated link:", updated);
    }
    return updated;
  },

  async deleteLink(id: string): Promise<void> {
    await deleteLinkFromStorage(id);
  },

  async exportLinks(): Promise<string> {
    const links = await getAllLinksFromStorage();
    return JSON.stringify(links, null, 2);
  },

  async importLinks(jsonContent: string): Promise<number> {
    try {
      const imported = JSON.parse(jsonContent);
      if (!Array.isArray(imported)) {
        throw new Error("Invalid format: not an array");
      }

      // Basic validation
      const validLinks = imported.filter(
        (item: any) =>
          item.id &&
          item.url &&
          item.hostname &&
          typeof item.createdAt === "number",
      ) as Link[];

      if (validLinks.length === 0) {
        return 0;
      }

      const currentLinks = await getAllLinksFromStorage();
      // Merge: imported links take precedence or just add?
      // Requirement said "prevent duplicate URLs".
      // We'll filter out imported links that already exist in current storage
      const existingUrls = new Set(currentLinks.map((l) => l.url));
      const newLinks = validLinks.filter((l) => !existingUrls.has(l.url));

      if (newLinks.length > 0) {
        // Import skips Supabase for now; links are local-only until edited/synced.
        await setStorage("links", [...newLinks, ...currentLinks]);
      }

      return newLinks.length;
    } catch (e) {
      console.error("Import failed", e);
      throw new Error("Failed to parse or validate JSON");
    }
  },
};
