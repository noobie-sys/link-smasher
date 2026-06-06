import { prisma } from "./prisma";
import type { Category } from "@prisma/client";

/**
 * Default color applied to auto-created categories when no color is provided.
 */
const DEFAULT_CATEGORY_COLOR = "#6366F1";

/**
 * Retrieves a user's category by name or creates one with a default color if none exists.
 *
 * @param userId - The authenticated user's ID
 * @param categoryName - The trimmed category name; must be validated (no emojis) before calling
 * @returns The found or newly created category record
 */
export async function findOrCreateCategory(userId: string, categoryName: string): Promise<Category> {
  const existingCategory = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId,
        name: categoryName,
      },
    },
  });

  if (existingCategory) {
    return existingCategory;
  }

  return prisma.category.create({
    data: {
      userId,
      name: categoryName,
      color: DEFAULT_CATEGORY_COLOR,
    },
  });
}
