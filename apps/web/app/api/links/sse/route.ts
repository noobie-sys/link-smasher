import { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-helper";
import { sseBroker } from "@/lib/sse-broker";

export const dynamic = "force-dynamic";

/**
 * GET /api/links/sse
 * Establishes a Server-Sent Events (SSE) stream for the authenticated user,
 * pushing updates in real-time when links are modified.
 */
export async function GET(request: NextRequest) {
  const session = await getAuthSession(request);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  // Create a TransformStream to stream data
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  // Subscribe the user session to the SSE event broker
  const unsubscribe = sseBroker.subscribeUser(userId, ({ event, data }) => {
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      void writer.write(encoder.encode(payload));
    } catch (err) {
      console.error("[SSE Route] Error writing event to stream:", err);
    }
  });

  // Keep-alive timer to prevent timeout closures by intermediate proxies/gateways
  const keepAliveInterval = setInterval(() => {
    try {
      void writer.write(encoder.encode(": keep-alive\n\n"));
    } catch {
      // Ignored: connection might be closing
    }
  }, 25000); // 25 seconds is safe for most proxies

  // Cleanup immediately when client aborts the connection (tab closed/refreshed)
  request.signal.addEventListener("abort", () => {
    console.log(`[SSE Route] Connection aborted for user: ${session.user.email}`);
    clearInterval(keepAliveInterval);
    unsubscribe();
    try {
      void writer.close();
    } catch {
      // Ignored
    }
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
