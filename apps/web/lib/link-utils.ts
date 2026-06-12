/**
 * Matches standard emojis, colored symbols, and pictographs.
 * Single source of truth — do not redeclare in individual route files.
 */
export const EMOJI_REGEX = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

/**
 * The shape of a Link as returned in all API responses.
 * Keeps the relational `category` join flattened to a plain string.
 */
export interface LinkResponse {
  id: string;
  userId: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes: string | null | undefined;
  category: string;
  createdAt: bigint | number;
  updatedAt: bigint | number | null;
}

/**
 * Prisma shape returned by link queries that include the category relation.
 */
export interface LinkWithCategory {
  id: string;
  userId: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes: string | null;
  createdAt: bigint;
  updatedAt: bigint | null;
  category: { name: string } | null;
}

/**
 * Formats a Prisma link record that includes the joined category into the flat API response shape.
 *
 * @param link - Prisma link record including the `category` relation
 * @returns A `LinkResponse` with `category` flattened to the category `name` (defaults to `"General"` when `category` is null)
 */
export function formatLinkResponse(link: LinkWithCategory): LinkResponse {
  return {
    id: link.id,
    userId: link.userId,
    url: link.url,
    title: link.title,
    hostname: link.hostname,
    tags: link.tags,
    notes: link.notes,
    category: link.category?.name ?? "General",
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}



/**
 * Convert a comma-separated tag string into a cleaned array of tags.
 *
 * Trims whitespace around each tag and omits empty entries produced by extra commas or whitespace.
 *
 * @param input - Comma-separated tags (e.g., "tag1, tag2,tag3")
 * @returns An array of trimmed, non-empty tag strings in their original order
 */
export function parseTagsInput(input: string): string[] {
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Extracts a normalized hostname from a URL string, lowercasing it and removing common host prefixes.
 *
 * If `urlStr` can be parsed as a URL, returns its hostname lowercased with a leading `www.`, `m.`, or `beta.` removed.
 *
 * @param urlStr - The input URL string to extract the hostname from.
 * @param fallbackHostname - Hostname to use (and normalize) if `urlStr` cannot be parsed.
 * @returns The normalized hostname (lowercased, without leading `www.`, `m.`, or `beta.`).
 * @throws Error if `urlStr` is not a valid URL and no `fallbackHostname` is provided.
 */
export function extractCleanHostname(urlStr: string, fallbackHostname?: string): string {
  const PREFIX_PATTERN = /^(www\.|m\.|beta\.)/;
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.toLowerCase().replace(PREFIX_PATTERN, "");
  } catch {
    if (fallbackHostname) {
      return fallbackHostname.toLowerCase().replace(PREFIX_PATTERN, "");
    }
    throw new Error("Invalid URL format. Hostname extraction failed.");
  }
}
