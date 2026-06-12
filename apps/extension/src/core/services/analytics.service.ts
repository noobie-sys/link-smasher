import { apiFetch } from "@/core/api/client";
import { getStorage, setStorage } from "@/core/storage/storage.util";
import { PendingAnalyticsEvent } from "@/shared/types/storage.types";

export const analyticsService = {
  async recordFocusStart(hostname: string): Promise<void> {
    await setStorage("activeFocusSession", { hostname, startTs: Date.now() });
  },

  async recordFocusEnd(hostname: string): Promise<void> {
    const session = await getStorage("activeFocusSession");
    if (!session || session.hostname !== hostname) return;

    const durationMs = Date.now() - session.startTs;
    const siteTimeLog = await getStorage("siteTimeLog");
    siteTimeLog[hostname] = (siteTimeLog[hostname] ?? 0) + durationMs;

    await setStorage("siteTimeLog", siteTimeLog);
    await setStorage("activeFocusSession", null);
  },

  async recordSaveEvent(hostname: string): Promise<void> {
    const events = await getStorage("pendingAnalyticsEvents");
    const newEvent: PendingAnalyticsEvent = {
      hostname,
      eventType: "save",
      source: "extension",
      occurredAt: Date.now(),
    };
    await setStorage("pendingAnalyticsEvents", [...events, newEvent]);
  },

  async checkpointFocusSession(): Promise<void> {
    const session = await getStorage("activeFocusSession");
    if (!session) return;

    const elapsed = Date.now() - session.startTs;
    if (elapsed <= 0) return;

    const siteTimeLog = await getStorage("siteTimeLog");
    siteTimeLog[session.hostname] = (siteTimeLog[session.hostname] ?? 0) + elapsed;

    await setStorage("siteTimeLog", siteTimeLog);
    await setStorage("activeFocusSession", { hostname: session.hostname, startTs: Date.now() });
  },

  async flushToServer(): Promise<void> {
    const token = await getStorage("sessionToken");
    if (!token) return;

    const [siteTimeLog, pendingAnalyticsEvents] = await Promise.all([
      getStorage("siteTimeLog"),
      getStorage("pendingAnalyticsEvents"),
    ]);

    const hasTime = Object.keys(siteTimeLog).length > 0;
    const hasEvents = pendingAnalyticsEvents.length > 0;
    if (!hasTime && !hasEvents) return;

    try {
      if (hasTime) {
        const now = Date.now();
        const sessions = Object.entries(siteTimeLog).map(([hostname, durationMs]) => ({
          hostname,
          durationMs,
          recordedAt: now,
        }));
        await apiFetch("/api/analytics/time", {
          method: "POST",
          body: JSON.stringify({ sessions }),
        });
      }

      if (hasEvents) {
        await apiFetch("/api/analytics/events", {
          method: "POST",
          body: JSON.stringify({ events: pendingAnalyticsEvents }),
        });
      }

      await Promise.all([
        setStorage("siteTimeLog", {}),
        setStorage("pendingAnalyticsEvents", []),
      ]);
    } catch (err) {
      console.warn("[analyticsService] Flush failed, data retained for next attempt:", err);
    }
  },
};
