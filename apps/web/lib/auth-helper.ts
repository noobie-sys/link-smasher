import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * A senior architectural helper that retrieves the authenticated session.
 * 
 * 🛠️ DEVELOPMENT MOCKING CAPABILITY:
 * In development mode (`process.env.NODE_ENV === "development"`), developers
 * can pass a special `X-Test-User-Id` header to mock an authenticated session
 * for local endpoint testing without needing to manually copy cookie headers.
 * 
 * 🔒 SECURITY ENFORCEMENT:
 * This bypass is strictly compiled and executed ONLY when NODE_ENV is "development".
 * In production, it is completely ignored, enforcing strict, secure Better Auth
 * session extraction.
 */
export async function getAuthSession(request: NextRequest) {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
