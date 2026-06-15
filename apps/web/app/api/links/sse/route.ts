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
  let keepAliveInterval: ReturnType<typeof setInterval>;
  let unsubscribe: () => void;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send connection established handshake immediately to confirm stability
      try {
        const handshake = `event: connected\ndata: ${JSON.stringify({ status: "active", message: "SSE connection established" })}\n\n`;
        controller.enqueue(encoder.encode(handshake));
      } catch (err) {
        console.error("[SSE Route] Failed to send connection handshake:", err);
      }

      // 2. Subscribe user to sseBroker
      unsubscribe = sseBroker.subscribeUser(userId, ({ event, data }) => {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          console.error("[SSE Route] Error writing event to stream:", err);
        }
      });

      // 3. Keep-alive heartbeat timer to prevent proxy timeout drops
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          // Connection likely closed
        }
      }, 20000); // 20 seconds
    },
    cancel() {
      // Clean up when stream is cancelled/aborted
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (unsubscribe) unsubscribe();
    }
  });

  // Clean up when client aborts the connection (tab closed/refreshed)
  request.signal.addEventListener("abort", () => {
    console.log(`[SSE Route] Connection aborted for user: ${session.user.email}`);
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    if (unsubscribe) unsubscribe();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
