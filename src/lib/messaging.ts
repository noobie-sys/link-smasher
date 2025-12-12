import { HistoryItem, Tab } from "./types";

import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  userAction(data: {
    type: "newTab" | "newWindow" | "muteTab" | "unmuteTab";
    tab?: Tab;
  }): void;
  getActiveTab(): Promise<Tab>;
  getHistory(data: { size: number }): HistoryItem[];
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
