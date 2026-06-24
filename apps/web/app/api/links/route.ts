import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError, ConflictError, ValidationError } from "@/lib/errors";
import { sseBroker } from "@/lib/sse-broker";
import {
  EMOJI_REGEX,
  formatLinkResponse,
  extractCleanHostname,
} from "@/lib/link-utils";
import { findOrCreateCategory } from "@/lib/link-utils.server";

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
  title: z.string().min(1, "Title is required").max(200),
  hostname: z.string().min(1, "Hostname is required").optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  category: z.string().default("General"),
});

/** URL prefix pattern stripped when normalising hostnames. */
const URL_PREFIX_PATTERN = /^(www\.|m\.|beta\.)/;

/**
 * GET /api/links
 * Retrieves links saved by the authenticated user with optional search, hostname, category, and pagination filters.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  const queryHostname = request.nextUrl.searchParams.get("hostname");
  const searchQuery = request.nextUrl.searchParams.get("search");
  const queryCategory = request.nextUrl.searchParams.get("category");
  const pageParam = request.nextUrl.searchParams.get("page");
  const limitParam = request.nextUrl.searchParams.get("limit");

  const isPaginated = pageParam !== null || limitParam !== null;

  // Build a typed Prisma `where` clause — use spread to avoid mutation.
  const hostnameFilter: Prisma.LinkWhereInput = queryHostname
    ? { hostname: queryHostname.toLowerCase().replace(URL_PREFIX_PATTERN, "") }
    : {};

  const searchFilter: Prisma.LinkWhereInput = searchQuery
    ? {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { url: { contains: searchQuery, mode: "insensitive" } },
          { notes: { contains: searchQuery, mode: "insensitive" } },
          { tags: { has: searchQuery } },
        ],
      }
    : {};

  const categoryFilter: Prisma.LinkWhereInput = queryCategory
    ? {
        category: {
          name: {
            equals: queryCategory,
            mode: "insensitive",
          },
        },
      }
    : {};

  const whereClause: Prisma.LinkWhereInput = {
    userId: session.user.id,
    ...hostnameFilter,
    ...searchFilter,
    ...categoryFilter,
  };

  let links;
  let totalCount = 0;
  let totalPages = 0;
  let page = 1;
  let limit = 10;

  if (isPaginated) {
    page = parseInt(pageParam || "1", 10);
    limit = parseInt(limitParam || "10", 10);

    // Validate inputs
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100; // max limit for safety

    const skip = (page - 1) * limit;

    const [fetchedLinks, count] = await Promise.all([
      prisma.link.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          url: true,
          title: true,
          hostname: true,
          tags: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { name: true } },
        },
      }),
      prisma.link.count({ where: whereClause }),
    ]);

    links = fetchedLinks;
    totalCount = count;
    totalPages = Math.ceil(totalCount / limit);
  } else {
    links = await prisma.link.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        url: true,
        title: true,
        hostname: true,
        tags: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { name: true } },
      },
    });
  }

  const formattedLinks = links.map(formatLinkResponse);

  return {
    success: true,
    data: formattedLinks,
    ...(isPaginated ? {
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasMore: page < totalPages,
      }
    } : {}),
  };
});

/**
 * POST /api/links
 * Saves a webpage link to the vault.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  const body = await request.json() as unknown;
  const parsedData = createLinkSchema.parse(body);

  // Deduplicate: reject if user already saved this exact URL.
  const existingLink = await prisma.link.findFirst({
    where: { userId: session.user.id, url: parsedData.url },
    select: { id: true },
  });
  if (existingLink) {
    throw new ConflictError("This link is already saved in your vault.");
  }

  const categoryName = parsedData.category.trim();
  if (EMOJI_REGEX.test(categoryName)) {
    throw new ValidationError("Category name must not contain emojis.");
  }

  const category = await findOrCreateCategory(session.user.id, categoryName);
  const cleanedHostname = extractCleanHostname(parsedData.url, parsedData.hostname);
  const now = BigInt(Date.now());

  const newLink = await prisma.link.create({
    data: {
      id: parsedData.id ?? crypto.randomUUID(),
      userId: session.user.id,
      url: parsedData.url,
      title: parsedData.title,
      hostname: cleanedHostname,
      tags: parsedData.tags,
      notes: parsedData.notes,
      categoryId: category.id,
      createdAt: now,
      updatedAt: now,
    },
    select: {
      id: true,
      userId: true,
      url: true,
      title: true,
      hostname: true,
      tags: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
  });

  const formatted = formatLinkResponse(newLink);
  sseBroker.notifyUser(session.user.id, "links_updated", formatted);

  return {
    status: 201,
    body: {
      success: true,
      data: formatted,
    },
  };
});

/**
 * OPTIONS /api/links
 * Handles CORS preflight — managed by the withApiHandler wrapper.
 */
export const OPTIONS = withApiHandler(async () => {
  return { success: true };
});
