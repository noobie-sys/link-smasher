/**
 * DEFAULT_CATEGORIES — the 8 built-in system categories.
 * These match what the Next.js backend seeds as isSystem=true categories.
 * User-created categories are stored in the DB and returned from GET /api/categories.
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

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];
