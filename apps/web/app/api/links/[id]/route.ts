import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * Payload validation schema for updating a Link.
 */
const updateLinkSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

/**
 * Unicode property escape to identify emojis.
 */
const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

/**
 * GET /api/links/[id]
 * Retrieves details of a single saved link if owned by the user.
 */
export const GET = withApiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  // 1. Authenticate user session
  const session = await getAuthSession(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  // 2. Query Link and verify ownership.
  // We filter by ID and userId together. If a user tries to scan IDs they don't own,
  // we return a standard 404 Not Found to prevent data enumeration attacks.
  const link = await prisma.link.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      category: true,
    },
  });

  if (!link) {
    throw new NotFoundError("Link not found.");
  }

  // 3. Format to flat output specification
  const data = {
    id: link.id,
    url: link.url,
    title: link.title,
    hostname: link.hostname,
    tags: link.tags,
    notes: link.notes,
    category: link.category?.name ?? "General",
    createdAt: link.createdAt,
  };

  return {
    success: true,
    data,
  };
});

/**
 * PATCH /api/links/[id]
 * Modifies details of an existing saved link.
 */
export const PATCH = withApiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  // 1. Authenticate user session
  const session = await getAuthSession(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  // 2. Parse and validate input payload
  const body = await request.json();
  const parsedData = updateLinkSchema.parse(body);

  // 3. Verify link exists and is owned by the session user
  const existingLink = await prisma.link.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingLink) {
    throw new NotFoundError("Link not found.");
  }

  // Build prisma updates payload
  const updatePayload: any = {
    updatedAt: BigInt(Date.now()),
  };

  if (parsedData.title !== undefined) updatePayload.title = parsedData.title;
  if (parsedData.tags !== undefined) updatePayload.tags = parsedData.tags;
  if (parsedData.notes !== undefined) updatePayload.notes = parsedData.notes;

  // 4. Handle dynamic category update if passed
  if (parsedData.category !== undefined) {
    const categoryName = parsedData.category.trim();
    if (emojiRegex.test(categoryName)) {
      throw new ValidationError("Category name must not contain emojis.");
    }

    // Dynamic lookup-or-create on Relational Category model
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
          color: "#6366F1",
        },
      });
    }

    updatePayload.categoryId = category.id;
  }

  // 5. DB Update
  const updatedLink = await prisma.link.update({
    where: {
      id,
    },
    data: updatePayload,
    include: {
      category: true,
    },
  });

  // 6. Format output
  const data = {
    id: updatedLink.id,
    url: updatedLink.url,
    title: updatedLink.title,
    hostname: updatedLink.hostname,
    tags: updatedLink.tags,
    notes: updatedLink.notes,
    category: updatedLink.category?.name ?? "General",
    createdAt: updatedLink.createdAt,
  };

  return {
    success: true,
    message: "Link updated successfully",
    data,
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

  // 1. Authenticate user session
  const session = await getAuthSession(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  // 2. Verify link exists and is owned by the user
  const existingLink = await prisma.link.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existingLink) {
    throw new NotFoundError("Link not found.");
  }

  // 3. DB Delete
  await prisma.link.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Link deleted successfully",
  };
});

/**
 * OPTIONS /api/links/[id]
 * Auto-delegates preflight OPTIONS requests to dynamic CORS handler.
 */
export const OPTIONS = withApiHandler(async () => {
  return { success: true };
});
