import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Fetches the authenticated Better Auth session for the current request.
 *
 * @returns The authenticated session returned by Better Auth (if any).
 */
export async function getAuthSession(_request: NextRequest) {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
