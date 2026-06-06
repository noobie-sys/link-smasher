import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Retrieves the authenticated session for the current request using Better Auth.
 * The `request` parameter is accepted for future use (e.g., bearer token extraction)
 * and to keep handler signatures uniform across all route files.
 */
export async function getAuthSession(_request: NextRequest) {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
