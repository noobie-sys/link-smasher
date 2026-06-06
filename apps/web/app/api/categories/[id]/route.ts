import { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-helper";
import { prisma } from "@/lib/prisma";
import { withApiHandler } from "@/lib/api-handler";
import { UnauthorizedError, NotFoundError, ForbiddenError } from "@/lib/errors";

/**
 * System categories cannot be deleted — they are maintained in code, not the DB.
 * This set is the source of truth for guard checks.
 */
const SYSTEM_CATEGORY_NAMES = new Set([
  "development",
  "social media",
  "productivity",
  "entertainment",
  "news",
  "education",
  "shopping",
  "general",
]);

/**
 * GET /api/categories/[id]
 * Returns a single category owned by the authenticated user.
 */
export const GET = withApiHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await getAuthSession(request);
    if (!session) throw new UnauthorizedError();

    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!category) throw new NotFoundError("Category not found.");

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        color: category.color,
        isSystem: false,
      },
    };
  }
);

/**
 * DELETE /api/categories/[id]
 * Permanently deletes a custom category.
 * Links in this category will have their categoryId set to null (Prisma onDelete: SetNull),
 * which the frontend treats as "General".
 *
 * System categories (defined in SYSTEM_CATEGORY_NAMES) cannot be deleted.
 */
export const DELETE = withApiHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await getAuthSession(request);
    if (!session) throw new UnauthorizedError();

    // 1. Find the category and verify ownership
    const category = await prisma.category.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!category) throw new NotFoundError("Category not found.");

    // 2. Block deletion of system categories
    if (SYSTEM_CATEGORY_NAMES.has(category.name.toLowerCase())) {
      throw new ForbiddenError("System categories cannot be deleted.");
    }

    // 3. Delete — Prisma's onDelete: SetNull ensures linked Link records retain their data
    await prisma.category.delete({ where: { id } });

    return {
      success: true,
      message: `Category "${category.name}" deleted successfully.`,
    };
  }
);

export const OPTIONS = withApiHandler(async () => ({ success: true }));
