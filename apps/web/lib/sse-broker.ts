import { EventEmitter } from "events";

class SSEBroker extends EventEmitter {
  /**
   * Broadcasts an event with data to all listeners subscribed to a specific user.
   */
  notifyUser(userId: string, event: string, data: any) {
    this.emit(`user:${userId}`, { event, data });
  }

  /**
   * Subscribes a callback to receive events for a specific user.
   * Returns an unsubscribe function.
   */
  subscribeUser(
    userId: string,
    callback: (payload: { event: string; data: any }) => void
  ): () => void {
    const eventName = `user:${userId}`;
    this.on(eventName, callback);
    return () => {
      this.off(eventName, callback);
    };
  }
}

// Global singleton pattern to prevent duplicate brokers during Next.js hot-reloads in development
const globalForSSE = global as unknown as { sseBroker?: SSEBroker };
export const sseBroker = globalForSSE.sseBroker ?? new SSEBroker();
if (process.env.NODE_ENV !== "production") globalForSSE.sseBroker = sseBroker;
