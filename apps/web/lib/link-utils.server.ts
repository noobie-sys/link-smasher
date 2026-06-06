import { prisma } from "./prisma";

/**
 * Default color applied to auto-created categories when no color is provided.
 */
const DEFAULT_CATEGORY_COLOR = "#6366F1";

/**
 * Finds an existing category for the user by name, or creates it if it doesn't exist.
 * Eliminates the repeated findUnique → create pattern across link creation and update routes.
 *
 * @param userId - The authenticated user's ID
 * @param categoryName - The trimmed category name (must not contain emojis — validate before calling)
 * @returns The found or newly created Prisma Category record
 */
export async function findOrCreateCategory(userId: string, categoryName: string) {
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
