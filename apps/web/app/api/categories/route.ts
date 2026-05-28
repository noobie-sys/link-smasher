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

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
});

const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

const SYSTEM_CATEGORIES = [
  { name: "Development", color: "#8B5CF6" },
  { name: "Social Media", color: "#EC4899" },
  { name: "Productivity", color: "#06B6D4" },
  { name: "Entertainment", color: "#F43F5E" },
  { name: "News", color: "#F59E0B" },
  { name: "Education", color: "#6366F1" },
  { name: "Shopping", color: "#10B981" },
  { name: "General", color: "#6B7280" },
];

/**
 * GET /api/categories
 * Returns user-created custom categories merged with system/default categories.
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  // 1. Fetch custom categories from the DB
  const dbCategories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  // 2. Prepare merged list, beginning with system categories
  const merged = SYSTEM_CATEGORIES.map((sys) => ({
    id: sys.name,
    name: sys.name,
    color: sys.color,
    isSystem: true,
  }));

  // 3. Append custom categories that do not conflict with system names
  for (const dbCat of dbCategories) {
    const isSystemName = SYSTEM_CATEGORIES.some(
      (sys) => sys.name.toLowerCase() === dbCat.name.toLowerCase()
    );
    if (!isSystemName) {
      merged.push({
        id: dbCat.id,
        name: dbCat.name,
        color: dbCat.color,
        isSystem: false,
      });
    }
  }

  return {
    success: true,
    data: merged,
  };
});

/**
 * POST /api/categories
 * Creates a new custom category for the authenticated user.
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const session = await getAuthSession(request);
  if (!session) {
    throw new UnauthorizedError();
  }

  const body = await request.json();
  const parsedData = createCategorySchema.parse(body);
  const name = parsedData.name.trim();

  // 1. Check for emojis
  if (emojiRegex.test(name)) {
    throw new ValidationError("Category name must not contain emojis.");
  }

  // 2. Prevent creating a custom category with a system category name
  const isSystemName = SYSTEM_CATEGORIES.some(
    (sys) => sys.name.toLowerCase() === name.toLowerCase()
  );
  if (isSystemName) {
    throw new ConflictError("Category already exists (system category).");
  }

  // 3. Check if custom category with same name already exists in the DB
  const existing = await prisma.category.findFirst({
    where: {
      userId: session.user.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new ConflictError("Category already exists.");
  }

  // 4. Create custom category in DB
  const newCategory = await prisma.category.create({
    data: {
      userId: session.user.id,
      name,
      color: parsedData.color || "#6366F1",
    },
  });

  return {
    status: 201,
    body: {
      success: true,
      data: {
        id: newCategory.id,
        name: newCategory.name,
        color: newCategory.color,
        isSystem: false,
      },
    },
  };
});

export const OPTIONS = withApiHandler(async () => {
  return { success: true };
});
