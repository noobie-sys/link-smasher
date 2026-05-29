import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import {
  UnauthorizedError,
  ConflictError,
  ValidationError,
} from "@/lib/errors";

/**
 * DEFAULT_CATEGORIES — the 8 built-in system categories.
 */
export const DEFAULT_CATEGORIES = [
  "Development",
  "Social Media",
  "Productivity",
  "Entertainment",
  "News",
  "Education",
  "Shopping",
  "General",
] as const;

/**
 * Payload validation schema for creating a new Link.
 */
const createLinkSchema = z.object({
  id: z.string().uuid("Invalid ID format").optional(),
  url: z.string().url("Invalid URL format"),
  title: z.string().min(1, "Title is required").max(500),
  hostname: z.string().min(1, "Hostname is required").optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  category: z.string().default("General"),
});

/**
 * Regex unicode property escape to robustly identify standard emojis,
 * colored symbols, and pictographs.
 */
const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

/**
 * Server-side hostname extractor. Extracts clean domain name without standard prefixes.
 */
function cleanHostname(urlStr: string, providedHostname?: string): string {
  try {
    const url = new URL(urlStr);
    let hostname = url.hostname.toLowerCase();

    // Trim standard prefixes (www., m., beta.) to ensure neat lookup namespace.
    hostname = hostname.replace(/^(www\.|m\.|beta\.)/, "");
    return hostname;
  } catch {
    if (providedHostname) {
      return providedHostname.toLowerCase().replace(/^(www\.|m\.|beta\.)/, "");
    }
    throw new ValidationError(
      "Invalid URL format. Hostname extraction failed.",
    );
  }
}

/**
 * GET /api/links
 * Retrieves links saved by the authenticated user with search and hostname filters.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  // 1. Authenticate user session
  const session = await getAuthSession(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  // 2. Extract query parameters
  const queryHostname = request.nextUrl.searchParams.get("hostname");
  const searchQuery = request.nextUrl.searchParams.get("search");

  // Build filter object
  const whereClause: any = {
    userId: session.user.id,
  };

  if (queryHostname) {
    // Dynamic matching also cleans prefix comparison
    const cleanedQueryHost = queryHostname
      .toLowerCase()
      .replace(/^(www\.|m\.|beta\.)/, "");
    whereClause.hostname = cleanedQueryHost;
  }

  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { url: { contains: searchQuery, mode: "insensitive" } },
      { notes: { contains: searchQuery, mode: "insensitive" } },
      { tags: { has: searchQuery } },
    ];
  }

  // 3. Query DB
  const links = await prisma.link.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 4. Transform dynamic relations to flat string mapping required by specification
  const data = links.map((link: any) => ({
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
  }));

  // Simply return the plain JS object. The wrapper serializes it and converts BigInts automatically.
  return {
    success: true,
    data,
  };
});

/**
 * POST /api/links
 * Saves a webpage link to the vault.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  // 1. Authenticate user session
  const session = await getAuthSession(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  // 2. Parse and validate input payload
  const body = await request.json();
  const parsedData = createLinkSchema.parse(body);

  // 3. Deduplicate check: Ensure user hasn't already saved this URL
  const existingLink = await prisma.link.findFirst({
    where: {
      userId: session.user.id,
      url: parsedData.url,
    },
  });

  if (existingLink) {
    throw new ConflictError("This link is already saved in your vault.");
  }

  // 4. Clean category name and validate it contains no emojis
  const categoryName = parsedData.category.trim();
  if (emojiRegex.test(categoryName)) {
    throw new ValidationError("Category name must not contain emojis.");
  }

  // 5. Dynamic lookup-or-create on Relational Category model
  let category = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId: session.user.id,
        name: categoryName,
      },
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name: categoryName,
        color: "#6366F1", // Default theme Indigo color
      },
    });
  }

  // 6. Clean domain hostname dynamically
  const cleanedHost = cleanHostname(parsedData.url, parsedData.hostname);
  const now = BigInt(Date.now());

  // 7. DB Insertion
  const newLink = await prisma.link.create({
    data: {
      id: parsedData.id || crypto.randomUUID(),
      userId: session.user.id,
      url: parsedData.url,
      title: parsedData.title,
      hostname: cleanedHost,
      tags: parsedData.tags,
      notes: parsedData.notes,
      categoryId: category.id,
      createdAt: now,
      updatedAt: now,
    },
    include: {
      category: true,
    },
  });

  // 8. Format response to match flat structure specification
  const data = {
    id: newLink.id,
    userId: newLink.userId,
    url: newLink.url,
    title: newLink.title,
    hostname: newLink.hostname,
    tags: newLink.tags,
    notes: newLink.notes,
    category: newLink.category?.name ?? "General",
    createdAt: newLink.createdAt,
    updatedAt: newLink.updatedAt,
  };

  // Return formatted status and body plain object to the wrapper
  return {
    status: 201,
    body: {
      success: true,
      data,
    },
  };
});

/**
 * OPTIONS /api/links
 * Auto-delegates preflight OPTIONS requests to dynamic CORS handler.
 * Managed directly by Next.js edge router routing to the wrapper.
 */
export const OPTIONS = withApiHandler(async () => {
  return { success: true };
});
