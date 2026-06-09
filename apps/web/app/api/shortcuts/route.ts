import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

const shortcutsSchema = z.record(
  z.string(),
  z.object({
    key: z.string().min(1, "Shortcut key cannot be empty"),
    metaKey: z.boolean().optional(),
    ctrlKey: z.boolean().optional(),
    altKey: z.boolean().optional(),
    shiftKey: z.boolean().optional(),
  })
);

/**
 * GET /api/shortcuts
 * Retrieves the authenticated user's custom keyboard shortcuts.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { shortcuts: true },
  });

  return {
    success: true,
    data: user?.shortcuts || {},
  };
});

/**
 * PUT /api/shortcuts
 * Saves/updates the user's custom keyboard shortcuts in the database.
 */
export const PUT = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const parsedData = shortcutsSchema.parse(body);

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      shortcuts: parsedData as Prisma.InputJsonValue,
    },
    select: { shortcuts: true },
  });

  return {
    success: true,
    data: updatedUser.shortcuts || {},
  };
});

export const OPTIONS = withApiHandler(async () => {
  return { success: true };
});
