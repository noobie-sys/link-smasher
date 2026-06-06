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
 * Produce a normalized hostname from a URL by lowercasing it and removing common prefixes (`www.`, `m.`, `beta.`).
 *
 * If the input cannot be parsed as a URL, the provided `fallbackHostname` is normalized and returned; if no fallback is given an error is thrown.
 *
 * @param urlStr - The full URL to extract a hostname from
 * @param fallbackHostname - Optional hostname to use if `urlStr` cannot be parsed
 * @returns The cleaned hostname string
 * @throws Error If `urlStr` cannot be parsed and `fallbackHostname` is not provided
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
