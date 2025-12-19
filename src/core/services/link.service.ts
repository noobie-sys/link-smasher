import { Link, LinkDTO } from "@/shared/types/common.types";
import { linkStorage } from "@/core/storage/link.storage";
import { generateId } from "@/core/utils/id.util";
import { getHostname, isValidUrl } from "@/core/utils/url.util";

export const linkService = {
  async addLink(dto: LinkDTO): Promise<Link | null> {
    if (!isValidUrl(dto.url)) {
      throw new Error("Invalid URL");
    }

    console.log("Saving link:", dto);

    const links = await linkStorage.get();

    // Check for duplicates
    // Check for duplicates (Upsert logic)
    const existingIndex = links.findIndex((l) => l.url === dto.url);

    if (existingIndex >= 0) {
      const existingLink = links[existingIndex];
      const updatedLink: Link = {
        ...existingLink,
        title: dto.title || existingLink.title,
        // Merge tags, unique only
        tags: Array.from(
          new Set([...(existingLink.tags || []), ...(dto.tags || [])])
        ),
      };

      const newLinks = [...links];
      newLinks[existingIndex] = updatedLink;

      await linkStorage.set(newLinks);
      console.log("Updated existing link:", updatedLink);
      return updatedLink;
    }

    const newLink: Link = {
      ...dto,
      id: generateId(),
      hostname: getHostname(dto.url),
      createdAt: Date.now(),
    };

    console.log(newLink, "NewLinks");

    // Add to beginning of list (newest first)
    await linkStorage.set([newLink, ...links]);
    return newLink;
  },

  async getLinksByHostname(hostname: string): Promise<Link[]> {
    const links = await linkStorage.get();
    return links.filter((l) => l.hostname === hostname);
  },

  async getAllLinks(): Promise<Link[]> {
    return await linkStorage.get();
  },

  async deleteLink(id: string): Promise<void> {
    const links = await linkStorage.get();
    const filtered = links.filter((l) => l.id !== id);
    await linkStorage.set(filtered);
  },

  async exportLinks(): Promise<string> {
    const links = await linkStorage.get();
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
          typeof item.createdAt === "number"
      ) as Link[];

      if (validLinks.length === 0) {
        return 0;
      }

      const currentLinks = await linkStorage.get();
      // Merge: imported links take precedence or just add?
      // Requirement said "prevent duplicate URLs".
      // We'll filter out imported links that already exist in current storage
      const existingUrls = new Set(currentLinks.map((l) => l.url));
      const newLinks = validLinks.filter((l) => !existingUrls.has(l.url));

      if (newLinks.length > 0) {
        await linkStorage.set([...newLinks, ...currentLinks]);
      }

      return newLinks.length;
    } catch (e) {
      console.error("Import failed", e);
      throw new Error("Failed to parse or validate JSON");
    }
  },
};
