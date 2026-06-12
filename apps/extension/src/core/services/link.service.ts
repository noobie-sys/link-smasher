import { Link, LinkDTO } from "@/shared/types/common.types";
import {
  deleteLink as deleteLinkFromStorage,
  getLinks as getAllLinksFromStorage,
  saveLink as saveLinkToStorage,
  updateLinkInStorage,
} from "@/core/storage/link.storage";
import { setStorage } from "@/core/storage/storage.util";
import { generateId } from "@/core/utils/id.util";
import { getHostname } from "@/core/utils/url.util";
import { categorizeUrl } from "@/core/utils/categorize";
import { LinkDTOSchema, ImportLinksSchema } from "@/shared/validation/schemas";
import { ZodError } from "zod";

export const linkService = {
  async addLink(dto: LinkDTO): Promise<Link | null> {
    let validated: typeof dto;
    try {
      validated = LinkDTOSchema.parse(dto);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(", ");
        throw new Error(messages);
      }
      throw error;
    }

    const links = await getAllLinksFromStorage();

    // Check for duplicates (Upsert logic)
    const existingIndex = links.findIndex((l) => l.url === validated.url);

    if (existingIndex >= 0) {
      const existingLink = links[existingIndex];
      const updatedLink: Link = {
        ...existingLink,
        title: validated.title || existingLink.title,
        // Merge tags, unique only
        tags: Array.from(
          new Set([...(existingLink.tags || []), ...(validated.tags || [])]),
        ),
        // Update notes if provided
        notes: validated.notes !== undefined ? validated.notes : existingLink.notes,
        // Update category if provided, or retain existing, or auto-categorize
        category: validated.category || existingLink.category || categorizeUrl(validated.url, validated.title || existingLink.title),
      };

      await updateLinkInStorage(existingLink.id, updatedLink);
      console.log("Updated existing link:", updatedLink);
      return updatedLink;
    }

    const now = Date.now();
    const newLink: Link = {
      ...validated,
      category: validated.category || categorizeUrl(validated.url, validated.title),
      id: generateId(),
      hostname: getHostname(validated.url),
      createdAt: now,
      updatedAt: now,
    };

    // Pass the already-loaded links array to saveLink so it doesn't read storage again.
    // Before: addLink reads storage (read #1) → saveLink reads storage again (read #2)
    // After:  addLink reads storage (read #1) → passes it to saveLink → no read #2 ✅
    await saveLinkToStorage(newLink, links);
    chrome.runtime.sendMessage({ type: "TRACK_SAVE", hostname: newLink.hostname });
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
    try {
      const validated = LinkDTOSchema.partial().parse(updates);
      const updated = await updateLinkInStorage(id, validated);
      if (updated) {
        console.log("Updated link:", updated);
      }
      return updated;
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(", ");
        throw new Error(messages);
      }
      throw error;
    }
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

      // Validate every imported link strictly using ImportLinksSchema
      const validatedLinks = ImportLinksSchema.parse(imported);

      if (validatedLinks.length === 0) {
        return 0;
      }

      const currentLinks = await getAllLinksFromStorage();
      // Merge: imported links take precedence or just add?
      // Requirement said "prevent duplicate URLs".
      // We'll filter out imported links that already exist in current storage
      const existingUrls = new Set(currentLinks.map((l) => l.url));
      const newLinks = validatedLinks.filter((l) => !existingUrls.has(l.url));

      if (newLinks.length > 0) {
        // Import skips Supabase for now; links are local-only until edited/synced.
        await setStorage("links", [...newLinks, ...currentLinks]);
      }

      return newLinks.length;
    } catch (e) {
      console.error("Import failed", e);
      if (e instanceof ZodError) {
        const firstError = e.issues[0];
        const pathStr = firstError.path.join(".");
        throw new Error(
          `Invalid link data: ${pathStr ? `field '${pathStr}' ` : ""}${firstError.message}`
        );
      }
      throw new Error(e instanceof Error ? e.message : "Failed to parse or validate JSON");
    }
  },
};
