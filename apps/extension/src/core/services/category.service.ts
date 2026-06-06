import { apiFetch } from "@/core/api/client";
import { DEFAULT_CATEGORIES } from "@/shared/constants/categories";
import { Category } from "@/shared/types/category.types";

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

interface CreateCategoryResponse {
  success: boolean;
  data: Category;
}

const DEFAULT_CATEGORY_COLORS: Record<(typeof DEFAULT_CATEGORIES)[number], string> = {
  Development: "#8B5CF6",
  "Social Media": "#EC4899",
  Productivity: "#06B6D4",
  Entertainment: "#F43F5E",
  News: "#F59E0B",
  Education: "#6366F1",
  Shopping: "#10B981",
  General: "#6B7280",
};

const fallbackCategories: Category[] = DEFAULT_CATEGORIES.map((name) => ({
  id: name,
  name,
  color: DEFAULT_CATEGORY_COLORS[name],
  isSystem: true,
}));

/**
 * Service for managing link categories.
 * Communicates with GET/POST /api/categories on the Next.js backend.
 * Returns a merged list of system (default) and user-created custom categories.
 */
export const categoryService = {
  /**
   * Fetches all categories for the authenticated user.
   * Returns both system/default categories (isSystem=true) and user-created ones.
   */
  async fetchCategories(): Promise<Category[]> {
    try {
      const response = await apiFetch<CategoriesResponse>("/api/categories");
      if (!response.success || !Array.isArray(response.data)) {
        console.warn("[categoryService] Unexpected response from /api/categories");
        return fallbackCategories;
      }
      return response.data.length > 0 ? response.data : fallbackCategories;
    } catch (err) {
      console.error("[categoryService] Failed to fetch categories:", err);
      return fallbackCategories;
    }
  },

  /**
   * Creates a new custom category for the authenticated user.
   * @param name - The category name (must not contain emojis, max 50 chars).
   * @returns The newly created category.
   */
  async createCategory(name: string): Promise<Category> {
    const response = await apiFetch<CreateCategoryResponse>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!response.success || !response.data) {
      throw new Error("Failed to create category");
    }

    return response.data;
  },
};
