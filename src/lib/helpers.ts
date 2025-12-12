import { sendMessage } from "./messaging";
import { HistoryItem } from "./types";

export function fetchHistory(size: number): Promise<HistoryItem[]> {
  try {
    const history = sendMessage("getHistory", { size });
    return history;
  } catch (error) {
    console.error("Error getting history", error);
    return Promise.resolve([]);
  }
}
