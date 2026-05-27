import { apiFetch } from "@/core/api/client";
import { Category } from "@/shared/types/category.types";

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

interface CreateCategoryResponse {
  success: boolean;
  data: Category;
}

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
        return [];
      }
      return response.data;
    } catch (err) {
      console.error("[categoryService] Failed to fetch categories:", err);
      return [];
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
