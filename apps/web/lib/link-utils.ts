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
 * Formats a Prisma link record (with joined category) into the flat API response shape.
 * Eliminates the repeated inline mapping spread across route handlers.
 *
 * @param link - Prisma link record including the `category` relation
 * @returns Flat link object safe to serialize in an API response
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
 * Extracts a clean hostname from a URL string, stripping common prefixes (www., m., beta.).
 * Falls back to the provided hostname if URL parsing fails.
 *
 * @param urlStr - The full URL to extract a hostname from
 * @param fallbackHostname - Optional hostname to use if URL parsing fails
 * @returns The cleaned hostname string
 * @throws {Error} If parsing fails and no fallback is provided
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
