import { getStorage, setStorage } from "@/core/storage/storage.util";

const BACKEND_URL = import.meta.env.WXT_BACKEND_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * A typed, authenticated HTTP client for the Link Smasher Next.js backend.
 *
 * - Automatically reads the cached session token from chrome.storage.local.
 * - Injects Authorization: Bearer <token> on every request.
 * - On 401 Unauthorized, clears local auth state so the UI prompts re-login.
 * - Throws descriptive errors for all non-OK responses.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if running in a content script (content scripts do not have access to chrome.cookies)
  const isContentScript =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    !chrome.cookies;

  if (isContentScript) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "API_FETCH",
          endpoint,
          options,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response.data as T);
          } else {
            reject(new Error(response?.error || "Background fetch failed"));
          }
        }
      );
    });
  }

  const token = await getStorage("sessionToken");

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    // Also send as cookie for servers that check cookies (Better Auth supports both)
    headers.set("Cookie", `better-auth.session_token=${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // On 401, clear stale auth so the UI prompts re-login
  if (response.status === 401) {
    await setStorage("sessionToken", null);
    await setStorage("user", null);
    throw new ApiError("Session expired. Please log in again at the web portal.", 401);
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error?.message || errorMessage;
    } catch {
      // Ignore JSON parse error on error bodies
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
}
