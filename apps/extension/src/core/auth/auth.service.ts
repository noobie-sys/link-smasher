import { getStorage, setStorage } from "@/core/storage/storage.util";

const BACKEND_URL = import.meta.env.WXT_BACKEND_URL ?? "http://localhost:3000";
const SESSION_COOKIE_NAME = "better-auth.session_token";

/**
 * Reads the Better Auth session cookie from the web portal domain using the
 * chrome.cookies API, verifies it against the Next.js backend, and caches the
 * resolved user + session token in chrome.storage.local.
 */
export const authService = {
  /**
   * Fetches the Better Auth session token from the browser cookie store.
   * Requires the `cookies` permission and host_permissions for BACKEND_URL.
   * Returns the token string on success, or null if no active session.
   */
  async fetchSessionToken(): Promise<string | null> {
    try {
      const cookie = await chrome.cookies.get({
        url: BACKEND_URL,
        name: SESSION_COOKIE_NAME,
      });

      if (!cookie?.value) {
        console.log("[authService] No session cookie found at", BACKEND_URL);
        await setStorage("sessionToken", null);
        await setStorage("user", null);
        return null;
      }

      const token = cookie.value;
      await setStorage("sessionToken", token);
      console.log("[authService] Session token found, verifying...");

      const isValid = await this.verifySession(token);
      return isValid ? token : null;
    } catch (error) {
      console.error("[authService] Error reading cookie:", error);
      return null;
    }
  },

  /**
   * Calls GET /api/auth/get-session to verify the token and resolve user info.
   * Writes the user profile to storage.
   */
  async verifySession(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      if (!response.ok) {
        console.warn("[authService] Session verification failed:", response.status);
        await setStorage("sessionToken", null);
        await setStorage("user", null);
        return false;
      }

      const payload = await response.json();

      if (payload?.user) {
        await setStorage("user", {
          id: payload.user.id,
          email: payload.user.email,
          createdAt: new Date(payload.user.createdAt).getTime(),
        });
        console.log("[authService] Authenticated as:", payload.user.email);
        return true;
      }

      await setStorage("sessionToken", null);
      await setStorage("user", null);
      return false;
    } catch (error) {
      console.error("[authService] Network error during verification:", error);
      await setStorage("sessionToken", null);
      await setStorage("user", null);
      return false;
    }
  },

  /**
   * Clears the local session state, effectively logging the extension out.
   */
  async clearSession(): Promise<void> {
    await setStorage("sessionToken", null);
    await setStorage("user", null);
    console.log("[authService] Session cleared.");
  },

  /**
   * Returns true if a valid session token is cached in local storage.
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await getStorage("sessionToken");
    const user = await getStorage("user");
    return !!(token && user);
  },
};
