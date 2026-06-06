import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  EMOJI_REGEX,
  formatLinkResponse,
} from "@/lib/link-utils";
import { findOrCreateCategory } from "@/lib/link-utils.server";

/**
 * Payload validation schema for updating a Link.
 * All fields are optional — only supplied fields are modified.
 */
const updateLinkSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

/**
 * Typed update payload to avoid `any` on the Prisma data argument.
 */
interface LinkUpdateData {
  updatedAt: bigint;
  title?: string;
  tags?: string[];
  notes?: string;
  categoryId?: string;
}

/**
 * GET /api/links/[id]
 * Retrieves details of a single saved link owned by the authenticated user.
 */
export const GET = withApiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  // Filter by both id and userId: returns 404 for IDs the user doesn't own,
  // preventing data enumeration attacks.
  const link = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
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

  if (!link) {
    throw new NotFoundError("Link not found.");
  }

  return {
    success: true,
    data: formatLinkResponse(link),
  };
});

/**
 * PATCH /api/links/[id]
 * Modifies editable fields of an existing saved link.
 */
export const PATCH = withApiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  const body = await request.json() as unknown;
  const parsedData = updateLinkSchema.parse(body);

  // Verify ownership before mutating.
  const existingLink = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!existingLink) {
    throw new NotFoundError("Link not found.");
  }

  // Build the typed update payload using spread — only include supplied fields.
  const updateData: LinkUpdateData = {
    updatedAt: BigInt(Date.now()),
    ...(parsedData.title !== undefined && { title: parsedData.title }),
    ...(parsedData.tags !== undefined && { tags: parsedData.tags }),
    ...(parsedData.notes !== undefined && { notes: parsedData.notes }),
  };

  if (parsedData.category !== undefined) {
    const categoryName = parsedData.category.trim();
    if (EMOJI_REGEX.test(categoryName)) {
      throw new ValidationError("Category name must not contain emojis.");
    }
    const category = await findOrCreateCategory(session.user.id, categoryName);
    updateData.categoryId = category.id;
  }

  const updatedLink = await prisma.link.update({
    where: { id },
    data: updateData,
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

  return {
    success: true,
    message: "Link updated successfully",
    data: formatLinkResponse(updatedLink),
  };
});

/**
 * DELETE /api/links/[id]
 * Permanently deletes a link from the vault.
 */
export const DELETE = withApiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  // Verify ownership before deleting.
  const existingLink = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!existingLink) {
    throw new NotFoundError("Link not found.");
  }

  await prisma.link.delete({ where: { id } });

  return {
    success: true,
    message: "Link deleted successfully",
  };
});

/**
 * OPTIONS /api/links/[id]
 * Handles CORS preflight — managed by the withApiHandler wrapper.
 */
export const OPTIONS = withApiHandler(async () => {
  return { success: true };
});
