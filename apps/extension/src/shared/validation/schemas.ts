import { z } from "zod";

/**
 * Strips HTML tags and escapes potentially dangerous characters to prevent HTML/XSS injection.
 */
export function sanitizeString(val: string): string {
  if (!val) return "";
  // Strip standard HTML tags (both simple tags and matching/unclosed tags)
  const stripped = val.replace(/<[^>]*>/g, "");
  // Escape special HTML characters to secure standard rendering contexts
  return stripped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes tag values to alphanumeric characters, hyphens, and underscores only.
 * Forces lowercase and trims whitespace.
 */
export function sanitizeTag(tag: string): string {
  if (!tag) return "";
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
}

/**
 * Validates and sanitizes standard Link DTOs (Data Transfer Objects) for new or edited links.
 */
export const LinkDTOSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL is too long (max 2048 characters)")
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          // Block dangerous protocols (like javascript:, data:, etc.)
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Invalid URL protocol (must start with http:// or https://)" }
    ),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long (max 200 characters)")
    .transform(sanitizeString),

  tags: z
    .array(
      z
        .string()
        .trim()
        .max(30, "Each tag must be 30 characters or less")
    )
    .max(20, "A link can have at most 20 tags")
    .default([])
    .transform((tags) =>
      tags.map(sanitizeTag).filter((tag) => tag.length > 0)
    ),

  notes: z
    .string()
    .trim()
    .max(200, "Notes cannot exceed 200 characters")
    .transform(sanitizeString)
    .optional(),

  category: z
    .string()
    .trim()
    .max(50, "Category name cannot exceed 50 characters")
    .transform(sanitizeString)
    .optional(),
});

/**
 * Validates and sanitizes a complete, stored Link object.
 */
export const LinkSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "ID cannot be empty")
    .max(100, "ID is too long"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Invalid URL protocol" }
    ),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .transform(sanitizeString),
  hostname: z
    .string()
    .trim()
    .min(1, "Hostname is required")
    .max(253, "Hostname is too long"),
  tags: z
    .array(
      z
        .string()
        .trim()
        .max(30)
    )
    .max(20)
    .default([])
    .transform((tags) =>
      tags.map(sanitizeTag).filter((tag) => tag.length > 0)
    ),
  notes: z
    .string()
    .trim()
    .max(200)
    .transform(sanitizeString)
    .optional(),
  category: z
    .string()
    .trim()
    .max(50)
    .transform(sanitizeString)
    .optional(),
  createdAt: z
    .number()
    .int()
    .positive("Created timestamp must be positive"),
  updatedAt: z
    .number()
    .int()
    .nonnegative("Updated timestamp must be non-negative")
    .default(0),
});

/**
 * Schema for verifying a list of imported links in JSON format.
 */
export const ImportLinksSchema = z.array(LinkSchema);

/**
 * Validates keyboard shortcut combinations to guarantee correct keys and optional modifiers.
 */
export const KeyboardShortcutComboSchema = z.object({
  key: z
    .string()
    .min(1, "Shortcut key cannot be empty")
    .max(50, "Key name is too long"),
  metaKey: z.boolean().optional(),
  ctrlKey: z.boolean().optional(),
  altKey: z.boolean().optional(),
  shiftKey: z.boolean().optional(),
});
