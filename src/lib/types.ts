export type HistoryItem = chrome.history.HistoryItem;

export type UserAction = {
  title: string;
  id: string;
  handler: () => void;
  visible: boolean; // To hide actions such as mute/unmute conditionally
};

export type Tab = chrome.tabs.Tab;
